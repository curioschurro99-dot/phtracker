# Project: phtracker

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TanStack Start (SSR via Nitro/h3) |
| Routing | TanStack Router (file-based, `src/routes/`) |
| Build | Vite 8 + `@lovable.dev/vite-tanstack-config` |
| Styling | Tailwind CSS 4 / inline `COLORS` tokens |
| UI | Radix primitives + shadcn-style components (`src/components/ui/`) |
| State | `localStorage`-backed React state (`src/lib/habit-store.ts`) |
| Language | TypeScript (strict mode) |

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

| Prefix | When |
|---|---|
| `feat:` | New feature or enhancement |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring (no behaviour change) |
| `style:` | Formatting, whitespace, styling-only changes |
| `chore:` | Tooling, dependencies, config, maintenance |
| `docs:` | Documentation (AGENTS.md, README, etc.) |

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

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint across the project |
| `npm run format` | Prettier formatting |

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
