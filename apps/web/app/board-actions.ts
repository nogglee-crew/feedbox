"use server";

import { revalidatePath } from "next/cache";
import {
  cancelIssueForQaSession,
  closeIssueForQaSession,
  updateIssueMemoForQaSession,
} from "@/features/projects/server/use-cases";

export async function confirmIssueResolved(token: string, issueId: number) {
  await closeIssueForQaSession({ token, issueId });
  revalidatePath(`/board/${token}`);
}

export async function updateIssueMemo(token: string, issueId: number, memo: string) {
  await updateIssueMemoForQaSession({ token, issueId, memo });
  revalidatePath(`/board/${token}`);
}

export async function cancelIssue(token: string, issueId: number) {
  await cancelIssueForQaSession({ token, issueId });
  revalidatePath(`/board/${token}`);
}
