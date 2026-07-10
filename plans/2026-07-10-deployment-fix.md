# 2026-07-10 — Deployment Fix Plan

## Goal

Make `habits.appletreegarden.com` work again by fixing the server config files with the correct domain and Supabase credentials.

---

## What Went Wrong Today

| Problem | Why |
|---------|------|
| I typed `habit` instead of `habits` in the website address | I knew the right domain but typed it wrong — twice |
| The server's firewall blocked Docker from reaching the internet | UFW (the firewall) needed extra rules to let Docker containers through |
| Supabase keys were missing from the VPS config file | When the code switched from "Better Auth" to "Supabase" (3 days ago), the config file was never updated |
| The Docker build files were missing from the repo | They were deleted in that same Supabase switch, so I had to recreate them from old backups on the VPS |

**Root cause of all chaos:** I tried to deploy without first checking what the VPS had, what the git history showed, or what credentials were needed.

---

## Steps Taken

### Step 1: Got Supabase credentials from user's Supabase dashboard

User logged into https://supabase.com and provided:
- VITE_SUPABASE_URL / SUPABASE_URL
- VITE_SUPABASE_ANON_KEY / SUPABASE_ANON_KEY

### Step 2: Fixed VPS `.env.production`

Updated via SSH:
- `BETTER_AUTH_URL` → `https://habits.appletreegarden.com`
- Added `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Added `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### Step 3: Fixed local `.env`

Added same Supabase credentials so dev server works locally.

### Step 4: Rebuilt Docker on VPS

Ran `docker compose up --build -d`, which:
- Rebuilt the app with new env vars
- Restarted db, app, and caddy containers
- Caddy obtained TLS certificate for `habits.appletreegarden.com`

### Step 5: Verified

`curl -s -o /dev/null -w '%{http_code}' https://habits.appletreegarden.com` → **HTTP 200**

---

## Files Created/Modified

| File | Action |
|------|--------|
| `/root/phtracker/.env.production` (VPS) | Modified — fixed domain, added Supabase creds |
| `/root/phtracker/Dockerfile` (VPS) | Created (was deleted from git) |
| `/root/phtracker/docker-compose.yml` (VPS) | Created (was deleted from git) |
| `/root/phtracker/Caddyfile` (VPS) | Created (was deleted from git) |
| `.env` (local) | Modified — added Supabase creds |
| `AGENTS.md` (local) | Modified — added pre-flight checklist lesson |

---

## Lessons for Future

See AGENTS.md section "2026-07-10 — Deployment pre-flight checklist" for the full pre-flight checklist to run before every deploy.
