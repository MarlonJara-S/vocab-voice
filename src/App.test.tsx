import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import App from "./App"
import type { DeckIndexEntry } from "./features/decks/types"
import { db } from "./lib/db/db"

const decks: DeckIndexEntry[] = [
  { id: "01-general-0001-0500", name: "Words 1–500", count: 500, builtIn: true },
  { id: "09-verbos-irregulares", name: "Irregular verbs", count: 154, builtIn: true },
]

beforeEach(async () => {
  await db.customDecks.clear()
})

describe("App", () => {
  it("lists the built-in decks from index.json", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(decks))

    render(<App />)

    expect(screen.getByRole("heading", { name: "Today" })).toBeInTheDocument()
    expect(await screen.findByText("Words 1–500")).toBeInTheDocument()
    expect(screen.getByText("Irregular verbs")).toBeInTheDocument()
    expect(screen.getByText("654 cards")).toBeInTheDocument()
  })

  it("adds custom decks from IndexedDB after the built-in ones", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(decks))
    await db.customDecks.add({
      id: "custom-series",
      name: "Series words",
      cards: [{ id: "custom-series:binge", front: "binge", meaning: "atracón", examples: [] }],
      createdAt: new Date("2026-11-13"),
    })

    render(<App />)

    expect(await screen.findByText("Series words")).toBeInTheDocument()
    expect(screen.getByText("655 cards")).toBeInTheDocument()
    const names = screen.getAllByRole("listitem").map((li) => li.textContent)
    expect(names.at(-1)).toContain("Series words")
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
