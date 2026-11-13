/** The subset of SpeechSynthesisVoice we use (easy to fake in tests). */
export type Voice = Pick<SpeechSynthesisVoice, "name" | "lang" | "voiceURI" | "localService">

export type VoiceQuality = "premium" | "enhanced" | "default"

// Apple's novelty voices (Bells, Zarvox…) and the robotic "Eloquence" ones
// (Eddy, Flo, Grandma…) are bad models for pronunciation.
const NOVELTY = /speech\.synthesis\.voice|eloquence/i

const lang = (v: Voice) => v.lang.replace("_", "-")

export const isEnglish = (v: Voice) => lang(v).toLowerCase().startsWith("en")

export function voiceQuality(v: Voice): VoiceQuality {
  const id = `${v.voiceURI} ${v.name}`
  if (/premium/i.test(id)) return "premium"
  if (/enhanced/i.test(id)) return "enhanced"
  return "default"
}

const QUALITY_SCORE: Record<VoiceQuality, number> = { premium: 20, enhanced: 10, default: 0 }
const REGION_SCORE: Record<string, number> = { "en-us": 3, "en-gb": 2 }

function score(v: Voice): number {
  return (
    QUALITY_SCORE[voiceQuality(v)] +
    (REGION_SCORE[lang(v).toLowerCase()] ?? 1) +
    (v.localService ? 0.5 : 0)
  )
}

/** English voices worth offering, best first (Premium/Enhanced, US, UK…). */
export function listEnglishVoices<V extends Voice>(voices: readonly V[]): V[] {
  return voices
    .filter((v) => isEnglish(v) && !NOVELTY.test(v.voiceURI))
    .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name))
}

/** The saved voice if it still exists, else the best English voice. */
export function pickVoice<V extends Voice>(
  voices: readonly V[],
  preferredURI: string | null
): V | undefined {
  const preferred = preferredURI
    ? voices.find((v) => v.voiceURI === preferredURI)
    : undefined
  return preferred ?? listEnglishVoices(voices)[0]
}

const REGION_NAMES: Record<string, string> = { GB: "UK" }

/** "Samantha · US" (as in the Settings mockup). */
export function voiceLabel(v: Voice): string {
  const name = v.name
    .replace(/\s*\((enhanced|premium)\)\s*/i, "") // iOS/macOS quality suffix
    .replace(/\s+-\s+.*$/, "") // Windows: "Microsoft David - English (United States)"
    .replace(/^Microsoft\s+/, "")
    .trim()
  const region = lang(v).split("-")[1]?.toUpperCase()
  return region ? `${name} · ${REGION_NAMES[region] ?? region}` : name
}

/** Rough speech length, for the progress bar and the shadowing pause. */
export function estimateSpeechMs(text: string, rate: number): number {
  const CHARS_PER_SECOND = 15
  return Math.max(600, ((text.length / CHARS_PER_SECOND) * 1000) / rate)
}

/** The 0.7× button slows the user's own speed down. */
export function effectiveRate(rate: number, slow: boolean): number {
  return slow ? Math.max(0.4, Math.round(rate * 0.7 * 100) / 100) : rate
}
