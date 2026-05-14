"use client";

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

const ENABLE_REMOTE_STATE_SYNC = false;

export function getLocalStorageJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setLocalStorageJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // no-op: storage may be blocked/full
  }
}

export function removeLocalStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export async function getRemoteStateJSON<T>(key: string): Promise<T | null> {
  if (!ENABLE_REMOTE_STATE_SYNC) {
    return null;
  }

  try {
    const response = await fetch(`/api/oss/state?key=${encodeURIComponent(key)}`, {
      method: "GET",
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { data?: T | null };
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function setRemoteStateJSON(key: string, data: JsonValue): Promise<boolean> {
  if (!ENABLE_REMOTE_STATE_SYNC) {
    return false;
  }

  try {
    const response = await fetch("/api/oss/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, data })
    });

    return response.ok;
  } catch {
    return false;
  }
}
