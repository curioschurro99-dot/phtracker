# AGENTS.md + Workflow Automation for phrasecraft

**Date:** 2026-07-10
**Goal:** Create AGENTS.md for the phrasecraft repo and replicate phtracker's automation routines.

## Scope

- Create AGENTS.md (adapted for phrasecraft's stack)
- Create plans/ directory
- Add ESLint + Prettier config (from phtracker, adapted)
- Copy auto-commit script from phtracker
- Add lint/format scripts to package.json

## Files to create

- AGENTS.md
- plans/ (empty dir)
- scripts/auto-commit.ps1 (copy from phtracker)
- eslint.config.js (copy from phtracker, remove server-only rule)
- .prettierrc (copy from phtracker)

## Files to modify

- package.json (add scripts + devDependencies)

## Verification

- npm run format passes
- npm run lint passes
- npm run build still succeeds
