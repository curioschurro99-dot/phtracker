import { createFileRoute } from "@tanstack/react-router";
import { HabitApp } from "@/components/habit-app/HabitApp";

export const Route = createFileRoute("/")({
  component: HabitApp,
});
