import { DataTable } from "@/features/analytics/components/data-table";
import { LocalTime } from "@/components/ui/local-time";
import { listSubscribers } from "@/features/analytics/server/admin-queries";

export default async function AdminSubscribersPage() {
  const subscribers = await listSubscribers();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-foreground">
          출시 알림 신청 {subscribers.length}건
        </h1>
        <p className="mt-1 text-sm text-muted">
          신청은 팀을 보유한 로그인 회원만 할 수 있습니다. 팀이 비어 있다면 신청 이후 그 팀이 삭제된
          경우입니다.
        </p>
      </div>

      <DataTable
        rows={subscribers}
        rowKey={(subscriber) => subscriber.email}
        empty="신청 내역이 없습니다."
        columns={[
          { header: "이메일", cell: (subscriber) => subscriber.email },
          {
            header: "팀",
            cell: (subscriber) => (
              <span className={subscriber.orgName ? "text-foreground" : "text-subtle"}>
                {subscriber.orgName ?? "삭제된 팀"}
              </span>
            ),
          },
          {
            header: "신청일",
            cell: (subscriber) => (
              <LocalTime value={subscriber.createdAt} style="shortDateTime" className="text-muted" />
            ),
          },
        ]}
      />
    </div>
  );
}
