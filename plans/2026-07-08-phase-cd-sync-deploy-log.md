# Fix: Enable Nitro Route Scanning for Server Routes

**Date:** 2026-07-08

## What was implemented

### Root cause

Nitro's serverDir defaults to alse, so the server/routes/ directory was never scanned during the Nitro build phase. The route files for auth and sync existed on disk but were silently excluded from the production bundle.

### Changes per file

1. **vite.config.ts** � Added
   itro: { serverDir: "server" } to explicitly tell Nitro to scan the server/ directory for route handlers.

2. **server/routes/api/auth/[...all].ts** � Fixed import paths from broken relative paths (../../../../src/...) to @/ alias.

3. **server/routes/api/sync/load.ts** � Same import path fix.

4. **server/routes/api/sync/save.ts** � Same import path fix.

5. **src/lib/habit-store.ts** �
   - Fixed empty catch block causing ESLint
     o-empty error
   - Fixed sync merge logic: only apply server state on load if the server actually has data (habits.length > 0, logs has keys, or todos.length > 0). Prevents empty server state from overwriting existing local data after registration.

6. **src/components/habit-app/HabitApp.tsx** � Fixed empty catch block causing ESLint
   o-empty error.

### Bugs encountered

- Nitro's serverDir is alse by default. The lovable config wrapper (@lovable.dev/vite-tanstack-config) doesn't set it. This means NO file-based route scanning happens unless explicitly configured.
- Relative import paths from server/routes/api/*/ to src/lib/ were calculated incorrectly (e.g. ../../../src/ from server/routes/api/sync/ resolves to server/routes/src/, not the project root).
- Using @/ alias works because Vite's
  esolve.alias: { "@": process.cwd() + "/src" } is inherited by the Nitro build environment.

### Verification

-

pm run build passes (client + SSR + Nitro stages)

- .output/server/index.mjs contains three route registrations before the SSR catch-all:
  - /api/auth/**:all (from _...all_.mjs)
  - /api/sync/load (from _routes/api/sync/load.mjs)
  - /api/sync/save (from _routes/api/sync/save.mjs)
- Lint passes (0 errors, 8 pre-existing warnings)
- Format passes (no changes)
