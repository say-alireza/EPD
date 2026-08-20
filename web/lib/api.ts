import { RegistrationPayload, RegistrationResponse, Session } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || JSON.stringify(errorJson);
    } catch {
      // Ignore fallback
    }
    throw new Error(errorDetail);
  }

  return response.json() as Promise<T>;
}

export async function getSessions(): Promise<Session[]> {
  return apiFetch<Session[]>("/api/sessions/");
}

export async function createRegistration(payload: RegistrationPayload): Promise<RegistrationResponse> {
  return apiFetch<RegistrationResponse>("/api/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
