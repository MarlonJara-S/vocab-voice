# Context: why Vocab Voice exists

## The learner

Marlon is a full-stack developer (~2 years: Python/Django, React, PostgreSQL, Docker) from Colombia. Native Spanish. In November 2026 a diagnostic placed his English at **A2+** overall (reading B1+, listening/grammar/writing A2+). His goals:

- Speak without mentally translating.
- Better job opportunities; job interviews and day-to-day dev work in English (meetings, explaining projects).

He follows a self-directed plan of ~40 min/day: flashcards, grammar, listening (podcasts, series with English subtitles), and short writing. Flashcards are the daily backbone.

Content preference: about **70% general English** (daily life, series, games, football, travel) and **30% work/tech English**.

## How we got here

1. **Decks built first.** Before this app existed, we built his vocabulary decks (they live in `data/`):
   - 8 decks with **4,000 words**: decks 01–07 are the 3,490 most frequent English lemmas (word-frequency order, names and profanity removed); deck 08 is 510 work/tech words and phrasal verbs (deploy, merge, walk through, catch up…). Each row: `Word, Meaning (Spanish), Example (simple English sentence)`.
   - 1 deck of **154 irregular verbs** with base–past–participle, other forms, meaning and two examples.
   - The CSVs also carry `Audio palabra` / `Audio ejemplo` columns, which only existed to feed Mochi's TTS fields. The app ignores them and speaks `Word` and the example directly.
2. **Mochi.** He imported the decks into Mochi (a flashcard app) on his iPhone with a text-to-speech template. It worked, but **Mochi's free plan allows only 200 characters of TTS per month**. His decks need ~126,000 characters (8,616 audio clips). Mochi Pro costs $5/month.
3. **Decision to build his own app** (2026-11-13). Hearing the word and the example is essential for an A2 learner (pronunciation, listening). The iPhone already ships good English voices for free via the Web Speech API, so a PWA can offer unlimited voice at $0. It also doubles as a **portfolio project** he can explain in English in interviews.
4. **Design iterations.** We went through 5 versions of the screens before he approved one. The history matters; see `docs/DESIGN.md` → "What the user rejected". Short version: he wants it to **look and feel like Mochi** (dark gray, calm, compact, content-first) but with its own identity (amber accent) and more useful features. He dislikes big radii, heavy bold, oversized components, loud colored buttons, unnecessary badges and gimmicky dashboards.
5. **Workflow.** He builds with Claude rather than by hand. A planning thread (in Claude, outside this repo) produced the design doc and mockups; implementation happens in VS Code with Claude Code using this repo's docs as the brief. The planning Claude will later review whether the project matches what was agreed.

## Constraints that shape everything

- **iPhone first.** He studies on an iPhone with Safari. The app must install from Safari ("Add to Home Screen") and run offline.
- **iPhone saves chat-downloaded CSVs as `.csv.txt`.** Any CSV import must accept `.csv`, `.txt` and `.csv.txt`.
- **iOS storage can be evicted** for sites not used for weeks; installed home-screen apps are mostly safe. Phase 1 includes export/import of progress as a JSON backup and calls `navigator.storage.persist()`.
- **Voice quality depends on installed voices.** iOS: Settings → Accessibility → Spoken Content → Voices → English → download "Enhanced"/"Premium" voices (free). The app should prefer those voices when present and show this tip in Settings.
- **iOS speech quirks**: `speechSynthesis` must be triggered from a user gesture the first time; voices load asynchronously (`voiceschanged`); check the silent switch if there's no sound.
- **Cost target: $0/month** for phase 1.
