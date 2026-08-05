"use server";

import { revalidatePath } from "next/cache";
import { updateUsernameForCurrentUser } from "@/features/account/server/use-cases";
import { setFlashToast } from "@/lib/flash-toast";

export async function updateUsername(formData: FormData) {
  const name = String(formData.get("username") ?? "").trim();
  if (!name) {
    await setFlashToast("이름을 입력해 주세요", "danger");
    return;
  }
  await updateUsernameForCurrentUser(name);
  await setFlashToast("이름을 변경했습니다");
  revalidatePath("/account");
}
