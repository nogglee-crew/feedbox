/**
 * 코딩 에이전트가 한 번에 설치를 끝내도록 설계한 프롬프트. 영문이 도구 호환성이 좋다.
 * 키를 주면 실제 값을 provider에 박아 그대로 붙여넣을 수 있게 하고,
 * 없으면 플레이스홀더 + "값을 붙여넣겠다" 안내를 남긴다 (랜딩용).
 */
export function buildInstallPrompt(keys?: { projectKey: string; apiKey: string }): string {
  const providerLine = keys
    ? `   <FeedboxProvider projectKey="${keys.projectKey}" apiKey="${keys.apiKey}">`
    : `   <FeedboxProvider projectKey={PROJECT_KEY} apiKey={API_KEY}>`;

  const step3 = keys
    ? `3. The projectKey and apiKey above are this project's real values from the FEEDBOX dashboard.
   Prefer moving them into public client env vars using this framework's convention
   (e.g. NEXT_PUBLIC_FEEDBOX_PROJECT_KEY / VITE_FEEDBOX_PROJECT_KEY) and add
   placeholder entries to the env example file.`
    : `3. Read both keys from public client env vars using this framework's convention
   (e.g. NEXT_PUBLIC_FEEDBOX_PROJECT_KEY / VITE_FEEDBOX_PROJECT_KEY), and add
   placeholder entries to the env example file. I will paste the real values
   from the FEEDBOX dashboard (Project → SDK 설치 정보).`;

  return `Install FEEDBOX (@nogglee/feedbox), a React SDK that collects user feedback with automatic diagnostics, into this project.

1. Install the package with this project's package manager
   (npm i @nogglee/feedbox / pnpm add @nogglee/feedbox / yarn add @nogglee/feedbox).
2. Find the app's root component and wrap it once with the provider:

   import { FeedboxProvider } from "@nogglee/feedbox";

${providerLine}
     <App />
   </FeedboxProvider>

${step3}
4. Do not change any other behavior, styling, or dependencies.

Docs: https://github.com/nogglee-crew/feedbox`;
}
