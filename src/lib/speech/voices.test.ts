import { describe, expect, it } from "vitest"

import {
  effectiveRate,
  estimateSpeechMs,
  listEnglishVoices,
  pickVoice,
  voiceLabel,
  voiceQuality,
  type Voice,
} from "./voices"

const v = (name: string, lang: string, voiceURI: string, localService = true): Voice => ({
  name,
  lang,
  voiceURI,
  localService,
})

// A realistic iPhone list (iOS 18 style URIs).
const samantha = v("Samantha", "en-US", "com.apple.voice.compact.en-US.Samantha")
const zoe = v("Zoe (Premium)", "en-US", "com.apple.voice.premium.en-US.Zoe")
const daniel = v("Daniel (Enhanced)", "en-GB", "com.apple.voice.enhanced.en-GB.Daniel")
const karen = v("Karen", "en-AU", "com.apple.voice.compact.en-AU.Karen")
const zarvox = v("Zarvox", "en-US", "com.apple.speech.synthesis.voice.Zarvox")
const eddy = v("Eddy", "en-US", "com.apple.eloquence.en-US.Eddy")
const monica = v("Mónica", "es-ES", "com.apple.voice.compact.es-ES.Monica")
const iphone = [monica, karen, zarvox, samantha, eddy, daniel, zoe]

describe("listEnglishVoices", () => {
  it("keeps real English voices, best quality and US/UK first", () => {
    expect(listEnglishVoices(iphone).map((x) => x.name)).toEqual([
      "Zoe (Premium)",
      "Daniel (Enhanced)",
      "Samantha",
      "Karen",
    ])
  })

  it("accepts underscore locales (some Android browsers)", () => {
    expect(listEnglishVoices([v("English", "en_US", "x")])).toHaveLength(1)
  })
})

describe("pickVoice", () => {
  it("uses the saved voice when it is still installed", () => {
    expect(pickVoice(iphone, samantha.voiceURI)).toBe(samantha)
  })

  it("falls back to the best English voice", () => {
    expect(pickVoice(iphone, null)).toBe(zoe)
    expect(pickVoice(iphone, "removed-voice")).toBe(zoe)
  })

  it("returns undefined when there is no English voice", () => {
    expect(pickVoice([monica], null)).toBeUndefined()
  })
})

describe("labels", () => {
  it("shows name and region like the mockup", () => {
    expect(voiceLabel(samantha)).toBe("Samantha · US")
    expect(voiceLabel(daniel)).toBe("Daniel · UK")
    expect(voiceLabel(karen)).toBe("Karen · AU")
  })

  it("shortens long desktop voice names", () => {
    const david = v("Microsoft David - English (United States)", "en-US", "MSTTS_V110_enUS_DavidM")
    expect(voiceLabel(david)).toBe("David · US")
    expect(voiceLabel(v("Google UK English Female", "en-GB", "g"))).toBe("Google UK English Female · UK")
  })

  it("detects voice quality", () => {
    expect(voiceQuality(zoe)).toBe("premium")
    expect(voiceQuality(daniel)).toBe("enhanced")
    expect(voiceQuality(samantha)).toBe("default")
  })
})

describe("timing", () => {
  it("slows the user's rate by 0.7 with a floor", () => {
    expect(effectiveRate(0.9, false)).toBe(0.9)
    expect(effectiveRate(0.9, true)).toBe(0.63)
    expect(effectiveRate(0.5, true)).toBe(0.4)
  })

  it("estimates longer speech for longer text and slower rates", () => {
    expect(estimateSpeechMs("hi", 1)).toBe(600)
    const sentence = "You can achieve your goals."
    expect(estimateSpeechMs(sentence, 0.5)).toBeGreaterThan(estimateSpeechMs(sentence, 1))
  })
})
