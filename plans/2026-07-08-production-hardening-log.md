# Implementation Log: Production Hardening

## What was implemented (per file)

- `vite.config.ts` — Rewrote without Lovable wrapper; `{ nitro }` named import, `preset: "node-server"`, `serverDir: "server"`.
- `package.json` — Removed `@lovable.dev/vite-tanstack-config`, `vite-tsconfig-paths`; added `@tanstack/devtools-vite`.
- `scripts/start.mjs` — Auto-migration via Drizzle programmatic migrator before starting Nitro server.
- `Dockerfile` — Copies `scripts/`, `drizzle/` into runner; runs `node scripts/start.mjs` as entry point.
- `Caddyfile` — Reverse proxy `habits.appletreegarden.com` → `app:3000` with auto TLS.
- `docker-compose.yml` — Caddy + PostgreSQL + app services; Caddy exposes 80/443; `restart: unless-stopped`; healthchecks; `POSTGRES_PASSWORD` from `env_file`.
- `env.example` — Added `POSTGRES_PASSWORD` placeholder.
- `.gitignore` — Added `.env.*` rule.
- `server/routes/api/health.ts` — Health endpoint for Docker healthcheck.
- `src/lib/auth-server.ts` — Added `sameSite: "lax"` for HTTPS compatibility.
- `server/routes/api/{health,auth/[...all],sync/load,sync/save}.ts` — Added explicit `import { defineEventHandler, readBody, createError } from "h3"` (Nitro auto-imports not working in this build config).

## Bugs encountered

1. **`db` service failed healthcheck** — `${POSTGRES_PASSWORD}` was unset during compose variable substitution because Docker Compose only reads `.env`, not `.env.production`. Fix: `cp .env.production .env` on VPS.

2. **Port 80/443 conflict with nginx** — Nginx was already running on the VPS. Fix: `systemctl stop nginx && systemctl disable nginx`.

3. **`defineEventHandler is not defined`** — Nitro auto-imports don't work with the current TanStack Start + Nitro plugin combination. Fix: Added explicit `import { defineEventHandler } from "h3"` (and `readBody`, `createError` where needed) to all route files.

4. **Caddy couldn't resolve DNS** — Docker containers use host's systemd-resolved at `127.0.0.53` which is inaccessible from inside containers. Fix: Added `{"dns": ["67.207.67.2", "67.207.67.3", "8.8.8.8"]}` to `/etc/docker/daemon.json` and restarted Docker.

5. **Wrong domain in Caddyfile** — Was `habit.appletreegarden.com`, should be `habits.appletreegarden.com`.

## Deviations from plan

None significant. The DNS + domain corrections were discovered during deployment.

## Verification

- `curl https://habits.appletreegarden.com/` returns 200
- `curl https://habits.appletreegarden.com/api/health` returns `{"status":"ok"}`
- All three containers (app, db, caddy) show healthy
- Let's Encrypt certificate obtained successfully for `habits.appletreegarden.com`
