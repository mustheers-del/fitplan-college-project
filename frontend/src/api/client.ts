// frontend/src/api/client.ts
//
// The ONLY place in the frontend that calls fetch().
//
// Nobody writes fetch() inside a page component. Everything goes through here,
// so authentication headers, error handling and the base URL live in one file.
//
// OWNER: Mustheer.

const BASE_URL: string = import.meta.env.VITE_API_URL ?? "";

if (!BASE_URL && import.meta.env.DEV) {
  console.warn(
    "[api] VITE_API_URL is not set. Create frontend/.env.local containing:\n" +
      "      VITE_API_URL=https://<api-id>.execute-api.us-east-1.amazonaws.com\n" +
      "      (Parshuram posts this URL in the group after his first deploy.)",
  );
}

/**
 * The Cognito JWT, held in memory only.
 *
 * Deliberately NOT in localStorage — a token in localStorage is readable by any
 * script on the page, which is the standard XSS token-theft route. Sprint 2
 * replaces this with a proper auth provider that refreshes it.
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

/** Thrown by every failed request. Pages catch this and show err.message. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public detail?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, signal } = options;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (err) {
    // Network-level failure: offline, DNS, CORS, server unreachable.
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError(0, "Could not reach the server. Check your connection.");
  }

  // 204 No Content — nothing to parse.
  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let payload: unknown = undefined;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    // Our backend returns { "detail": "readable message" } on a 400.
    const detail =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail: unknown }).detail)
        : undefined;

    throw new ApiError(
      response.status,
      detail ?? `Request failed (${response.status})`,
      payload,
    );
  }

  return payload as T;
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
