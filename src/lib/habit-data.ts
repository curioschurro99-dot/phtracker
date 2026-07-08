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

export type Grocery = {
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
  bedtime: string;
  wake: string;
  quality: string;
  note?: string;
  updatedAt: string;
};

export type SleepLogs = Record<string, SleepLog>;

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
  [
    "8:00 – 8:20 AM | Wake + Hydrate (Bottled water + salt or lemon)",
    "Open the windows, let some light in — helps reset your body clock.",
  ],
  [
    "8:20 – 10:00 AM | Breakfast + Daily To Do + News",
    "Protein-forward (eggs, yogurt, tofu). Sit down to eat — no phone.",
  ],
  [
    "10:00 – 10:45 AM | Shower + Get Dressed Properly + Laundry",
    "A small psychological trick to kick start your day.",
  ],
  [
    "10:45 – 11:45 AM | Finance News",
    "Daily read — markets, portfolio check-ins. Low-stress, engaged-brain activity.",
  ],
  [
    "11:45 AM – 12:40 PM | Productive Block",
    "Job hunting/applications, a course, the counselling program research, or admin/errands.",
  ],
  ["12:45 – 2:00 PM | Water + Light Walk + Prep Lunch", "Walk outside (for sunlight, fresh air)."],
  ["2:00 – 3:00 PM | Cook + Eat Lunch", "Main meal of the day. ~30 mins to cook."],
  ["3:00 – 5:00 PM | Rest / Drama Time / Reading", "Guilt-free. This is a genuine leisure block."],
  [
    "5:00 – 5:45 PM | Second Movement Block",
    "A brisk walk, a second shorter yoga session, or light strength training (bodyweight squats, resistance bands).",
  ],
  [
    "6:00 – 8:30 PM | Cook + Eat Dinner + Water",
    "Finish eating by 7:30pm–8:30pm so digestion has time before bed.",
  ],
  ["8:30 – 9:00 PM | Evening Leisure", "Last big glass of water for the evening & unwind."],
  [
    "9:00 – 9:30 PM | Gentle Evening Yoga / Stretch",
    "Restorative poses — signal to body it's time to slow down.",
  ],
  [
    "9:30 – 10:30 PM | Wind Down",
    "Skincare, tidy up, prep clothes/food for tmr. Avoid heavy phone scrolling here if you can.",
  ],
  [
    "10:30 – 11:00 PM | Bible + Prayer + Sleep",
    "Consistent bedtime is critical — poor sleep disrupts hunger hormones.",
  ],
];

const satList: Array<[string, string]> = [
  ["7:30 – 7:40 AM | Wake + Hydrate (A glass of water + salt or lemon)", "Boil eggs (7 mins)."],
  [
    "7:40 – 8:00 AM | Shower + Get Dressed Properly",
    "A small psychological trick to kick start your day.",
  ],
  ["8:00 – 8:20 AM | Breakfast", "Protein-forward (eggs, yogurt, tofu)."],
  ["8:20 – 8:55 AM | Commute to Tzu Tzih", "Plan your tuition program."],
  ["9:00 – 11:15 AM | Tuition", "Tuition."],
  [
    "11:15 AM – 1:30 PM | Water + Northpoint City Library + Lunch",
    "Read, shop, lunch and grocery.",
  ],
  [
    "1:30 – 2:30 PM | Saturday Date with Bf",
    "Walk outside (for sunlight, fresh air, and breaking up sitting).",
  ],
  ["2:30 – 9:00 PM | Free Play + Water", "Free playyyyy."],
  [
    "9:00 – 9:30 PM | Gentle Evening Yoga / Stretch",
    "Restorative poses — signal to body it's time to slow down.",
  ],
  [
    "9:30 – 10:30 PM | Wind Down",
    "Skincare, tidy up, prep clothes/food for tmr. Avoid heavy phone scrolling here if you can.",
  ],
  [
    "10:30 – 11:00 PM | Bible + Prayer + Sleep",
    "Consistent bedtime is critical — poor sleep disrupts hunger hormones.",
  ],
];

const sunList: Array<[string, string]> = [
  [
    "8:00 – 8:10 AM | Wake + Hydrate (A glass of water + salt or lemon)",
    "Open the windows, let some light in — helps reset your body clock.",
  ],
  [
    "8:10 – 8:15 AM | Shower + Get Dressed Properly",
    "A small psychological trick to kick start your day.",
  ],
  ["8:15 – 9:30 AM | Breakfast", "Protein-forward (eggs, yogurt, tofu). Drama."],
  ["9:30 AM – 12:00 PM | Church?", "Depends. Chill."],
  ["12:00 – 4:30 PM | Play Time", "Free play."],
  ["4:30 – 9:00 PM | Sunday Date with Bf", "Walk outside (for sunlight & fresh air)."],
  [
    "9:00 – 9:30 PM | Gentle Evening Yoga / Stretch",
    "Restorative poses — signal to body it's time to slow down.",
  ],
  [
    "9:30 – 10:30 PM | Wind Down",
    "Skincare, tidy up, prep clothes/food for tmr. Avoid heavy phone scrolling here if you can.",
  ],
  [
    "10:30 – 11:00 PM | Bible + Prayer + Sleep",
    "Consistent bedtime is critical — poor sleep disrupts hunger hormones.",
  ],
];

const dailyList: Array<[string, string]> = [
  ["Total Water Intake 1.5 Litre", ""],
  ["Total Step Count >10,000", ""],
  ["135 Coffee, Else Decaf.", "Too much coffee - stomach issues."],
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
    ...mk(dailyList, ALL_DAYS),
    ...mk(weekdayList, WEEKDAYS),
    ...mk(satList, ["Sat"]),
    ...mk(sunList, ["Sun"]),
  ];
}

export type Phase = "menses" | "follicular" | "fertile" | "luteal";

export const PHASE_COLORS: Record<
  Phase,
  { bg: string; text: string; letter: string; label: string }
> = {
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
    day = ((day % cycleLen) + cycleLen) % cycleLen;
    estimated = true;
  } else if (day >= cycleLen) {
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
