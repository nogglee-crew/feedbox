import { requestSubscriptionNotify } from "@/app/subscribe-actions";
import { Dot } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";

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
    <Card padding="lg">
      <h2 className="font-bold">프로젝트를 더 만들려면 구독이 필요해요</h2>
      <p className="mt-1 text-sm text-muted">
        무료 플랜에서는 팀당 프로젝트 1개까지 만들 수 있습니다. 여러 프로젝트를 관리할 수 있는{" "}
        <b>구독 서비스를 준비 중</b>입니다.
      </p>

      {requested ? (
        <p className="mt-4 flex items-start gap-2 rounded-lg bg-surface-muted p-3 text-sm text-muted">
          <Dot tone="success" className="mt-1.5" />
          <span>
            알림 신청이 완료되었습니다. 구독 서비스가 출시되면 <b>{email}</b>로 안내드릴게요.
          </span>
        </p>
      ) : (
        <form action={requestSubscriptionNotify} className="mt-4 space-y-3">
          <input type="hidden" name="org_id" value={orgId} />
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="subscribe-email"
              name="email"
              type="email"
              defaultValue={email}
              required
              aria-label="알림 받을 이메일"
              className="w-72"
            />
            <SubmitButton pendingText="신청 중...">출시 알림 받기</SubmitButton>
          </div>
          <Checkbox
            name="privacy_agree"
            required
            label="(필수) 개인정보 수집·이용에 동의합니다."
            description={
              <>
                <span className="block">수집 항목: 이메일 주소</span>
                <span className="block">수집 목적: 구독 서비스 출시 알림 발송</span>
                <span className="block">보유 기간: 알림 발송 완료 또는 동의 철회 시까지</span>
                <span className="mt-1 block">
                  동의를 거부할 수 있으며, 거부 시 출시 알림을 받을 수 없습니다.
                </span>
              </>
            }
          />
        </form>
      )}
    </Card>
  );
}
