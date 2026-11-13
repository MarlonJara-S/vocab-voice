import { describe, expect, it } from "vitest"

import { endOfStudyDay, startOfStudyDay, studyDayKey } from "./day"

// Local times: new Date(year, monthIndex, day, hour, minute)
const local = (d: number, h: number, m = 0) => new Date(2026, 10, d, h, m)

describe("study day (starts at 4 AM)", () => {
  it("starts today at 4 AM after 4 AM", () => {
    expect(startOfStudyDay(local(13, 10))).toEqual(local(13, 4))
    expect(startOfStudyDay(local(13, 4))).toEqual(local(13, 4))
    expect(endOfStudyDay(local(13, 23, 59))).toEqual(local(14, 4))
  })

  it("counts a late-night session for the previous day", () => {
    expect(startOfStudyDay(local(14, 1, 30))).toEqual(local(13, 4))
    expect(endOfStudyDay(local(14, 3, 59))).toEqual(local(14, 4))
    expect(studyDayKey(local(14, 1, 30))).toBe("2026-11-13")
  })

  it("works across a month boundary", () => {
    expect(studyDayKey(new Date(2026, 11, 1, 2))).toBe("2026-11-30")
  })
})
