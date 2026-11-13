import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { VocabDB } from "@/lib/db/db"

import { useSettings } from "./hooks/useSettings"
import { DEFAULT_SETTINGS, parseSetting, parseSettings } from "./settings"
import { readSettings, saveSetting } from "./settings-store"

let testDb: VocabDB | undefined
const openTestDb = () => (testDb = new VocabDB(`test-${crypto.randomUUID()}`))

afterEach(async () => {
  await testDb?.delete()
})

describe("parseSettings", () => {
  it("returns the defaults from the spec when nothing is stored", () => {
    expect(parseSettings([])).toEqual({
      voiceURI: null,
      rate: 0.9,
      autoPlay: true,
      newPerDay: 20,
      retention: 0.9,
      reverseCards: true,
    })
  })

  it("keeps valid values and ignores wrong types and unknown keys", () => {
    const settings = parseSettings([
      { key: "rate", value: 1.1 },
      { key: "autoPlay", value: "yes" },
      { key: "newPerDay", value: Number.NaN },
      { key: "theme", value: "light" },
    ])
    expect(settings).toEqual({ ...DEFAULT_SETTINGS, rate: 1.1 })
  })
})

describe("parseSetting", () => {
  it("clamps numbers to their ranges", () => {
    expect(parseSetting("rate", 3)).toBe(1.2)
    expect(parseSetting("rate", 0.66)).toBe(0.7)
    expect(parseSetting("newPerDay", -5)).toBe(0)
    expect(parseSetting("newPerDay", 12.6)).toBe(13)
    expect(parseSetting("retention", 1)).toBe(0.99)
  })

  it("accepts a voice URI or null, but not an empty string", () => {
    expect(parseSetting("voiceURI", "com.apple.voice.premium.en-US.Zoe")).toBe(
      "com.apple.voice.premium.en-US.Zoe"
    )
    expect(parseSetting("voiceURI", null)).toBeNull()
    expect(parseSetting("voiceURI", "")).toBeUndefined()
  })
})

describe("settings store", () => {
  it("saves the clamped value and reads it back", async () => {
    const database = openTestDb()
    expect(await saveSetting("rate", 2, database)).toBe(1.2)
    expect((await readSettings(database)).rate).toBe(1.2)
  })

  it("rejects values of the wrong type", async () => {
    const database = openTestDb()
    // Simulates bad input from a backup file.
    const bad = "fast" as unknown as number
    await expect(saveSetting("rate", bad, database)).rejects.toThrow("rate")
  })
})

describe("useSettings", () => {
  it("loads the defaults, then updates live after a save", async () => {
    const database = openTestDb()
    const { result } = renderHook(() => useSettings(database))

    await waitFor(() => expect(result.current.settings).toEqual(DEFAULT_SETTINGS))

    await act(() => result.current.update("reverseCards", false))
    await waitFor(() => expect(result.current.settings?.reverseCards).toBe(false))
  })
})
