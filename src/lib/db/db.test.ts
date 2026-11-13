import { createEmptyCard, Rating } from "ts-fsrs"
import { afterEach, describe, expect, it } from "vitest"

import { VocabDB } from "./db"

let testDb: VocabDB | undefined

function openTestDb() {
  testDb = new VocabDB(`test-${crypto.randomUUID()}`)
  return testDb
}

afterEach(async () => {
  await testDb?.delete()
})

describe("VocabDB", () => {
  it("keeps one progress record per card and direction, with Dates intact", async () => {
    const database = openTestDb()
    const due = new Date("2026-11-13T10:00:00Z")
    const base = { cardId: "d:achieve", deckId: "d", updatedAt: due }

    await database.progress.bulkPut([
      { ...base, direction: "en-es", fsrs: createEmptyCard(due) },
      { ...base, direction: "es-en", fsrs: createEmptyCard(due) },
    ])

    const saved = await database.progress.get(["d:achieve", "en-es"])
    expect(saved?.fsrs.due).toBeInstanceOf(Date)
    expect(saved?.fsrs.due.getTime()).toBe(due.getTime())
    expect(await database.progress.where("deckId").equals("d").count()).toBe(2)
  })

  it("finds due cards through the fsrs.due index", async () => {
    const database = openTestDb()
    const now = new Date("2026-11-13T10:00:00Z")
    const past = new Date("2026-11-12T10:00:00Z")
    const future = new Date("2026-11-20T10:00:00Z")
    const record = (cardId: string, due: Date) => ({
      cardId,
      deckId: "d",
      direction: "en-es" as const,
      fsrs: createEmptyCard(due),
      updatedAt: now,
    })

    await database.progress.bulkPut([record("d:a", past), record("d:b", future)])

    const due = await database.progress.where("fsrs.due").belowOrEqual(now).toArray()
    expect(due.map((p) => p.cardId)).toEqual(["d:a"])
  })

  it("auto-increments review log ids and queries them by deck and day", async () => {
    const database = openTestDb()
    const log = {
      cardId: "d:achieve",
      deckId: "d",
      direction: "en-es" as const,
      rating: Rating.Good,
      wasNew: true,
      durationMs: 4200,
    }
    const id1 = await database.logs.add({ ...log, reviewedAt: new Date("2026-11-12T23:00:00Z") })
    const id2 = await database.logs.add({ ...log, reviewedAt: new Date("2026-11-13T09:00:00Z") })

    expect(Number(id2)).toBeGreaterThan(Number(id1))
    const today = await database.logs
      .where("[deckId+reviewedAt]")
      .between(["d", new Date("2026-11-13T00:00:00Z")], ["d", new Date("2026-11-14T00:00:00Z")])
      .toArray()
    expect(today.map((l) => l.id)).toEqual([id2])
  })
})
