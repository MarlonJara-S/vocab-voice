import { lazy, Suspense } from "react"

import { DecksSection } from "@/features/decks/components/DecksSection"
import { formatShortDate } from "@/lib/format"
import { useHash } from "@/lib/useHash"

// Dev-only voice test page (/#voice). Removed from production builds.
const VoiceCheck = import.meta.env.DEV ? lazy(() => import("./dev/VoiceCheck")) : null

export function App() {
  const hash = useHash()
  if (VoiceCheck && hash === "#voice") {
    return (
      <Suspense fallback={null}>
        <VoiceCheck />
      </Suspense>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-3.5 px-4 pt-[calc(env(safe-area-inset-top)+8px)] pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <header className="flex h-11 items-center justify-between">
        <h1 className="text-[22px] font-semibold tracking-[-0.3px]">Today</h1>
        <span className="text-[13px] text-muted-foreground">
          {formatShortDate(new Date())}
        </span>
      </header>

      <DecksSection />

      <p className="text-center text-[13px] text-muted-foreground">
        Study screens are coming soon.
      </p>
      {import.meta.env.DEV && (
        <a href="#voice" className="py-3 text-center text-[13px] text-primary">
          Voice check (dev only)
        </a>
      )}
    </main>
  )
}

export default App
