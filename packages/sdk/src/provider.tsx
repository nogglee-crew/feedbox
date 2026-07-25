import { useEffect, useState, type ReactNode } from "react";
import { verifySession } from "./api";
import { FeedboxOverlay } from "./overlay";
import type { FeedboxConfig, FeedboxSessionInfo } from "./types";

const STORAGE_KEY = "feedbox:session-token";
const HASH_PARAM = "session";

/** Activates the overlay from the URL fragment or a previously verified session. */
export function FeedboxProvider({
  projectKey,
  apiKey,
  apiBaseUrl,
  children,
}: FeedboxConfig & { children?: ReactNode }) {
  const [session, setSession] = useState<FeedboxSessionInfo | null>(null);

  useEffect(() => {
    const config: FeedboxConfig = { projectKey, apiKey, apiBaseUrl };
    const fragment = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const fromUrl = new URLSearchParams(fragment).get(HASH_PARAM);
    const token = fromUrl ?? sessionStorage.getItem(STORAGE_KEY);
    if (!token) return;

    let cancelled = false;
    verifySession(config, token)
      .then((info) => {
        if (cancelled) return;
        sessionStorage.setItem(STORAGE_KEY, token);
        setSession(info);
      })
      .catch(() => {
        if (cancelled) return;
        sessionStorage.removeItem(STORAGE_KEY);
        setSession(null);
      });
    return () => {
      cancelled = true;
    };
  }, [projectKey, apiKey, apiBaseUrl]);

  return (
    <>
      {children}
      {session && (
        <FeedboxOverlay config={{ projectKey, apiKey, apiBaseUrl }} session={session} />
      )}
    </>
  );
}
