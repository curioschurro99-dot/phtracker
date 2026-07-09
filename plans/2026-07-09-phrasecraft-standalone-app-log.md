# PhraseCraft — Implementation Log

**Date:** 2026-07-09

---

## What was implemented

### Created `phrasecraft/` — standalone Vite + React 18 SPA

| File | Description |
|------|-------------|
| `phrasecraft/package.json` | Dependencies: React 18, Lucide React, Vite 6, Tailwind CSS 4 |
| `phrasecraft/vite.config.ts` | Plain Vite config with `@vitejs/plugin-react` |
| `phrasecraft/tsconfig.json` | TypeScript strict config |
| `phrasecraft/index.html` | Entry HTML |
| `phrasecraft/src/main.tsx` | React 18 entry point |
| `phrasecraft/src/index.css` | Tailwind CSS v4 import |
| `phrasecraft/src/data/categories.json` | 8 categories extracted from Bolt Supabase |
| `phrasecraft/src/data/subcategories.json` | 62 subcategories extracted from Bolt Supabase |
| `phrasecraft/src/data/phrases.json` | 938 phrases extracted from Bolt Supabase |
| `phrasecraft/src/App.tsx` | Main app with full feature set (view state machine, category browsing, phrase display, favorites, search, dictionary, add custom phrase, TTS, copy) |
| `phrasecraft/src/lib/store.ts` | `useLocalStorage` generic hook for favorites + custom phrases |
| `phrasecraft/src/lib/icons.ts` | Lucide icon name → component map |
| `phrasecraft/src/lib/dictionary.ts` | FreeDictionaryAPI wrapper |

### Features (matching original app)

- **Category browser**: 8 category buttons → subcategory list → phrase cards
- **Phrase cards**: show literary text (with clickable word → dictionary) + context example
- **Copy to clipboard** with green check visual feedback (2s)
- **Text-to-speech** (en-GB, rate 0.9) with active state highlighting
- **Favorites** (heart toggle, persisted in localStorage, viewable in Favorites tab)
- **Search** across all phrases (text, context, category, subcategory names — 2 char minimum)
- **Dictionary modal**: tap any word within phrase text → FreeDictionaryAPI lookup showing definitions, synonyms, phonetic
- **Add custom phrase** (FAB): category/subcategory select, phrase text, context example — stored in localStorage, displayed alongside built-in phrases in the correct subcategory
- **Delete custom phrases** from within the phrase view
- **Bottom nav bar** with 3 tabs: Categories, Favorites, Search
- **Back navigation** from subcategory → category → home
- **Loading spinner** during initial render

### Data

- Extracted from Bolts Supabase instance (`gmesgkxrwybsezynmpob`) using Supabase REST API
- 8 categories (Weather, Settings/Scenery, Emotions, Character Actions, Sound/Smell/Taste, Endings & Resolutions, Sizes & Scale, Texture & Touch)
- 62 subcategories
- 938 phrases with literary text + context examples
- All data embedded as static JSON — zero API calls at runtime

### Comparison to original

| Feature | Original (Bolt) | This build |
|---------|----------------|------------|
| Data storage | Supabase REST API | Embedded JSON (faster, offline) |
| Auth | Supabase Auth | None required |
| Dictionary | Supabase edge function | FreeDictionaryAPI (free, no auth) |
| Icons | Lucide React | Lucide React (same) |
| Styling | Tailwind + `#2C3E50` | Tailwind CSS v4 + `#2C3E50` (same) |
| Custom phrases | localStorage | localStorage (same) |
| Favorites | localStorage | localStorage (same) |
| TTS | SpeechSynthesis (en-GB, 0.9) | SpeechSynthesis (en-GB, 0.9) (same) |
| Build | Vite (Bolt-managed) | Vite 6 (standalone) |

## Bugs encountered

- `useRef` imported but unused → removed
- `SubcategoryListView` had unused `phrases` prop → removed from type and call site
- TypeScript strict mode caught these at build time

## Deviations from plan

None. Implementation followed the plan exactly.

## Verification

- `npm install` — 73 packages, 0 vulnerabilities
- `npm run build` — succeeds in 5.93s
  - `dist/index.html` — 0.49 kB
  - `dist/assets/index.css` — 21.30 kB (5.86 kB gzipped)
  - `dist/assets/index.js` — 542.82 kB (162.10 kB gzipped, includes all phrase data)
- Chunk size warning expected — all 938 phrases are embedded in the bundle

## Next steps (for deployment)

1. Build `phrasecraft/dist/` on the VPS
2. Configure nginx for `phrases.appletreegarden.com` with SSL (certbot)
3. Serve static files from `phrasecraft/dist/`
4. Point DNS `phrases.appletreegarden.com` → `157.245.147.55`
