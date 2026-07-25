# @nogglee/feedbox

React SDK for collecting FEEDBOX feedback directly from a web page. Testers point at the
element that broke and write a note; the SDK attaches the selector, recent errors, failed
API calls, viewport, browser, and a screenshot.

Product: <https://feedbox.nogglee.com>

## Install

```bash
npm install @nogglee/feedbox
# pnpm add @nogglee/feedbox
# yarn add @nogglee/feedbox
```

## Setup

Wrap the app root once.

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

Both keys come from the dashboard: **Project → SDK 설치 정보**.

### Props

| Prop         | Required | Description                                                       |
| ------------ | -------- | ----------------------------------------------------------------- |
| `projectKey` | yes      | Project identifier from the dashboard.                            |
| `apiKey`     | yes      | Project API key from the dashboard.                               |
| `apiBaseUrl` | no       | Self-hosting only. Defaults to `https://feedbox.nogglee.com`.     |

Both keys are exposed to the browser by design. They only permit creating issues for that
project, and every write additionally requires a valid QA session token.

## Using it

1. In the dashboard, create a release and issue a QA URL.
2. Open the generated link: `https://your-service.com#session=<token>`.
3. The toolbar appears at the bottom right. Press **피드백 남기기** or <kbd>ESC</kbd> to
   start picking an element; <kbd>ESC</kbd> again cancels.
4. Pick an element, write a note, submit. The issue lands in the dashboard and on the
   public issue board.

The SDK verifies the token, strips it from the URL, and keeps it in `sessionStorage`, so
navigating within the app keeps the toolbar alive. Without a valid token nothing renders,
so ordinary visitors never see the overlay.

## What gets collected

Attached automatically when present, from the previous 60 seconds:

- CSS selector and text of the picked element, plus the page URL
- Uncaught errors, unhandled rejections, resource load failures
- Failed `fetch` / `XHR` requests: method, URL, status code
- Viewport size and user agent
- A screenshot of the moment (the tester can uncheck it)

Not collected: query strings, request/response bodies, and headers.

Fallback error codes are `UNCAUGHT_ERROR`, `UNHANDLED_REJECTION`, `RESOURCE_LOAD_ERROR`,
`NETWORK_ERROR`, and `HTTP_<status>`.

### Reporting handled errors

Errors you catch yourself never reach the global handlers, so report them explicitly from
an error boundary or `catch` block:

```tsx
import { captureFeedboxError } from "@nogglee/feedbox";

try {
  await checkout();
} catch (error) {
  captureFeedboxError(error, { code: "CHECKOUT_FAILED" });
}
```

The captured error is attached to the next issue submitted within 60 seconds.

## Troubleshooting

**The toolbar does not appear.** Work through these in order:

1. Is `#session=<token>` in the URL? Without it nothing renders — this is intended.
2. Is the release still open? Closing a release revokes its sessions.
3. Has the QA URL expired? Check the expiry date in the dashboard session list.
4. Was the session ended manually? Revoked sessions stop working immediately.
5. If you self-host, does `apiBaseUrl` point at your FEEDBOX server? A 404 on
   `/api/sdk/sessions/verify` means it is hitting the wrong origin.
6. Is `FeedboxProvider` mounted on the page you opened? It only works inside its subtree.

**The toolbar appears but submitting fails.** Verify `projectKey` / `apiKey` against the
dashboard, and confirm the QA session belongs to that same project.

**Screenshots are missing.** Capture is best effort. Cross-origin images and iframes may be
blanked by the browser; the issue is still created without the screenshot.

## Requirements

React 18 or later, and evergreen browsers — the overlay relies on the native `<dialog>`
element and the Clipboard API.

## License

The `@nogglee/feedbox` SDK is available under the [MIT License](LICENSE), so installing it
does not affect your application's licensing. The FEEDBOX platform itself is licensed
separately under the GNU AGPL v3.
