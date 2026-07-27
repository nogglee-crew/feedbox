import { Card } from "@/components/ui/card";
import { DailyBars, FunnelSteps, StatTile } from "@/features/analytics/components/metric-views";
import { DataTable } from "@/features/analytics/components/data-table";
import {
  listMembershipActivity,
  listSignups,
  loadEventCounts,
  loadPlatformTotals,
  medianTransitionDays,
  summarizeMembershipsByUser,
  toDailySeries,
} from "@/features/analytics/server/admin-queries";

const SIGNUP_TREND_DAYS = 30;

export default async function AdminOverviewPage() {
  const [signups, memberships, totals, eventCounts] = await Promise.all([
    listSignups(),
    listMembershipActivity(),
    loadPlatformTotals(),
    loadEventCounts(30),
  ]);

  // 한 사람이 여러 팀에 속할 수 있어 퍼널은 팀이 아니라 회원 단위로 센다.
  const activeUsers = [...summarizeMembershipsByUser(memberships, signups).values()];
  const usersWithProject = activeUsers.filter((user) => user.projectCount > 0);
  const usersWithIssue = activeUsers.filter((user) => user.issueCount > 0);

  const signupAtByUserId = new Map(signups.map((user) => [user.id, user.createdAt]));
  const daysToTeam = medianTransitionDays(
    activeUsers.map((user) => ({
      from: signupAtByUserId.get(user.authUserId),
      to: user.firstJoinedAt,
    })),
  );
  const daysToProject = medianTransitionDays(
    activeUsers.map((user) => ({ from: user.firstJoinedAt, to: user.firstProjectAt })),
  );
  const daysToIssue = medianTransitionDays(
    activeUsers.map((user) => ({ from: user.firstProjectAt, to: user.firstIssueAt })),
  );

  const now = Date.now();
  const signupsLast7 = signups.filter(
    (user) => now - user.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000,
  ).length;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-lg font-semibold text-foreground">운영 지표</h1>
        <p className="mt-1 text-sm text-muted">
          유입 분석은 GA4가, 제품 내부 행동은 이 화면이 담당합니다.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="누적 회원"
          value={signups.length}
          hint={`최근 7일 +${signupsLast7}`}
          href="/admin/users"
        />
        <StatTile label="팀" value={totals.orgs} href="/admin/orgs" />
        <StatTile label="프로젝트" value={totals.projects} href="/admin/projects" />
        <StatTile label="이슈" value={totals.issues} href="/admin/issues" />
        <StatTile label="릴리즈" value={totals.releases} href="/admin/projects" />
        <StatTile label="QA 세션" value={totals.qaSessions} href="/admin/projects" />
        <StatTile
          label="출시 알림 신청"
          value={totals.subscriptionInterests}
          href="/admin/subscribers"
        />
        <StatTile
          label="이슈 경험 회원"
          value={usersWithIssue.length}
          hint={`전체 ${signups.length}명 중`}
        />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">활성화 퍼널</h2>
          <p className="mt-1 text-xs text-muted">
            회원 단위 집계입니다. 아직 다음 단계에 도달하지 않았을 뿐 이탈로 단정할 수 없어
            &lsquo;미도달&rsquo;로 표기합니다.
          </p>
        </div>
        <FunnelSteps
          steps={[
            { label: "가입", count: signups.length },
            {
              label: "팀 참여",
              count: activeUsers.length,
              medianDaysFromPrevious: daysToTeam,
            },
            {
              label: "프로젝트 보유 팀 소속",
              count: usersWithProject.length,
              medianDaysFromPrevious: daysToProject,
            },
            {
              label: "첫 이슈 수신",
              count: usersWithIssue.length,
              medianDaysFromPrevious: daysToIssue,
            },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          신규 가입 추이 (최근 {SIGNUP_TREND_DAYS}일)
        </h2>
        <Card padding="sm">
          <DailyBars
            series={toDailySeries(
              signups.map((user) => user.createdAt),
              SIGNUP_TREND_DAYS,
            )}
          />
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">자체 계측 이벤트 (최근 30일)</h2>
          <p className="mt-1 text-xs text-muted">
            비어 있다면 아직 이벤트가 수집되지 않은 것입니다. GA4와 수치를 비교하면 애드블록 유실률을
            가늠할 수 있습니다.
          </p>
        </div>
        <DataTable
          rows={eventCounts}
          rowKey={(event) => event.name}
          empty="수집된 이벤트가 없습니다."
          columns={[
            { header: "이벤트", cell: (event) => event.name },
            { header: "발생", align: "right", cell: (event) => event.total },
            { header: "사용자", align: "right", cell: (event) => event.users },
          ]}
        />
      </section>
    </div>
  );
}
