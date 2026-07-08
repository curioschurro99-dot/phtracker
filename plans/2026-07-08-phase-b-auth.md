# Phase B — Multi-User Authentication

**Date:** 2026-07-08
**Auth approach:** Better Auth (MIT, self-hosted, free)
**Database for Phase B:** SQLite (via `@libsql/client`)
**Database for Phase C:** PostgreSQL (migration deferred)

---

## Overview

Add login/signup/session management so each user gets their own private data. Better Auth handles:

- Email/password authentication
- Session management (cookies, CSRF)
- Account creation and verification
- Future: OAuth (Google, GitHub, etc.) — configurable later

---

## Dependencies

```
npm install better-auth @better-auth/utils
npm install @libsql/client
```

---

## Files to create

| File                       | Purpose                                                       |
| -------------------------- | ------------------------------------------------------------- |
| `src/lib/auth-server.ts`   | Better Auth server config (SQLite adapter, email/pw provider) |
| `src/lib/auth-client.ts`   | Better Auth browser client (`createAuthClient()`)             |
| `src/routes/auth/[...].ts` | Nitro catch-all route — delegates to Better Auth's h3 handler |
| `src/routes/login.tsx`     | Login page with email/password form                           |
| `src/routes/signup.tsx`    | Signup page with email/password form                          |

## Files to modify

| File                     | Change                                                                      |
| ------------------------ | --------------------------------------------------------------------------- |
| `src/routes/__root.tsx`  | Add session check; redirect unauthenticated users to `/login`               |
| `src/routes/index.tsx`   | Wrap `HabitApp` in auth guard                                               |
| `src/lib/habit-store.ts` | Scope localStorage key by `userId` (e.g. `habit-tracker-state-v2-{userId}`) |

---

## Implementation order

### 1. Install packages

```bash
npm install better-auth @better-auth/utils @libsql/client
```

### 2. Create `src/lib/auth-server.ts`

Initialize Better Auth with the SQLite adapter:

```ts
import { betterAuth } from "better-auth";
import { libsql } from "@better-auth/adapters/libsql";
import { createClient } from "@libsql/client";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

const sqlite = createClient({
  url: `file:${path.join(DATA_DIR, "auth.db")}`,
});

export const auth = betterAuth({
  database: libsql(sqlite),
  emailAndPassword: {
    enabled: true,
  },
  // session cookie config
  session: {
    cookie: {
      name: "phtracker.session",
    },
  },
});
```

### 3. Create `src/lib/auth-client.ts`

```ts
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient();
```

### 4. Create API route `src/routes/auth/[...].ts`

Better Auth generates REST endpoints at `/api/auth/*` (signup, signin, signout, session, etc.). These need to be mounted via the Nitro/h3 server.

Since TanStack Start uses Nitro, the cleanest approach is a Nitro plugin or a TanStack server function catch-all that delegates to Better Auth's `auth.handler`.

Sketch:

```ts
// Nitro plugin — mounts Better Auth handler at /api/auth/**
// This is a server-only file (not a TanStack route)
// Located at server/plugins/auth.ts
import { auth } from "../../src/lib/auth-server";

export default defineNitroPlugin((app) => {
  app.use("/api/auth/**", (event) => auth.handler(event));
});
```

_(Requires creating a `server/plugins/` directory — Nitro auto-loads plugins from there.)_

### 5. Create login/signup pages

Two TanStack routes using React components:

**`src/routes/login.tsx`**

- Email + password form
- Error display
- On success, redirect to `/`
- Uses `authClient.signIn.email({ email, password })`

**`src/routes/signup.tsx`**

- Email + password + confirm password form
- Error display
- On success, redirect to `/login` (or auto-sign-in)
- Uses `authClient.signUp.email({ email, password, name })`

Both pages should match the existing app styling (inline `COLORS` tokens, Card, Button, Input components).

### 6. Protect routes

In `src/routes/__root.tsx` or a wrapper component:

- On page load / hydration, check `authClient.getSession()`
- If no session, redirect to `/login`
- Pass `session` (or `userId`) down via React context or URL params

The `HabitApp` component receives `userId` as a prop.

### 7. Scope localStorage by user

In `src/lib/habit-store.ts`:

```ts
const KEY = (userId: string) => `habit-tracker-state-v2-${userId}`;
```

The `useHabitStore` hook now accepts an optional `userId` parameter. When provided, data is isolated per user.

---

## Architecture notes

- **Loading state:** The auth check blocks rendering until session is confirmed (Better Auth loads session from cookie via a server call).
- **SSR considerations:** The login/signup pages are static. The protected index page returns a loading state until the client confirms the session.
- **No email verification** in initial build — can be added later from Better Auth's built-in support.
- **No OAuth** in initial build — Better Auth supports Google/GitHub/etc. as a config addition later.

---

## Migration path to Phase C (PostgreSQL)

When Phase C adds PostgreSQL:

1. Switch Better Auth's adapter from `@libsql/client` to `@better-auth/adapters/pg` (or `drizzle`)
2. Migrate the auth tables
3. No API changes — Better Auth abstracts the database adapter

---

## Future: Phase C + D

See `2026-07-08-phases-cd-overview.md` (to be created).
