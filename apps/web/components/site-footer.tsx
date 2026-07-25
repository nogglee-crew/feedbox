import Link from "next/link";

// TODO: youtube는 실제 채널 주소로 교체 필요
const LINKS = {
  github: "https://github.com/nogglee-crew/feedbox",
  youtube: "https://www.youtube.com/@nogglee",
  email: "crew.nogglee@gmail.com",
  openChat: "http://pf.kakao.com/_xkNbxnX/chat",
  demo: "/demo#session=Z72AGKeihOspaMRN3NoNqi8iaVfhtajh",
};

/** 랜딩과 대시보드가 함께 쓰는 사이트 푸터 */
export function SiteFooter() {
  return (
    <footer className="bg-surface-inverse">
      <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-1">
            <span className="text-sm font-bold text-on-inverse">FEEDBOX</span>
            <p className="text-xs text-neutral-400">
              버그 제보를 받는 가장 짧은 경로
            </p>
          </div>
          <nav
            aria-label="푸터"
            className="grid grid-cols-2 gap-x-10 gap-y-2 text-xs sm:grid-cols-3"
          >
            <div className="space-y-2">
              <p className="font-semibold text-neutral-500">제품</p>
              <Link
                href={LINKS.demo}
                className="block text-neutral-400 hover:text-on-inverse"
              >
                Demo
              </Link>
              <a
                href={LINKS.github}
                target="_blank"
                rel="noreferrer"
                className="block text-neutral-400 hover:text-on-inverse"
              >
                GitHub
              </a>
              <a
                href={LINKS.youtube}
                target="_blank"
                rel="noreferrer"
                className="block text-neutral-400 hover:text-on-inverse"
              >
                YouTube
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-neutral-500">문의</p>
              <a
                href={`mailto:${LINKS.email}`}
                className="block text-neutral-400 hover:text-on-inverse"
              >
                이메일
              </a>
              <a
                href={LINKS.openChat}
                target="_blank"
                rel="noreferrer"
                className="block text-neutral-400 hover:text-on-inverse"
              >
                카카오톡
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-neutral-500">약관</p>
              <Link
                href="/terms"
                className="block text-neutral-400 hover:text-on-inverse"
              >
                이용약관
              </Link>
              <Link
                href="/privacy"
                className="block text-neutral-400 hover:text-on-inverse"
              >
                개인정보처리방침
              </Link>
            </div>
          </nav>
        </div>
        <div className="space-y-1.5 border-t border-neutral-800 pt-4 text-xs text-neutral-500">
          <p>
            상호: 노글리크루 · 대표자: 이은지 · 사업자등록번호: 808-09-03103
          </p>
          <p>© 2026 NOGGLEECREW. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
