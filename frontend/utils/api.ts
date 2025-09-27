// Simple API helpers for the Expo app. Reads base URL from EXPO_PUBLIC_API_URL.

export const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

function buildHeaders(token?: string, isJsonBody?: boolean): HeadersInit {
  return {
    ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
  };
}

async function handleResponse(r: Response) {
  if (!r.ok) {
    // Try to surface error body for easier debugging
    const text = await r.text();
    throw new Error(text || r.statusText);
  }
  // 204 No Content or empty body
  const contentType = r.headers.get("content-type") || "";
  if (r.status === 204 || !contentType.includes("application/json")) {
    try {
      const text = await r.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }
  return r.json();
}

export async function apiGet(path: string, token?: string) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: buildHeaders(token, false),
  });
  return handleResponse(r);
}

export async function apiPost(path: string, body: any, token?: string) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: buildHeaders(token, true),
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(r);
}

export async function apiPatch(path: string, body: any, token?: string) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: buildHeaders(token, true),
    body: JSON.stringify(body ?? {}),
  });
  return handleResponse(r);
}

export async function apiDelete(path: string, token?: string) {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: buildHeaders(token, false),
  });
  return handleResponse(r);
}


