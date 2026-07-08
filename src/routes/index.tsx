import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { HabitApp } from "@/components/habit-app/HabitApp";
import { useAuth } from "../lib/auth-context";
import { COLORS } from "../components/habit-app/ui";

function IndexPage() {
  const { isPending, userId } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !userId) {
      navigate({ to: "/login" });
    }
  }, [isPending, userId, navigate]);

  if (isPending) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: COLORS.bg,
        }}
      >
        <p style={{ color: COLORS.sub, fontSize: 14 }}>Loading...</p>
      </div>
    );
  }

  if (!userId) return null;

  return <HabitApp />;
}

export const Route = createFileRoute("/")({
  component: IndexPage,
});
