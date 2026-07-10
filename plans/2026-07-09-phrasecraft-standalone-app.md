# PhraseCraft — Standalone SPA

**Date:** 2026-07-09
**Goal:** Rebuild the existing PhraseCraft Bolt app as a standalone Vite + React SPA within this repo, embedding all phrase data as JSON, deployed at `phrases.appletreegarden.com`.

---

## Overview

A fully offline-capable phrase-collection webapp for kids' English composition. All data (8 categories, 62 subcategories, ~190 phrases) is embedded as JSON at build time — zero API calls, instant load, works offline after first visit.

Replaces the Bolt-hosted original which used Supabase for data + auth + dictionary edge function. This version uses embedded JSON + FreeDictionaryAPI + localStorage.

---

## Files to create

| File                                             | Purpose                                               |
| ------------------------------------------------ | ----------------------------------------------------- |
| `phrasecraft/package.json`                       | Vite + React 18 SPA deps                              |
| `phrasecraft/vite.config.ts`                     | Plain Vite config                                     |
| `phrasecraft/index.html`                         | Entry HTML                                            |
| `phrasecraft/src/main.tsx`                       | React entry point                                     |
| `phrasecraft/src/data/categories.json`           | 8 categories (id, name, icon, order)                  |
| `phrasecraft/src/data/subcategories.json`        | 62 subcategories (id, name, category_id, order)       |
| `phrasecraft/src/data/phrases.json`              | ~190 phrases (id, text, context, subcategory_id)      |
| `phrasecraft/src/App.tsx`                        | Main app component with view-state machine            |
| `phrasecraft/src/components/CategoryList.tsx`    | Grid of category buttons                              |
| `phrasecraft/src/components/SubcategoryList.tsx` | List of subcategory items                             |
| `phrasecraft/src/components/PhraseList.tsx`      | List of phrase cards                                  |
| `phrasecraft/src/components/PhraseCard.tsx`      | Single phrase display + actions                       |
| `phrasecraft/src/components/NavBar.tsx`          | Bottom tab navigation (Categories, Favorites, Search) |
| `phrasecraft/src/components/AddPhraseModal.tsx`  | FAB modal for custom phrase creation                  |
| `phrasecraft/src/components/DictionaryModal.tsx` | Word definition lookup modal                          |
| `phrasecraft/src/components/SearchView.tsx`      | Full-text search across all phrases                   |
| `phrasecraft/src/lib/store.ts`                   | localStorage-backed state (favorites, custom phrases) |
| `phrasecraft/src/lib/dictionary.ts`              | FreeDictionaryAPI wrapper                             |
| `phrasecraft/src/lib/icons.ts`                   | Lucide icon name → component map                      |
| `phrasecraft/src/index.css`                      | Tailwind CSS v4 imports                               |

---

## Implementation order

### 1. Project scaffold

`package.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/index.css`

### 2. Data files

Extract Supabase data into three JSON files matching the original shape.

### 3. Store

`src/lib/store.ts` — `useLocalStorage` hook for favorites + custom phrases, following same patterns as original app.

### 4. Core components

- `App.tsx` — top-level state machine (view: categories → subcategories → phrases, favorites, search)
- `CategoryList` — 8 category buttons with icons
- `SubcategoryList` — subcategories grouped under a category
- `PhraseCard` — individual phrase with text, context, copy/TTS/favorite buttons
- `PhraseList` — renders list of PhraseCards
- `NavBar` — bottom tab navigation

### 5. Search

`SearchView` — input field, filters phrases/categories/subcategories by text, shows results grouped with names.

### 6. Dictionary

`DictionaryModal` — tap any word in phrase text → fetch from FreeDictionaryAPI → display definitions.

### 7. Add Custom Phrase

`AddPhraseModal` — form with category/subcategory selects + text/context textareas, stored in localStorage.

### 8. Polish

Text-to-speech (SpeechSynthesisUtterance, en-GB, rate 0.9), copy-to-clipboard with visual feedback.

### 9. Verify

`npm run build`, `npm run lint` (if configured).

---

## Key architectural decisions

| Decision       | Choice                  | Rationale                                                 |
| -------------- | ----------------------- | --------------------------------------------------------- |
| Data storage   | Embedded JSON           | Zero load time, fully offline, simple deploys             |
| Dictionary API | `api.dictionaryapi.dev` | Free, no auth needed, same data as original               |
| State          | localStorage            | Matches original, works offline, simple                   |
| Icons          | Lucide React            | Same icon set as the original Bolt app                    |
| Styling        | Tailwind CSS v4         | Same look as original (`#2C3E50` primary, `#F5F5F7` bg)   |
| Build          | Vite static SPA         | Simple `npm run build` → `dist/` dir, deployable anywhere |

## Future considerations

- If phrase collection grows large, load JSON dynamically via `fetch()` instead of import
- Add sync for favorites/custom phrases across devices (future phase)
- Add user-contributed phrases with moderation workflow
