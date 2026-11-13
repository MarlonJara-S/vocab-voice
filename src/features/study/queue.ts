import { State } from "ts-fsrs"

import type { DeckCard, Direction, ProgressRecord, ReviewLogRecord } from "@/lib/db/types"

import { endOfStudyDay } from "./day"
import { newCardsLeft } from "./limits"
import { isReverseUnlocked } from "./reverse"
import type { DeckInput, QueueItem } from "./types"

/** Learning cards due within this window are studied in the current session. */
export const LEARN_AHEAD_MS = 20 * 60 * 1000

export type QueueInput = {
  decks: DeckInput[]
  /** All progress records of these decks */
  progress: ProgressRecord[]
  /** Review logs since the start of the study day */
  todayLogs: ReviewLogRecord[]
  /** cardId → successful EN → ES reviews (see reverse.ts) */
  successfulReviews: ReadonlyMap<string, number>
  newPerDay: number
  reverseCards: boolean
  now: Date
}

export const progressKey = (cardId: string, direction: Direction) =>
  `${cardId}|${direction}`

export const isLearning = (p: ProgressRecord | undefined) =>
  p?.fsrs.state === State.Learning || p?.fsrs.state === State.Relearning

/**
 * Review cards are due for the whole study day (until 4 AM tomorrow).
 * Learning cards are due when their short step ends (with a 20 min learn-ahead).
 */
export function isDue(p: ProgressRecord, now: Date): boolean {
  const due = p.fsrs.due.getTime()
  if (p.fsrs.state === State.Review) return due < endOfStudyDay(now).getTime()
  if (isLearning(p)) return due <= now.getTime() + LEARN_AHEAD_MS
  return false
}

/**
 * Builds today's session:
 * 1. due cards (reviews + learning), oldest due first;
 * 2. new cards, per deck, up to the deck's daily limit. New EN → ES words
 *    (file order) alternate with newly unlocked reverse cards, so neither
 *    starves the other.
 * Siblings are buried: if a word's EN → ES card is in the session, its
 * ES → EN card waits for another day (it would give the answer away).
 */
export function buildQueue(input: QueueInput): QueueItem[] {
  const { decks, now, reverseCards } = input
  const cards = new Map<string, { deckId: string; card: DeckCard }>()
  for (const deck of decks) {
    for (const card of deck.cards) cards.set(card.id, { deckId: deck.deckId, card })
  }
  const byKey = new Map(input.progress.map((p) => [progressKey(p.cardId, p.direction), p]))

  const due: QueueItem[] = []
  for (const p of input.progress) {
    const entry = cards.get(p.cardId)
    if (!entry || !isDue(p, now)) continue
    if (p.direction === "es-en" && !reverseCards) continue
    due.push({ ...entry, direction: p.direction, progress: p })
  }
  const dueTime = (i: QueueItem) => i.progress?.fsrs.due.getTime() ?? 0
  due.sort((a, b) => dueTime(a) - dueTime(b))

  const forwardInSession = new Set(
    due.filter((i) => i.direction === "en-es").map((i) => i.card.id)
  )
  const newItems: QueueItem[] = []
  for (const deck of decks) {
    const forward = deck.cards.filter((c) => !byKey.has(progressKey(c.id, "en-es")))
    const reverse = reverseCards
      ? deck.cards.filter(
          (c) =>
            !byKey.has(progressKey(c.id, "es-en")) &&
            !forwardInSession.has(c.id) &&
            isReverseUnlocked(c.id, input.successfulReviews)
        )
      : []
    const left = newCardsLeft(deck.deckId, input.todayLogs, input.newPerDay)
    for (const [card, direction] of alternate(forward, reverse).slice(0, left)) {
      newItems.push({ deckId: deck.deckId, card, direction })
    }
  }

  return [...due, ...newItems].filter(
    (item) => item.direction === "en-es" || !forwardInSession.has(item.card.id)
  )
}

/** [f1, r1, f2, r2, …] then whatever is left of the longer list. */
function alternate(forward: DeckCard[], reverse: DeckCard[]): [DeckCard, Direction][] {
  const out: [DeckCard, Direction][] = []
  for (let i = 0; i < Math.max(forward.length, reverse.length); i++) {
    if (i < forward.length) out.push([forward[i], "en-es"])
    if (i < reverse.length) out.push([reverse[i], "es-en"])
  }
  return out
}

/** Counts for the Today card and the "Study N due + M new" button. */
export function countQueue(queue: QueueItem[]): { due: number; new: number } {
  const fresh = queue.filter((i) => !i.progress).length
  return { due: queue.length - fresh, new: fresh }
}
