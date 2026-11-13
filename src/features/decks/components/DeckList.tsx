import type { DeckIndexEntry } from "../types"

type DeckListProps = {
  decks: DeckIndexEntry[]
}

/** Grouped list of decks (layout from docs/mockups/Main.dc.html). */
export function DeckList({ decks }: DeckListProps) {
  return (
    <ul className="flex flex-col rounded-lg border bg-card">
      {decks.map((deck) => (
        <li
          key={deck.id}
          className="flex items-center gap-3 border-b px-3.5 py-3 last:border-b-0"
        >
          <span className="flex grow flex-col gap-0.5">
            <span>{deck.name}</span>
            <span className="text-xs text-muted-foreground">
              {deck.count.toLocaleString("en-US")} cards · Not started
            </span>
          </span>
          <span className="text-[13px] text-muted-foreground">—</span>
        </li>
      ))}
    </ul>
  )
}
