import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import App from "./App"
import type { DeckIndexEntry } from "./features/decks/types"

const decks: DeckIndexEntry[] = [
  { id: "01-general-0001-0500", name: "Words 1–500", count: 500, builtIn: true },
  { id: "09-verbos-irregulares", name: "Irregular verbs", count: 154, builtIn: true },
]

describe("App", () => {
  it("lists the built-in decks from index.json", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(decks))

    render(<App />)

    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument()
    expect(await screen.findByText("Words 1–500")).toBeInTheDocument()
    expect(screen.getByText("Irregular verbs")).toBeInTheDocument()
    expect(screen.getByText("654 cards")).toBeInTheDocument()
  })

  it("shows an error when the decks cannot be loaded", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", { status: 404 })
    )

    render(<App />)

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not load the decks"
    )
  })
})
