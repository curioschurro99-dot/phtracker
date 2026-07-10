# Extract phrasecraft into standalone repo

**Date:** 2026-07-10
**Goal:** Move phtracker/phrasecraft/ into GitHub/phrasecraft/ as its own git repo, then remove it from phtracker.

## Steps

1. Copy source files (excl node_modules, dist) to new location
2. Create .gitignore
3. npm install + verify build
4. Init new git repo + commit
5. git rm phrasecraft/ from phtracker + commit

## Verification

-

pm run build exits with code 0
