# Phase B — Implementation Log

**Date:** 2026-07-08
**Plan:** `2026-07-08-phase-b-auth.md`

---

## What was implemented

### Files created

| File                                 | Purpose                                                                                                   |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `src/lib/auth-server.ts`             | Better Auth server config with Node.js built-in SQLite (`node:sqlite`), WAL mode, email/password provider |
| `src/lib/auth-client.ts`             | Better Auth browser client (React integration via `better-auth/react`)                                    |
| `src/lib/auth-context.tsx`           | React context (`AuthProvider` + `useAuth` hook) exposing `session`, `isPending`, `userId`                 |
| `server/routes/api/auth/[...all].ts` | Nitro catch-all route delegating to Better Auth's h3 handler                                              |
| `src/routes/login.tsx`               | Login page (email + password form, error display, styled with COLORS/Card/Button/Input)                   |
| `src/routes/signup.tsx`              | Signup page (name + email + password + confirm, client-side validation, same styling)                     |
| `.env`                               | Local dev environment variables (`BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`)                                 |
| `env.example`                        | Template for environment setup (committed to repo)                                                        |

### Files modified

| File                                    | Change                                                                                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/__root.tsx`                 | Wrapped `RootComponent` with `<AuthProvider>`                                                                                                             |
| `src/routes/index.tsx`                  | Replaced direct `HabitApp` render with `IndexPage` component that checks auth; shows "Loading..." while pending; redirects to `/login` if unauthenticated |
| `src/lib/habit-store.ts`                | `useHabitStore( userId? )` accepts optional `userId`; `load()` and `storageKey()` are scoped per user (`habit-tracker-state-v2-{userId}`)                 |
| `src/components/habit-app/HabitApp.tsx` | Imports `useAuth`, reads `userId`, passes to `useHabitStore(userId)`                                                                                      |
| `.gitignore`                            | Added `.env` to ignored files (secrets should not be committed)                                                                                           |

### Dependencies added

```
npm install better-auth @better-auth/utils @libsql/client
```

Note: `node:sqlite` was used instead of `@libsql/client` for the database (built into Node 24), so `@libsql/client` ended up unused but installed. The `node:sqlite` approach required no additional native dependencies.

---

## Key architectural decisions

1. **Better Auth over custom auth** — used `better-auth` with its TanStack Start integration. The `createAuthClient` from `better-auth/react` provides `useSession()` hook, making session management trivial.

2. **Nitro route for API mounting** — created `server/routes/api/auth/[...all].ts` as a Nitro catch-all route that delegates to `auth.handler`. This avoids having to configure a separate Nitro plugin and keeps the auth API endpoints at `/api/auth/*` where Better Auth's client expects them.

3. **React context for auth state** — `AuthProvider` wraps the app at the root level. `useAuth()` provides `session`, `isPending`, and `userId` to any component. This avoids prop-drilling through the deeply nested tab components.

4. **Node.js built-in SQLite** — used `DatabaseSync` from `node:sqlite` (available since Node 22.5+) instead of `@libsql/client` or `better-sqlite3`. Zero native dependencies, WAL mode enabled for concurrent access.

---

## Bugs encountered

None during implementation. All lint/prettier issues were pre-existing (`no-empty` on `catch {}` blocks for Notification API and localStorage).

---

## Deviations from plan

1. **Nitro route over plugin** — The plan suggested `server/plugins/auth.ts` with `defineNitroPlugin`. Instead, used `server/routes/api/auth/[...all].ts` with `defineEventHandler`. This is simpler and more compatible with the `@lovable.dev/vite-tanstack-config` wrapper (no need to configure Nitro plugins directly).

2. **React integration** — Used `better-auth/react` (which exports `createAuthClient` with `useSession` hook) instead of `better-auth/client` (vanilla). This gave us `useSession()` for free.

3. **No OAuth providers configured** — deferred as planned.

---

## Verification steps

| Step                              | Result                                                                              |
| --------------------------------- | ----------------------------------------------------------------------------------- |
| `npm run lint`                    | 2 pre-existing errors (empty catch blocks), 8 pre-existing warnings (react-refresh) |
| `npm run format`                  | Passed (all new files formatted)                                                    |
| `npm run build`                   | Passed (client + SSR + Nitro, all bundles built)                                    |
| Build output includes auth routes | Confirmed: `/api/auth/[...all]` found in `.output/server/index.mjs`                 |

---

## Files not actually used

- `@libsql/client` — installed but not used. `node:sqlite` handles the SQLite database.
- `@better-auth/utils` — installed but not directly imported. Used internally by Better Auth.
