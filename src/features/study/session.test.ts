import { State } from "ts-fsrs"
import { describe, expect, it } from "vitest"

import { buildQueue } from "./queue"
import { createScheduler, reviewCard } from "./scheduler"
import { afterReview, pickNextIndex } from "./session"
import { progress, word } from "./test-utils"
import type { QueueItem } from "./types"

const now = new Date(2026, 10, 13, 10, 0)
const at = (h: number, m: number) => new Date(2026, 10, 13, h, m)
const [a, b, c] = ["achieve", "although", "enough"].map((w) => word("A", w))

const item = (card = a, p?: ReturnType<typeof progress>): QueueItem => ({
  deckId: "A",
  card,
  direction: "en-es",
  progress: p,
})

describe("pickNextIndex", () => {
  it("returns -1 for an empty queue", () => {
    expect(pickNextIndex([], now)).toBe(-1)
  })

  it("shows a learning card as soon as its step ends", () => {
    const queue = [item(a), item(b, progress(b, State.Learning, at(9, 58)))]
    expect(pickNextIndex(queue, now)).toBe(1)
  })

  it("keeps queue order while learning cards are still waiting", () => {
    const queue = [item(b, progress(b, State.Learning, at(10, 8))), item(a), item(c)]
    expect(pickNextIndex(queue, now)).toBe(1)
  })

  it("learns ahead when only waiting learning cards are left (earliest first)", () => {
    const queue = [
      item(a, progress(a, State.Learning, at(10, 15))),
      item(b, progress(b, State.Relearning, at(10, 9))),
    ]
    expect(pickNextIndex(queue, now)).toBe(1)
  })
})

describe("afterReview", () => {
  it("re-inserts a card that is still learning and due within 20 min", () => {
    const updated = progress(a, State.Learning, at(10, 10))
    const next = afterReview([item(a), item(b)], 0, updated, now)
    expect(next.map((i) => i.card.front)).toEqual(["although", "achieve"])
    expect(next[1].progress).toBe(updated)
  })

  it("removes a card scheduled for another day", () => {
    const updated = progress(a, State.Review, new Date(2026, 10, 16, 10))
    expect(afterReview([item(a), item(b)], 0, updated, now)).toEqual([item(b)])
  })
})

describe("a whole session with the real scheduler", () => {
  it("brings back new cards until they graduate, then ends", () => {
    const scheduler = createScheduler(0.9)
    let queue = buildQueue({
      decks: [{ deckId: "A", cards: [a, b] }],
      progress: [],
      todayLogs: [],
      successfulReviews: new Map(),
      newPerDay: 20,
      reverseCards: true,
      now,
    })
    let clock = now
    const shown: string[] = []

    for (let step = 0; step < 20; step++) {
      const i = pickNextIndex(queue, clock)
      if (i < 0) break
      const current = queue[i]
      // Learn-ahead: if the card is not due yet, time jumps to its due time.
      const due = current.progress?.fsrs.due
      if (due && due > clock) clock = due
      shown.push(current.card.front)

      const grade = shown.length === 1 ? "forgot" : "remembered"
      const result = reviewCard(scheduler, current.progress?.fsrs, grade, clock)
      const updated = { ...progress(current.card, result.card.state, result.card.due), fsrs: result.card }
      queue = afterReview(queue, i, updated, clock)
    }

    // 10:00 achieve forgot → back at 10:01
    // 10:00 although good → back at 10:10
    // 10:01 achieve good  → back at 10:11
    // 10:10 although good → graduates (days)
    // 10:11 achieve good  → graduates (days)
    expect(shown).toEqual(["achieve", "although", "achieve", "although", "achieve"])
    expect(queue).toEqual([])
  })
})
