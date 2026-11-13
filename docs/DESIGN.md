# Design

Approved on 2026-11-13 after five iterations. The mockups in `docs/mockups/` are the source of truth; this file explains the rules behind them.

## Direction

**"Like Mochi, but ours."** Calm, dark gray, content-first, compact. The card and the word are the hero; chrome stays quiet. Own identity through an **amber accent** and a few genuinely useful features (interval labels, undo, swipe, shadowing, deck states, hard-words filter).

Do not copy Mochi's assets, logo or exact layouts; take the feel.

## Tokens (dark theme, default)

| Token | Value | Use |
|---|---|---|
| background | `#1E1E21` | page |
| card / surface | `#29292D` | cards, list groups, round buttons |
| surface-sunken | `#161618` | search input |
| tab bar | `#26262A` | bottom navigation |
| border | `#36363B` | 1px borders, dividers |
| divider-dashed | `#3E3E44` | dashed divider between question and answer |
| text | `#ECECEE` | primary text |
| text-secondary | `#C9C9CE` | example sentences |
| muted | `#8E8E93` | labels, meta text, inactive icons |
| disabled | `#5E5E63` | disabled icons |
| accent | `#E5A54B` (amber) | primary button bg, due counts, meaning text, progress, active tab |
| on-accent | `#1E1E21` | text on amber |
| success icon | `#7FC79A` | ✓ icon only |
| danger icon | `#E07A7A` | ✕ icon only, "Hard" state |

Map these onto shadcn CSS variables (`--background`, `--card`, `--border`, `--muted-foreground`, `--primary`, etc.) instead of hard-coding hex in components.

## Type and spacing

- **Inter**, base **15px**, line-height 1.45. Weights **400 and 500**; 600 only for page titles (22px) and the primary button.
- Sizes: word on the card 40px/500 (36px on reverse), meaning 20px, example 16px, list text 15px, meta 12–13px, tab labels 11px.
- Spacing on a 4px grid; page padding 16px; gaps 8–14px.
- Radius: cards **10px**, small tiles and inputs **8px**, filter chips 6px. Pills (audio player, chips) and the round ✕/✓ buttons are the only fully rounded shapes.
- Buttons: 40px tall (primary), 48px pill for "Show answer", 60px round rating buttons. Touch targets ≥ 44px.
- Icons: lucide, 1.7–1.8 stroke, 14–22px.

## What the user rejected (don't repeat these)

1. **v1** — light warm theme with a big colored hero card, streak pill, four rating buttons (Again/Hard/Good/Easy): "not this".
2. **v2** — minimal white/black, hairline list: "se ve horrible".
3. **v3** — dark "modern" with neon violet glow, progress ring hero, heatmap, big rounded cards, large colored Forgot/Remembered buttons: "horrible". His explicit list:
   - too much border radius
   - poor font setup; wants better spacing (%)
   - too much bold
   - components too big; wants small components
   - Forgot/Remembered buttons were ugly
   - better colors
   - no unnecessary badges, not so many buttons
   - "like Mochi" (repeated, in capitals)
4. **v4** — very flat gray, everything tiny and plain: still not it; he then sent Mochi screenshots.
5. **v5 (approved)** — Mochi-like structure with amber identity and extra features. He also liked the small stat tiles in the deck view (231 learned / 21 due today / 269 new).

## Interaction details

- Tap anywhere on the card to reveal. Subtle 150ms fade/height transition; respect `prefers-reduced-motion`.
- Swipe threshold ~80px with the card following the finger; show a faint red/green tint at the edge while dragging.
- Undo shows a small Sonner toast "Undone".
- Audio pill: play/pause, progress bar while speaking (estimated from `boundary` events or duration), 0.7× toggle, repeat.
- Respect the iPhone safe areas (`env(safe-area-inset-*)`).
