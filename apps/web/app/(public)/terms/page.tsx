import { LegalList, LegalPage, LegalSection } from "@/features/legal/components/legal-page";

export const metadata = { title: "이용약관" };

const EFFECTIVE_DATE = "2026년 7월 25일";
const CONTACT = "crew.nogglee@gmail.com";

export default function TermsPage() {
  return (
    <LegalPage title="이용약관" effectiveDate={EFFECTIVE_DATE}>
      <LegalSection title="제1조 (목적)">
        <p>
          본 약관은 노글리크루(이하 &ldquo;회사&rdquo;)가 제공하는 FEEDBOX(이하
          &ldquo;서비스&rdquo;)의 이용 조건과 절차, 회사와 이용자의 권리·의무를 정합니다.
        </p>
      </LegalSection>

      <LegalSection title="제2조 (용어의 정의)">
        <LegalList
          items={[
            "이용자: 본 약관에 동의하고 서비스를 이용하는 자",
            "팀: 프로젝트와 멤버를 묶는 단위이며, 요금제가 적용되는 기준",
            "프로젝트: SDK를 설치할 웹 서비스 단위",
            "QA 세션: 테스터가 피드백을 남길 수 있도록 발급하는 만료 기한이 있는 접근 링크",
            "SDK: 이용자의 웹 서비스에 설치하는 @nogglee/feedbox 라이브러리",
          ]}
        />
      </LegalSection>

      <LegalSection title="제3조 (약관의 효력과 변경)">
        <p>
          본 약관은 서비스 화면에 게시함으로써 효력이 발생합니다. 회사는 관련 법령을 위반하지
          않는 범위에서 약관을 변경할 수 있으며, 변경 시 시행일 최소 7일 전에 공지합니다.
          이용자에게 불리한 변경은 30일 전에 공지하며, 이용자가 시행일까지 거부 의사를 밝히지
          않으면 동의한 것으로 봅니다.
        </p>
      </LegalSection>

      <LegalSection title="제4조 (계정)">
        <LegalList
          items={[
            "서비스는 Google 계정을 통한 로그인만 지원합니다.",
            "이용자는 자신의 계정을 제3자와 공유해서는 안 되며, 계정 관리 소홀로 발생한 문제에 대한 책임은 이용자에게 있습니다.",
            "이용자는 언제든지 서비스 내 회원탈퇴 기능으로 계정을 삭제할 수 있습니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제5조 (서비스의 내용)">
        <p>회사는 다음의 기능을 제공합니다.</p>
        <LegalList
          items={[
            "웹 서비스 화면에서 요소를 지정해 피드백을 등록하는 SDK",
            "선택 요소, 오류, 실패한 API 호출, 브라우저 환경, 스크린샷의 자동 수집",
            "팀·프로젝트·릴리즈 단위의 이슈 관리",
            "로그인 없이 열람 가능한 이슈 보드 공유",
          ]}
        />
      </LegalSection>

      <LegalSection title="제6조 (요금제)">
        <LegalList
          items={[
            "요금제는 팀 단위로 적용됩니다.",
            "무료 플랜은 팀당 프로젝트 1개로 제한됩니다.",
            "유료 구독은 준비 중이며, 도입 시 요금과 조건을 사전에 공지합니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제7조 (이용자의 의무)">
        <p>이용자는 다음 행위를 해서는 안 됩니다.</p>
        <LegalList
          items={[
            "타인의 권리를 침해하거나 법령을 위반하는 내용을 등록하는 행위",
            "정당한 권한 없이 타인의 웹 서비스에 SDK를 설치하는 행위",
            "서비스의 정상적인 운영을 방해하거나 과도한 부하를 유발하는 행위",
            "서비스를 역설계하거나 무단으로 복제·배포하는 행위",
          ]}
        />
        <p className="font-semibold text-foreground">
          이용자는 QA 세션 URL과 이슈 보드 링크가 로그인 없이 접근 가능하다는 점을 인지하고,
          링크 공유 범위를 스스로 관리할 책임이 있습니다. 또한 스크린샷에 개인정보나 기밀 정보가
          포함되지 않도록 테스터에게 안내해야 합니다.
        </p>
      </LegalSection>

      <LegalSection title="제8조 (데이터의 소유와 삭제)">
        <LegalList
          items={[
            "이용자가 등록한 피드백과 첨부 파일의 권리는 이용자에게 있습니다.",
            "회사는 서비스 제공에 필요한 범위에서만 해당 데이터를 처리합니다.",
            "프로젝트 또는 팀을 삭제하면 그에 속한 이슈와 스크린샷 파일이 함께 삭제되며, 삭제된 데이터는 복구할 수 없습니다.",
          ]}
        />
      </LegalSection>

      <LegalSection title="제9조 (서비스의 변경·중단)">
        <p>
          회사는 서비스의 내용을 변경하거나 제공을 중단할 수 있으며, 이 경우 사전에 공지합니다.
          다만 시스템 점검, 장애, 천재지변 등 부득이한 사유가 있는 경우 사후에 공지할 수
          있습니다.
        </p>
      </LegalSection>

      <LegalSection title="제10조 (책임의 제한)">
        <p>
          회사는 무료로 제공되는 서비스와 관련하여 이용자에게 발생한 손해에 대해 회사의 고의 또는
          중대한 과실이 없는 한 책임을 지지 않습니다. 회사는 이용자가 등록한 내용의 정확성이나
          제3자와의 분쟁에 대해 책임지지 않습니다.
        </p>
      </LegalSection>

      <LegalSection title="제11조 (준거법과 관할)">
        <p>
          본 약관은 대한민국 법령에 따라 해석되며, 서비스 이용과 관련한 분쟁은 민사소송법에 따른
          관할 법원에 제기합니다.
        </p>
      </LegalSection>

      <LegalSection title="사업자 정보">
        <LegalList
          items={[
            "상호: 노글리크루",
            "대표자: 이은지",
            "사업자등록번호: 808-09-03103",
            <>
              문의: <a className="underline" href={`mailto:${CONTACT}`}>{CONTACT}</a>
            </>,
          ]}
        />
      </LegalSection>
    </LegalPage>
  );
}
