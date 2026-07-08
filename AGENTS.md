# Project: phtracker

## Stack

| Layer     | Technology                                                        |
| --------- | ----------------------------------------------------------------- |
| Framework | React 19 + TanStack Start (SSR via Nitro/h3)                      |
| Routing   | TanStack Router (file-based, `src/routes/`)                       |
| Build     | Vite 8 + `@lovable.dev/vite-tanstack-config`                      |
| Styling   | Tailwind CSS 4 / inline `COLORS` tokens                           |
| UI        | Radix primitives + shadcn-style components (`src/components/ui/`) |
| State     | `localStorage`-backed React state (`src/lib/habit-store.ts`)      |
| Language  | TypeScript (strict mode)                                          |

## Workflow

All features and fixes follow a three-step process.

### 1. Plan first

Before any implementation, write a dated plan file to `plans/`:

```
plans/YYYY-MM-DD-<short-description>.md
```

The plan must cover:

- Goal and scope
- Files to create / modify
- Implementation order
- Key architectural decisions and tradeoffs
- Future considerations (migration paths, open questions)

Write the plan, present it to the user, and get sign-off before writing any code.

### 2. Log after implementation

After the plan is fully implemented and committed, write a dated implementation log to `plans/`:

```
plans/YYYY-MM-DD-<short-description>-log.md
```

The log must record:

- What was implemented (list of changes per file)
- Any bugs encountered during development and how they were fixed
- Deviations from the original plan (if any) and why
- Verification steps taken (lint, format, build, manual test)

### 3. Capture lessons learned

After each implementation, update the **Lessons Learned** section at the bottom of this file. Record:

- Patterns that worked well (repeat for future tasks)
- Pitfalls to avoid
- Config or tooling quirks (e.g. Windows CRLF issues, ESLint rules, dependency gotchas)
- Any changes to team conventions

Lessons are cumulative — add new entries at the top so the most recent is easiest to find.

## Git setup

Git is installed via GitHub Desktop — not in the normal PATH.

**Git executable:**

```
C:\Users\ellis\AppData\Local\GitHubDesktop\app-3.6.2\resources\app\git\cmd\git.exe
```

**Remote:** `origin` → `https://github.com/curioschurro99-dot/phtracker.git` (`main` branch)

### Auto-commit script

After implementing any feature or fix, run the helper script from the project root:

```
scripts/auto-commit.ps1 "type: description of the change"
```

It stages all changes, commits with the given message, and pushes to `origin/main`.

### Commit message format

Use conventional commits:

| Prefix      | When                                         |
| ----------- | -------------------------------------------- |
| `feat:`     | New feature or enhancement                   |
| `fix:`      | Bug fix                                      |
| `refactor:` | Code restructuring (no behaviour change)     |
| `style:`    | Formatting, whitespace, styling-only changes |
| `chore:`    | Tooling, dependencies, config, maintenance   |
| `docs:`     | Documentation (AGENTS.md, README, etc.)      |

**Examples:**

```
scripts/auto-commit.ps1 "feat: add dark mode toggle"
scripts/auto-commit.ps1 "fix: correct cycle day calculation for short months"
scripts/auto-commit.ps1 "chore: update dependencies"
```

### Important

- Never force-push, rebase, amend, or squash commits that have already been pushed.
- Keep `main` in a working state at all times.

## Dev commands

| Command           | What it does              |
| ----------------- | ------------------------- |
| `npm run dev`     | Start dev server with HMR |
| `npm run build`   | Production build          |
| `npm run preview` | Preview production build  |
| `npm run lint`    | ESLint across the project |
| `npm run format`  | Prettier formatting       |

## Code conventions

- **No comments** in source files — code should be self-documenting.
- **No emojis** unless the user explicitly requests them.
- **Inline styles:** Use the `COLORS` tokens object from `src/components/habit-app/ui.tsx` rather than raw colour values.
- **Components:** Look at existing components before creating new ones — follow same patterns for imports, typing, and structure.
- **State mutations:** Always use `store.update(fn)` with an immutable update function (see `habit-store.ts`).
- **Types:** All domain types live in `src/lib/habit-data.ts`.
- **File structure:**
  - `src/components/habit-app/` — feature-specific components
  - `src/components/ui/` — reusable UI primitives (shadcn-style)
  - `src/lib/` — utilities, stores, data definitions
  - `src/routes/` — TanStack Router file-based routes

## Lessons Learned

### 2026-07-08 — Remove Lovable wrapper + switch to node-server

- **Lovable wrapper is optional**: `@lovable.dev/vite-tanstack-config` is MIT licensed and open source, but bundles Lovable-platform plugins (sandbox HMR gate, component tagger, error telemetry) that do nothing on a self-hosted VPS. Replacing it with a plain `vite.config.ts` importing plugins directly is straightforward (~20 lines of config).
- **`nitro` named export**: `nitro/vite` exports `{ nitro }`, not a default export. Use `import { nitro } from "nitro/vite"`.
- **`node-server` preset**: The `cloudflare-module` preset does NOT start an HTTP server — it only exports a `fetch` handler for Cloudflare Workers. For Docker/VPS deployment, use `preset: "node-server"` which auto-starts on port 3000.
- **`resolve.tsconfigPaths: true`**: Vite 8 has native tsconfig path resolution. No need for `vite-tsconfig-paths` plugin.
- **Start script for auto-migration**: Use Drizzle's programmatic migrator (`drizzle-orm/postgres-js/migrator`) in a startup script to auto-apply migrations before the server starts. No need for `drizzle-kit` in production.
- **Dockerfile needs `drizzle/` + `scripts/`**: The runner stage must copy the migration files and start script alongside the `.output/` and `node_modules/`.

### 2026-07-08 — Nitro route scanning fix

- **Nitro `serverDir` defaults to `false`**: The `@lovable.dev/vite-tanstack-config` wrapper does NOT enable Nitro file-based route scanning. To add custom server routes (e.g. `server/routes/api/`), you must explicitly set `nitro: { serverDir: "server" }` in `vite.config.ts`.
- **Use `@/` for imports in Nitro routes**: From `server/routes/api/sync/load.ts`, relative imports like `../../../src/lib/...` resolve incorrectly. Use `@/lib/...` instead — Vite's `@` alias (`process.cwd()/src`) is inherited by the Nitro build environment.
- **ESLint `no-empty`**: Replace `catch {}` with `catch { void 0; }` to suppress the rule with a valid expression statement.
- **Sync merge guard**: When merging server state into local state, check that the server has actual data first. Otherwise, an empty database (new user) overwrites any local data that existed before registration.

### 2026-07-08 — Phase B: Multi-user auth (Better Auth)

- **Better Auth + TanStack Start**: Use `better-auth/react` for the client (has `useSession` hook), not `better-auth/client`. Mount the auth handler via a Nitro catch-all route at `server/routes/api/auth/[...all].ts` rather than a plugin — simpler and avoids configuring Nitro plugins through the config wrapper.
- **Node.js SQLite**: `node:sqlite` module (available since Node 22.5+) works perfectly with Better Auth — pass `new DatabaseSync("./path")` directly as the `database` option. No need for `better-sqlite3` or `@libsql/client`.
- **Windows CRLF**: Running `npm run format` (prettier) fixes CRLF issues. Always run format before lint to avoid false positives.
- **`.env` handling**: Never commit `.env` with real secrets. Use `.gitignore` to exclude it, commit an `env.example` as a template.
- **Prettier auto-fix**: `npm run format` before `npm run lint` — prettier can fix many issues that ESLint would otherwise report as errors.
