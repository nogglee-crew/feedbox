import { authenticateSdk, corsJson, corsPreflight } from "@/lib/sdk-auth";
import { store } from "@/lib/store";

export async function OPTIONS() {
  return corsPreflight();
}

const MAX_SCREENSHOT_BYTES = 8 * 1024 * 1024;

function decodeScreenshot(dataUrl: unknown): Buffer | null {
  if (typeof dataUrl !== "string") return null;
  const match = /^data:image\/png;base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  const buffer = Buffer.from(match[1], "base64");
  if (buffer.byteLength === 0 || buffer.byteLength > MAX_SCREENSHOT_BYTES) return null;
  return buffer;
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

  const png = decodeScreenshot(body.screenshot);
  const screenshotUrl = png ? await store.saveScreenshot(project.id, png) : null;

  try {
    const { id } = await store.createIssue({
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
