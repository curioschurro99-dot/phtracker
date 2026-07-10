import { useEffect, useState, useCallback, useRef } from "react";
import {
  seedHabits,
  type Habit,
  type Todo,
  type Buy,
  type Cycle,
  type Reminder,
  type Logs,
  type Thought,
  type SleepLogs,
  type GratitudeLogs,
  type Grocery,
  type Gratitudes,
} from "./habit-data";
import type { SyncClient } from "./sync";

function storageKey(userId?: string | null): string {
  if (userId) return `habit-tracker-state-v2-${userId}`;
  return "habit-tracker-state-v2";
}

export type State = {
  habits: Habit[];
  logs: Logs;
  todos: Todo[];
  buys: Buy[];
  cycle: Cycle;
  reminders: Reminder[];
  seeded: boolean;
  thoughts: Thought[];
  sleepLogs: SleepLogs;
  gratitude: GratitudeLogs;
  groceries: Grocery[];
  gratitudes: Gratitudes;
};

function initialState(): State {
  return {
    habits: seedHabits(),
    logs: {},
    todos: [],
    buys: [],
    cycle: { periods: [], avgCycleLength: 28, avgPeriodLength: 5 },
    reminders: [],
    seeded: true,
    thoughts: [],
    sleepLogs: {},
    gratitude: {},
    groceries: [],
    gratitudes: {},
  };
}

function load(userId?: string | null): State {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as State;
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

export function useHabitStore(userId?: string | null, syncClient?: SyncClient | null) {
  const [state, setState] = useState<State>(() =>
    typeof window === "undefined"
      ? {
          habits: [],
          logs: {},
          todos: [],
          buys: [],
          cycle: { periods: [], avgCycleLength: 28, avgPeriodLength: 5 },
          reminders: [],
          seeded: false,
          thoughts: [],
          sleepLogs: {},
          gratitude: {},
          groceries: [],
          gratitudes: {},
        }
      : load(userId),
  );
  const [hydrated, setHydrated] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const syncTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setState(load(userId));
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(state));
    } catch {
      void 0;
    }
  }, [state, hydrated, userId]);

  useEffect(() => {
    if (!hydrated || !syncClient) return;
    syncClient.load().then((serverState) => {
      if (!serverState || !syncClient) return;
      const hasData =
        serverState.habits.length > 0 ||
        Object.keys(serverState.logs).length > 0 ||
        serverState.todos.length > 0;
      if (!hasData) return;
      setState((prev) => ({ ...initialState(), ...prev, ...serverState }));
    });
  }, [hydrated, syncClient]);

  useEffect(() => {
    if (!hydrated || !syncClient) return;
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      syncClient.save(state).then((ok) => {
        if (ok) setLastSavedAt(new Date().toISOString());
      });
    }, 2000);
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [state, hydrated, syncClient]);

  const update = useCallback((fn: (s: State) => State) => setState((prev) => fn(prev)), []);

  return { state, setState, update, hydrated, lastSavedAt };
}
