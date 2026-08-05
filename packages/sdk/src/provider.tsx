import { useEffect, useState, type ReactNode } from "react";
import { verifySession } from "./api";
import { installDiagnosticCapture } from "./diagnostics";
import { FeedboxLoadingToolbar, FeedboxOverlay } from "./overlay";
import type { FeedboxConfig, FeedboxSessionInfo } from "./types";

const STORAGE_KEY = "feedbox:session-token";
const HASH_PARAM = "session";

interface ActiveSession {
  info: FeedboxSessionInfo;
  entryNoticeKey: number;
}

function removeSessionFragment(): void {
  const url = new URL(window.location.href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  fragment.delete(HASH_PARAM);
  url.hash = fragment.toString();
  window.history.replaceState(window.history.state, "", url);
}

/** Activates the overlay from the URL fragment or a previously verified session. */
export function FeedboxProvider({
  projectKey,
  apiKey,
  apiBaseUrl,
  children,
}: FeedboxConfig & { children?: ReactNode }) {
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [hashTick, setHashTick] = useState(0);

  // SPA에서 새 세션 링크로 이동하면 해시만 바뀌어 리로드가 없다.
  // hashchange를 듣지 않으면 기존 세션이 유지된 채 이슈가 옛 세션으로 등록된다.
  useEffect(() => {
    const onHashChange = () => {
      const fragment = window.location.hash.slice(1);
      if (new URLSearchParams(fragment).get(HASH_PARAM)) setHashTick((tick) => tick + 1);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    const config: FeedboxConfig = { projectKey, apiKey, apiBaseUrl };
    const fragment = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const fromUrl = new URLSearchParams(fragment).get(HASH_PARAM);
    const token = fromUrl ?? sessionStorage.getItem(STORAGE_KEY);
    if (!token) {
      setSession(null);
      setVerifying(false);
      return;
    }

    setSession(null);
    setVerifying(true);
    const stopDiagnosticCapture = installDiagnosticCapture();
    let cancelled = false;
    verifySession(config, token)
      .then((info) => {
        if (cancelled) return;
        sessionStorage.setItem(STORAGE_KEY, token);
        if (fromUrl) removeSessionFragment();
        setSession({ info, entryNoticeKey: fromUrl ? Date.now() : 0 });
      })
      .catch(() => {
        if (cancelled) return;
        sessionStorage.removeItem(STORAGE_KEY);
        setSession(null);
      })
      .finally(() => {
        if (!cancelled) setVerifying(false);
      });
    return () => {
      cancelled = true;
      stopDiagnosticCapture();
    };
  }, [projectKey, apiKey, apiBaseUrl, hashTick]);

  return (
    <>
      {children}
      {verifying && !session && <FeedboxLoadingToolbar />}
      {session && (
        <FeedboxOverlay
          config={{ projectKey, apiKey, apiBaseUrl }}
          session={session.info}
          entryNoticeKey={session.entryNoticeKey}
        />
      )}
    </>
  );
}
