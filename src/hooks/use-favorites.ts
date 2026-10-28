"use client"

import { useCallback, useSyncExternalStore } from "react"

const KEY = "gp:favorites"
const listeners = new Set<() => void>()
const EMPTY: string[] = []
let cache: string[] | null = null

/** Read saved property ids from localStorage (may be unavailable in private mode). */
function read(): string[] {
  if (cache) return cache
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]")
    cache = Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []
  } catch {
    cache = []
  }
  return cache
}

function write(ids: string[]) {
  cache = ids
  try {
    localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {
    // Storage blocked: favourites still work for this visit.
  }
  listeners.forEach((notify) => notify())
}

function subscribe(notify: () => void) {
  listeners.add(notify)
  // Keep tabs in sync.
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) {
      cache = null
      notify()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(notify)
    window.removeEventListener("storage", onStorage)
  }
}

/** Saved ("hearted") properties, kept only in this visitor's browser. */
export function useFavorites() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY)

  const toggle = useCallback((id: string) => {
    const current = read()
    write(current.includes(id) ? current.filter((x) => x !== id) : [...current, id])
  }, [])

  return { ids, isSaved: (id: string) => ids.includes(id), toggle }
}
