import { useEffect, useState, useCallback } from "react";
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
  type Grocery,
} from "./habit-data";

const KEY = "habit-tracker-state-v2";

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
  groceries: Grocery[];
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
    groceries: [],
  };
}

function load(): State {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as State;
    return { ...initialState(), ...parsed };
  } catch {
    return initialState();
  }
}

export function useHabitStore() {
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
          groceries: [],
        }
      : load(),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, hydrated]);

  const update = useCallback((fn: (s: State) => State) => setState((prev) => fn(prev)), []);

  return { state, setState, update, hydrated };
}
