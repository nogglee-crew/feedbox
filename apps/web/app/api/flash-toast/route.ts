import { NextResponse } from "next/server";
import { clearFlashToast } from "@/lib/flash-toast";

export async function DELETE() {
  await clearFlashToast();
  return NextResponse.json({ ok: true });
}
