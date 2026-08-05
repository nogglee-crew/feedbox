# Changelog

이 패키지의 주요 변경 사항을 기록합니다.
버전은 [유의적 버전](https://semver.org/lang/ko/)을 따릅니다.

## [0.1.4] - 2026-08-05

### 수정

- **새 세션 링크로 들어가도 이슈가 이전 세션에 등록되던 문제** ([#12](https://github.com/nogglee-crew/feedbox/issues/12))

  이미 열려 있던 화면에서 새 세션 링크를 열면, 화면이 새로 뜨지 않아
  이전 세션이 그대로 유지됐습니다. 이후 등록한 이슈가 이전 세션의 이슈 보드에
  섞여 보였습니다.

  이제 새 링크를 열면 새 세션으로 바로 전환됩니다.

- **스크린샷 저장에 실패해도 아무 안내가 없던 문제** ([#13](https://github.com/nogglee-crew/feedbox/issues/13))

  스크린샷을 첨부했는데 저장이 안 되면 알 방법이 없었습니다.

  이제 실패하면 등록 완료 메시지에 함께 표시되고, 원인이 브라우저 콘솔에 남아
  문제를 추적할 수 있습니다.

- **등록 완료 메시지의 이슈 번호가 이슈 보드와 다르게 표시되던 문제** ([#14](https://github.com/nogglee-crew/feedbox/issues/14))

  내부 관리용 번호가 표시되고 있었습니다.

  이제 이슈 보드에서 보는 번호와 같은 번호로 안내합니다.

## [0.1.3] - 2026-08-03

### 문서

- README에 변경 이력 링크 추가. npm 패키지 페이지는 README만 렌더하므로 CHANGELOG를
  패키지에 넣어도 링크가 없으면 사실상 찾을 수 없다
- 0.1.2까지의 변경 이력이 이 릴리스부터 패키지에 함께 배포된다

### 내부

- 버전이 오른 채로 main에 머지되면 자동 배포하도록 릴리스 워크플로를 바꿨다.
  태그 푸시로 직접 배포하는 방법도 그대로 쓸 수 있다

## [0.1.2] - 2026-08-03

### 수정

- **피드백 모드에서 '이슈 보드' 클릭 시 404가 나오던 문제** ([#6](https://github.com/nogglee-crew/feedbox/issues/6))

  이슈 보드 링크가 FEEDBOX가 아니라 피드백 중인 서비스의 주소로 잘못 연결돼
  없는 페이지가 열렸습니다.

  `apiBaseUrl`을 따로 지정하지 않은 기본 설정에서만 발생했습니다.

> [!IMPORTANT]
> SDK는 앱 번들에 포함되므로, 의존성을 올린 뒤 **앱을 재배포해야** 반영됩니다.
> 적용 여부는 콘솔에서 확인할 수 있습니다.
>
> ```js
> document.querySelector('[data-feedbox="board-link"]').href;
> // https://feedbox.nogglee.com/board/... → 정상
> ```

## [0.1.1] - 2026-07-27

### 수정

- **'최근 감지된 에러'에 분석 도구 요청이 섞여 나오던 문제** ([#7](https://github.com/nogglee-crew/feedbox/issues/7))

  Google Analytics 같은 분석·모니터링 도구의 요청이 에러처럼 표시되어,
  테스터가 보고하려는 실제 문제를 가리고 있었습니다.

  이제 분석 도구로 나가는 요청과 성공 여부를 알 수 없는 요청(`no-cors`)은
  목록에 넣지 않습니다. 서비스의 분석 지표 수집에는 영향이 없고,
  서비스 자체 API의 실패는 변함없이 기록됩니다.

## [0.1.0] - 2026-07-25

최초 릴리스.

### 추가

- **요소 지정 이슈 등록** - 화면에서 문제가 된 요소를 찍고 메모를 남겨 이슈를
  등록합니다
- **자동 진단 수집** - 등록 시점의 에러·실패한 요청·화면 정보를 자동으로 수집해
  이슈에 첨부합니다
- **스크린샷 자동 첨부** - 등록하는 화면을 자동으로 캡처해 함께 저장합니다
- **에러 직접 전달** - 앱에서 에러를 바로 넘길 수 있는 `captureFeedboxError` API
- **셀프 호스팅 지원** - `apiBaseUrl`로 자체 서버 주소를 지정할 수 있습니다

[0.1.3]: https://github.com/nogglee-crew/feedbox/releases/tag/sdk-v0.1.3
[0.1.2]: https://github.com/nogglee-crew/feedbox/releases/tag/sdk-v0.1.2
[0.1.1]: https://github.com/nogglee-crew/feedbox/releases/tag/sdk-v0.1.1
[0.1.0]: https://www.npmjs.com/package/@nogglee/feedbox/v/0.1.0
