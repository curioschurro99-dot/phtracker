# Production Hardening

**Date:** 2026-07-08

## Goal

Bridge the final gaps between "builds on my machine" and "one-command deploy on a VPS with HTTPS."

## What's missing

| Gap                           | Issue                                     |
| ----------------------------- | ----------------------------------------- |
| No TLS                        | Plain HTTP only. Traffic is unencrypted.  |
| No restart policy             | Container crash leaves the app dead.      |
| PostgreSQL password hardcoded | `phtracker_dev` is in docker-compose.yml. |
| DB port exposed to host       | Port 5432 published to the internet.      |
| No app healthcheck            | Docker can't detect a stuck process.      |
| Auth cookie not secured       | No explicit sameSite config for HTTPS.    |
| env.example has dev values    | BETTER_AUTH_URL points to localhost.      |

## Changes

### 1. docker-compose.yml

- Add Caddy reverse proxy service (auto Let's Encrypt SSL)
- Add `restart: unless-stopped` to all services
- Add healthcheck to app service (port probe on 3000)
- Remove `ports` from db and app services (Caddy talks via internal network)
- Read `POSTGRES_PASSWORD` from `.env.production` instead of hardcoding

### 2. Caddyfile (new, project root)

```
habit.appletreegarden.com {
    reverse_proxy app:3000
}
```

### 3. src/lib/auth-server.ts

Add `sameSite: "lax"` to the session cookie config. The `secure` flag auto-detects HTTPS from Caddy's x-forwarded-proto header.

### 4. server/routes/api/health.ts (new)

```ts
export default defineEventHandler(() => ({ status: "ok" }));
```

### 5. env.example

Add `POSTGRES_PASSWORD` variable. Update `BETTER_AUTH_URL` to show `https://habit.yourdomain.com`.

### 6. .gitignore

Add `.env.*` to catch `.env.production` and other env variants.

## Deployment flow

```bash
ssh root@vps
git clone https://github.com/curioschurro99-dot/phtracker.git
cd phtracker

cat > .env.production << EOF
BETTER_AUTH_SECRET=$(openssl rand -hex 32)
BETTER_AUTH_URL=https://habit.appletreegarden.com
DATABASE_URL=postgres://phtracker:$(openssl rand -hex 12)@db:5432/phtracker
POSTGRES_PASSWORD=$(openssl rand -hex 12)
EOF

docker compose up -d --build
```

## Files to modify

| File                        | Action                   |
| --------------------------- | ------------------------ |
| docker-compose.yml          | Rewrite                  |
| Caddyfile                   | Create                   |
| src/lib/auth-server.ts      | Edit (add sameSite: lax) |
| server/routes/api/health.ts | Create                   |
| env.example                 | Edit                     |
| .gitignore                  | Edit (add .env.*)        |

No source-code logic changes.
