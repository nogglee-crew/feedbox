import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { EventParams, ServerEventName } from "../domain/events";

export interface RecordEventInput {
  name: string;
  anonId: string;
  sessionId: string;
  authUserId?: string | null;
  orgId?: string | null;
  path?: string | null;
  referrer?: string | null;
  country?: string | null;
  params?: EventParams | null;
}

/**
 * 계측 실패가 사용자 동작을 깨서는 안 되므로 삼킨다.
 * 호출부는 성공 여부를 기다릴 이유가 없다.
 */
export async function recordEvent(input: RecordEventInput): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        name: input.name,
        anonId: input.anonId,
        sessionId: input.sessionId,
        authUserId: input.authUserId ?? null,
        orgId: input.orgId ?? null,
        path: input.path ?? null,
        referrer: input.referrer ?? null,
        country: input.country ?? null,
        params: input.params ?? undefined,
      },
    });
  } catch (error) {
    console.error("[analytics] 이벤트 기록 실패", error);
  }
}

/**
 * 조직은 클라이언트가 아니라 경로에서 판정한다.
 * 대시보드 경로의 첫 세그먼트가 팀 slug이고, 실제 멤버일 때만 귀속시킨다.
 */
export async function resolveOrgIdFromPath(
  path: string | null,
  authUserId: string | null,
): Promise<string | null> {
  if (!path || !authUserId) return null;
  const slug = path.split("/")[1];
  if (!slug) return null;

  const member = await prisma.organizationMember.findFirst({
    where: { authUserId, org: { slug } },
    select: { orgId: true },
  });
  return member?.orgId ?? null;
}

/**
 * 소유권 검증이 끝난 usecase에서 호출하는 생애주기 이벤트.
 * 브라우저 식별자가 없으므로 인증된 사용자 id를 익명 id 자리에 채워
 * 클라이언트 이벤트와 같은 스키마로 조회할 수 있게 한다.
 */
export async function recordServerEvent(
  name: ServerEventName,
  orgId: string | null,
  params?: EventParams,
): Promise<void> {
  const user = await getUser();
  if (!user) return;

  await recordEvent({
    name,
    anonId: `srv:${user.id}`,
    sessionId: `srv:${user.id}`,
    authUserId: user.id,
    orgId,
    params,
  });
}
