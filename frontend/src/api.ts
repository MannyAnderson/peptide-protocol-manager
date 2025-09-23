// Base URL for the backend API. Set EXPO_PUBLIC_API_URL in your Expo env.
export const API_BASE = process.env.EXPO_PUBLIC_API_URL!;

// Simple GET helper that throws on non-2xx responses
export async function apiGet(path: string) {
  // 1) Perform network request
  const r = await fetch(`${API_BASE}${path}`);
  // 2) Throw if response is not 2xx
  if (!r.ok) throw new Error(await r.text());
  // 3) Parse and return JSON
  return r.json();
}

// Simple POST helper. Pass an optional JWT token for auth-protected routes.
export async function apiPost(path: string, body: any, token?: string) {
  // 1) Perform POST with JSON body and optional Bearer token
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  // 2) Throw if response is not 2xx
  if (!r.ok) throw new Error(await r.text());
  // 3) Parse and return JSON
  return r.json();
}


