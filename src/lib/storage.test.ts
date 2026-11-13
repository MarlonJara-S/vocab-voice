import { describe, expect, it, vi } from "vitest"

import { requestPersistentStorage } from "./storage"

describe("requestPersistentStorage", () => {
  it("returns false when the API is missing", async () => {
    expect(await requestPersistentStorage(undefined)).toBe(false)
    expect(await requestPersistentStorage({})).toBe(false)
  })

  it("does not ask again when storage is already persistent", async () => {
    const persist = vi.fn()
    const result = await requestPersistentStorage({
      persisted: () => Promise.resolve(true),
      persist,
    })
    expect(result).toBe(true)
    expect(persist).not.toHaveBeenCalled()
  })

  it("asks for persistence and returns the answer", async () => {
    const result = await requestPersistentStorage({
      persisted: () => Promise.resolve(false),
      persist: () => Promise.resolve(true),
    })
    expect(result).toBe(true)
  })

  it("returns false when the browser throws", async () => {
    const result = await requestPersistentStorage({
      persist: () => Promise.reject(new Error("denied")),
    })
    expect(result).toBe(false)
  })
})
