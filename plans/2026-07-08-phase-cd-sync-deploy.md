# Phases C + D — Server Sync + VPS Deployment

**Date:** 2026-07-08  
**Prerequisite:** Phase B (Better Auth with SQLite, user-scoped state)

---

## Phase C — Server-side sync with PostgreSQL

**Goal:** Replace localStorage-only state with a PostgreSQL-backed server sync. Data persists across devices and browser resets.

### Dependencies

```
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

### Implementation order

1. **`docker-compose.yml`** — PostgreSQL service for local dev
2. **`src/lib/db/schema.ts`** — Drizzle schema (all domain tables with `userId` FK)
3. **`src/lib/db/index.ts`** — DB connection pool from env var `DATABASE_URL`
4. **`drizzle.config.ts`** — Drizzle Kit config for migrations
5. **`src/lib/sync.ts`** — TanStack Start server functions (`loadState`, `saveState`, `patchState`)
6. **`src/lib/habit-store.ts`** — Modify to call sync functions on mutation and hydration

### Architecture

```
User action → store.update() → localStorage (immediate) + server function (async, fire-and-forget)
Hydration  → load from server → merge into localStorage → render
Offline    → localStorage only → queue pending → retry on reconnect
```

Simple approach: full-state push/pull. No granular conflict resolution — last-write-wins.

All server functions check `auth.session.userId` from the session cookie (Better Auth).

---

## Phase D — VPS deployment

**Goal:** Dockerized production deployment at `habit.appletreegarden.com`.

### Implementation order

1. **`Dockerfile`** — multi-stage build (Node 24, build + run)
2. **`docker-compose.yml`** — add app service (alongside PostgreSQL)
3. **`env.example`** — add `DATABASE_URL` to template
4. **VPS setup** — documented steps in the plan log

---

## Files to create

| File                   | Purpose                                |
| ---------------------- | -------------------------------------- |
| `docker-compose.yml`   | PostgreSQL + app services              |
| `Dockerfile`           | Multi-stage build for the app          |
| `src/lib/db/schema.ts` | Drizzle table definitions              |
| `src/lib/db/index.ts`  | Database connection pool               |
| `drizzle.config.ts`    | Drizzle Kit configuration              |
| `src/lib/sync.ts`      | Server functions + client sync helpers |

## Files to modify

| File                     | Change                                                           |
| ------------------------ | ---------------------------------------------------------------- |
| `src/lib/habit-store.ts` | Add `server` param; call `syncState()` on mutation and hydration |
| `env.example`            | Add `DATABASE_URL`                                               |
| `.gitignore`             | Add `.env.production`, `drizzle/meta/`                           |

## Future considerations

- **Conflict resolution:** current approach is last-write-wins. If users edit from two devices simultaneously, the last save overwrites. Can add timestamps per-field later.
- **Offline queue:** not implemented initially — if server is down, the app still works from localStorage, but pending changes are lost on page refresh. Queue can be added later.
- **Migrations:** Drizzle Kit generates SQL migration files. Apply with `npx drizzle-kit push` or `npx drizzle-kit migrate` in production.
