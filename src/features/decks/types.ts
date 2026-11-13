/** One card of a deck, as generated in public/decks/<deckId>.json. */
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

/** One entry of public/decks/index.json. */
export type DeckIndexEntry = {
  id: string
  name: string
  count: number
  builtIn: boolean
}
