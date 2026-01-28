/**
 * API Client Utility
 * 
 * Centralized HTTP client with authentication, error handling, and request/response interceptors.
 * Uses fetch API (React Native compatible).
 */

const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.example.com";

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: unknown;
}

export class ApiClientError extends Error {
  code?: string;
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Get auth token from storage
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const AsyncStorage = await import("@react-native-async-storage/async-storage");
    return await AsyncStorage.default.getItem("@auth/token");
  } catch {
    return null;
  }
}

/**
 * API Client with automatic auth and error handling
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = DEFAULT_BASE_URL.replace(/\/$/, "");
  const url = `${baseUrl}${endpoint}`;

  // Get auth token
  const token = await getAuthToken();
  
  // Prepare headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: unknown;
    if (isJson) {
      data = await response.json().catch(() => ({}));
    } else {
      data = await response.text().catch(() => "");
    }

    if (!response.ok) {
      const errorData = data as { message?: string; error?: string; code?: string; details?: unknown };
      throw new ApiClientError(
        errorData.message || errorData.error || `HTTP ${response.status}`,
        response.status,
        errorData.code,
        errorData.details
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiClientError(
      error instanceof Error ? error.message : "Network request failed",
      0,
      "NETWORK_ERROR"
    );
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = unknown>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = unknown>(endpoint: string, body?: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = unknown>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: "DELETE" });
}
