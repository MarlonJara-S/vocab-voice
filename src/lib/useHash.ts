import { useSyncExternalStore } from "react"

const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange)
  return () => window.removeEventListener("hashchange", onChange)
}

/** The current location hash ("#voice"), updated on navigation. */
export function useHash(): string {
  return useSyncExternalStore(subscribe, () => window.location.hash)
}
