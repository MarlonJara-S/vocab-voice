import { useDecks } from "../hooks/useDecks"
import { DeckList } from "./DeckList"

/** "DECKS" header + list (built-in and custom decks), with loading and error states. */
export function DecksSection() {
  const state = useDecks()
  const total =
    state.status === "ready"
      ? state.decks.reduce((sum, deck) => sum + deck.count, 0)
      : null

  return (
    <section aria-labelledby="decks-title" className="flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between pt-1.5">
        <h2
          id="decks-title"
          className="text-[13px] font-medium tracking-[0.3px] text-muted-foreground"
        >
          DECKS
        </h2>
        {total !== null && (
          <span className="text-[13px] text-muted-foreground">
            {total.toLocaleString("en-US")} cards
          </span>
        )}
      </div>

      {state.status === "loading" && (
        <p className="text-[13px] text-muted-foreground">Loading decks…</p>
      )}
      {state.status === "error" && (
        <p role="alert" className="text-[13px] text-danger">
          Could not load the decks. Run “npm run decks” and reload.
        </p>
      )}
      {state.status === "ready" && <DeckList decks={state.decks} />}
    </section>
  )
}
