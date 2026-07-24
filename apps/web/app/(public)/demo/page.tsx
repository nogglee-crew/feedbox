"use client";

import { FeedboxProvider } from "@nogglee/feedbox";
import { useState } from "react";

/**
 * SDK 동작 확인용 데모 페이지.
 * Dashboard에서 프로젝트/릴리즈/세션을 만들고
 * /demo#session=<token> 으로 접속하면 FEEDBOX 오버레이가 활성화된다.
 */
export default function DemoPage() {
  const [count, setCount] = useState(0);

  const projectKey = process.env.NEXT_PUBLIC_DEMO_PROJECT_KEY ?? "";
  const apiKey = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "";

  return (
    <FeedboxProvider projectKey={projectKey} apiKey={apiKey}>
      <div className="mx-auto max-w-xl space-y-6 py-10">
        <h1 className="text-2xl font-bold">데모 서비스</h1>
        <p className="text-sm text-gray-500">
          이 페이지는 SDK가 설치된 고객 웹 서비스 역할을 합니다. QA URL로 접속하면 우측 하단에 QA
          툴바가 나타납니다.
        </p>


        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold">회원 가입</h2>
          <input id="email" placeholder="이메일" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <input id="password" type="password" placeholder="비밀번호" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" />
          <button
            data-testid="signup-button"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            가입하기
          </button>
        </div>

        <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold">카운터</h2>
          <p className="text-sm text-gray-500">
            현재 값: <span data-testid="count">{count}</span>
          </p>
          <button
            onClick={() => setCount((c) => c + 1)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            +1
          </button>
        </div>
      </div>
    </FeedboxProvider>
  );
}
