"use server";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

export type FlashToastTone = "success" | "danger" | "info";

export interface FlashToast {
  id: string;
  message: string;
  tone: FlashToastTone;
}

const FLASH_TOAST_COOKIE = "feedbox_flash_toast";

export async function setFlashToast(message: string, tone: FlashToastTone = "success") {
  const cookieStore = await cookies();
  cookieStore.set(
    FLASH_TOAST_COOKIE,
    JSON.stringify({
      id: randomUUID(),
      message,
      tone,
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
    };
  } catch {
    return null;
  }
}

export async function clearFlashToast() {
  const cookieStore = await cookies();
  cookieStore.delete(FLASH_TOAST_COOKIE);
}
