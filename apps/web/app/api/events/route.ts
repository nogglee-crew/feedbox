import { NextResponse } from "next/server";
import { isLikelyBot } from "@/features/analytics/domain/bots";
import {
  isClientEventName,
  isValidIdentifier,
  sanitizeParams,
  sanitizePath,
  sanitizeReferrer,
} from "@/features/analytics/domain/events";
import { recordEvent, resolveOrgIdFromPath } from "@/features/analytics/server/record-event";
import { getUser } from "@/lib/auth";

const MAX_BODY_BYTES = 4_000;

// 서버리스라 인스턴스별 최선 노력이다. 실제 남용이 보이면 영속 저장소로 옮긴다.
const ANON_RATE_LIMIT_PER_MINUTE = 30;
const IP_RATE_LIMIT_PER_MINUTE = 300;
const recentByAnonId = new Map<string, number[]>();
const recentByIp = new Map<string, number[]>();

function isRateLimited(
  store: Map<string, number[]>,
  key: string,
  limit: number,
): boolean {
  const now = Date.now();
  const hits = (store.get(key) ?? []).filter((at) => now - at < 60_000);
  hits.push(now);
  store.set(key, hits);

  // 유휴 키가 쌓이지 않도록 가끔 정리한다.
  if (store.size > 5_000) {
    for (const [staleKey, stamps] of store) {
      if (stamps.every((at) => now - at >= 60_000)) store.delete(staleKey);
    }
  }
  return hits.length > limit;
}

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    null
  );
}

async function readLimitedJsonBody(request: Request): Promise<Record<string, unknown> | null | "too-large"> {
  const reader = request.body?.getReader();
  if (!reader) return null;

  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) return "too-large";
    chunks.push(value);
  }

  try {
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const raw = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }
  if (isLikelyBot(request.headers.get("user-agent"))) {
    return new NextResponse(null, { status: 204 });
  }

  const ip = clientIp(request);
  if (ip && isRateLimited(recentByIp, ip, IP_RATE_LIMIT_PER_MINUTE)) {
    return new NextResponse(null, { status: 429 });
  }

  const body = await readLimitedJsonBody(request);
  if (body === "too-large") {
    return new NextResponse(null, { status: 413 });
  }
  if (!body) {
    return new NextResponse(null, { status: 400 });
  }

  const { name, anonId, sessionId } = body;
  if (!isClientEventName(name) || !isValidIdentifier(anonId) || !isValidIdentifier(sessionId)) {
    return new NextResponse(null, { status: 400 });
  }
  if (isRateLimited(recentByAnonId, anonId, ANON_RATE_LIMIT_PER_MINUTE)) {
    return new NextResponse(null, { status: 429 });
  }

  const user = await getUser();
  const authUserId = user?.id ?? null;
  const path = sanitizePath(body.path);

  await recordEvent({
    name,
    anonId,
    sessionId,
    authUserId,
    orgId: await resolveOrgIdFromPath(path, authUserId),
    path,
    referrer: sanitizeReferrer(body.referrer),
    // Vercel이 요청마다 붙여주는 지역 헤더. 별도 GeoIP 데이터셋이 필요 없다.
    country: request.headers.get("x-vercel-ip-country"),
    params: sanitizeParams(body.params),
  });

  return new NextResponse(null, { status: 204 });
}
