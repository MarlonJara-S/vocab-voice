import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { VocabDB } from "@/lib/db/db"
import type { CustomDeck } from "@/lib/db/types"

import { clearDeckCache, loadDeckCards, mergeDecks } from "./decks"
import type { DeckCard, DeckIndexEntry } from "./types"

const card = (id: string): DeckCard => ({
  id,
  front: id,
  meaning: "significado",
  examples: ["Example."],
})

const customDeck = (id: string, createdAt: string): CustomDeck => ({
  id,
  name: id,
  cards: [card(`${id}:a`), card(`${id}:b`)],
  createdAt: new Date(createdAt),
})

let testDb: VocabDB

beforeEach(() => {
  testDb = new VocabDB(`test-${crypto.randomUUID()}`)
  clearDeckCache()
})

afterEach(async () => {
  await testDb.delete()
})

describe("mergeDecks", () => {
  it("lists built-in decks first, then custom decks oldest first", () => {
    const builtIn: DeckIndexEntry[] = [{ id: "01", name: "Words 1–500", count: 500, builtIn: true }]
    const merged = mergeDecks(builtIn, [
      customDeck("custom-new", "2026-11-13"),
      customDeck("custom-old", "2026-11-01"),
    ])
    expect(merged.map((d) => [d.id, d.count, d.builtIn])).toEqual([
      ["01", 500, true],
      ["custom-old", 2, false],
      ["custom-new", 2, false],
    ])
  })
})

describe("loadDeckCards", () => {
  it("reads custom decks from IndexedDB without fetching", async () => {
    await testDb.customDecks.add(customDeck("custom-1", "2026-11-13"))
    const fetchCards = vi.fn()

    const cards = await loadDeckCards("custom-1", { database: testDb, fetchCards })

    expect(cards.map((c) => c.id)).toEqual(["custom-1:a", "custom-1:b"])
    expect(fetchCards).not.toHaveBeenCalled()
  })

  it("fetches a built-in deck once and caches it", async () => {
    const fetchCards = vi.fn().mockResolvedValue([card("01:the")])

    await loadDeckCards("01", { database: testDb, fetchCards })
    const cards = await loadDeckCards("01", { database: testDb, fetchCards })

    expect(cards).toEqual([card("01:the")])
    expect(fetchCards).toHaveBeenCalledTimes(1)
  })

  it("retries after a failed fetch", async () => {
    const fetchCards = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce([card("01:the")])

    await expect(loadDeckCards("01", { database: testDb, fetchCards })).rejects.toThrow("offline")
    expect(await loadDeckCards("01", { database: testDb, fetchCards })).toHaveLength(1)
  })
})
