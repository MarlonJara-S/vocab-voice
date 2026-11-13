# Vocab Voice

Personal flashcard PWA for learning English vocabulary with **unlimited free text-to-speech**, spaced repetition (FSRS) and an offline-first iPhone experience. Built as an alternative to Mochi, and as a portfolio project.

## Read these first (in order)

1. `docs/CONTEXT.md` — why this exists, who uses it, how we got here. **Read before writing any code.**
2. `docs/SPEC.md` — phase 1 features, data model, study flow, scheduling rules.
3. `docs/DESIGN.md` — visual design rules, tokens, and the design feedback history (what the user rejected and why).
4. `docs/DECISIONS.md` — tech decisions and the alternatives we rejected.
5. `docs/ROADMAP.md` — phases and what is explicitly out of scope for now.
6. `docs/mockups/*.dc.html` — the approved screen mockups (HTML, 390×844). Treat them as the visual source of truth for layout, spacing, sizes and copy.

## Working with the user

- The user is **Marlon**, a full-stack developer (React, Django, PostgreSQL) whose native language is Spanish. **Talk to him in Spanish.** UI copy is in simple English on purpose (immersion).
- He does not hand-write code for this project: Claude writes it, he reviews, tests on his iPhone and approves.
- He is very sensitive to visual quality. When in doubt, look at the mockups and `docs/DESIGN.md` → "What the user rejected". Show him the running app (or a screenshot) before calling UI work done.
- Keep changes small and reviewable: one feature per branch/PR, with a short PR description in simple English plus a one-line summary in Spanish.

## Stack (decided — don't change without asking)

- React 19 + TypeScript (strict) + Vite
- **shadcn/ui with preset `b1D0dv72`** (style "mira", base color neutral, Inter, lucide icons). Init with:
  `npx shadcn@latest init -t vite -p b1D0dv72` then add components as needed. Dark theme by default, amber accent (see DESIGN.md).
- Tailwind CSS (comes with shadcn)
- `ts-fsrs` for scheduling, `dexie` (IndexedDB) for local storage, `papaparse` for CSV import
- `vite-plugin-pwa` for manifest + service worker (offline)
- Web Speech API (`speechSynthesis`) for voice — free, unlimited, offline on iPhone
- Vitest + Testing Library for tests; ESLint
- Deploy: Vercel (Hobby), preview URL per PR

## Commands

- `npm run decks` (needs `papaparse`) — converts `data/*.csv` into `public/decks/*.json` (script: `scripts/build-decks.mjs`; it runs before `build`)
- `npm run dev` — dev server (use `--host` to open it on the iPhone over the local Wi-Fi)
- `npm run build`, `npm run test`, `npm run lint`

## Code conventions

- Feature folders: `src/features/{decks,study,stats,settings}/` each with `components/`, `hooks/`, and pure logic files. Shared UI in `src/components/ui` (shadcn), shared helpers in `src/lib`.
- **Small components**: one component per file, ideally < 120 lines. Logic in hooks or pure functions, not in JSX.
- Pure, tested functions for anything about scheduling, queues and daily limits (`src/features/study/queue.ts`, etc.).
- No `any`. Explicit types for DB records.
- Accessibility: real `<button>`s, `aria-label` on icon buttons, 44px minimum touch targets, respects `prefers-reduced-motion`.
- SEO/PWA basics in `index.html`: `lang="en"`, title, description, Open Graph tags, `theme-color`, apple-touch-icon, `apple-mobile-web-app-capable`, `robots.txt`.
