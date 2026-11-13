import { Rating, State } from "ts-fsrs"
import { describe, expect, it } from "vitest"

import { formatInterval } from "./interval"
import { createScheduler, previewDue, reviewCard } from "./scheduler"

const now = new Date("2026-11-13T10:00:00Z")
const scheduler = createScheduler(0.9)

describe("reviewCard", () => {
  it("maps Forgot to Again and Remembered to Good", () => {
    expect(reviewCard(scheduler, undefined, "forgot", now).rating).toBe(Rating.Again)
    expect(reviewCard(scheduler, undefined, "remembered", now).rating).toBe(Rating.Good)
  })

  it("marks the first review of a card as new, and later ones as not new", () => {
    const first = reviewCard(scheduler, undefined, "remembered", now)
    expect(first.wasNew).toBe(true)
    expect(first.card.state).toBe(State.Learning)

    const second = reviewCard(scheduler, first.card, "remembered", first.card.due)
    expect(second.wasNew).toBe(false)
    expect(second.card.state).toBe(State.Review)
  })
})

describe("previewDue", () => {
  it("shows 1 min / 10 min for a new card", () => {
    const due = previewDue(scheduler, undefined, now)
    expect(formatInterval(now, due.forgot)).toBe("1 min")
    expect(formatInterval(now, due.remembered)).toBe("10 min")
  })

  it("matches what reviewCard actually schedules (fuzz included)", () => {
    let card = reviewCard(scheduler, undefined, "remembered", now).card
    let at = card.due
    for (let i = 0; i < 4; i++) {
      const preview = previewDue(scheduler, card, at)
      const result = reviewCard(scheduler, card, "remembered", at)
      expect(result.card.due).toEqual(preview.remembered)
      card = result.card
      at = card.due
    }
  })
})

describe("formatInterval", () => {
  const after = (ms: number) => formatInterval(now, new Date(now.getTime() + ms))
  const min = 60_000
  const day = 24 * 60 * min

  it("uses short, simple units", () => {
    expect(after(20_000)).toBe("1 min")
    expect(after(10 * min)).toBe("10 min")
    expect(after(3 * 60 * min)).toBe("3 h")
    expect(after(day)).toBe("1 day")
    expect(after(3 * day)).toBe("3 days")
    expect(after(60 * day)).toBe("2 mo")
    expect(after(548 * day)).toBe("1.5 yr")
  })
})
