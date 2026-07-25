import {
  LegalList,
  LegalPage,
  LegalSection,
  LegalTable,
} from "@/features/legal/components/legal-page";

export const metadata = { title: "개인정보처리방침" };

const EFFECTIVE_DATE = "2026년 7월 25일";
const CONTACT = "crew.nogglee@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalPage title="개인정보처리방침" effectiveDate={EFFECTIVE_DATE}>
      <p>
        노글리크루(이하 &ldquo;회사&rdquo;)는 FEEDBOX(이하 &ldquo;서비스&rdquo;)를 제공하면서
        이용자의 개인정보를 소중히 다루며, 개인정보 보호법 등 관련 법령을 준수합니다. 본 방침은
        회사가 어떤 정보를 어떤 목적으로 수집하고 얼마나 보관하는지 설명합니다.
      </p>

      <LegalSection title="1. 수집하는 개인정보">
        <p>서비스는 아래 정보를 수집합니다.</p>
        <LegalTable
          head={["구분", "항목", "수집 시점"]}
          rows={[
            [
              "계정",
              "Google 계정의 이메일 주소, 이름, 프로필 사진",
              "Google 계정으로 로그인할 때",
            ],
            [
              "팀 멤버",
              "초대 대상 이메일 주소, 이름, 프로필 사진, 역할",
              "팀 소유자가 멤버를 초대하거나 초대받은 사람이 로그인할 때",
            ],
            [
              "피드백(이슈)",
              "작성한 메모, 페이지 URL, 선택한 요소의 CSS 선택자와 텍스트, 화면 해상도, 브라우저 정보(User-Agent), 발생한 오류 정보, 실패한 API 호출의 메서드·URL·상태 코드, 화면 스크린샷",
              "테스터가 SDK로 피드백을 등록할 때",
            ],
            [
              "QA 세션",
              "발급 대상으로 입력한 값(선택 입력)",
              "팀이 QA URL을 발급할 때",
            ],
            [
              "구독 알림 신청",
              "이메일 주소, 동의 일시",
              "출시 알림을 신청할 때",
            ],
            [
              "서비스 이용 기록",
              "쿠키 등 유사 식별자, 방문한 페이지와 머문 시간, 유입 경로, 기기·운영체제·브라우저 정보, IP 주소로 추정한 국가·도시 수준의 위치, 버튼 클릭 등 화면에서 발생한 동작",
              "서비스의 웹 페이지를 방문할 때(이슈 보드 등 공개 페이지 포함)",
            ],
          ]}
        />
        <p>
          서비스는 주민등록번호 등 고유식별정보를 수집하지 않으며, 결제 정보를 직접 저장하지
          않습니다. SDK는 요청의 쿼리 문자열, 헤더, 요청·응답 본문을 수집하지 않습니다.
        </p>
        <p className="font-semibold text-foreground">
          스크린샷에는 촬영 시점 화면의 모든 내용이 담길 수 있습니다. 테스터는 피드백 등록 시
          스크린샷 첨부를 해제할 수 있으며, 서비스 운영자는 개인정보가 노출될 수 있는 화면에서
          첨부하지 않도록 테스터에게 안내할 것을 권장합니다.
        </p>
      </LegalSection>

      <LegalSection title="2. 이용 목적">
        <LegalList
          items={[
            "회원 식별과 로그인, 팀 접근 권한 관리",
            "피드백 수집·조회·상태 관리 등 서비스 핵심 기능 제공",
            "이슈 보드를 통한 처리 현황 공유",
            "서비스 안정성 확보와 오·남용 방지",
            "서비스 이용 현황 통계 분석과 기능 개선",
            "구독 서비스 출시 알림 발송(동의한 경우에 한함)",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. 보유 및 이용 기간">
        <LegalList
          items={[
            "계정 정보: 회원 탈퇴 시까지. 탈퇴하면 계정과 팀 멤버 정보가 즉시 삭제됩니다.",
            "피드백(이슈)과 스크린샷: 해당 프로젝트 또는 팀이 삭제될 때까지. 프로젝트를 삭제하면 이슈와 스크린샷 파일이 함께 삭제됩니다.",
            "구독 알림 신청 정보: 알림 발송 완료 또는 동의 철회 시까지",
            "서비스 이용 기록: 수집일로부터 최대 14개월",
            "관련 법령에서 별도 보존을 요구하는 경우 해당 기간 동안 보관합니다.",
          ]}
        />
        <p>
          회원이 혼자 속한 팀은 탈퇴 시 팀과 그 안의 모든 프로젝트·이슈가 함께 삭제됩니다. 다른
          멤버가 있는 팀의 유일한 소유자는 소유자를 위임한 뒤 탈퇴할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="4. 제3자 제공">
        <p>
          회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만 법령에 근거한 요청이
          있는 경우 관련 절차에 따라 제공할 수 있습니다.
        </p>
      </LegalSection>

      <LegalSection title="5. 처리 위탁">
        <p>서비스 운영을 위해 아래와 같이 개인정보 처리를 위탁하고 있습니다.</p>
        <LegalTable
          head={["수탁자", "위탁 업무", "비고"]}
          rows={[
            ["Supabase, Inc.", "인증, 데이터베이스, 파일 저장", "해외 인프라"],
            ["Vercel, Inc.", "애플리케이션 호스팅", "해외 인프라"],
            ["Google LLC", "Google 계정 로그인", "인증 수단 제공"],
            [
              "Google LLC",
              "서비스 이용 통계 분석(Google Analytics)",
              "해외 인프라",
            ],
          ]}
        />
        <p>
          위탁에 따라 개인정보가 국외에 저장·처리될 수 있습니다. 이용자는 국외 이전을 거부할 수
          있으나, 이 경우 서비스 이용이 제한됩니다.
        </p>
      </LegalSection>

      <LegalSection title="6. 쿠키 및 분석 도구">
        <p>
          회사는 서비스 이용 현황을 파악하고 개선하기 위해 Google LLC의 Google Analytics를
          사용하며, 이 과정에서 쿠키 등 유사 기술이 사용됩니다. 분석은 서비스의 웹 페이지 전반에
          적용되며, 여기에는 팀이 발급한 링크로 접속하는 이슈 보드 등 공개 페이지가 포함됩니다.
        </p>
        <p>
          분석 도구에는 이름, 이메일 주소 등 개인을 직접 식별할 수 있는 정보와 피드백 본문,
          스크린샷을 전송하지 않습니다. 수집되는 값은 방문 페이지, 유입 경로, 기기·브라우저 정보와
          버튼 클릭 등 동작 기록으로 한정됩니다.
        </p>
        <p>이용자는 아래 방법으로 분석을 거부할 수 있습니다.</p>
        <LegalList
          items={[
            "브라우저 설정에서 쿠키 저장을 차단하거나 저장된 쿠키를 삭제",
            <>
              Google에서 제공하는{" "}
              <a
                className="underline"
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noreferrer"
              >
                Google Analytics 차단 브라우저 부가기능
              </a>{" "}
              설치
            </>,
          ]}
        />
        <p>분석을 거부하더라도 서비스 이용에는 제한이 없습니다.</p>
      </LegalSection>

      <LegalSection title="7. 이용자의 권리">
        <p>
          이용자는 언제든지 자신의 개인정보에 대한 열람, 정정, 삭제, 처리 정지를 요구할 수
          있습니다. 계정 삭제는 서비스 내 프로필 메뉴의 &ldquo;회원탈퇴&rdquo;에서 직접 할 수
          있으며, 그 밖의 요청은 아래 연락처로 접수하면 지체 없이 처리합니다.
        </p>
      </LegalSection>

      <LegalSection title="8. 안전성 확보 조치">
        <LegalList
          items={[
            "전송 구간 암호화(HTTPS) 적용",
            "접근 권한 최소화 및 팀 단위 권한 분리",
            "QA 세션 URL의 만료일 설정과 즉시 폐기 기능 제공",
            "피드백 등록 API의 요청 빈도 제한",
          ]}
        />
      </LegalSection>

      <LegalSection title="9. 개인정보 보호책임자">
        <LegalList
          items={[
            "상호: 노글리크루",
            "대표자 및 개인정보 보호책임자: 이은지",
            "사업자등록번호: 808-09-03103",
            <>
              문의: <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="10. 방침의 변경">
        <p>
          본 방침이 변경되는 경우 시행일 최소 7일 전에 서비스 내 공지사항 또는 본 페이지를 통해
          알립니다. 이용자에게 불리한 변경은 30일 전에 알립니다.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
