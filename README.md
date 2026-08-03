# FEEDBOX

버그 제보를 받는 가장 짧은 경로. 사용자가 화면에서 문제가 된 요소를 찍고 메모만 남기면
셀렉터, 에러, 실패한 API 호출, 브라우저 환경, 스크린샷이 자동으로 첨부됩니다.

**<https://feedbox.nogglee.com>** · [데모 체험](https://feedbox.nogglee.com/demo#session=Z72AGKeihOspaMRN3NoNqi8iaVfhtajh) ·
[@nogglee/feedbox](https://www.npmjs.com/package/@nogglee/feedbox)

이 저장소는 FEEDBOX 플랫폼(Next.js 애플리케이션)과 React SDK를 함께 담고 있습니다.

---

## 빠른 시작

FEEDBOX를 쓰려면 [feedbox.nogglee.com](https://feedbox.nogglee.com)에서 팀과 프로젝트를
만들고, 서비스에 SDK를 설치하면 됩니다. 이 저장소를 클론할 필요는 없습니다.

### 코딩 에이전트로 설치

아래 프롬프트를 붙여넣으면 설치부터 Provider 적용까지 한 번에 끝납니다.

```text
Install FEEDBOX (@nogglee/feedbox), a React SDK that collects user feedback with
automatic diagnostics, into this project.

1. Install the package with this project's package manager
   (npm i @nogglee/feedbox / pnpm add @nogglee/feedbox / yarn add @nogglee/feedbox).
2. Find the app's root component and wrap it once with the provider:

   import { FeedboxProvider } from "@nogglee/feedbox";

   <FeedboxProvider projectKey={PROJECT_KEY} apiKey={API_KEY}>
     <App />
   </FeedboxProvider>

3. Read both keys from public client env vars using this framework's convention
   (e.g. NEXT_PUBLIC_FEEDBOX_PROJECT_KEY / VITE_FEEDBOX_PROJECT_KEY), and add
   placeholder entries to the env example file. I will paste the real values
   from the FEEDBOX dashboard (Project → SDK 설치 정보).
4. Do not change any other behavior, styling, or dependencies.
```

### 직접 설치

```bash
npm install @nogglee/feedbox
```

```tsx
import { FeedboxProvider } from "@nogglee/feedbox";

export function App() {
  return (
    <FeedboxProvider
      projectKey={process.env.NEXT_PUBLIC_FEEDBOX_PROJECT_KEY!}
      apiKey={process.env.NEXT_PUBLIC_FEEDBOX_API_KEY!}
    >
      <YourApp />
    </FeedboxProvider>
  );
}
```

`projectKey`와 `apiKey`는 대시보드의 **프로젝트 → SDK 설치 정보**에서 복사합니다.
셀프 호스팅이 아니라면 그게 전부입니다. 서버 주소(`apiBaseUrl`)는 기본값으로 들어갑니다.

SDK 전체 레퍼런스와 문제 해결은 [`packages/sdk/README.md`](packages/sdk/README.md)에 있습니다.

## 동작 방식

```text
팀 → 프로젝트 → 릴리즈 → QA 세션(URL 발급)
                              │
       테스터: {서비스}#session=<token> 접속 → 피드백 모드 → 이슈 등록
                              │
       팀:     대시보드에서 상태·담당자 관리
       고객사:  이슈 보드 링크로 처리 현황 열람 (로그인 불필요)
```

- **QA 세션**은 만료일이 있고 언제든 종료할 수 있습니다. 종료하면 링크가 즉시 무효화됩니다.
- **이슈 보드**는 로그인 없이 열리는 공개 현황판입니다. 고객이 내용을 수정하거나 처리 완료를
  확인할 수 있습니다.
- 이슈는 재현 정보가 담긴 JSON으로 복사해 코딩 에이전트에 바로 붙여넣을 수 있습니다.

---

## 셀프 호스팅 / 개발

플랫폼을 직접 띄우거나 기여하려면 [`CONTRIBUTING.md`](CONTRIBUTING.md)를 보세요.
기여 방법, 구조, 로컬 설정, 작업 규칙, 배포 절차가 정리돼 있습니다.

## 변경 이력

웹 앱은 [`CHANGELOG.md`](CHANGELOG.md), SDK는
[`packages/sdk/CHANGELOG.md`](packages/sdk/CHANGELOG.md)에 정리돼 있습니다.

## License

FEEDBOX 플랫폼 소스는 [GNU AGPL v3](LICENSE)를 따릅니다. 자유롭게 사용·수정·배포할 수
있으며, 수정한 버전을 네트워크 서비스로 제공할 경우 그 사용자에게 소스를 제공해야 합니다.

`packages/sdk`의 `@nogglee/feedbox` SDK는 별도의 [MIT License](packages/sdk/LICENSE)를
적용합니다. 고객 애플리케이션에 설치되는 코드이므로 AGPL이 전파되지 않습니다.
