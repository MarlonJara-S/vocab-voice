# Phase 1 spec

Phase 1 is a local-first PWA. No backend, no login. Everything lives in IndexedDB on the device.

## Screens (see `docs/mockups/`)

| # | Screen | Mockup | Purpose |
|---|---|---|---|
| 1 | Today | `Main.dc.html` | Today's summary card (cards left, due/new/done, ~minutes, "Study now"), deck list with learned count and due count, "+ Import CSV". Tab bar. |
| 2 | Deck | `Deck.dc.html` | Stats (learned / due today / new), "Study N due + M new", search, filters (All / Due / Learning / Hard words), grid of word cards with meaning and FSRS state ("Due today", "Next in 3 days", "Learning · 10 min", "Hard · due today", "New"). Tap a card's speaker to hear it. |
| 3 | Study, question | `Study.dc.html` | Progress (ring + "17 / 54"), deck name + card kind, card with the word and an audio pill (play, progress, 0.7× slow, repeat). "Tap the card to reveal". Bottom: undo, "Show answer", more (···). |
| 4 | Study, answer | `Answer.dc.html` | Same card expanded: dashed divider, meaning (accent color), example with the word emphasized, "Listen" and "Repeat after it" chips. Bottom: undo, round ✕ (Forgot) and ✓ (Remembered) buttons with the next interval under each, more. Hint: swipe left = forgot, right = remembered. |
| 5 | Reverse card | `Reverse.dc.html` | Spanish → English: "How do you say it in English?", the Spanish meaning, the example with the word blanked out. Same bottom bar as the question side. |
| 6 | Session complete | `Done.dc.html` | Cards, time, streak; remembered vs forgot bar; list of words forgotten today; what's due tomorrow. Also reached from the Stats tab in phase 1. |
| 7 | Settings | `Settings.dc.html` | Voice (picker of English voices), speed slider (0.5–1.2, default 0.9), auto-play word; new cards per day (default 20), target memory / desired retention (default 90%), reverse cards on/off; export backup, import CSV or backup. Voice tip text. |

Tab bar: Today, Decks, Stats, Settings. Hidden during a study session (focus mode).

## Study flow

1. Start from Today ("Study now" = all decks) or from a deck.
2. Question side shows the word and **auto-plays it** (setting). Tapping the card or "Show answer" reveals.
3. Answer side: user rates **Forgot** (FSRS `Rating.Again`) or **Remembered** (FSRS `Rating.Good`). Only two buttons on purpose (simpler, Mochi-like). Under each, show the interval FSRS would give (e.g. "1 min", "3 days").
4. Swipe gestures: left = Forgot, right = Remembered. Undo restores the previous card state and removes the review log.
5. "Repeat after it" = shadowing: plays the example, then waits ~the same duration so he can repeat out loud. (No speech recognition in phase 1.)
6. Learning/relearning cards due within the next 20 minutes are re-inserted into the current session queue.
7. When the queue is empty → Session complete screen.

## Reverse cards (decided 2026-11-13)

- Each word has two directions: EN→ES (recognition, the main card) and ES→EN (production).
- The reverse card is **unlocked only after the EN→ES card has 2 successful reviews**, so beginners don't get double the load from day one.
- Each direction has its own FSRS state. Can be disabled in Settings.

## Scheduling (FSRS)

- `ts-fsrs` with `enable_fuzz: true`, `request_retention` from Settings (default 0.9).
- New cards per day: per deck limit (default 20), counted from review logs since the day start.
- **Day starts at 4:00 AM local time** (so a late-night session counts for the same day).
- Queue order: due reviews first (oldest due first), then new cards in file order, interleaving learning cards as they come due.

## Data model (Dexie)

Built-in decks are static JSON in `public/decks/` (generated from `data/*.csv`), cached by the service worker. Only user data goes into IndexedDB.

```ts
type DeckCard = {           // from public/decks/<deckId>.json
  id: string;               // `${deckId}:${slug(word)}` — stable, unique per deck
  front: string;            // English word or verb
  meaning: string;          // Spanish
  examples: string[];       // 1 for vocab, 2 for verbs (past, participle)
  forms?: string;           // verbs only: "catch – caught – caught"
  other?: string;           // verbs only: "catches · catching"
};

type Direction = 'en-es' | 'es-en';

type ProgressRecord = {     // table "progress", key [cardId+direction]
  cardId: string; deckId: string; direction: Direction;
  fsrs: Card;               // ts-fsrs Card (dates as Date)
  updatedAt: Date;
};

type ReviewLogRecord = {    // table "logs", ++id
  cardId: string; deckId: string; direction: Direction;
  rating: Rating; wasNew: boolean; reviewedAt: Date; durationMs: number;
};

type CustomDeck = { id: string; name: string; cards: DeckCard[]; createdAt: Date }; // table "customDecks"
type Settings = { key: string; value: unknown };                                      // table "settings"
```

Decks index: `public/decks/index.json` → `[{ id, name, count, builtIn: true }]`.

## CSV import

- Accept `.csv`, `.txt`, `.csv.txt`.
- Recognized headers: `Word,Meaning,Example` (our format) and `Front,Back` (Mochi/Anki style; strip markdown `**`/`_`; split Back on the first blank line into meaning and example).
- Show a preview (first 5 rows, count) before saving.

## Backup

- Export: JSON with progress, logs, custom decks and settings, file name `vocab-voice-backup-YYYY-MM-DD.json`. Use the Web Share API on iOS when available, else a download.
- Import: validate version, then replace or merge (ask).

## Quality bar for phase 1

- Works offline after first load; installable from Safari with proper icon and name.
- Unit tests for queue building, daily limits, day-start logic, reverse-card unlock, CSV parsing.
- Lighthouse PWA/accessibility pass on mobile.
