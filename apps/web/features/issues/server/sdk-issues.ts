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
  error_name: string | null;
  error_code: string | null;
  error_message: string | null;
  error_stack: string | null;
  api_method: string | null;
  api_url: string | null;
  api_status: number | null;
  memo: string;
  screenshot_url: string | null;
}

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
      errorName: input.error_name,
      errorCode: input.error_code,
      errorMessage: input.error_message,
      errorStack: input.error_stack,
      apiMethod: input.api_method,
      apiUrl: input.api_url,
      apiStatus: input.api_status,
      memo: input.memo,
      screenshotUrl: input.screenshot_url,
    },
    select: { id: true },
  });
}

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
