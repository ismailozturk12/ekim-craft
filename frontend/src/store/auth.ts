"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_staff?: boolean;
  date_joined?: string;
  marketing_opt_in?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  access: string | null;
  refresh: string | null;
  setAuth: (p: { user: AuthUser; access: string; refresh: string }) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      access: null,
      refresh: null,
      setAuth: ({ user, access, refresh }) => set({ user, access, refresh }),
      setUser: (user) => set({ user }),
      logout: () => set({ user: null, access: null, refresh: null }),
    }),
    { name: "ekim.auth" }
  )
);

/** Zustand persist'ın localStorage'dan rehydrate olup olmadığını dinler. */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const persist = useAuth.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    if (persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    return unsub;
  }, []);
  return hydrated;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/v1/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const msg = res.status === 401 ? "E-posta veya şifre hatalı" : "Giriş başarısız";
    throw new Error(msg);
  }
  return (await res.json()) as { access: string; refresh: string; user: AuthUser };
}

export async function apiRegister(data: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  marketing_opt_in?: boolean;
}) {
  const res = await fetch(`${API_URL}/api/v1/accounts/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error(await apiErrorMessage(res));
  }
  return (await res.json()) as AuthUser;
}

/** Refresh token ile yeni access al. Başarısızsa logout. */
async function refreshAccessToken(): Promise<string | null> {
  const { refresh, logout } = useAuth.getState();
  if (!refresh) return null;
  try {
    const res = await fetch(`${API_URL}/api/v1/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      logout();
      return null;
    }
    const data = (await res.json()) as { access: string; refresh?: string };
    useAuth.setState((s) => ({
      ...s,
      access: data.access,
      refresh: data.refresh ?? s.refresh,
    }));
    return data.access;
  } catch {
    logout();
    return null;
  }
}

export async function authedFetch(path: string, init?: RequestInit): Promise<Response> {
  const buildReq = (token: string | null) =>
    fetch(`${API_URL}/api/v1${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
      },
    });

  const { access } = useAuth.getState();
  let res = await buildReq(access);

  // Access expired → refresh + retry
  if (res.status === 401 && access) {
    const fresh = await refreshAccessToken();
    if (fresh) {
      res = await buildReq(fresh);
    }
  }
  return res;
}

/** API hata yanıtını insana okunaklı string'e çevir — [object Object] engeller. */
export async function apiErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json();

    // SimpleJWT: { detail: "...", code: "token_not_valid", messages: [...] }
    if (body?.code === "token_not_valid") return "Oturum süresi doldu. Tekrar giriş yap.";
    if (typeof body?.detail === "string") return body.detail;

    // DRF validation: { email: ["geçersiz"], password: ["çok kısa"] }
    if (body && typeof body === "object") {
      const parts: string[] = [];
      for (const [k, v] of Object.entries(body)) {
        if (k === "messages") continue;
        if (Array.isArray(v)) {
          parts.push(...v.map((x) => (typeof x === "string" ? x : JSON.stringify(x))));
        } else if (typeof v === "string") {
          parts.push(v);
        } else if (v && typeof v === "object") {
          parts.push(JSON.stringify(v));
        }
      }
      if (parts.length) return parts.join("\n");
    }
    return `İstek başarısız (${res.status})`;
  } catch {
    return `Sunucu hatası (${res.status})`;
  }
}
