// src/api/client.ts

const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:5000";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiError extends Error {
  status?: number;
  data?: unknown;
}

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string; // JWT
  headers?: Record<string, string>;
}

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, token, headers = {} }: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const finalHeaders: Record<string, string> = {
    ...headers,
  };

  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (!isFormData) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: isFormData
      ? (body as FormData)
      : body != null
      ? JSON.stringify(body)
      : undefined,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const err: ApiError = new Error(
      (data as any)?.error || response.statusText
    );
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data as T;
}
