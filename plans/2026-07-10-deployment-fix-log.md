# 2026-07-10 — Deployment Fix Log

## What was implemented

| File | Action |
|------|--------|
| `/root/phtracker/.env.production` (VPS) | Fixed `BETTER_AUTH_URL` domain, added all 4 Supabase env vars |
| `/root/phtracker/Dockerfile` (VPS) | Created from old container snapshot |
| `/root/phtracker/docker-compose.yml` (VPS) | Created from old container snapshot |
| `/root/phtracker/Caddyfile` (VPS) | Created with correct `habits.appletreegarden.com` domain |
| `.env` (local) | Added Supabase credentials |
| `AGENTS.md` | Added deployment pre-flight checklist lesson |
| `plans/2026-07-10-deployment-fix.md` | Plan file |

## Bugs encountered during deployment

1. **UFW blocked Docker forwarding**: The firewall's FORWARD chain defaulted to DROP. Docker containers (Caddy) couldn't reach the internet for DNS or TLS cert validation. Fixed with `ufw route allow` rules.

2. **Stale rebase corruption**: Earlier git rebase partially failed due to missing `vi` editor on Windows. Had to manually clean `.git/rebase-merge` directory.

3. **Merge conflict in `habit-data.ts`**: Remote had its own simpler gratitude types. Resolved by keeping the richer types (entries array, messageToUniverse, etc.) while adding `Gratitudes` type for backward compatibility.

4. **Duplicate import in `HabitApp.tsx`**: Auto-merge created two `EMOTIONS` imports. Consolidated into one import.

5. **Caddy domain typo**: Recreated the `habit.*` vs `habits.*` mistake. Had to regenerate Caddyfile after first deployment attempt failed.

## Deviations from plan

None — plan was created after the fix was completed.

## Verification

- `curl -s -o /dev/null -w '%{http_code}' https://habits.appletreegarden.com` → **HTTP 200**
- Docker containers all healthy (db, app, caddy)
- Caddy TLS certificate obtained for `habits.appletreegarden.com`
- Local `.env` updated and `npm run dev` confirmed working
