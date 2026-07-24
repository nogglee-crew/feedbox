import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * 회원 탈퇴: 사용자와 관련된 모든 데이터를 삭제한다. 되돌릴 수 없다.
 *
 * 정책
 * - 나 혼자만 있는 팀: 팀 전체 삭제 (프로젝트/릴리즈/이슈 cascade)
 * - 다른 멤버가 있는 팀의 유일한 owner: 탈퇴 차단 (owner 위임 또는 멤버 정리 후 탈퇴)
 * - 그 외: 내 멤버십만 삭제
 * - 구독 알림 신청, Supabase Auth 계정 삭제
 */
export async function deleteCurrentAccount(): Promise<void> {
  const user = await getUser();
  if (!user?.email) redirect("/login");

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
