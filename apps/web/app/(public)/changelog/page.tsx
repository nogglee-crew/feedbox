import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Tag } from "@/components/ui/badge";
import { cn } from "@/components/ui/cn";
import { LocalTime } from "@/components/ui/local-time";
import { ChangelogNav } from "@/features/changelog/components/changelog-nav";
import { SdkUpdateHelp } from "@/features/changelog/components/sdk-update-help";
import { ChangelogSeenMarker } from "@/features/changelog/components/update-link";
import { loadChangelog, markChangelogSeen } from "@/features/changelog/server/changelog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "업데이트",
  description: "FEEDBOX의 새로운 기능과 변경 사항",
};

export default async function ChangelogPage() {
  const entries = await loadChangelog();
  const latestDate = entries[0]?.date ?? null;
  await markChangelogSeen();

  // 같은 날짜의 웹/SDK 항목을 한 섹션으로 묶는다 (정렬은 이미 날짜 내림차순, 웹 먼저)
  const byDate = new Map<string, typeof entries>();
  for (const entry of entries) {
    const group = byDate.get(entry.date);
    if (group) group.push(entry);
    else byDate.set(entry.date, [entry]);
  }
  const dates = [...byDate.keys()];

  return (
    <div className="space-y-8 pb-16">
      <ChangelogSeenMarker latestDate={latestDate} />

      <header className="space-y-4">
        <Link href="/" aria-label="FEEDBOX 홈" className="inline-block">
          <Image
            src="/feedbox-logo.png"
            alt="FEEDBOX"
            width={1468}
            height={284}
            className="h-5 w-auto"
          />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">업데이트</h1>
          <p className="mt-1 text-sm text-muted">FEEDBOX의 새로운 기능과 변경 사항입니다.</p>
        </div>
        <hr className="border-border" />
      </header>

      <div className="grid gap-10 lg:grid-cols-[10rem_minmax(0,1fr)]">
        <ChangelogNav
          items={dates.map((date) => ({
            date,
            hasSdk: byDate.get(date)!.some((entry) => entry.sdkVersion),
          }))}
        />

        <div className="space-y-8">
          {dates.map((date) => (
            <section
              key={date}
              id={date}
              // 연회색 body 위 흰 카드라 배경 대비만으로 구분된다. 보더 없이 담백하게
              className="scroll-mt-8 space-y-6 rounded-xl bg-surface p-5"
            >
              <h2 className="text-lg font-bold">
                <LocalTime value={date} style="date" />
              </h2>
              {byDate.get(date)!.map((entry) => (
                <div
                  key={entry.id}
                  className={cn(
                    "space-y-5",
                    // SDK 항목은 박스 중첩 대신 왼쪽 악센트 라인으로 구분한다
                    entry.sdkVersion && "border-l-2 border-brand-300 pl-4",
                  )}
                >
                  {entry.sdkVersion && (
                    <h3 className="flex items-center gap-1 text-base font-bold">
                      SDK {entry.sdkVersion}
                      <SdkUpdateHelp version={entry.sdkVersion} />
                    </h3>
                  )}
                  {entry.sections.map((section) => (
                    <div key={section.category} className="space-y-3">
                      <Tag>{section.category}</Tag>
                      <ul className="space-y-3">
                        {section.items.map((item, index) => (
                          <li key={index} className="space-y-1.5 text-sm leading-relaxed">
                            {item.title && <p className="font-semibold">{item.title}</p>}
                            {item.paragraphs.map((paragraph, paragraphIndex) => (
                              <p key={paragraphIndex} className="text-muted">
                                {paragraph}
                              </p>
                            ))}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}
          {entries.length === 0 && (
            <p className="text-sm text-muted">아직 기록된 업데이트가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
