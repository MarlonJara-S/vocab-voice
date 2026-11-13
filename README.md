# Vocab Voice

A personal flashcard app for learning English vocabulary, with unlimited text-to-speech, FSRS spaced repetition and offline support. Installable on iPhone as a PWA.

- 4,000 most useful English words (general + work/tech) and 154 irregular verbs, each with a Spanish meaning and an example sentence.
- Hear every word and example with the iPhone's built-in voices: free, unlimited, offline.
- Reverse cards (Spanish → English), swipe to answer, undo, shadowing practice.

Status: planning done, phase 1 in progress. See `docs/` for context, spec, design and roadmap.

## Stack

React 19 · TypeScript · Vite · shadcn/ui (Tailwind) · vite-plugin-pwa · Vitest

## Run it

```bash
npm install
npm run dev -- --host   # open the "Network" URL on the iPhone (same Wi-Fi)
```

| Command | What it does |
|---|---|
| `npm run decks` | Converts `data/*.csv` into `public/decks/*.json` (runs before `dev` and `build`) |
| `npm run dev` | Dev server |
| `npm run build` | Type check + production build with service worker |
| `npm run preview` | Serves the production build (to test offline/PWA) |
| `npm run test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run icons` | Regenerates the PWA icons from `public/icon.svg` |
