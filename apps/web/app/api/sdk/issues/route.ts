import {
  countRecentSessionIssues,
  createSdkIssue,
  saveScreenshot,
} from "@/features/issues/server/sdk-issues";
import { authenticateSdk, corsJson, corsPreflight } from "@/lib/sdk-auth";

// 세션당 분당 이슈 등록 한도 (스토리지 남용 방지)
const RATE_LIMIT_PER_MINUTE = 10;

export async function OPTIONS() {
  return corsPreflight();
}

// Vercel 서버리스 요청 본문 한도가 4.5MB이므로 그 이하로 잡는다 (SDK가 JPEG 압축해서 보냄)
const MAX_SCREENSHOT_BYTES = 4 * 1024 * 1024;

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
      memo: memo.trim().slice(0, 5000),
      screenshot_url: screenshotUrl,
    });
    return corsJson({ id }, 201);
  } catch {
    return corsJson({ error: "이슈 저장에 실패했습니다" }, 500);
  }
}
