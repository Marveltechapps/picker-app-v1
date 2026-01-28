/**
 * Face Verification Service
 *
 * Handles API integration for live face verification: upload captured frame,
 * retry logic, and error handling. Replace the placeholder implementation
 * with your actual verify-face endpoint.
 */

const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";
const VERIFY_ENDPOINT = "/verify/face";
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 800;

export type VerifyFacePayload = { uri: string } | { base64: string };

export interface VerifyFaceResult {
  success: boolean;
  verified?: boolean;
  message?: string;
  error?: string;
}

/**
 * Call the verify-face API with retries.
 *
 * - For `{ uri }`: sends multipart/form-data (file upload).
 * - For `{ base64 }`: sends JSON `{ image: base64 }`.
 *
 * @param payload - Either `{ uri: string }` (local file) or `{ base64: string }`
 * @param options - Optional base URL and auth token
 * @returns VerifyFaceResult
 */
export async function verifyFace(
  payload: VerifyFacePayload,
  options?: { baseUrl?: string; token?: string }
): Promise<VerifyFaceResult> {
  const baseUrl = (options?.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const url = `${baseUrl}${VERIFY_ENDPOINT}`;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const headers: Record<string, string> = {};
      if (options?.token) headers["Authorization"] = `Bearer ${options.token}`;

      let res: Response;

      if ("uri" in payload) {
        const form = new FormData();
        form.append("face", {
          uri: payload.uri,
          type: "image/jpeg",
          name: "face.jpg",
        } as unknown as Blob);
        res = await fetch(url, { method: "POST", body: form, headers });
      } else {
        headers["Content-Type"] = "application/json";
        res = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify({ image: payload.base64 }),
        });
      }

      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      const ok = res.ok;

      if (ok) {
        return {
          success: true,
          verified: data.verified === true,
          message: typeof data.message === "string" ? data.message : undefined,
        };
      }

      lastError = new Error(
        typeof data.error === "string" ? data.error : `HTTP ${res.status}`
      );
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }

    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }

  return {
    success: false,
    error: lastError?.message ?? "Verification failed",
  };
}
