import { DecksSection } from "@/features/decks/components/DecksSection"
import { formatShortDate } from "@/lib/format"

export function App() {
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
    </main>
  )
}

export default App
