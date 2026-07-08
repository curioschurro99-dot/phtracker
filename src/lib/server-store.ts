import { createServerFn } from "@tanstack/react-start";
import fs from "node:fs";
import path from "node:path";
import { seedHabits } from "./habit-data";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "store.json");

function getPassword(): string {
  return process.env.APP_PASSWORD || "changeme";
}

function defaultState() {
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

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState(), null, 2));
  }
}

export const loadServerState = createServerFn({ method: "GET" })
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    if (data.password !== getPassword()) {
      throw new Error("UNAUTHORIZED");
    }
    ensureFile();
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  });

export const saveServerState = createServerFn({ method: "POST" })
  .validator((data: { password: string; state: unknown }) => data)
  .handler(async ({ data }) => {
    if (data.password !== getPassword()) {
      throw new Error("UNAUTHORIZED");
    }
    ensureFile();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data.state, null, 2));
    return { ok: true };
  });
