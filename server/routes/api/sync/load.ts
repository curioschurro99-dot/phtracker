import { defineEventHandler, createError } from "h3";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import {
  habits,
  logs,
  todos,
  buys,
  groceries,
  periods,
  cycleMeta,
  reminders,
  thoughts,
  sleepLogs,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default defineEventHandler(async (event) => {
  const supabase = createSupabaseServerClient(event);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
  }
  const uid = user.id;

  const [h, l, t, b, g, p, cm, r, th, sl] = await Promise.all([
    db.select().from(habits).where(eq(habits.userId, uid)),
    db.select().from(logs).where(eq(logs.userId, uid)),
    db.select().from(todos).where(eq(todos.userId, uid)),
    db.select().from(buys).where(eq(buys.userId, uid)),
    db.select().from(groceries).where(eq(groceries.userId, uid)),
    db.select().from(periods).where(eq(periods.userId, uid)),
    db
      .select()
      .from(cycleMeta)
      .where(eq(cycleMeta.userId, uid))
      .then((r) => r[0] ?? null),
    db.select().from(reminders).where(eq(reminders.userId, uid)),
    db.select().from(thoughts).where(eq(thoughts.userId, uid)),
    db.select().from(sleepLogs).where(eq(sleepLogs.userId, uid)),
  ]);

  const logsMap: Record<string, Record<string, boolean>> = {};
  for (const row of l) {
    if (!logsMap[row.date]) logsMap[row.date] = {};
    logsMap[row.date][row.habitId] = row.done;
  }

  const sleepMap: Record<
    string,
    { bedtime: string; wake: string; quality: string; note?: string; updatedAt: string }
  > = {};
  for (const row of sl) {
    sleepMap[row.date] = {
      bedtime: row.bedtime,
      wake: row.wake,
      quality: row.quality,
      note: row.note ?? undefined,
      updatedAt: row.updatedAt,
    };
  }

  return {
    habits: h.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      order: r.order,
      activeDays: r.activeDays,
    })),
    logs: logsMap,
    todos: t.map((r) => ({
      id: r.id,
      text: r.text,
      done: r.done,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    })),
    buys: b.map((r) => ({
      id: r.id,
      text: r.text,
      price: r.price,
      done: r.done,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    })),
    groceries: g.map((r) => ({
      id: r.id,
      text: r.text,
      price: r.price,
      done: r.done,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    })),
    cycle: {
      periods: p.map((r) => ({ start: r.start, logged: r.logged })),
      avgCycleLength: cm?.avgCycleLength ?? 28,
      avgPeriodLength: cm?.avgPeriodLength ?? 5,
    },
    reminders: r.map((ri) => ({ id: ri.id, habitId: ri.habitId, time: ri.time })),
    thoughts: th.map((t) => ({
      id: t.id,
      header: t.header,
      body: t.body,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      archived: t.archived,
    })),
    sleepLogs: sleepMap,
  };
});
