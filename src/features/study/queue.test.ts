import { Rating, State } from "ts-fsrs"
import { describe, expect, it } from "vitest"

import { newCardsLeft } from "./limits"
import { buildQueue, countQueue, isDue, type QueueInput } from "./queue"
import { countSuccessfulReviews, isReverseUnlocked } from "./reverse"
import { log, progress, word } from "./test-utils"

// 10:00 local time, Nov 13. The study day ends Nov 14 at 4:00 AM.
const now = new Date(2026, 10, 13, 10, 0)
const at = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m)

const words = ["the", "to", "achieve", "although", "improve", "enough"].map((w) => word("A", w))
const [the, to, achieve] = words

const input = (over: Partial<QueueInput> = {}): QueueInput => ({
  decks: [{ deckId: "A", cards: words }],
  progress: [],
  todayLogs: [],
  successfulReviews: new Map(),
  newPerDay: 20,
  reverseCards: true,
  now,
  ...over,
})

const show = (q: ReturnType<typeof buildQueue>) =>
  q.map((i) => `${i.card.front}${i.direction === "es-en" ? "(rev)" : ""}${i.progress ? "" : "*"}`)

describe("isDue", () => {
  it("treats review cards as due for the whole study day", () => {
    expect(isDue(progress(the, State.Review, at(13, 23)), now)).toBe(true)
    expect(isDue(progress(the, State.Review, at(14, 3, 59)), now)).toBe(true)
    expect(isDue(progress(the, State.Review, at(14, 4)), now)).toBe(false)
  })

  it("treats learning cards as due only within the 20 min learn-ahead", () => {
    expect(isDue(progress(the, State.Learning, at(13, 10, 20)), now)).toBe(true)
    expect(isDue(progress(the, State.Relearning, at(13, 10, 21)), now)).toBe(false)
  })
})

describe("newCardsLeft", () => {
  it("subtracts the new cards introduced today in that deck", () => {
    const logs = [
      log(the, at(13, 8), { wasNew: true }),
      log(to, at(13, 8), { wasNew: true }),
      log(achieve, at(13, 9)), // a review, not new
      log(word("B", "x"), at(13, 9), { wasNew: true }), // other deck
    ]
    expect(newCardsLeft("A", logs, 20)).toBe(18)
    expect(newCardsLeft("A", logs, 1)).toBe(0)
  })
})

describe("reverse unlock", () => {
  it("needs 2 successful EN → ES reviews", () => {
    const counts = countSuccessfulReviews([
      log(the, at(10, 9)),
      log(the, at(11, 9), { rating: Rating.Again }),
      log(the, at(12, 9), { direction: "es-en" }),
      log(to, at(10, 9)),
      log(to, at(12, 9)),
    ])
    expect(isReverseUnlocked(the.id, counts)).toBe(false)
    expect(isReverseUnlocked(to.id, counts)).toBe(true)
  })
})

describe("buildQueue", () => {
  it("puts due cards first (oldest due first), then new cards in file order", () => {
    const queue = buildQueue(
      input({
        progress: [
          progress(achieve, State.Review, at(13, 9)),
          progress(the, State.Review, at(11, 9)),
          progress(to, State.Review, at(20, 9)), // not due
        ],
      })
    )
    expect(show(queue)).toEqual(["the", "achieve", "although*", "improve*", "enough*"])
    expect(countQueue(queue)).toEqual({ due: 2, new: 3 })
  })

  it("respects the daily new limit per deck, counting today's new cards", () => {
    const queue = buildQueue(
      input({ newPerDay: 3, todayLogs: [log(the, at(13, 8), { wasNew: true })] })
    )
    expect(show(queue)).toEqual(["the*", "to*"])
  })

  it("adds no new cards once the limit is reached, but still the due ones", () => {
    const queue = buildQueue(
      input({
        newPerDay: 1,
        todayLogs: [log(the, at(13, 8), { wasNew: true })],
        progress: [progress(the, State.Learning, at(13, 10, 5))],
      })
    )
    expect(show(queue)).toEqual(["the"])
  })

  it("applies the limit to each deck separately", () => {
    const b = [word("B", "deploy"), word("B", "merge")]
    const queue = buildQueue(
      input({ newPerDay: 1, decks: [{ deckId: "A", cards: words }, { deckId: "B", cards: b }] })
    )
    expect(show(queue)).toEqual(["the*", "deploy*"])
  })

  it("adds unlocked reverse cards as new cards, alternating with new words", () => {
    const queue = buildQueue(
      input({
        newPerDay: 4,
        progress: [
          progress(the, State.Review, at(20, 9)),
          progress(to, State.Review, at(20, 9)),
        ],
        successfulReviews: new Map([[the.id, 2], [to.id, 1]]),
      })
    )
    expect(show(queue)).toEqual(["achieve*", "the(rev)*", "although*", "improve*"])
  })

  it("skips reverse cards when the setting is off", () => {
    const queue = buildQueue(
      input({
        newPerDay: 2,
        reverseCards: false,
        progress: [
          progress(the, State.Review, at(20, 9)),
          progress(to, State.Review, at(20, 9)),
          progress(to, State.Review, at(13, 9), "es-en"), // due, but reverse is off
        ],
        successfulReviews: new Map([[the.id, 5]]),
      })
    )
    expect(show(queue)).toEqual(["achieve*", "although*"])
  })

  it("buries the reverse card when the same word is studied EN → ES today", () => {
    const queue = buildQueue(
      input({
        newPerDay: 0,
        progress: [
          progress(the, State.Review, at(13, 9)),
          progress(the, State.Review, at(13, 8), "es-en"), // buried
          progress(to, State.Review, at(13, 7), "es-en"),
        ],
      })
    )
    expect(show(queue)).toEqual(["to(rev)", "the"])
  })

  it("ignores progress of cards that are not in the selected decks", () => {
    const other = word("B", "deploy")
    const queue = buildQueue(
      input({ newPerDay: 0, progress: [progress(other, State.Review, at(13, 9))] })
    )
    expect(queue).toEqual([])
  })

  it("keeps the words not yet seen in file order across sessions", () => {
    const queue = buildQueue(
      input({
        newPerDay: 2,
        progress: [progress(the, State.Review, at(30, 9)), progress(achieve, State.Review, at(30, 9))],
      })
    )
    expect(show(queue)).toEqual(["to*", "although*"])
  })
})
