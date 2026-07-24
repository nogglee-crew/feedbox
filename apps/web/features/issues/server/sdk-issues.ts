import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

export interface NewSdkIssue {
  project_id: string;
  release_id: string;
  session_id: string | null;
  page_url: string;
  selector: string;
  element_text: string | null;
  viewport_width: number | null;
  viewport_height: number | null;
  browser: string | null;
  memo: string;
  screenshot_url: string | null;
}

/** 최근 windowMs 안에 해당 세션이 등록한 이슈 수 (rate limit용) */
export async function countRecentSessionIssues(
  sessionId: string,
  windowMs: number,
): Promise<number> {
  return prisma.issue.count({
    where: {
      sessionId,
      createdAt: { gte: new Date(Date.now() - windowMs) },
    },
  });
}

/** SDK가 등록하는 이슈 저장 (인증은 sdk-auth에서 완료된 상태) */
export async function createSdkIssue(input: NewSdkIssue): Promise<{ id: number }> {
  return prisma.issue.create({
    data: {
      projectId: input.project_id,
      releaseId: input.release_id,
      sessionId: input.session_id,
      pageUrl: input.page_url,
      selector: input.selector,
      elementText: input.element_text,
      viewportWidth: input.viewport_width,
      viewportHeight: input.viewport_height,
      browser: input.browser,
      memo: input.memo,
      screenshotUrl: input.screenshot_url,
    },
    select: { id: true },
  });
}

/** 스크린샷을 Supabase Storage에 저장하고 공개 URL을 반환한다. 실패 시 null. */
export async function saveScreenshot(
  projectId: string,
  image: Buffer,
  contentType: "image/png" | "image/jpeg",
): Promise<string | null> {
  const storage = supabaseAdmin().storage;
  const ext = contentType === "image/jpeg" ? "jpg" : "png";
  const path = `${projectId}/${randomUUID()}.${ext}`;
  const { error } = await storage.from("screenshots").upload(path, image, { contentType });
  if (error) return null;
  return storage.from("screenshots").getPublicUrl(path).data.publicUrl;
}
