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
