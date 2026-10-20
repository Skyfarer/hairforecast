import { useCallback, useState } from 'react'

/** useState persisted to localStorage; tolerant of private mode and bad JSON. */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw != null) return JSON.parse(raw)
    } catch {
      // ignore
    }
    return typeof initial === 'function' ? initial() : initial
  })

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        try {
          if (resolved == null) window.localStorage.removeItem(key)
          else window.localStorage.setItem(key, JSON.stringify(resolved))
        } catch {
          // ignore
        }
        return resolved
      })
    },
    [key],
  )

  return [value, set]
}
