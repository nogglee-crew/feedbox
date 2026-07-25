# @nogglee/feedbox

React SDK for collecting FEEDBOX feedback directly from a web page.

```bash
npm install @nogglee/feedbox
```

```tsx
import { FeedboxProvider } from "@nogglee/feedbox";

<FeedboxProvider
  projectKey="project-key"
  apiKey="project-api-key"
  apiBaseUrl="https://feedbox.example.com"
>
  <App />
</FeedboxProvider>;
```

Open a generated FEEDBOX link in the form `https://service.example.com#session=<token>`.

The SDK automatically attaches uncaught errors, unhandled rejections, and failed
Fetch/XHR request metadata detected within the previous minute. Query strings,
headers, and request/response bodies are not collected.

Handled errors can be supplied from an error boundary or `catch` block:

```tsx
import { captureFeedboxError } from "@nogglee/feedbox";

captureFeedboxError(error, { code: "CHECKOUT_FAILED" });
```

Automatic fallback codes are `UNCAUGHT_ERROR`, `UNHANDLED_REJECTION`,
`RESOURCE_LOAD_ERROR`, `NETWORK_ERROR`, and `HTTP_<status>`.

## License

The `@nogglee/feedbox` SDK is available under the [MIT License](LICENSE). The FEEDBOX platform source is licensed separately under the PolyForm Perimeter License 1.0.0.
