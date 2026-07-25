"use client";

import { FeedboxProvider } from "@nogglee/feedbox";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

/** SDK smoke test activated with `/demo#session=<token>`. */
export default function DemoPage() {
  const [count, setCount] = useState(0);

  const projectKey = process.env.NEXT_PUBLIC_DEMO_PROJECT_KEY ?? "";
  const apiKey = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "";

  return (
    <FeedboxProvider projectKey={projectKey} apiKey={apiKey}>
      <div className="mx-auto max-w-xl space-y-6 py-10">
        <h1 className="text-2xl font-bold">데모 서비스</h1>
        <p className="text-sm text-muted">
          이 페이지는 SDK가 설치된 고객 웹 서비스 역할을 합니다. QA URL로 접속하면 우측 하단에 QA
          툴바가 나타납니다.
        </p>


        <Card padding="lg" className="space-y-4">
          <h2 className="font-semibold">회원 가입</h2>
          <Input id="email" aria-label="이메일" placeholder="이메일" className="w-full" />
          <Input
            id="password"
            type="password"
            aria-label="비밀번호"
            placeholder="비밀번호"
            className="w-full"
          />
          <Button data-testid="signup-button" variant="primary">
            가입하기
          </Button>
        </Card>

        <Card padding="lg" className="space-y-3">
          <h2 className="font-semibold">카운터</h2>
          <p className="text-sm text-muted">
            현재 값: <span data-testid="count">{count}</span>
          </p>
          <Button onClick={() => setCount((c) => c + 1)}>+1</Button>
        </Card>
      </div>
    </FeedboxProvider>
  );
}
