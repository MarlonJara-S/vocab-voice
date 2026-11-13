import Dexie, { type EntityTable, type Table } from "dexie"

import type {
  CustomDeck,
  Direction,
  ProgressRecord,
  ReviewLogRecord,
  SettingRecord,
} from "./types"

export const DB_NAME = "vocab-voice"

/**
 * Local-first storage (IndexedDB). Only user data lives here; built-in decks
 * are static JSON cached by the service worker.
 */
export class VocabDB extends Dexie {
  declare progress: Table<ProgressRecord, [string, Direction]>
  declare logs: EntityTable<ReviewLogRecord, "id">
  declare customDecks: EntityTable<CustomDeck, "id">
  declare settings: EntityTable<SettingRecord, "key">

  constructor(name = DB_NAME) {
    super(name)
    this.version(1).stores({
      // Primary key first, then indexes.
      progress: "[cardId+direction], deckId, fsrs.due",
      logs: "++id, cardId, reviewedAt, [deckId+reviewedAt]",
      customDecks: "id",
      settings: "key",
    })
  }
}

export const db = new VocabDB()
