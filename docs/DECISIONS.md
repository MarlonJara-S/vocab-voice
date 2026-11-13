# Decisions

| Topic | Decision | Rejected alternative | Why |
|---|---|---|---|
| App type | PWA installed from Safari | Native (React Native / Expo) | Installing a native app on his iPhone outside the App Store needs the $99/year Apple Developer account. A PWA is free. |
| Frontend | React 19 + TypeScript + Vite | Next.js | His stack; no server needed in phase 1, Vite is simpler. |
| UI kit | shadcn/ui, preset `b1D0dv72` (style "mira": compact, neutral, Inter, lucide) | Custom CSS, other kits | His choice. Mira's compact components match his "small components" feedback. Adapt to the dark tokens in DESIGN.md. |
| Scheduling | FSRS via `ts-fsrs` | SM-2 (classic Anki) | Modern algorithm (Anki default since 2023); same retention with fewer reviews. |
| Rating buttons | 2 (Forgot = Again, Remembered = Good) | 4 (Again/Hard/Good/Easy) | Simpler and Mochi-like; he rejected the 4-button version. |
| Reverse cards | In phase 1, unlocked after 2 successful EN→ES reviews | Phase 2 / always on | He asked for "whatever is best for learning": production practice matters, but gating avoids doubling the beginner load. |
| Storage | IndexedDB via Dexie, local-first | Server-only | Offline, free. Sync comes in phase 2. |
| Voice | Web Speech API (iPhone voices) | Pre-generated neural MP3s (Google/Azure) | Free, unlimited, offline. Neural audio stays an option: all decks are ~126k characters, inside Google's (1M/month premium) and Azure's (0.5M/month) free tiers. |
| UI language | Simple English | Spanish | More exposure to English. Talk to the user in Spanish. |
| Hosting | Vercel Hobby | Cloudflare Pages, GitHub Pages | Preview URL per PR to test on the iPhone before merging. |
| Phase 2 backend | Django + DRF + PostgreSQL (Neon/Supabase free tier) | Supabase-only | His stack, better for the portfolio. |
| Cost | $0/month phase 1; $0–5/month phase 2 | Mochi Pro $5/month | |
