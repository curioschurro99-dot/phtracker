# Phases C + D — Server Sync + VPS Deployment

**Date:** 2026-07-08
**Prerequisite:** Phase B (Better Auth with SQLite)

---

## Phase C — Server-side sync with PostgreSQL

### Goal

Replace localStorage-only state with a PostgreSQL-backed server sync layer. Users log in → their data lives on the server → is also cached in localStorage for offline reads.

### Dependencies

```
npm install drizzle-orm postgres
npm install -D drizzle-kit  # for migrations
```

### Steps

#### 1. Database setup

Add PostgreSQL to the project:

- `docker-compose.yml` with a `postgres:17` service
- Database URL via `DATABASE_URL` env var
- Drizzle config (`drizzle.config.ts`)
- Schema file (`src/lib/db/schema.ts`) mirroring the `State` type:

```ts
// tables: users, habits, logs, todos, buys, groceries, cycle, thoughts, sleep_logs, reminders
```

#### 2. Seed migration

Write a Drizzle migration that creates all tables with references to a `user_id` foreign key.

#### 3. Server functions — CRUD

Replace the skeleton `server-store.ts` with full TanStack Start server functions:

| Function     | Method | Description                                          |
| ------------ | ------ | ---------------------------------------------------- |
| `loadState`  | GET    | Fetch full user state from DB                        |
| `saveState`  | POST   | Full-state replace (simple approach)                 |
| `patchState` | PATCH  | Granular update per domain (e.g. `{ todos: [...] }`) |

All functions check `auth.session.userId` before operating.

#### 4. Sync layer in `habit-store.ts`

The `useHabitStore` hook gets a sync mode:

- **Online (default):** On every `update()`, call `saveState` server function after writing to localStorage. On page load, fetch from server and merge into localStorage.
- **Offline:** Write to localStorage only; queue pending mutations. On reconnect, replay queue.

Simple initial approach — full-state push/pull (no conflict resolution):

```
Login → loadState() → populate localStorage
Mutation → saveState() → update localStorage + server
```

Conflict resolution can be added later (last-write-wins is the default).

#### 5. Migrate existing data

For the initial single user (the developer), write a one-shot script to move from `data/store.json` or localStorage to PostgreSQL.

---

## Phase D — VPS deployment

### Goal

Dockerized production deployment on the existing VPS (`157.245.147.55`, domain `habit.appletreegarden.com`).

### Steps

#### 1. Docker setup

**`Dockerfile`** (multi-stage):

```dockerfile
# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

**`docker-compose.yml`**:

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env.production
    depends_on: [db]
    volumes:
      - ./data:/app/data # persist SQLite / uploaded data
  db:
    image: postgres:17
    env_file: .env.production
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

#### 2. Environment variables

**`.env.production`**:

```
DATABASE_URL=postgres://phtracker:password@db:5432/phtracker
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://habit.appletreegarden.com
```

#### 3. VPS setup (one-time)

```bash
# Install Docker
ssh root@157.245.147.55
apt update && apt install -y docker.io docker-compose-v2

# Clone repo
git clone https://github.com/curioschurro99-dot/phtracker.git
cd phtracker

# Deploy
docker compose -f docker-compose.yml up -d
```

#### 4. Cloudflare + Nginx/Caddy

- Cloudflare proxied DNS (already set up)
- Option A: Caddy in docker-compose (automatic SSL, simple config)
- Option B: Nginx reverse proxy with Cloudflare Origin CA certs
- Caddy is recommended for simplicity

#### 5. CI / deploy workflow

Simplest approach: SSH into VPS, `git pull && docker compose up -d --build`.

Can be scripted in `scripts/deploy.ps1`.

---

## Estimated effort

| Phase      | Files changed/created | Complexity                             |
| ---------- | --------------------- | -------------------------------------- |
| B (auth)   | ~8 files              | Medium — mostly config + UI            |
| C (sync)   | ~12 files             | High — data model, sync logic, offline |
| D (deploy) | ~5 files + VPS setup  | Medium — Docker, env, one-time setup   |
