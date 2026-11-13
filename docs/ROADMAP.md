# Roadmap

## Phase 1 — local PWA (now)

Build in small PRs, roughly in this order:

1. Scaffold: Vite + React + TS + shadcn (preset `b1D0dv72`) + dark tokens + PWA manifest/icons + SEO meta + lint/test setup. Deck JSON generation from `data/`.
2. Data layer: Dexie schema, deck loading, settings store.
3. Scheduling core (pure + tested): FSRS wrapper, queue builder, daily new limits, 4 AM day start, reverse-card unlock.
4. Voice: `useSpeech` hook (voice selection, rate, auto-play, slow, repeat, iOS quirks).
5. Study screens: question, answer, reverse, swipe, undo, session complete.
6. Today + Deck screens (stats tiles, search, filters, card grid).
7. Settings: voice picker, speed, limits, retention, reverse toggle, backup export/import, CSV import.
8. Polish: transitions, safe areas, Lighthouse, Vercel deploy.

## Phase 2 — sync and stats

- Django REST API + PostgreSQL, accounts, progress sync (offline queue, last-write-wins per card).
- Stats tab: reviews per day, retention, streak history, forecast.

## Phase 3 — ideas

- Pronunciation check with speech recognition.
- Optional pre-generated neural audio.
- Sentence mining: quick-add phrases from series/podcasts.

## Out of scope for phase 1

Accounts, sync, social features, push notifications, card editor beyond CSV import.
