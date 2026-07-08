import type { State } from "./habit-store";

export function createSyncClient(userId: string) {
  const base = "/api/sync";

  async function load(): Promise<State | null> {
    try {
      const res = await fetch(`${base}/load`, { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      return data as State;
    } catch {
      return null;
    }
  }

  async function save(state: State): Promise<boolean> {
    try {
      const res = await fetch(`${base}/save`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  return { load, save, userId };
}

export type SyncClient = ReturnType<typeof createSyncClient>;
