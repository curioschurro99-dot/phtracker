import { useEffect, useState } from "react";
import { useHabitStore } from "@/lib/habit-store";
import {
  cycleInfoForDate,
  dayNameFromDate,
  DAYS,
  PHASE_COLORS,
  todayStr,
  uid,
  ALL_DAYS,
  type Habit,
  type Phase,
} from "@/lib/habit-data";
import { Button, Card, COLORS, IconArrowDown, IconArrowUp, IconCheck, IconPencil, IconTrash, Input, Muted, SectionTitle, Textarea } from "./ui";
import { DaysSelector } from "./DaysSelector";

type Tab = "today" | "week" | "month" | "cycle" | "todos" | "buys" | "grocery" | "thoughts" | "analysis" | "habits" | "reminders";

const TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "cycle", label: "Cycle" },
  { id: "todos", label: "To-Dos" },
  { id: "buys", label: "To-Buys" },
  { id: "grocery", label: "Grocery" },
  { id: "thoughts", label: "Thoughts" },
  { id: "analysis", label: "Analysis" },
  { id: "habits", label: "Habits" },
  { id: "reminders", label: "Reminders" },
];

export function HabitApp() {
  const [tab, setTab] = useState<Tab>("today");
  const store = useHabitStore();

  // Reminders check
  useReminderNotifier(store);

  if (!store.hydrated) {
    return <div style={{ minHeight: "100vh", background: COLORS.bg }} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.text,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px 80px" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.2 }}>Habit Tracker</div>
          <Muted style={{ fontSize: 13 }}>Local-only · Atomic Habits inspired</Muted>
        </header>

        <nav
          style={{
            background: "#EDEDF0",
            borderRadius: 999,
            padding: 4,
            display: "flex",
            gap: 2,
            overflowX: "auto",
            marginBottom: 20,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: tab === t.id ? COLORS.text : "transparent",
                color: tab === t.id ? "#fff" : COLORS.sub,
                border: "none",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "today" && <TodayTab store={store} />}
        {tab === "week" && <WeekTab store={store} />}
        {tab === "month" && <MonthTab store={store} />}
        {tab === "cycle" && <CycleTab store={store} />}
        {tab === "todos" && <TodosTab store={store} />}
        {tab === "buys" && <BuysTab store={store} />}
        {tab === "grocery" && <GroceryTab store={store} />}
        {tab === "thoughts" && <ThoughtsTab store={store} />}
        {tab === "analysis" && <AnalysisTab store={store} />}
        {tab === "habits" && <HabitsTab store={store} />}
        {tab === "reminders" && <RemindersTab store={store} />}
      </div>
    </div>
  );
}

type Store = ReturnType<typeof useHabitStore>;

function formatTs(ts: string | null): string {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return ts;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Singapore",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`;
}

/* ============================ TODAY ============================ */
function TodayTab({ store }: { store: Store }) {
  const now = new Date();
  const today = todayStr(now);
  const dayName = dayNameFromDate(now);
  const scheduled = store.state.habits
    .filter((h) => h.activeDays.includes(dayName))
    .sort((a, b) => a.order - b.order);
  const log = store.state.logs[today] || {};
  const done = scheduled.filter((h) => log[h.id]).length;
  const pct = scheduled.length ? Math.round((done / scheduled.length) * 100) : 0;
  const cycleInfo = cycleInfoForDate(store.state.cycle, today);

  const toggle = (id: string) => {
    store.update((s) => {
      const dayLog = { ...(s.logs[today] || {}) };
      dayLog[id] = !dayLog[id];
      return { ...s, logs: { ...s.logs, [today]: dayLog } };
    });
  };

  const longDate = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const todosPreview = store.state.todos.filter((t) => !t.done).slice(0, 4);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>{longDate}</h1>
        <Muted style={{ fontSize: 14 }}>{done} of {scheduled.length} habits complete</Muted>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 }}>
          <span>Daily Progress</span>
          <span>{pct}%</span>
        </div>
        <div style={{ height: 6, background: "#EDEDF0", borderRadius: 999, marginTop: 6, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: COLORS.green, transition: "width 200ms" }} />
        </div>

        <div style={{ marginTop: 20, display: "grid", gap: 8 }}>
          {scheduled.length === 0 && <Muted>No habits scheduled today.</Muted>}
          {scheduled.map((h) => {
            const isDone = !!log[h.id];
            return (
              <div key={h.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 4px" }}>
                <button
                  onClick={() => toggle(h.id)}
                  aria-label={isDone ? "Mark incomplete" : "Mark complete"}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 999,
                    border: `1.5px solid ${isDone ? COLORS.green : COLORS.border}`,
                    background: isDone ? COLORS.green : "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {isDone && <IconCheck />}
                </button>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: isDone ? COLORS.sub : COLORS.text, textDecoration: isDone ? "line-through" : "none" }}>
                    {h.name}
                  </div>
                  {h.description && <Muted style={{ fontSize: 12 }}>{h.description}</Muted>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>
            {cycleInfo ? `Cycle Day ${cycleInfo.day}` : "Cycle not set"}
          </div>
          {cycleInfo && <PhasePill phase={cycleInfo.phase} estimated={cycleInfo.estimated} />}
        </div>
      </Card>

      <Card>
        <SectionTitle>Today's To-Dos</SectionTitle>
        {todosPreview.length === 0 && <Muted>Nothing pending.</Muted>}
        <div style={{ display: "grid", gap: 6 }}>
          {todosPreview.map((t) => (
            <div key={t.id} style={{ fontSize: 14 }}>• {t.text}</div>
          ))}
        </div>
      </Card>

      <SleepLogCard store={store} dateStr={today} />
    </div>
  );
}

/* ============================ SLEEP LOG (Today) ============================ */
function SleepLogCard({ store, dateStr }: { store: Store; dateStr: string }) {
  const existing = store.state.sleepLogs[dateStr];
  const [bedtime, setBedtime] = useState(existing?.bedtime || "");
  const [wake, setWake] = useState(existing?.wake || "");
  const [quality, setQuality] = useState(existing?.quality || "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setBedtime(existing?.bedtime || "");
    setWake(existing?.wake || "");
    setQuality(existing?.quality || "");
  }, [dateStr, existing?.bedtime, existing?.wake, existing?.quality]);

  const save = () => {
    store.update((s) => ({
      ...s,
      sleepLogs: {
        ...s.sleepLogs,
        [dateStr]: { bedtime, wake, quality, updatedAt: new Date().toISOString() },
      },
    }));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Card>
      <SectionTitle>Sleep Log</SectionTitle>
      <Muted style={{ fontSize: 12 }}>Log last night's sleep and how you feel this morning.</Muted>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
          <Muted>Bedtime (last night)</Muted>
          <Input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
          <Muted>Wake time (this morning)</Muted>
          <Input type="time" value={wake} onChange={(e) => setWake(e.target.value)} />
        </label>
      </div>
      <label style={{ display: "grid", gap: 6, fontSize: 13, marginTop: 12 }}>
        <Muted>Sleep quality</Muted>
        <Textarea
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          placeholder="How well did you sleep? Dreams, wake-ups, energy on waking..."
        />
      </label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
        <Button onClick={save}>Save</Button>
        {saved && <Muted style={{ fontSize: 12, color: COLORS.green }}>Saved</Muted>}
        {existing?.updatedAt && !saved && <Muted style={{ fontSize: 12 }}>Last updated {formatTs(existing.updatedAt)}</Muted>}
      </div>
    </Card>
  );
}

/* ============================ THOUGHTS ============================ */
function ThoughtsTab({ store }: { store: Store }) {
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHeader, setEditHeader] = useState("");
  const [editBody, setEditBody] = useState("");

  const add = () => {
    if (!header.trim() && !body.trim()) return;
    const now = new Date().toISOString();
    store.update((s) => ({
      ...s,
      thoughts: [
        { id: uid(), header: header.trim(), body: body.trim(), createdAt: now, updatedAt: now },
        ...s.thoughts,
      ],
    }));
    setHeader(""); setBody("");
  };

  const startEdit = (id: string, h: string, b: string) => {
    setEditingId(id); setEditHeader(h); setEditBody(b);
  };
  const saveEdit = () => {
    const now = new Date().toISOString();
    store.update((s) => ({
      ...s,
      thoughts: s.thoughts.map((t) =>
        t.id === editingId ? { ...t, header: editHeader, body: editBody, updatedAt: now } : t,
      ),
    }));
    setEditingId(null);
  };
  const del = (id: string) =>
    store.update((s) => ({ ...s, thoughts: s.thoughts.filter((t) => t.id !== id) }));

  const sorted = [...store.state.thoughts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle>New Thought</SectionTitle>
        <div style={{ display: "grid", gap: 10 }}>
          <Input
            placeholder="Header (optional)"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            style={{ fontWeight: 700, fontSize: 15 }}
          />
          <Textarea
            placeholder="Write your thought..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            style={{ minHeight: 100 }}
          />
          <div><Button onClick={add}>Add note</Button></div>
        </div>
      </Card>

      <Card>
        <SectionTitle>Notes ({sorted.length})</SectionTitle>
        {sorted.length === 0 && <Muted>No thoughts yet.</Muted>}
        <div style={{ display: "grid", gap: 12 }}>
          {sorted.map((t) => (
            <div key={t.id} style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              {editingId === t.id ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Input
                    value={editHeader}
                    onChange={(e) => setEditHeader(e.target.value)}
                    placeholder="Header (optional)"
                    style={{ fontWeight: 700, fontSize: 15 }}
                  />
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    style={{ minHeight: 100 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button onClick={saveEdit}>Save</Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {t.header && (
                      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{t.header}</div>
                    )}
                    {t.body && (
                      <div style={{ fontSize: 14, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{t.body}</div>
                    )}
                    <Muted style={{ fontSize: 11, display: "block", marginTop: 6 }}>
                      {formatTs(t.createdAt)}
                      {t.updatedAt && t.updatedAt !== t.createdAt && ` · edited ${formatTs(t.updatedAt)}`}
                    </Muted>
                  </div>
                  <Button variant="ghost" onClick={() => startEdit(t.id, t.header, t.body)}><IconPencil /></Button>
                  <Button variant="danger" onClick={() => del(t.id)}><IconTrash /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PhasePill({ phase, estimated }: { phase: Phase; estimated: boolean }) {
  const c = PHASE_COLORS[phase];
  return (
    <span style={{ background: c.bg, color: c.text, padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>
      {c.label}{estimated ? " · estimated" : " · logged"}
    </span>
  );
}

/* ============================ WEEK ============================ */
function WeekTab({ store }: { store: Store }) {
  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(anchor.getDate() + i);
    return d;
  });
  const habits = [...store.state.habits].sort((a, b) => a.order - b.order);
  const today = todayStr();

  const toggle = (habitId: string, date: string) => {
    store.update((s) => {
      const dayLog = { ...(s.logs[date] || {}) };
      dayLog[habitId] = !dayLog[habitId];
      return { ...s, logs: { ...s.logs, [date]: dayLog } };
    });
  };

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Button variant="secondary" onClick={() => setAnchor(addDays(anchor, -7))}>← Prev</Button>
        <div style={{ fontWeight: 600 }}>
          {days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {days[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        <Button variant="secondary" onClick={() => setAnchor(addDays(anchor, 7))}>Next →</Button>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, tableLayout: "fixed", minWidth: 640 }}>
          <colgroup>
            <col style={{ width: "32%" }} />
            {days.map((_, i) => <col key={i} style={{ width: `${68 / 7}%` }} />)}
          </colgroup>
          <thead>
            <tr>
              <th style={{ textAlign: "left", fontSize: 12, color: COLORS.sub, fontWeight: 500, padding: "8px 8px" }}>HABIT</th>
              {days.map((d, i) => {
                const ds = todayStr(d);
                const isToday = ds === today;
                return (
                  <th key={i} style={{ fontSize: 12, color: COLORS.sub, fontWeight: 500, padding: "8px 4px", background: isToday ? COLORS.blueBg : "transparent", borderRadius: 8 }}>
                    <div>{DAYS[i]}</div>
                    <div style={{ fontSize: 11 }}>{d.getDate()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <SleepWeekRows store={store} days={days} />
            {habits.map((h) => (
              <tr key={h.id}>
                <td style={{ padding: "10px 8px", borderTop: `1px solid ${COLORS.border}`, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={h.name}>{h.name}</div>
                  {h.description && (
                    <div style={{ fontSize: 11, color: COLORS.sub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={h.description}>{h.description}</div>
                  )}
                </td>
                {days.map((d, i) => {
                  const ds = todayStr(d);
                  const isToday = ds === today;
                  const scheduled = h.activeDays.includes(DAYS[i]);
                  const checked = !!store.state.logs[ds]?.[h.id];
                  return (
                    <td key={i} style={{ textAlign: "center", padding: 6, borderTop: `1px solid ${COLORS.border}`, background: isToday ? COLORS.blueBg : "transparent" }}>
                      {scheduled ? (
                        <button
                          onClick={() => toggle(h.id, ds)}
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 6,
                            border: `1px solid ${checked ? COLORS.green : COLORS.border}`,
                            background: checked ? COLORS.green : "#fff",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {checked && <IconCheck size={12} />}
                        </button>
                      ) : (
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: "#F0F0F3", display: "inline-block" }} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function startOfWeek(d: Date): Date {
  const dt = new Date(d);
  dt.setHours(0, 0, 0, 0);
  const offset = (dt.getDay() + 6) % 7; // Monday=0
  dt.setDate(dt.getDate() - offset);
  return dt;
}

function SleepWeekRows({ store, days }: { store: Store; days: Date[] }) {
  const today = todayStr();
  const rows: Array<{ label: string; get: (log: import("@/lib/habit-data").SleepLog | undefined) => string }> = [
    { label: "Bedtime", get: (l) => l?.bedtime || "" },
    { label: "Wake", get: (l) => l?.wake || "" },
    { label: "Quality", get: (l) => l?.quality || "" },
  ];
  return (
    <>
      {rows.map((row, ri) => (
        <tr key={row.label}>
          <td style={{ padding: "8px", borderTop: `1px solid ${COLORS.border}`, background: "#FAFAFB", minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.sub, textTransform: "uppercase", letterSpacing: 0.3 }}>
              {ri === 0 ? "SLEEP" : ""}
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{row.label}</div>
          </td>
          {days.map((d, i) => {
            const ds = todayStr(d);
            const isToday = ds === today;
            const value = row.get(store.state.sleepLogs[ds]);
            return (
              <td key={i} style={{ textAlign: "center", padding: 6, borderTop: `1px solid ${COLORS.border}`, background: isToday ? COLORS.blueBg : "#FAFAFB" }}>
                <div
                  title={value}
                  style={{
                    fontSize: 12,
                    color: value ? COLORS.text : COLORS.sub,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    padding: "0 2px",
                  }}
                >
                  {value || "—"}
                </div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

function addDays(d: Date, n: number): Date {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

/* ============================ MONTH ============================ */
function MonthTab({ store }: { store: Store }) {
  const [anchor, setAnchor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const today = todayStr();
  const habits = store.state.habits;

  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <Button variant="secondary" onClick={() => setAnchor(new Date(year, month - 1, 1))}>← Prev</Button>
        <div style={{ fontWeight: 600 }}>{anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
        <Button variant="secondary" onClick={() => setAnchor(new Date(year, month + 1, 1))}>Next →</Button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
        {DAYS.map((d) => (
          <div key={d} style={{ fontSize: 11, color: COLORS.sub, fontWeight: 500, textAlign: "center", padding: 4 }}>{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const ds = todayStr(d);
          const isToday = ds === today;
          const dayName = DAYS[(d.getDay() + 6) % 7];
          const log = store.state.logs[ds] || {};
          const scheduled = habits.filter((h) => h.activeDays.includes(dayName));
          const completed = scheduled.filter((h) => log[h.id]).length;
          const cycleInfo = cycleInfoForDate(store.state.cycle, ds);
          const c = cycleInfo ? PHASE_COLORS[cycleInfo.phase] : null;
          return (
            <div key={i} style={{
              minHeight: 78,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              padding: 6,
              background: isToday ? COLORS.blueBg : "#fff",
              position: "relative",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: 500,
                  width: 22, height: 22,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: 999,
                  background: isToday ? COLORS.blue : "transparent",
                  color: isToday ? "#fff" : COLORS.text,
                }}>{d.getDate()}</div>
                {c && (
                  <div style={{ width: 16, height: 16, borderRadius: 999, background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {c.letter}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 4 }}>
                {Array.from({ length: completed }).map((_, j) => (
                  <div key={j} style={{ width: 5, height: 5, borderRadius: 999, background: COLORS.green }} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginTop: 16 }}>
        {(["menses","follicular","fertile","luteal"] as Phase[]).map((p) => {
          const c = PHASE_COLORS[p];
          return (
            <div key={p} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <div style={{ width: 12, height: 12, borderRadius: 999, background: c.bg }} />
              <Muted style={{ fontSize: 12 }}>{c.label}</Muted>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: 999, background: COLORS.green }} />
          <Muted style={{ fontSize: 12 }}>Habit completed</Muted>
        </div>
      </div>
    </Card>
  );
}

/* ============================ CYCLE ============================ */
function CycleTab({ store }: { store: Store }) {
  const [date, setDate] = useState(todayStr());
  const c = store.state.cycle;
  const info = cycleInfoForDate(c, todayStr());

  const logPeriod = () => {
    if (!date) return;
    store.update((s) => {
      if (s.cycle.periods.find((p) => p.start === date)) return s;
      return { ...s, cycle: { ...s.cycle, periods: [...s.cycle.periods, { start: date, logged: true }] } };
    });
  };
  const remove = (start: string) => {
    store.update((s) => ({ ...s, cycle: { ...s.cycle, periods: s.cycle.periods.filter((p) => p.start !== start) } }));
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle>Current Cycle</SectionTitle>
        {info ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>Day {info.day}</div>
            <PhasePill phase={info.phase} estimated={info.estimated} />
          </div>
        ) : (
          <Muted>Log your first period to begin tracking.</Muted>
        )}
      </Card>

      <Card>
        <SectionTitle>Log Period Start</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 200 }} />
          <Button onClick={logPeriod}>Log</Button>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 6 }}>
          {[...c.periods].sort((a, b) => b.start.localeCompare(a.start)).map((p) => (
            <div key={p.start} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 14 }}>{p.start}</span>
              <Button variant="danger" onClick={() => remove(p.start)}><IconTrash /></Button>
            </div>
          ))}
          {c.periods.length === 0 && <Muted>No periods logged.</Muted>}
        </div>
      </Card>

      <Card>
        <SectionTitle>Averages</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            <Muted>Cycle length (days)</Muted>
            <Input type="number" value={c.avgCycleLength} onChange={(e) => store.update((s) => ({ ...s, cycle: { ...s.cycle, avgCycleLength: Number(e.target.value) || 28 } }))} />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
            <Muted>Period length (days)</Muted>
            <Input type="number" value={c.avgPeriodLength} onChange={(e) => store.update((s) => ({ ...s, cycle: { ...s.cycle, avgPeriodLength: Number(e.target.value) || 5 } }))} />
          </label>
        </div>
      </Card>
    </div>
  );
}

/* ============================ TODOS ============================ */
function TodosTab({ store }: { store: Store }) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const add = () => {
    if (!text.trim()) return;
    store.update((s) => ({ ...s, todos: [...s.todos, { id: uid(), text: text.trim(), done: false, createdAt: new Date().toISOString(), completedAt: null }] }));
    setText("");
  };
  const toggle = (id: string) => store.update((s) => ({ ...s, todos: s.todos.map((t) => t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? new Date().toISOString() : null } : t) }));
  const del = (id: string) => store.update((s) => ({ ...s, todos: s.todos.filter((t) => t.id !== id) }));
  const saveEdit = (id: string) => {
    store.update((s) => ({ ...s, todos: s.todos.map((t) => t.id === id ? { ...t, text: editText } : t) }));
    setEditingId(null);
  };

  const active = store.state.todos.filter((t) => !t.done);
  const completed = store.state.todos.filter((t) => t.done);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle>To-Dos</SectionTitle>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a task..." onKeyDown={(e) => e.key === "Enter" && add()} />
          <Button onClick={add}>Add</Button>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {active.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <Checkbox checked={t.done} onClick={() => toggle(t.id)} />
              {editingId === t.id ? (
                <>
                  <Input value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <Button onClick={() => saveEdit(t.id)}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <div>{t.text}</div>
                    <Muted style={{ fontSize: 11 }}>Added {formatTs(t.createdAt)}</Muted>
                  </div>
                  <Button variant="ghost" onClick={() => { setEditingId(t.id); setEditText(t.text); }}><IconPencil /></Button>
                  <Button variant="danger" onClick={() => del(t.id)}><IconTrash /></Button>
                </>
              )}
            </div>
          ))}
          {active.length === 0 && <Muted>No active tasks.</Muted>}
        </div>
      </Card>

      {completed.length > 0 && (
        <Card>
          <SectionTitle>Completed ({completed.length})</SectionTitle>
          <div style={{ display: "grid", gap: 6 }}>
            {completed.map((t) => (
              <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <Checkbox checked onClick={() => toggle(t.id)} />
                <div style={{ flex: 1, fontSize: 14, color: COLORS.sub, textDecoration: "line-through" }}>{t.text}</div>
                <Muted style={{ fontSize: 12 }}>{formatTs(t.completedAt)}</Muted>
                <Button variant="danger" onClick={() => del(t.id)}><IconTrash /></Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 22, height: 22, borderRadius: 6,
        border: `1.5px solid ${checked ? COLORS.green : COLORS.border}`,
        background: checked ? COLORS.green : "#fff",
        cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >{checked && <IconCheck size={12} />}</button>
  );
}

/* ============================ BUYS ============================ */
function BuysTab({ store }: { store: Store }) {
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const add = () => {
    if (!text.trim()) return;
    store.update((s) => ({ ...s, buys: [...s.buys, { id: uid(), text: text.trim(), price: Number(price) || 0, done: false, createdAt: new Date().toISOString(), completedAt: null }] }));
    setText(""); setPrice("");
  };
  const toggle = (id: string) => store.update((s) => ({ ...s, buys: s.buys.map((b) => b.id === id ? { ...b, done: !b.done, completedAt: !b.done ? new Date().toISOString() : null } : b) }));
  const del = (id: string) => store.update((s) => ({ ...s, buys: s.buys.filter((b) => b.id !== id) }));
  const saveEdit = (id: string) => {
    store.update((s) => ({ ...s, buys: s.buys.map((b) => b.id === id ? { ...b, text: editText, price: Number(editPrice) || 0 } : b) }));
    setEditingId(null);
  };

  const active = store.state.buys.filter((b) => !b.done);
  const completed = store.state.buys.filter((b) => b.done);
  const totalActive = active.reduce((s, b) => s + b.price, 0);
  const totalAll = store.state.buys.reduce((s, b) => s + b.price, 0);
  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <SectionTitle>To-Buys</SectionTitle>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <div><Muted>Pending: </Muted><b>{fmt(totalActive)}</b></div>
            <div><Muted>All: </Muted><b>{fmt(totalAll)}</b></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Item..." style={{ flex: 2, minWidth: 160 }} />
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" style={{ flex: 1, minWidth: 100 }} />
          <Button onClick={add}>Add</Button>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {active.map((b) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <Checkbox checked={b.done} onClick={() => toggle(b.id)} />
              {editingId === b.id ? (
                <>
                  <Input value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ maxWidth: 100 }} />
                  <Button onClick={() => saveEdit(b.id)}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <div>{b.text}</div>
                    <Muted style={{ fontSize: 11 }}>Added {formatTs(b.createdAt)}</Muted>
                  </div>
                  <div style={{ fontSize: 14 }}>{fmt(b.price)}</div>
                  <Button variant="ghost" onClick={() => { setEditingId(b.id); setEditText(b.text); setEditPrice(String(b.price)); }}><IconPencil /></Button>
                  <Button variant="danger" onClick={() => del(b.id)}><IconTrash /></Button>
                </>
              )}
            </div>
          ))}
          {active.length === 0 && <Muted>No pending items.</Muted>}
        </div>
      </Card>

      {completed.length > 0 && (
        <Card>
          <SectionTitle>Completed ({completed.length})</SectionTitle>
          <div style={{ display: "grid", gap: 6 }}>
            {completed.map((b) => (
              <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <Checkbox checked onClick={() => toggle(b.id)} />
                <div style={{ flex: 1, fontSize: 14, color: COLORS.sub, textDecoration: "line-through" }}>{b.text}</div>
                <div style={{ fontSize: 14, color: COLORS.sub }}>{fmt(b.price)}</div>
                <Muted style={{ fontSize: 12 }}>{formatTs(b.completedAt)}</Muted>
                <Button variant="danger" onClick={() => del(b.id)}><IconTrash /></Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================ GROCERY ============================ */
function GroceryTab({ store }: { store: Store }) {
  const [text, setText] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editPrice, setEditPrice] = useState("");

  const add = () => {
    if (!text.trim()) return;
    store.update((s) => ({
      ...s,
      groceries: [
        ...s.groceries,
        {
          id: uid(),
          text: text.trim(),
          price: Number(price) || 0,
          done: false,
          createdAt: new Date().toISOString(),
          completedAt: null,
        },
      ],
    }));
    setText(""); setPrice("");
  };
  const toggle = (id: string) =>
    store.update((s) => ({
      ...s,
      groceries: s.groceries.map((g) =>
        g.id === id
          ? { ...g, done: !g.done, completedAt: !g.done ? new Date().toISOString() : null }
          : g,
      ),
    }));
  const del = (id: string) =>
    store.update((s) => ({ ...s, groceries: s.groceries.filter((g) => g.id !== id) }));
  const saveEdit = (id: string) => {
    store.update((s) => ({
      ...s,
      groceries: s.groceries.map((g) =>
        g.id === id ? { ...g, text: editText, price: Number(editPrice) || 0 } : g,
      ),
    }));
    setEditingId(null);
  };

  const active = store.state.groceries.filter((g) => !g.done);
  const completed = store.state.groceries.filter((g) => g.done);
  const totalActive = active.reduce((s, g) => s + (Number(g.price) || 0), 0);
  const totalAll = store.state.groceries.reduce((s, g) => s + (Number(g.price) || 0), 0);
  const fmt = (n: number) => "$" + (n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <SectionTitle>Grocery</SectionTitle>
          <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
            <div><Muted>Pending: </Muted><b>{fmt(totalActive)}</b></div>
            <div><Muted>All: </Muted><b>{fmt(totalAll)}</b></div>
          </div>
        </div>
        <Muted style={{ fontSize: 12 }}>Household items to pick up.</Muted>
        <div style={{ display: "flex", gap: 8, marginTop: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Item..." style={{ flex: 2, minWidth: 160 }} />
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" style={{ flex: 1, minWidth: 100 }} />
          <Button onClick={add}>Add</Button>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          {active.map((g) => (
            <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <Checkbox checked={g.done} onClick={() => toggle(g.id)} />
              {editingId === g.id ? (
                <>
                  <Input value={editText} onChange={(e) => setEditText(e.target.value)} />
                  <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} style={{ maxWidth: 100 }} />
                  <Button onClick={() => saveEdit(g.id)}>Save</Button>
                  <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, fontSize: 14 }}>
                    <div>{g.text}</div>
                    <Muted style={{ fontSize: 11 }}>Added {formatTs(g.createdAt)}</Muted>
                  </div>
                  <div style={{ fontSize: 14 }}>{fmt(Number(g.price) || 0)}</div>
                  <Button variant="ghost" onClick={() => { setEditingId(g.id); setEditText(g.text); setEditPrice(String(g.price || 0)); }}><IconPencil /></Button>
                  <Button variant="danger" onClick={() => del(g.id)}><IconTrash /></Button>
                </>
              )}
            </div>
          ))}
          {active.length === 0 && <Muted>No items on the list.</Muted>}
        </div>
      </Card>

      {completed.length > 0 && (
        <Card>
          <SectionTitle>Completed ({completed.length})</SectionTitle>
          <div style={{ display: "grid", gap: 6 }}>
            {completed.map((g) => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
                <Checkbox checked onClick={() => toggle(g.id)} />
                <div style={{ flex: 1, fontSize: 14, color: COLORS.sub, textDecoration: "line-through" }}>{g.text}</div>
                <div style={{ fontSize: 14, color: COLORS.sub }}>{fmt(Number(g.price) || 0)}</div>
                <Muted style={{ fontSize: 12 }}>{formatTs(g.completedAt)}</Muted>
                <Button variant="danger" onClick={() => del(g.id)}><IconTrash /></Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

/* ============================ ANALYSIS ============================ */
function AnalysisTab({ store }: { store: Store }) {
  const [range, setRange] = useState<"month" | "quarter" | "year">("month");
  const [anchor, setAnchor] = useState(() => new Date());

  const { start, end, label } = getRange(anchor, range);
  const dates = enumerateDates(start, end);

  const habits = [...store.state.habits].sort((a, b) => a.order - b.order);

  const habitStats = habits.map((h) => {
    const scheduledDates = dates.filter((d) => h.activeDays.includes(DAYS[(d.getDay() + 6) % 7]));
    const completed = scheduledDates.filter((d) => !!store.state.logs[todayStr(d)]?.[h.id]);
    // streaks
    let cur = 0, longest = 0, run = 0;
    // longest across scheduledDates chronological
    scheduledDates.forEach((d) => {
      if (store.state.logs[todayStr(d)]?.[h.id]) { run++; longest = Math.max(longest, run); } else run = 0;
    });
    // current streak: count trailing consecutive completions up to today (only if scheduled)
    const todayIdx = scheduledDates.length - 1;
    for (let i = todayIdx; i >= 0; i--) {
      if (store.state.logs[todayStr(scheduledDates[i])]?.[h.id]) cur++;
      else break;
    }
    return {
      habit: h,
      pct: scheduledDates.length ? Math.round((completed.length / scheduledDates.length) * 100) : 0,
      current: cur, longest,
    };
  });

  // Overall trend: bucketized bars
  const buckets = bucketize(start, end, range);
  const trend = buckets.map((b) => {
    const bDates = enumerateDates(b.start, b.end);
    let total = 0, done = 0;
    for (const d of bDates) {
      const dayName = DAYS[(d.getDay() + 6) % 7];
      const sch = habits.filter((h) => h.activeDays.includes(dayName));
      total += sch.length;
      const log = store.state.logs[todayStr(d)] || {};
      for (const h of sch) if (log[h.id]) done++;
    }
    return { label: b.label, pct: total ? Math.round((done / total) * 100) : 0 };
  });

  // Cycle correlation
  const cyclePhases: Record<Phase, { total: number; done: number }> = {
    menses: { total: 0, done: 0 }, follicular: { total: 0, done: 0 }, fertile: { total: 0, done: 0 }, luteal: { total: 0, done: 0 },
  };
  for (const d of dates) {
    const ds = todayStr(d);
    const info = cycleInfoForDate(store.state.cycle, ds);
    if (!info) continue;
    const dayName = DAYS[(d.getDay() + 6) % 7];
    const sch = habits.filter((h) => h.activeDays.includes(dayName));
    const log = store.state.logs[ds] || {};
    cyclePhases[info.phase].total += sch.length;
    for (const h of sch) if (log[h.id]) cyclePhases[info.phase].done++;
  }

  // Todos throughput
  const todosInRange = store.state.todos.filter((t) => t.createdAt >= todayStr(start) && t.createdAt <= todayStr(end));
  const todosCompleted = store.state.todos.filter((t) => t.completedAt && t.completedAt >= todayStr(start) && t.completedAt <= todayStr(end));
  const avgDays = todosCompleted.length
    ? Math.round((todosCompleted.reduce((s, t) => s + (t.completedAt ? Math.max(0, (new Date(t.completedAt).getTime() - new Date(t.createdAt).getTime()) / 86400000) : 0), 0) / todosCompleted.length) * 10) / 10
    : 0;

  // Buys spend
  const buysInRange = store.state.buys.filter((b) => b.done && b.completedAt && b.completedAt >= todayStr(start) && b.completedAt <= todayStr(end));
  const totalSpend = buysInRange.reduce((s, b) => s + b.price, 0);
  const fmt = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD" });

  const exportCsv = () => {
    const rows: string[] = ["type,date,item,value,extra"];
    for (const d of dates) {
      const ds = todayStr(d);
      const log = store.state.logs[ds] || {};
      for (const h of habits) {
        if (log[h.id]) rows.push(`habit,${ds},"${escapeCsv(h.name)}",1,`);
      }
    }
    for (const t of todosInRange) rows.push(`todo,${t.createdAt},"${escapeCsv(t.text)}",${t.done ? 1 : 0},${t.completedAt || ""}`);
    for (const b of store.state.buys.filter((x) => x.createdAt >= todayStr(start) && x.createdAt <= todayStr(end))) {
      rows.push(`buy,${b.createdAt},"${escapeCsv(b.text)}",${b.price},${b.completedAt || ""}`);
    }
    const csv = rows.join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `habit-tracker-${label.replace(/\s+/g, "-")}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const stepAnchor = (dir: number) => {
    const d = new Date(anchor);
    if (range === "month") d.setMonth(d.getMonth() + dir);
    else if (range === "quarter") d.setMonth(d.getMonth() + dir * 3);
    else d.setFullYear(d.getFullYear() + dir);
    setAnchor(d);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "#EDEDF0", borderRadius: 999, padding: 4 }}>
            {(["month","quarter","year"] as const).map((r) => (
              <button key={r} onClick={() => setRange(r)} style={{
                border: "none", cursor: "pointer",
                background: range === r ? COLORS.text : "transparent",
                color: range === r ? "#fff" : COLORS.sub,
                padding: "6px 14px", borderRadius: 999, fontSize: 13, fontWeight: 500, textTransform: "capitalize",
              }}>{r}ly</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Button variant="secondary" onClick={() => stepAnchor(-1)}>←</Button>
            <div style={{ fontWeight: 600, minWidth: 140, textAlign: "center" }}>{label}</div>
            <Button variant="secondary" onClick={() => stepAnchor(1)}>→</Button>
          </div>
          <Button onClick={exportCsv}>Export CSV</Button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Habit Consistency</SectionTitle>
        <div style={{ display: "grid", gap: 8 }}>
          {habitStats.map(({ habit, pct, current, longest }) => (
            <div key={habit.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={habit.name}>{habit.name}</div>
                <div style={{ height: 6, background: "#EDEDF0", borderRadius: 999, marginTop: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: COLORS.green }} />
                </div>
              </div>
              <div style={{ fontSize: 12, textAlign: "right", minWidth: 120 }}>
                <div><b>{pct}%</b></div>
                <Muted style={{ fontSize: 11 }}>streak {current} · best {longest}</Muted>
              </div>
            </div>
          ))}
          {habitStats.length === 0 && <Muted>No habits.</Muted>}
        </div>
      </Card>

      <Card>
        <SectionTitle>Overall Trend</SectionTitle>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140 }}>
          {trend.map((t, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: "100%", background: COLORS.blue, borderRadius: 4, height: `${t.pct}%`, minHeight: 2, opacity: 0.85 }} title={`${t.pct}%`} />
              <Muted style={{ fontSize: 10 }}>{t.label}</Muted>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle>Cycle Correlation</SectionTitle>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {(["menses","follicular","fertile","luteal"] as Phase[]).map((p) => {
            const c = PHASE_COLORS[p];
            const pct = cyclePhases[p].total ? Math.round((cyclePhases[p].done / cyclePhases[p].total) * 100) : 0;
            return (
              <div key={p} style={{ background: c.bg, borderRadius: 10, padding: 12 }}>
                <div style={{ fontSize: 12, color: c.text, fontWeight: 600 }}>{c.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: c.text }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle>To-Do Throughput</SectionTitle>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Stat label="Created" value={todosInRange.length} />
          <Stat label="Completed" value={todosCompleted.length} />
          <Stat label="Avg days to complete" value={avgDays} />
        </div>
      </Card>

      <Card>
        <SectionTitle>To-Buy Spend</SectionTitle>
        <Stat label={`Total spent in ${label}`} value={fmt(totalSpend)} />
        {(range !== "month") && (
          <div style={{ marginTop: 12, display: "grid", gap: 4 }}>
            {monthlyBreakdown(buysInRange).map((m) => (
              <div key={m.month} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <Muted>{m.month}</Muted>
                <span>{fmt(m.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <Muted style={{ fontSize: 12 }}>{label}</Muted>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function monthlyBreakdown(buys: { price: number; completedAt: string | null }[]) {
  const map: Record<string, number> = {};
  for (const b of buys) {
    if (!b.completedAt) continue;
    const m = b.completedAt.slice(0, 7);
    map[m] = (map[m] || 0) + b.price;
  }
  return Object.keys(map).sort().map((month) => ({ month, total: map[month] }));
}

function escapeCsv(s: string) { return s.replace(/"/g, '""'); }

function enumerateDates(start: Date, end: Date): Date[] {
  const out: Date[] = [];
  const d = new Date(start);
  while (d <= end) { out.push(new Date(d)); d.setDate(d.getDate() + 1); }
  return out;
}

function getRange(anchor: Date, range: "month" | "quarter" | "year") {
  const y = anchor.getFullYear();
  if (range === "month") {
    const start = new Date(y, anchor.getMonth(), 1);
    const end = new Date(y, anchor.getMonth() + 1, 0);
    return { start, end, label: anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" }) };
  }
  if (range === "quarter") {
    const q = Math.floor(anchor.getMonth() / 3);
    const start = new Date(y, q * 3, 1);
    const end = new Date(y, q * 3 + 3, 0);
    return { start, end, label: `Q${q + 1} ${y}` };
  }
  return { start: new Date(y, 0, 1), end: new Date(y, 11, 31), label: String(y) };
}

function bucketize(start: Date, end: Date, range: "month" | "quarter" | "year") {
  if (range === "month") {
    // weekly buckets
    const out: { start: Date; end: Date; label: string }[] = [];
    let cur = new Date(start);
    let idx = 1;
    while (cur <= end) {
      const bStart = new Date(cur);
      const bEnd = new Date(cur); bEnd.setDate(bEnd.getDate() + 6);
      if (bEnd > end) bEnd.setTime(end.getTime());
      out.push({ start: bStart, end: bEnd, label: `W${idx}` });
      cur = new Date(bEnd); cur.setDate(cur.getDate() + 1);
      idx++;
    }
    return out;
  }
  if (range === "quarter") {
    // monthly buckets
    const out: { start: Date; end: Date; label: string }[] = [];
    let m = new Date(start);
    while (m <= end) {
      const bStart = new Date(m.getFullYear(), m.getMonth(), 1);
      const bEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
      out.push({ start: bStart, end: bEnd, label: m.toLocaleDateString("en-US", { month: "short" }) });
      m = new Date(m.getFullYear(), m.getMonth() + 1, 1);
    }
    return out;
  }
  // yearly => monthly
  const out: { start: Date; end: Date; label: string }[] = [];
  for (let mo = 0; mo < 12; mo++) {
    const bStart = new Date(start.getFullYear(), mo, 1);
    const bEnd = new Date(start.getFullYear(), mo + 1, 0);
    out.push({ start: bStart, end: bEnd, label: bStart.toLocaleDateString("en-US", { month: "short" })[0] });
  }
  return out;
}

/* ============================ HABITS ============================ */
function HabitsTab({ store }: { store: Store }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [days, setDays] = useState<string[]>(ALL_DAYS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDays, setEditDays] = useState<string[]>([]);

  const habits = [...store.state.habits].sort((a, b) => a.order - b.order);

  const add = () => {
    if (!name.trim()) return;
    const maxOrder = habits.reduce((m, h) => Math.max(m, h.order), -1);
    store.update((s) => ({ ...s, habits: [...s.habits, { id: uid(), name: name.trim(), description: desc.trim(), order: maxOrder + 1, activeDays: days.length ? days : ALL_DAYS }] }));
    setName(""); setDesc(""); setDays(ALL_DAYS);
  };
  const del = (id: string) => store.update((s) => ({ ...s, habits: s.habits.filter((h) => h.id !== id) }));
  const move = (id: string, dir: -1 | 1) => {
    store.update((s) => {
      const sorted = [...s.habits].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((h) => h.id === id);
      const other = idx + dir;
      if (other < 0 || other >= sorted.length) return s;
      const a = sorted[idx], b = sorted[other];
      const swap = a.order; a.order = b.order; b.order = swap;
      return { ...s, habits: s.habits.map((h) => h.id === a.id ? a : h.id === b.id ? b : h) };
    });
  };
  const startEdit = (h: Habit) => { setEditingId(h.id); setEditName(h.name); setEditDesc(h.description); setEditDays(h.activeDays); };
  const saveEdit = () => {
    store.update((s) => ({ ...s, habits: s.habits.map((h) => h.id === editingId ? { ...h, name: editName, description: editDesc, activeDays: editDays.length ? editDays : ALL_DAYS } : h) }));
    setEditingId(null);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle>Add Habit</SectionTitle>
        <div style={{ display: "grid", gap: 10 }}>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <DaysSelector value={days} onChange={setDays} />
          <div><Button onClick={add}>Add habit</Button></div>
        </div>
      </Card>

      <Card>
        <SectionTitle>All Habits ({habits.length})</SectionTitle>
        <div style={{ display: "grid", gap: 8 }}>
          {habits.map((h, idx) => (
            <div key={h.id} style={{ padding: "10px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              {editingId === h.id ? (
                <div style={{ display: "grid", gap: 8 }}>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                  <DaysSelector value={editDays} onChange={setEditDays} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Button onClick={saveEdit}>Save</Button>
                    <Button variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <button onClick={() => move(h.id, -1)} disabled={idx === 0} style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 6, padding: 2, cursor: idx === 0 ? "not-allowed" : "pointer", opacity: idx === 0 ? 0.4 : 1 }}><IconArrowUp /></button>
                    <button onClick={() => move(h.id, 1)} disabled={idx === habits.length - 1} style={{ border: `1px solid ${COLORS.border}`, background: "#fff", borderRadius: 6, padding: 2, cursor: idx === habits.length - 1 ? "not-allowed" : "pointer", opacity: idx === habits.length - 1 ? 0.4 : 1 }}><IconArrowDown /></button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{h.name}</div>
                    {h.description && <Muted style={{ fontSize: 12 }}>{h.description}</Muted>}
                    <div style={{ fontSize: 11, color: COLORS.sub, marginTop: 4 }}>{h.activeDays.join(" · ")}</div>
                  </div>
                  <Button variant="ghost" onClick={() => startEdit(h)}><IconPencil /></Button>
                  <Button variant="danger" onClick={() => del(h.id)}><IconTrash /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ============================ REMINDERS ============================ */
function RemindersTab({ store }: { store: Store }) {
  const [habitId, setHabitId] = useState("");
  const [time, setTime] = useState("09:00");
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  const habits = [...store.state.habits].sort((a, b) => a.order - b.order);
  const habitName = (id: string) => habits.find((h) => h.id === id)?.name || "(deleted)";

  const add = () => {
    if (!habitId) return;
    store.update((s) => ({ ...s, reminders: [...s.reminders, { id: uid(), habitId, time }] }));
  };
  const del = (id: string) => store.update((s) => ({ ...s, reminders: s.reminders.filter((r) => r.id !== id) }));

  const request = async () => {
    if (typeof Notification === "undefined") return;
    const p = await Notification.requestPermission();
    setPerm(p);
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <SectionTitle>Notifications</SectionTitle>
        {perm === "unsupported" ? (
          <Muted>Not supported in this browser.</Muted>
        ) : perm === "granted" ? (
          <Muted>Notifications enabled.</Muted>
        ) : (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Muted>Status: {perm}</Muted>
            <Button onClick={request}>Enable notifications</Button>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle>Add Reminder</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select value={habitId} onChange={(e) => setHabitId(e.target.value)} style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "8px 12px", background: "#fff", fontSize: 14, flex: 1, minWidth: 200 }}>
            <option value="">Select habit</option>
            {habits.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ width: 130 }} />
          <Button onClick={add}>Add</Button>
        </div>
      </Card>

      <Card>
        <SectionTitle>Reminders</SectionTitle>
        <div style={{ display: "grid", gap: 6 }}>
          {store.state.reminders.map((r) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ flex: 1, fontSize: 14 }}>{habitName(r.habitId)}</div>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{r.time}</div>
              <Button variant="danger" onClick={() => del(r.id)}><IconTrash /></Button>
            </div>
          ))}
          {store.state.reminders.length === 0 && <Muted>No reminders yet.</Muted>}
        </div>
      </Card>
    </div>
  );
}

function useReminderNotifier(store: Store) {
  useEffect(() => {
    if (typeof window === "undefined" || typeof Notification === "undefined") return;
    const firedKey = "habit-tracker-fired-reminders";
    const getFired = (): Record<string, boolean> => {
      try { return JSON.parse(window.localStorage.getItem(firedKey) || "{}"); } catch { return {}; }
    };
    const setFired = (v: Record<string, boolean>) => window.localStorage.setItem(firedKey, JSON.stringify(v));

    const check = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const cur = `${hh}:${mm}`;
      const today = todayStr(now);
      const dayName = DAYS[(now.getDay() + 6) % 7];
      const fired = getFired();
      // clear old entries not from today
      const cleaned: Record<string, boolean> = {};
      for (const k of Object.keys(fired)) if (k.startsWith(today)) cleaned[k] = fired[k];
      for (const r of store.state.reminders) {
        if (r.time !== cur) continue;
        const habit = store.state.habits.find((h) => h.id === r.habitId);
        if (!habit) continue;
        if (!habit.activeDays.includes(dayName)) continue;
        if (store.state.logs[today]?.[habit.id]) continue;
        const key = `${today}|${r.id}`;
        if (cleaned[key]) continue;
        try { new Notification("Habit Tracker", { body: `Reminder: ${habit.name}` }); } catch {}
        cleaned[key] = true;
      }
      setFired(cleaned);
    };

    const interval = window.setInterval(check, 20000);
    check();
    return () => window.clearInterval(interval);
  }, [store.state.reminders, store.state.habits, store.state.logs]);
}