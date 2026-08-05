import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { getUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export interface ChangelogItem {
  /** `**제목** - 내용` 형태일 때의 굵은 제목. 없으면 null */
  title: string | null;
  /** 원문에서 빈 줄로 나눈 문단들 — 맥락이 바뀌는 지점이 곧 줄바꿈이다 */
  paragraphs: string[];
}

export interface ChangelogSectionData {
  category: string;
  items: ChangelogItem[];
}

export interface ChangelogEntry {
  /** 앵커 id — 웹은 날짜, SDK는 `sdk-<버전>` */
  id: string;
  /** "2026-08-05" — 정렬과 미확인 비교 기준 */
  date: string;
  /** SDK 릴리즈 항목이면 버전. 웹 앱 항목이면 null */
  sdkVersion: string | null;
  sections: ChangelogSectionData[];
}

/** 사용자가 알아도 이득이 없는 분류는 통합 화면에서 뺀다 */
const HIDDEN_CATEGORIES = new Set(["내부", "문서"]);

/** 원문 분류명 → 사용자 눈높이 표현 */
const CATEGORY_LABELS: Record<string, string> = {
  추가: "새 기능",
  변경: "개선",
  수정: "버그 수정",
};

async function readFirstExisting(candidates: string[]): Promise<string> {
  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // 다음 후보를 시도한다
    }
  }
  return "";
}

/** 마크다운 장식(링크·백틱)을 걷어내고 순수 텍스트만 남긴다 */
function plainText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function parseItem(paragraphLines: string[][]): ChangelogItem {
  const paragraphs = paragraphLines
    .map((lines) => plainText(lines.join(" ").replace(/\s+/g, " ")))
    .filter(Boolean);
  if (paragraphs.length === 0) return { title: null, paragraphs: [] };

  const withTitle = /^\*\*(.+?)\*\*\s*[-–—]?\s*(.*)$/.exec(paragraphs[0]);
  if (!withTitle) return { title: null, paragraphs };
  // 제목 뒤에 붙는 깃헙 이슈 참조("(#12)")는 고객사 독자에게 소음이라 걷어낸다
  const rest = withTitle[2].replace(/^\(#\d+\)\s*/, "");
  return {
    title: withTitle[1],
    paragraphs: [rest, ...paragraphs.slice(1)].filter(Boolean),
  };
}

/**
 * 체인지로그 마크다운을 구조화한다.
 * 엔트리 시작: 웹은 `## 2026-08-05`, SDK는 `## [0.1.4] - 2026-08-05`.
 * 규칙을 벗어난 줄은 조용히 무시하므로 문서 규칙 유지가 전제다.
 */
function parseChangelog(source: string, kind: "web" | "sdk"): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];
  let entry: ChangelogEntry | null = null;
  let section: ChangelogSectionData | null = null;
  let itemParagraphs: string[][] = [];
  let currentLines: string[] = [];

  const flushParagraph = () => {
    if (currentLines.length) itemParagraphs.push(currentLines);
    currentLines = [];
  };
  const flushItem = () => {
    flushParagraph();
    if (itemParagraphs.length && section) section.items.push(parseItem(itemParagraphs));
    itemParagraphs = [];
  };
  const insideItem = () => currentLines.length > 0 || itemParagraphs.length > 0;

  for (const line of source.split("\n")) {
    const header =
      kind === "web"
        ? /^## (\d{4}-\d{2}-\d{2})\s*$/.exec(line)
        : /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})\s*$/.exec(line);
    if (header) {
      flushItem();
      entry =
        kind === "web"
          ? { id: header[1], date: header[1], sdkVersion: null, sections: [] }
          : { id: `sdk-${header[1]}`, date: header[2], sdkVersion: header[1], sections: [] };
      section = null;
      entries.push(entry);
      continue;
    }
    const category = /^### (.+)$/.exec(line);
    if (category && entry) {
      flushItem();
      const name = category[1].trim();
      if (HIDDEN_CATEGORIES.has(name)) {
        section = null;
        continue;
      }
      section = { category: CATEGORY_LABELS[name] ?? name, items: [] };
      entry.sections.push(section);
      continue;
    }
    if (/^- /.test(line) && section) {
      flushItem();
      currentLines = [line.slice(2)];
      continue;
    }
    if (/^\s+\S/.test(line) && insideItem()) {
      currentLines.push(line.trim());
      continue;
    }
    // 항목 안의 빈 줄 = 문단 경계(맥락 전환)
    if (line.trim() === "" && currentLines.length) {
      flushParagraph();
    }
  }
  flushItem();
  return entries.filter((e) => e.sections.some((s) => s.items.length > 0));
}

/**
 * 웹 앱 + SDK 체인지로그를 하나의 타임라인으로 합친다.
 * 날짜 내림차순, 같은 날짜면 웹 항목이 먼저.
 */
export const loadChangelog = cache(async function loadChangelog(): Promise<ChangelogEntry[]> {
  const [webSource, sdkSource] = await Promise.all([
    readFirstExisting([
      path.join(process.cwd(), "../../CHANGELOG.md"),
      path.join(process.cwd(), "CHANGELOG.md"),
    ]),
    readFirstExisting([
      path.join(process.cwd(), "../../packages/sdk/CHANGELOG.md"),
      path.join(process.cwd(), "packages/sdk/CHANGELOG.md"),
    ]),
  ]);

  return [...parseChangelog(webSource, "web"), ...parseChangelog(sdkSource, "sdk")].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return Number(a.sdkVersion !== null) - Number(b.sdkVersion !== null);
  });
});

/** 미확인 비교 기준 시각 — 최신 항목 날짜의 자정(UTC) */
function latestThreshold(latestDate: string | null): Date | null {
  return latestDate ? new Date(`${latestDate}T00:00:00Z`) : null;
}

/**
 * 로그인 유저의 체인지로그 미확인 여부.
 * 비로그인(null)이면 클라이언트가 localStorage로 판단한다.
 */
export const getChangelogUnread = cache(async function getChangelogUnread(): Promise<
  boolean | null
> {
  const user = await getUser();
  if (!user) return null;

  const entries = await loadChangelog();
  const threshold = latestThreshold(entries[0]?.date ?? null);
  if (!threshold) return false;

  const membership = await prisma.organizationMember.findFirst({
    where: { OR: [{ authUserId: user.id }, { email: user.email.toLowerCase() }] },
    select: { changelogSeenAt: true },
  });
  if (!membership) return null; // 멤버십 없는 유저는 익명과 같은 경로로
  return !membership.changelogSeenAt || membership.changelogSeenAt < threshold;
});

/** /changelog 방문 시 호출 — 이 계정의 모든 멤버십에 확인 시각을 기록한다 */
export async function markChangelogSeen(): Promise<void> {
  const user = await getUser();
  if (!user) return;
  await prisma.organizationMember.updateMany({
    where: { OR: [{ authUserId: user.id }, { email: user.email.toLowerCase() }] },
    data: { changelogSeenAt: new Date() },
  });
}
