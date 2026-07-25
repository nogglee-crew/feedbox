import type {
  CaptureFeedboxErrorOptions,
  IssueDiagnostics,
  IssueErrorContext,
  IssueRequestContext,
} from "./types";

const RECENT_DIAGNOSTIC_MS = 60_000;

const ERROR_CODE = {
  captured: "CAPTURED_ERROR",
  http: (status: number) => `HTTP_${status}`,
  network: "NETWORK_ERROR",
  resource: "RESOURCE_LOAD_ERROR",
  uncaught: "UNCAUGHT_ERROR",
  unhandledRejection: "UNHANDLED_REJECTION",
} as const;

interface StoredDiagnostics {
  capturedAt: number;
  value: IssueDiagnostics;
}

let latestDiagnostics: StoredDiagnostics | null = null;
let installCount = 0;
let teardownCapture: (() => void) | null = null;
let nativeFetch: typeof fetch | null = null;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
}

function sanitizeRequestUrl(value: string): string {
  try {
    const url = new URL(value, window.location.href);
    url.username = "";
    url.password = "";
    url.search = "";
    url.hash = "";
    return url.href.slice(0, 2000);
  } catch {
    return value.split(/[?#]/, 1)[0].slice(0, 2000);
  }
}

function normalizeRequest(
  request: IssueRequestContext,
): IssueRequestContext {
  return {
    method: request.method.trim().toUpperCase().slice(0, 16) || "GET",
    url: sanitizeRequestUrl(request.url),
    status: Number.isInteger(request.status) ? request.status : null,
  };
}

function resolveRequestUrl(path: string, baseUrl: string | null): string {
  if (!baseUrl) return path;
  try {
    return new URL(path, baseUrl).href;
  } catch {
    return path;
  }
}

function requestFromError(error: unknown): IssueRequestContext | null {
  const record = asRecord(error);
  const config = asRecord(record?.config);
  const response = asRecord(record?.response);
  const path = text(config?.url, 2000);
  if (!path) return null;
  const baseUrl = text(config?.baseURL, 2000);
  const url = resolveRequestUrl(path, baseUrl);

  return normalizeRequest({
    method: text(config?.method, 16) ?? "GET",
    url,
    status: typeof response?.status === "number" ? response.status : null,
  });
}

function normalizeError(
  error: unknown,
  fallback: Pick<IssueErrorContext, "name" | "code" | "message">,
): IssueErrorContext {
  const record = asRecord(error);
  const rawCode = record?.code;
  const code =
    typeof rawCode === "number"
      ? String(rawCode)
      : text(rawCode, 120) ?? fallback.code;

  return {
    name: text(record?.name, 120) ?? fallback.name,
    code: code.slice(0, 120),
    message:
      text(record?.message, 2000) ??
      text(error, 2000) ??
      fallback.message,
    stack: text(record?.stack, 10_000),
  };
}

function recordDiagnostics(
  error: IssueErrorContext,
  request: IssueRequestContext | null,
) {
  latestDiagnostics = {
    capturedAt: Date.now(),
    value: {
      error,
      request: request ? normalizeRequest(request) : null,
    },
  };
}

function recordHttpFailure(
  method: string,
  url: string,
  status: number,
) {
  const request = normalizeRequest({ method, url, status });
  recordDiagnostics(
    {
      name: "HttpError",
      code: ERROR_CODE.http(status),
      message: `${request.method} ${request.url} returned ${status}`,
      stack: null,
    },
    request,
  );
}

function recordNetworkFailure(
  error: unknown,
  method: string,
  url: string,
) {
  const request = normalizeRequest({ method, url, status: null });
  recordDiagnostics(
    normalizeError(error, {
      name: "NetworkError",
      code: ERROR_CODE.network,
      message: `${request.method} ${request.url} failed`,
    }),
    request,
  );
}

function requestDetails(
  input: RequestInfo | URL,
  init?: RequestInit,
): { method: string; url: string } {
  if (typeof Request !== "undefined" && input instanceof Request) {
    return {
      method: init?.method ?? input.method,
      url: input.url,
    };
  }
  return {
    method: init?.method ?? "GET",
    url: input.toString(),
  };
}

function resourceUrl(target: EventTarget | null): string | null {
  if (target instanceof HTMLScriptElement) return target.src;
  if (target instanceof HTMLLinkElement) return target.href;
  if (target instanceof HTMLImageElement) return target.currentSrc || target.src;
  return null;
}

function installCapture(): () => void {
  const onError = (event: Event) => {
    if (event instanceof ErrorEvent) {
      const normalized = normalizeError(event.error ?? event.message, {
        name: "Error",
        code: ERROR_CODE.uncaught,
        message: event.message || "Uncaught error",
      });
      if (!normalized.stack && event.filename) {
        normalized.stack = `${event.filename}:${event.lineno}:${event.colno}`;
      }
      recordDiagnostics(
        normalized,
        requestFromError(event.error),
      );
      return;
    }

    const url = resourceUrl(event.target);
    if (!url) return;
    const request = normalizeRequest({ method: "GET", url, status: null });
    recordDiagnostics(
      {
        name: "ResourceLoadError",
        code: ERROR_CODE.resource,
        message: `Failed to load ${request.url}`,
        stack: null,
      },
      request,
    );
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    recordDiagnostics(
      normalizeError(event.reason, {
        name: "UnhandledRejection",
        code: ERROR_CODE.unhandledRejection,
        message: "Unhandled promise rejection",
      }),
      requestFromError(event.reason),
    );
  };

  window.addEventListener("error", onError, true);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  nativeFetch = window.fetch;
  const trackedFetch: typeof fetch = async (input, init) => {
    const request = requestDetails(input, init);
    try {
      const response = await nativeFetch!(input, init);
      if (!response.ok) {
        recordHttpFailure(request.method, request.url, response.status);
      }
      return response;
    } catch (error) {
      recordNetworkFailure(error, request.method, request.url);
      throw error;
    }
  };
  window.fetch = trackedFetch;

  const xhrRequests = new WeakMap<
    XMLHttpRequest,
    { method: string; url: string }
  >();
  const originalOpen = XMLHttpRequest.prototype.open;
  const originalSend = XMLHttpRequest.prototype.send;

  const trackedOpen = function (
    this: XMLHttpRequest,
    ...args: unknown[]
  ) {
    const [method, url] = args;
    if (typeof method === "string" && (typeof url === "string" || url instanceof URL)) {
      xhrRequests.set(this, { method, url: url.toString() });
    }
    return Reflect.apply(originalOpen, this, args);
  } as XMLHttpRequest["open"];

  const trackedSend = function (
    this: XMLHttpRequest,
    ...args: unknown[]
  ) {
    const request = xhrRequests.get(this);
    if (request) {
      this.addEventListener(
        "load",
        () => {
          if (this.status >= 400) {
            recordHttpFailure(request.method, request.url, this.status);
          }
        },
        { once: true },
      );
      this.addEventListener(
        "error",
        () => recordNetworkFailure(null, request.method, request.url),
        { once: true },
      );
      this.addEventListener(
        "timeout",
        () => recordNetworkFailure(null, request.method, request.url),
        { once: true },
      );
    }
    return Reflect.apply(originalSend, this, args);
  } as XMLHttpRequest["send"];

  XMLHttpRequest.prototype.open = trackedOpen;
  XMLHttpRequest.prototype.send = trackedSend;

  return () => {
    window.removeEventListener("error", onError, true);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    if (window.fetch === trackedFetch && nativeFetch) {
      window.fetch = nativeFetch;
    }
    if (XMLHttpRequest.prototype.open === trackedOpen) {
      XMLHttpRequest.prototype.open = originalOpen;
    }
    if (XMLHttpRequest.prototype.send === trackedSend) {
      XMLHttpRequest.prototype.send = originalSend;
    }
    nativeFetch = null;
    latestDiagnostics = null;
  };
}

export function installDiagnosticCapture(): () => void {
  installCount += 1;
  if (installCount === 1) {
    teardownCapture = installCapture();
  }

  let active = true;
  return () => {
    if (!active) return;
    active = false;
    installCount = Math.max(0, installCount - 1);
    if (installCount === 0) {
      teardownCapture?.();
      teardownCapture = null;
    }
  };
}

export function getRecentDiagnostics(): IssueDiagnostics | null {
  if (
    !latestDiagnostics ||
    Date.now() - latestDiagnostics.capturedAt > RECENT_DIAGNOSTIC_MS
  ) {
    return null;
  }
  return latestDiagnostics.value;
}

export function captureFeedboxError(
  error: unknown,
  options: CaptureFeedboxErrorOptions = {},
): void {
  const normalized = normalizeError(error, {
    name: "Error",
    code: ERROR_CODE.captured,
    message: "Captured error",
  });
  if (options.code?.trim()) {
    normalized.code = options.code.trim().slice(0, 120);
  }
  recordDiagnostics(
    normalized,
    options.request ?? requestFromError(error),
  );
}

export function untrackedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  return (nativeFetch ?? globalThis.fetch)(input, init);
}
