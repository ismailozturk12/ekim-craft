import createClient from "openapi-fetch";

/**
 * Backend API client (openapi-fetch).
 *
 * Tip güvenliği için `make gen-sdk` ile `shared/openapi.json` → `lib/api/schema.d.ts` üret.
 * Henüz schema yok; üretildikten sonra:
 *   import type { paths } from "./schema";
 *   export const api = createClient<paths>({ baseUrl: API_URL });
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const api = createClient({ baseUrl: `${API_URL}/api/v1` });

export async function health() {
  const res = await fetch(`${API_URL}/health/`, { cache: "no-store" });
  if (!res.ok) throw new Error("Health check failed");
  return (await res.json()) as { status: string; service: string; version: string };
}
