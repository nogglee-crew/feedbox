import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

/** Deletes single-member organizations and blocks sole owners from leaving shared organizations. */
export async function deleteCurrentAccount(): Promise<void> {
  const user = await getUser();
  if (!user?.email) redirect("/auth/sign-in");

  const email = user.email.toLowerCase();
  const memberships = await prisma.organizationMember.findMany({
    where: { OR: [{ authUserId: user.id }, { email }] },
    select: { id: true, orgId: true, role: true },
  });

  await prisma.$transaction(async (tx) => {
    for (const membership of memberships) {
      const memberCount = await tx.organizationMember.count({
        where: { orgId: membership.orgId },
      });

      if (memberCount === 1) {
        await tx.organization.delete({ where: { id: membership.orgId } });
        continue;
      }

      if (membership.role === "OWNER") {
        const ownerCount = await tx.organizationMember.count({
          where: { orgId: membership.orgId, role: "OWNER" },
        });
        if (ownerCount <= 1) {
          throw new Error(
            "다른 멤버가 있는 팀의 유일한 owner입니다. owner를 위임하거나 멤버를 정리한 뒤 탈퇴해주세요.",
          );
        }
      }

      await tx.organizationMember.delete({ where: { id: membership.id } });
    }

    await tx.subscriptionInterest.deleteMany({ where: { email } });
  });

  const { error } = await supabaseAdmin().auth.admin.deleteUser(user.id);
  if (error) {
    throw new Error(`계정 삭제에 실패했습니다: ${error.message}`);
  }
}

const MAX_USERNAME_LENGTH = 50;

/** 표시 이름 변경 — 이 계정의 모든 팀 멤버십에 반영된다 */
export async function updateUsernameForCurrentUser(name: string): Promise<void> {
  const user = await getUser();
  if (!user?.email) redirect("/auth/sign-in");

  const trimmed = name.trim().slice(0, MAX_USERNAME_LENGTH);
  if (!trimmed) throw new Error("이름을 입력해 주세요");

  await prisma.organizationMember.updateMany({
    where: { OR: [{ authUserId: user.id }, { email: user.email.toLowerCase() }] },
    data: { name: trimmed },
  });
}
