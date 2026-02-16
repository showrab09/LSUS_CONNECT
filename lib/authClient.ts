/**
 * lib/authClient.ts
 * Centralized client side auth API helper for the app router pages.
 * Keeps request logic, error handling, and types consistent across auth screens.
 */

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

const DEFAULT_ERROR = "Something went wrong. Please try again.";

function getBaseUrl(): string {
  // Use NEXT_PUBLIC_API_BASE_URL if defined, otherwise fall back to relative calls.
  // Example: NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
  return process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "";
}

async function safeJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function normalizeError(payload: unknown): string {
  if (!payload) return DEFAULT_ERROR;
  if (typeof payload === "string") return payload;

  if (typeof payload === "object" && payload !== null) {
    const anyPayload = payload as Record<string, unknown>;
    const msg = anyPayload.message ?? anyPayload.error ?? anyPayload.detail;
    if (typeof msg === "string" && msg.trim().length > 0) return msg.trim();
  }

  return DEFAULT_ERROR;
}

async function requestJson<T>(
  path: string,
  options: RequestInit
): Promise<ApiResult<T>> {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const payload = await safeJson<unknown>(res);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: normalizeError(payload),
      };
    }

    return {
      ok: true,
      data: (payload ?? ({} as unknown)) as T,
    };
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." };
  }
}

/**
 * Forgot password
 * Expected backend: POST /api/auth/forgot-password
 * Body: { email: string }
 * Response example: { message: string }
 */
export async function forgotPassword(email: string): Promise<ApiResult<{ message: string }>> {
  return requestJson<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

/**
 * Reset password
 * Expected backend: POST /api/auth/reset-password
 * Body: { token: string, password: string }
 * Response example: { message: string }
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<ApiResult<{ message: string }>> {
  return requestJson<{ message: string }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

/**
 * Verify email
 * Expected backend: POST /api/auth/verify-email
 * Body: { token: string }
 * Response example: { message: string }
 */
export async function verifyEmail(token: string): Promise<ApiResult<{ message: string }>> {
  return requestJson<{ message: string }>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}
