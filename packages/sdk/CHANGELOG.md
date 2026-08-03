# Changelog

이 패키지의 주요 변경 사항을 기록합니다.
버전은 [유의적 버전](https://semver.org/lang/ko/)을 따릅니다.

## [0.1.3] - 2026-08-03

### 문서

- README에 변경 이력 링크 추가. npm 패키지 페이지는 README만 렌더하므로 CHANGELOG를
  패키지에 넣어도 링크가 없으면 사실상 찾을 수 없다
- 0.1.2까지의 변경 이력이 이 릴리스부터 패키지에 함께 배포된다

## [0.1.2] - 2026-08-03

### 수정

- **피드백 모드에서 '이슈 보드' 클릭 시 404** ([#6](https://github.com/nogglee-crew/feedbox/issues/6))

  오버레이가 `apiBaseUrl` 기본값을 적용하지 않고 빈 문자열로 대체해, 링크가
  `/board/<token>` 루트 상대 경로가 됐습니다. 브라우저가 이를 현재 문서 기준으로
  해석하면서 고객사 도메인으로 이동해 404가 발생했습니다.

  `apiBaseUrl`을 지정하지 않는 호스팅 사용자에게만 발생했고, 셀프 호스팅은 영향이
  없었습니다.

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

- **피드백 패널이 서드파티 계측 요청으로 채워지던 문제** ([#7](https://github.com/nogglee-crew/feedbox/issues/7))

  '최근 감지된 에러'에 Google Analytics 요청이 `HttpError · HTTP_0`으로 표시되어
  테스터가 보고하려는 실제 결함을 가리고 있었습니다.

  - `no-cors` 요청의 **opaque 응답을 실패로 기록하지 않습니다.** opaque는 스펙상
    `status`가 항상 0이고 `ok`가 false라, 성공 여부를 알 수 없는 응답을 실패로
    단정하고 있었습니다. GA만이 아니라 모든 `no-cors` 요청에 해당하던 문제입니다.
  - **계측·모니터링 전용 호스트**로 나가는 요청을 진단에서 제외합니다.
    (GA, GTM, Sentry, Amplitude, Mixpanel, Segment, Hotjar, Clarity, PostHog,
    Datadog, New Relic 등)

  호스트 앱의 GA4 지표에는 영향이 없습니다. 요청·응답·에러를 모두 원본 그대로
  통과시키며 기록 여부만 결정합니다. `navigator.sendBeacon`은 패치 대상이 아니라
  GA4의 주 전송 경로는 거치지도 않습니다.

  앱 자체 API 실패는 그대로 기록됩니다. 결제·지도 같은 서드파티 API 실패도 유효한
  결함이므로 교차 출처 전체를 막지는 않았습니다.

## [0.1.0] - 2026-07-25

최초 릴리스.

- `FeedboxProvider` - QA 세션(`#session=<token>`)을 감지해 피드백 모드를 켭니다
- 요소 선택 → 메모 작성 → 스크린샷 첨부로 이슈 등록
- 에러·네트워크 실패 자동 수집 후 이슈에 진단 정보로 첨부
- `captureFeedboxError` - 앱에서 직접 에러를 전달하는 API
- 셀프 호스팅 지원 (`apiBaseUrl`)

[0.1.3]: https://github.com/nogglee-crew/feedbox/releases/tag/sdk-v0.1.3
[0.1.2]: https://github.com/nogglee-crew/feedbox/releases/tag/sdk-v0.1.2
[0.1.1]: https://github.com/nogglee-crew/feedbox/releases/tag/sdk-v0.1.1
[0.1.0]: https://www.npmjs.com/package/@nogglee/feedbox/v/0.1.0
