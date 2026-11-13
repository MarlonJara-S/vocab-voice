import { describe, expect, it } from "vitest"

import { formatShortDate } from "./format"

describe("formatShortDate", () => {
  it("formats like the Today header", () => {
    expect(formatShortDate(new Date(2026, 10, 12))).toBe("Thu, Nov 12")
  })
})
