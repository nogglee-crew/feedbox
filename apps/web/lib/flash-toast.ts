"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

export type FlashToastTone = "success" | "danger" | "info";

export interface FlashToast {
  id: string;
  message: string;
  tone: FlashToastTone;
  /**
   * 토스트를 띄울 때 1회 전송할 GA4 이벤트 이름.
   * 서버 액션은 gtag를 직접 호출할 수 없고 redirect로 끝나는 경우도 있어,
   * 이미 성공 시에만 왕복하는 이 쿠키에 실어 보낸다.
   */
  event?: string;
}

const FLASH_TOAST_COOKIE = "feedbox_flash_toast";

export async function setFlashToast(
  message: string,
  tone: FlashToastTone = "success",
  event?: string,
) {
  const cookieStore = await cookies();
  cookieStore.set(
    FLASH_TOAST_COOKIE,
    JSON.stringify({
      id: randomUUID(),
      message,
      tone,
      event,
    } satisfies FlashToast),
    {
      httpOnly: true,
      maxAge: 30,
      path: "/",
      sameSite: "lax",
    },
  );
}

export async function getFlashToast(): Promise<FlashToast | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(FLASH_TOAST_COOKIE)?.value;
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<FlashToast>;
    if (!parsed.id || !parsed.message) return null;
    return {
      id: parsed.id,
      message: parsed.message,
      tone:
        parsed.tone === "danger" || parsed.tone === "info" || parsed.tone === "success"
          ? parsed.tone
          : "success",
      event: typeof parsed.event === "string" ? parsed.event : undefined,
    };
  } catch {
    return null;
  }
}

export async function clearFlashToast() {
  const cookieStore = await cookies();
  cookieStore.delete(FLASH_TOAST_COOKIE);
}
