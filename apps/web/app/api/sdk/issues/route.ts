import {
  countRecentSessionIssues,
  createSdkIssue,
  saveScreenshot,
} from "@/features/issues/server/sdk-issues";
import { authenticateSdk, corsJson, corsPreflight } from "@/lib/sdk-auth";

// Bounds per-session storage abuse.
const RATE_LIMIT_PER_MINUTE = 10;

export async function OPTIONS() {
  return corsPreflight();
}

// Leaves headroom under Vercel's 4.5 MB request limit.
const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024;

function limitedText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function safeApiUrl(value: unknown): string | null {
  const raw = limitedText(value, 2000);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.href.slice(0, 2000);
  } catch {
    return null;
  }
}

function parseDiagnostics(value: unknown) {
  if (typeof value !== "object" || value === null) return null;
  const diagnostics = value as Record<string, unknown>;
  const error =
    typeof diagnostics.error === "object" && diagnostics.error !== null
      ? (diagnostics.error as Record<string, unknown>)
      : null;
  const request =
    typeof diagnostics.request === "object" && diagnostics.request !== null
      ? (diagnostics.request as Record<string, unknown>)
      : null;

  const errorName = limitedText(error?.name, 120);
  const errorCode = limitedText(error?.code, 120);
  const errorMessage = limitedText(error?.message, 2000);
  if (!errorName || !errorCode || !errorMessage) return null;

  const status = request?.status;
  return {
    errorName,
    errorCode,
    errorMessage,
    errorStack: limitedText(error?.stack, 10_000),
    apiMethod: limitedText(request?.method, 16)?.toUpperCase() ?? null,
    apiUrl: safeApiUrl(request?.url),
    apiStatus:
      typeof status === "number" && Number.isInteger(status) && status >= 0 && status <= 599
        ? status
        : null,
  };
}

function decodeScreenshot(
  dataUrl: unknown,
): { buffer: Buffer; contentType: "image/png" | "image/jpeg" } | null {
  if (typeof dataUrl !== "string") return null;
  const match = /^data:image\/(png|jpeg);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_SCREENSHOT_BYTES) return null;
  return { buffer, contentType: match[1] === "png" ? "image/png" : "image/jpeg" };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { context, error } = await authenticateSdk(body);
  if (error) return error;
  const { project, session, release } = context!;

  const { pageUrl, selector, memo } = body;
  if (typeof pageUrl !== "string" || typeof selector !== "string" || typeof memo !== "string" || !memo.trim()) {
    return corsJson({ error: "pageUrl, selector, memo가 필요합니다" }, 400);
  }

  const recentCount = await countRecentSessionIssues(session.id, 60_000);
  if (recentCount >= RATE_LIMIT_PER_MINUTE) {
    return corsJson({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }, 429);
  }

  const screenshot = decodeScreenshot(body.screenshot);
  const screenshotUrl = screenshot
    ? await saveScreenshot(project.id, screenshot.buffer, screenshot.contentType)
    : null;
  const diagnostics = parseDiagnostics(body.diagnostics);

  try {
    const { id } = await createSdkIssue({
      project_id: project.id,
      release_id: release.id,
      session_id: session.id,
      page_url: pageUrl.slice(0, 2000),
      selector: selector.slice(0, 2000),
      element_text: typeof body.elementText === "string" ? body.elementText.slice(0, 300) : null,
      viewport_width: Number.isFinite(body.viewportWidth) ? body.viewportWidth : null,
      viewport_height: Number.isFinite(body.viewportHeight) ? body.viewportHeight : null,
      browser: typeof body.browser === "string" ? body.browser.slice(0, 500) : null,
      error_name: diagnostics?.errorName ?? null,
      error_code: diagnostics?.errorCode ?? null,
      error_message: diagnostics?.errorMessage ?? null,
      error_stack: diagnostics?.errorStack ?? null,
      api_method: diagnostics?.apiMethod ?? null,
      api_url: diagnostics?.apiUrl ?? null,
      api_status: diagnostics?.apiStatus ?? null,
      memo: memo.trim().slice(0, 5000),
      screenshot_url: screenshotUrl,
    });
    return corsJson({ id }, 201);
  } catch {
    return corsJson({ error: "이슈 저장에 실패했습니다" }, 500);
  }
}
