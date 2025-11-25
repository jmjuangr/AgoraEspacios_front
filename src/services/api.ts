// src/services/api.ts

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5292/api";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("agora_token");

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  return {};
}

// ---------------------------
// GET genérico
// ---------------------------
export async function apiGet<T>(url: string): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const resp = await fetch(`${API_BASE_URL}${url}`, { headers });

  if (!resp.ok) {
    throw new Error(`Error ${resp.status} al hacer GET ${url}`);
  }

  return (await resp.json()) as T;
}

// ---------------------------
// POST / PUT / DELETE genérico
// ---------------------------
export async function apiSend<T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown
): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  const resp = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Error ${resp.status} en ${method} ${url}`);
  }

  const contentType = resp.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return (await resp.json()) as T;
  }

  return undefined as T;
}
