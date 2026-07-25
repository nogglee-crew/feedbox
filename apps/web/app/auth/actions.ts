"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { deleteCurrentAccount } from "@/features/account/server/use-cases";
import { authEnv, isAuthEnabled } from "@/lib/auth";

export async function deleteAccount() {
  await deleteCurrentAccount();
  await signOut();
}

export async function signOut() {
  if (isAuthEnabled()) {
    const { url, anonKey } = authEnv();
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    });
    await supabase.auth.signOut();
  }
  redirect("/login");
}
