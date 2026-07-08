import { pgTable, text, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
});

export const habits = pgTable("habits", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  order: integer("order").notNull().default(0),
  activeDays: text("active_days").array().notNull().default([]),
});

export const logs = pgTable("logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  habitId: text("habit_id").notNull(),
  done: boolean("done").notNull().default(false),
});

export const todos = pgTable("todos", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  done: boolean("done").notNull().default(false),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const buys = pgTable("buys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  price: integer("price").notNull().default(0),
  done: boolean("done").notNull().default(false),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const groceries = pgTable("groceries", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  price: integer("price").notNull().default(0),
  done: boolean("done").notNull().default(false),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const periods = pgTable("periods", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  start: text("start").notNull(),
  logged: boolean("logged").notNull().default(true),
});

export const cycleMeta = pgTable("cycle_meta", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  avgCycleLength: integer("avg_cycle_length").notNull().default(28),
  avgPeriodLength: integer("avg_period_length").notNull().default(5),
});

export const reminders = pgTable("reminders", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  habitId: text("habit_id").notNull(),
  time: text("time").notNull(),
});

export const thoughts = pgTable("thoughts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  header: text("header").notNull().default(""),
  body: text("body").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  archived: boolean("archived").notNull().default(false),
});

export const sleepLogs = pgTable("sleep_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  bedtime: text("bedtime").notNull(),
  wake: text("wake").notNull(),
  quality: text("quality").notNull(),
  note: text("note"),
  updatedAt: text("updated_at").notNull(),
});
