import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Card, Button, Input, COLORS } from "../components/habit-app/ui";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error: err } = await authClient.signIn.email({ email, password });
    if (err) {
      setError(err.message ?? err.statusText ?? "Sign in failed");
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: COLORS.bg,
        padding: 20,
      }}
    >
      <Card style={{ width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Sign in</h1>
        <p style={{ fontSize: 14, color: COLORS.sub, marginBottom: 20 }}>
          Welcome back to Habit Tracker
        </p>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 4 }}>
              Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ width: "100%" }}
            />
          </div>
          {error && <p style={{ fontSize: 13, color: "#C53030" }}>{error}</p>}
          <Button type="submit" style={{ width: "100%" }}>
            Sign in
          </Button>
        </form>
        <p style={{ fontSize: 13, color: COLORS.sub, marginTop: 16, textAlign: "center" }}>
          Don't have an account?{" "}
          <Link
            to="/signup"
            style={{ color: COLORS.blue, textDecoration: "none", fontWeight: 600 }}
          >
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}
