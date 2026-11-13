import type { Card, Rating } from "ts-fsrs"

/** One card of a deck (built-in JSON in public/decks/, or a custom deck). */
export type DeckCard = {
  /** `${deckId}:${slug(word)}` — stable and unique per deck */
  id: string
  /** English word or verb */
  front: string
  /** Spanish meaning */
  meaning: string
  /** 1 for vocab, 2 for irregular verbs (past, participle) */
  examples: string[]
  /** Irregular verbs only: "catch – caught – caught" */
  forms?: string
  /** Irregular verbs only: "catches · catching" */
  other?: string
}

/** en-es = recognition (main card), es-en = production (reverse card). */
export type Direction = "en-es" | "es-en"

/** Table "progress", key [cardId+direction]. One FSRS state per direction. */
export type ProgressRecord = {
  cardId: string
  deckId: string
  direction: Direction
  fsrs: Card
  updatedAt: Date
}

/** Table "logs", auto-increment id. */
export type ReviewLogRecord = {
  id?: number
  cardId: string
  deckId: string
  direction: Direction
  rating: Rating
  wasNew: boolean
  reviewedAt: Date
  durationMs: number
}

/** Table "customDecks" (imported from CSV). */
export type CustomDeck = {
  id: string
  name: string
  cards: DeckCard[]
  createdAt: Date
}

/** Table "settings". Values are validated by features/settings. */
export type SettingRecord = {
  key: string
  value: unknown
}
