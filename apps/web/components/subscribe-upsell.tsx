import { requestSubscriptionNotify } from "@/app/subscribe-actions";

/**
 * Free 플랜 프로젝트 개수 제한 도달 시 표시되는 구독 안내 카드.
 * requested가 true면 이미 알림 신청을 마친 상태.
 */
export function SubscribeUpsell({
  email,
  orgId,
  requested,
}: {
  email: string;
  orgId: string;
  requested: boolean;
}) {
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-6">
      <h2 className="font-bold">프로젝트를 더 만들려면 구독이 필요해요</h2>
      <p className="mt-1 text-sm text-gray-600">
        무료 플랜에서는 조직당 프로젝트 1개까지 만들 수 있습니다. 여러 프로젝트를 관리할 수 있는{" "}
        <b>구독 서비스를 준비 중</b>입니다.
      </p>

      {requested ? (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          알림 신청이 완료되었습니다. 구독 서비스가 출시되면 <b>{email}</b>로 안내드릴게요.
        </p>
      ) : (
        <form action={requestSubscriptionNotify} className="mt-4 space-y-3">
          <input type="hidden" name="org_id" value={orgId} />
          <div className="flex flex-wrap items-center gap-2">
            <input
              name="email"
              type="email"
              defaultValue={email}
              required
              className="w-72 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              출시 알림 받기
            </button>
          </div>
          <label className="flex items-start gap-2 text-xs text-gray-600">
            <input type="checkbox" name="privacy_agree" required className="mt-0.5" />
            <span>
              (필수) 개인정보 수집·이용에 동의합니다.
              <span className="mt-0.5 block text-gray-400">
                수집 항목: 이메일 주소 · 수집 목적: 구독 서비스 출시 알림 발송 · 보유 기간: 알림 발송 완료
                또는 동의 철회 시까지. 동의를 거부할 수 있으며, 거부 시 출시 알림을 받을 수 없습니다.
              </span>
            </span>
          </label>
        </form>
      )}
    </div>
  );
}
