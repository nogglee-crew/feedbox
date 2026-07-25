"use client";

import { FeedboxProvider } from "@nogglee/feedbox";
import { useState } from "react";
import { HiOutlineTrash } from "react-icons/hi2";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge, Tag } from "@/components/ui/badge";
import { Button, IconButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Code } from "@/components/ui/code";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const ORDERS = [
  {
    id: "ORD-2451",
    customer: "김서연",
    amount: "1,240,000",
    tone: "success" as const,
    state: "결제 완료",
  },
  {
    id: "ORD-2452",
    customer: "박지훈",
    amount: "320,000",
    tone: "warning" as const,
    state: "배송 준비",
  },
  {
    id: "ORD-2453",
    customer: "이하늘",
    amount: "88,000",
    tone: "danger" as const,
    state: "결제 실패",
  },
  {
    id: "ORD-2454",
    customer: "최민석",
    amount: "560,000",
    tone: "neutral" as const,
    state: "취소됨",
  },
];

const TABS = ["주문", "재고", "정산"];

/** SDK smoke test activated with `/demo#session=<token>`. */

export default function DemoPage() {
  const [count, setCount] = useState(0);
  const [tab, setTab] = useState(TABS[0]);

  const projectKey = process.env.NEXT_PUBLIC_DEMO_PROJECT_KEY ?? "";
  const apiKey = process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "";

  return (
    <FeedboxProvider projectKey={projectKey} apiKey={apiKey}>
      <div className="space-y-8 py-4">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">데모 ERP</h1>
            <nav
              aria-label="데모 메뉴"
              className="flex items-center gap-4 text-sm text-muted"
            >
              <a href="#orders" className="hover:text-foreground">
                주문
              </a>
              <a href="#signup" className="hover:text-foreground">
                회원 가입
              </a>
              <a href="#settings" className="hover:text-foreground">
                설정
              </a>
              <Avatar name="데모 사용자" />
            </nav>
          </div>
          <p className="text-sm text-muted">
            SDK가 설치된 고객 웹 서비스 역할을 하는 페이지입니다. 우측 하단
            툴바에서 <b>피드백 남기기</b>를 누르거나 <Code>ESC</Code>를 눌러
            아무 요소나 찍어보세요.
          </p>
        </header>

        {/* 지표 카드 */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "오늘 주문", value: "128" },
            { label: "매출", value: "8.4M" },
            { label: "미처리", value: "12" },
            { label: "반품", value: "3" },
          ].map((stat) => (
            <Card key={stat.label} padding="sm">
              <p className="text-xs font-semibold text-muted">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">{stat.value}</p>
            </Card>
          ))}
        </div>

        {/* 탭 + 검색 + 테이블 */}
        <section id="orders" className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="데이터 종류" className="flex gap-1">
              {TABS.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  onClick={() => setTab(item)}
                  className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                    tab === item
                      ? "bg-surface-inverse text-on-inverse"
                      : "text-muted hover:bg-surface-hover"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                aria-label="주문 검색"
                placeholder="주문번호 검색"
                className="w-44"
              />
              <Select aria-label="기간" defaultValue="7">
                <option value="7">최근 7일</option>
                <option value="30">최근 30일</option>
                <option value="90">최근 90일</option>
              </Select>
              <Button type="submit">조회</Button>
            </form>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-4 py-3 font-semibold">주문번호</th>
                  <th className="px-4 py-3 font-semibold">고객</th>
                  <th className="px-4 py-3 font-semibold">금액</th>
                  <th className="px-4 py-3 font-semibold">상태</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border-subtle last:border-0"
                  >
                    <td className="px-4 py-3">
                      <Code>{order.id}</Code>
                    </td>
                    <td className="px-4 py-3">{order.customer}</td>
                    <td className="px-4 py-3 tabular-nums">{order.amount}원</td>
                    <td className="px-4 py-3">
                      <StatusBadge tone={order.tone}>{order.state}</StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <IconButton
                        size="sm"
                        label={`${order.id} 삭제`}
                        icon={<HiOutlineTrash aria-hidden className="size-4" />}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* 폼 */}
          <div id="signup">
            <Card padding="lg" className="space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">회원 가입</h2>
                <Tag tone="primary">beta</Tag>
              </div>
              <Input
                id="email"
                label="이메일"
                placeholder="name@company.com"
                className="w-full"
              />
              <Input
                id="password"
                type="password"
                label="비밀번호"
                placeholder="8자 이상"
                className="w-full"
              />
              <Select id="plan" label="플랜">
                <option value="free">Free</option>
                <option value="pro">Pro</option>
              </Select>
              <Textarea
                id="note"
                label="요청 사항 (선택)"
                rows={2}
                placeholder="예: 세금계산서 발행이 필요해요"
                className="w-full"
              />
              <Checkbox name="terms" label="이용약관에 동의합니다." />
              <div className="flex gap-2">
                <Button data-testid="signup-button" variant="primary">
                  가입하기
                </Button>
                <Button variant="ghost">취소</Button>
              </div>
            </Card>
          </div>

          {/* 상태 변화 요소 */}
          <div id="settings" className="space-y-4">
            <Card padding="lg" className="space-y-3">
              <h2 className="font-semibold">카운터</h2>
              <p className="text-sm text-muted">
                현재 값: <span data-testid="count">{count}</span>
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setCount((c) => c + 1)}>+1</Button>
                <Button variant="ghost" onClick={() => setCount(0)}>
                  초기화
                </Button>
              </div>
            </Card>

            <Card padding="lg" className="space-y-3">
              <h2 className="font-semibold">위험 구역</h2>
              <p className="text-sm text-muted">
                이 버튼은 실제로 아무것도 삭제하지 않습니다. 눌러본 뒤 피드백을
                남겨보세요.
              </p>
              <Button variant="danger">계정 삭제</Button>
            </Card>
          </div>
        </div>
      </div>
    </FeedboxProvider>
  );
}
