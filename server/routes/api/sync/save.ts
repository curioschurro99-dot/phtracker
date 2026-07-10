import { defineEventHandler, readBody, createError } from "h3";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { db } from "@/lib/db";
import {
  users,
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
  const body = await readBody(event);
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: "Bad Request" });
  }

  const state = body.state as Record<string, unknown>;

  await db.insert(users).values({ id: uid }).onConflictDoNothing();

  await db.transaction(async (tx) => {
    await tx.delete(habits).where(eq(habits.userId, uid));
    await tx.delete(logs).where(eq(logs.userId, uid));
    await tx.delete(todos).where(eq(todos.userId, uid));
    await tx.delete(buys).where(eq(buys.userId, uid));
    await tx.delete(groceries).where(eq(groceries.userId, uid));
    await tx.delete(periods).where(eq(periods.userId, uid));
    await tx.delete(cycleMeta).where(eq(cycleMeta.userId, uid));
    await tx.delete(reminders).where(eq(reminders.userId, uid));
    await tx.delete(thoughts).where(eq(thoughts.userId, uid));
    await tx.delete(sleepLogs).where(eq(sleepLogs.userId, uid));

    if (!tx) return;

    const h = state.habits as Array<{
      id: string;
      name: string;
      description: string;
      order: number;
      activeDays: string[];
    }>;
    if (h.length) {
      await tx.insert(habits).values(h.map((r) => ({ ...r, userId: uid })));
    }

    const l = state.logs as Record<string, Record<string, boolean>>;
    if (l) {
      const rows: Array<{
        id: string;
        userId: string;
        date: string;
        habitId: string;
        done: boolean;
      }> = [];
      let id = 0;
      for (const [date, habitsMap] of Object.entries(l)) {
        for (const [habitId, done] of Object.entries(habitsMap)) {
          rows.push({ id: `log-${uid}-${id++}`, userId: uid, date, habitId, done });
        }
      }
      if (rows.length) await tx.insert(logs).values(rows);
    }

    const t = state.todos as Array<{
      id: string;
      text: string;
      done: boolean;
      createdAt: string;
      completedAt: string | null;
    }>;
    if (t.length) {
      await tx.insert(todos).values(t.map((r) => ({ ...r, userId: uid })));
    }

    const b = state.buys as Array<{
      id: string;
      text: string;
      price: number;
      done: boolean;
      createdAt: string;
      completedAt: string | null;
    }>;
    if (b.length) {
      await tx.insert(buys).values(b.map((r) => ({ ...r, userId: uid })));
    }

    const g = state.groceries as Array<{
      id: string;
      text: string;
      price: number;
      done: boolean;
      createdAt: string;
      completedAt: string | null;
    }>;
    if (g.length) {
      await tx.insert(groceries).values(g.map((r) => ({ ...r, userId: uid })));
    }

    const p = (state.cycle as { periods?: Array<{ start: string; logged: boolean }> })?.periods;
    if (p.length) {
      await tx.insert(periods).values(
        p.map((r) => ({
          id: `per-${uid}-${r.start}`,
          userId: uid,
          start: r.start,
          logged: r.logged,
        })),
      );
    }

    const cm = state.cycle as { avgCycleLength?: number; avgPeriodLength?: number } | undefined;
    if (cm && (cm.avgCycleLength || cm.avgPeriodLength)) {
      await tx.insert(cycleMeta).values({
        userId: uid,
        avgCycleLength: cm.avgCycleLength ?? 28,
        avgPeriodLength: cm.avgPeriodLength ?? 5,
      });
    }

    const r = state.reminders as Array<{ id: string; habitId: string; time: string }>;
    if (r.length) {
      await tx.insert(reminders).values(r.map((ri) => ({ ...ri, userId: uid })));
    }

    const th = state.thoughts as Array<{
      id: string;
      header: string;
      body: string;
      createdAt: string;
      updatedAt: string;
      archived?: boolean;
    }>;
    if (th.length) {
      await tx
        .insert(thoughts)
        .values(th.map((ri) => ({ ...ri, userId: uid, archived: ri.archived ?? false })));
    }

    const sl = state.sleepLogs as Record<
      string,
      { bedtime: string; wake: string; quality: string; note?: string; updatedAt: string }
    >;
    if (sl) {
      const rows = Object.entries(sl).map(([date, v]) => ({
        id: `slp-${uid}-${date}`,
        userId: uid,
        date,
        bedtime: v.bedtime,
        wake: v.wake,
        quality: v.quality,
        note: v.note ?? null,
        updatedAt: v.updatedAt,
      }));
      if (rows.length) await tx.insert(sleepLogs).values(rows);
    }
  });

  return { ok: true };
});
