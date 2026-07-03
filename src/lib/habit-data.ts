export type Habit = {
  id: string;
  name: string;
  description: string;
  order: number;
  activeDays: string[];
};

export type Todo = {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type Buy = {
  id: string;
  text: string;
  price: number;
  done: boolean;
  createdAt: string;
  completedAt: string | null;
};

export type Period = { start: string; logged: true };

export type Cycle = {
  periods: Period[];
  avgCycleLength: number;
  avgPeriodLength: number;
};

export type Reminder = { id: string; habitId: string; time: string };

export type Logs = Record<string, Record<string, boolean>>;

export type Thought = {
  id: string;
  header: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type SleepLog = {
  bedtime: string; // e.g. "23:15" (previous night)
  wake: string;    // e.g. "07:00" (this morning)
  quality: string; // free-text description
  updatedAt: string;
};

export type SleepLogs = Record<string, SleepLog>; // keyed by date (the wake-up date)

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export const WEEKENDS = ["Sat", "Sun"];
export const ALL_DAYS = [...DAYS];

export function todayStr(d: Date = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dayNameFromDate(d: Date): string {
  return DAYS[(d.getDay() + 6) % 7];
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const weekdayList: Array<[string, string]> = [
  ["7:00 – 7:20 AM | Wake + Hydrate", "A glass of water + salt or lemon. Open the windows, let some light in — helps reset your body clock."],
  ["7:20 – 8:00 AM | Morning Yoga", "Sun salutations & strength-focused poses (chair, warrior series)."],
  ["8:00 – 8:30 AM | Shower + Get Dressed Properly", "A small psychological trick to kick start your day."],
  ["8:30 – 9:15 AM | Breakfast", "Protein-forward (eggs, yogurt, tofu). Sit down to eat — no phone."],
  ["9:15 – 9:45 AM | Finance News", "Daily read — markets, portfolio check-ins. Low-stress, engaged-brain activity."],
  ["9:45 – 11:30 AM | Productive Block", "Job hunting/applications, a course, the counselling program research, or admin/errands."],
  ["11:30 AM – 12:00 PM | Water + Light Walk", "Walk outside (for sunlight, fresh air, and breaking up sitting)."],
  ["12:00 – 1:00 PM | Cook + Eat Lunch", "Main meal of the day. ~30 min to cook."],
  ["1:00 – 2:30 PM | Rest / Drama Time", "Guilt-free. This is a genuine leisure block."],
  ["2:30 – 3:00 PM | Water Break + Snack", "Fruit, nuts, or yogurt. Hydrate."],
  ["3:00 – 4:30 PM | Reading", "Book time."],
  ["4:30 – 5:15 PM | Second Movement Block", "A brisk walk, a second shorter yoga session, or light strength training (bodyweight squats, resistance bands)."],
  ["5:15 – 6:00 PM | Downtime / Errands", "Flexible slot — groceries, calls, chores, or more reading/drama."],
  ["6:00 – 7:00 PM | Cook + Eat Dinner", "Finish eating by 7–7:30pm so digestion has time before bed."],
  ["7:00 – 9:00 PM | Evening Leisure + Water", "Last big glass of water for the evening & unwind."],
  ["9:00 – 9:30 PM | Gentle Evening Yoga / Stretch", "Restorative poses — signal to body it's time to slow down."],
  ["9:30 – 10:30 PM | Wind Down", "Skincare, tidy up, prep clothes/food for tmr. Avoid heavy phone scrolling here if you can."],
  ["10:30 – 11:00 PM | Bible + Prayer + Sleep", "Consistent bedtime is critical — poor sleep disrupts hunger hormones."],
];

const satList: Array<[string, string]> = [
  ["7:00 – 7:10 AM | Wake + Hydrate", "A glass of water + salt or lemon. Boil eggs (7 mins)."],
  ["7:10 – 7:40 AM | Morning Yoga", "Sun salutations & strength-focused poses (chair, warrior series)."],
  ["7:40 – 8:00 AM | Shower + Get Dressed Properly", "A small psychological trick to kick start your day."],
  ["8:00 – 8:20 AM | Breakfast", "Protein-forward (eggs, yogurt, tofu)."],
  ["8:20 – 8:55 AM | Commute to Chong Pang Centre", "Plan your tuition program."],
  ["9:00 – 11:15 AM | Tuition", "Tuition at Chong Pang."],
  ["11:15 AM – 1:30 PM | Water + Northpoint City Library + Lunch", "Read, shop, lunch and grocery."],
  ["1:30 – 2:30 PM | Saturday Date with Bf", "Walk outside (for sunlight, fresh air, and breaking up sitting)."],
  ["2:30 – 9:00 PM | Free Play + Water", "Main meal of the day. ~30 min to cook."],
  ["9:00 – 9:30 PM | Gentle Evening Yoga / Stretch", "Restorative poses — signal to body it's time to slow down."],
  ["9:30 – 10:30 PM | Wind Down", "Skincare, tidy up, prep clothes/food for tmr. Avoid heavy phone scrolling here if you can."],
  ["10:30 – 11:00 PM | Bible + Prayer + Sleep", "Consistent bedtime is critical — poor sleep disrupts hunger hormones."],
];

const sunList: Array<[string, string]> = [
  ["7:00 – 7:10 AM | Wake + Hydrate", "A glass of water + salt or lemon. Open the windows, let some light in — helps reset your body clock."],
  ["7:10 – 7:50 AM | Morning Yoga", "Sun salutations & strength-focused poses (chair, warrior series)."],
  ["7:50 – 8:15 AM | Shower + Get Dressed Properly", "A small psychological trick to kick start your day."],
  ["8:15 – 9:30 AM | Breakfast", "Protein-forward (eggs, yogurt, tofu). Drama."],
  ["9:30 AM – 12:00 PM | Church?", "Depends. Chill."],
  ["12:00 – 4:30 PM | Church?", "Depends. Chill."],
  ["4:30 – 9:00 PM | Sunday Date with Bf", "Walk outside (for sunlight & fresh air)."],
  ["9:00 – 9:30 PM | Gentle Evening Yoga / Stretch", "Restorative poses — signal to body it's time to slow down."],
  ["9:30 – 10:30 PM | Wind Down", "Skincare, tidy up, prep clothes/food for tmr. Avoid heavy phone scrolling here if you can."],
  ["10:30 – 11:00 PM | Bible + Prayer + Sleep", "Consistent bedtime is critical — poor sleep disrupts hunger hormones."],
];

export function seedHabits(): Habit[] {
  let order = 0;
  const mk = (list: Array<[string, string]>, active: string[]): Habit[] =>
    list.map(([name, description]) => ({
      id: uid(),
      name,
      description,
      order: order++,
      activeDays: active,
    }));
  return [
    ...mk(weekdayList, WEEKDAYS),
    ...mk(satList, ["Sat"]),
    ...mk(sunList, ["Sun"]),
  ];
}

export type Phase = "menses" | "follicular" | "fertile" | "luteal";

export const PHASE_COLORS: Record<Phase, { bg: string; text: string; letter: string; label: string }> = {
  menses: { bg: "#FADAE1", text: "#8A2E45", letter: "M", label: "Menses" },
  follicular: { bg: "#D6F0DA", text: "#256B3A", letter: "F", label: "Follicular" },
  fertile: { bg: "#FCE7C2", text: "#8A5A1A", letter: "F", label: "Fertile" },
  luteal: { bg: "#E3D6F0", text: "#5A3A8A", letter: "L", label: "Luteal" },
};

export function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T00:00:00");
  const db = new Date(b + "T00:00:00");
  return Math.round((db.getTime() - da.getTime()) / 86400000);
}

export function cycleInfoForDate(
  cycle: Cycle,
  dateStr: string,
): { day: number; phase: Phase; estimated: boolean } | null {
  if (!cycle.periods.length) return null;
  const sorted = [...cycle.periods].sort((a, b) => a.start.localeCompare(b.start));
  // find most recent period start on or before date
  let ref = sorted[0];
  for (const p of sorted) {
    if (p.start <= dateStr) ref = p;
    else break;
  }
  const diff = daysBetween(ref.start, dateStr);
  const cycleLen = cycle.avgCycleLength || 28;
  let day = diff;
  let estimated = false;
  if (day < 0) {
    // date before first logged period — estimate backwards
    day = ((day % cycleLen) + cycleLen) % cycleLen;
    estimated = true;
  } else if (day >= cycleLen) {
    // beyond one cycle from ref & no newer logged period — estimated
    day = day % cycleLen;
    estimated = true;
  }
  const periodLen = cycle.avgPeriodLength || 5;
  const ovulation = cycleLen - 14;
  const fertileStart = cycleLen - 16;
  const fertileEnd = cycleLen - 12;
  let phase: Phase;
  if (day < periodLen) phase = "menses";
  else if (day >= fertileStart && day < fertileEnd) phase = "fertile";
  else if (day < ovulation) phase = "follicular";
  else phase = "luteal";
  return { day: day + 1, phase, estimated };
}