import { useEffect, useId, useRef, useState } from 'react'
import { searchPlaces } from '../api'
import { placeDetail } from '../lib/format'
import { SearchIcon, Spinner } from './Icons'

/**
 * One-box place search with an accessible listbox. Type "Paris" or
 * "Paris, TX"; the backend ranks capitals and the preferred country first.
 */
export default function LocationSearch({ onSelect, countryHint, autoFocus = false, placeholder = 'Search city or town', size = 'md' }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [busy, setBusy] = useState(false)
  const [noMatch, setNoMatch] = useState(false)
  const rootRef = useRef(null)
  const inputRef = useRef(null)
  const listId = useId()

  // Debounced search; stale responses are ignored via the AbortController.
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      setNoMatch(false)
      setBusy(false)
      return undefined
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setBusy(true)
      try {
        const found = await searchPlaces(q, countryHint, controller.signal)
        if (controller.signal.aborted) return
        setResults(found)
        setNoMatch(found.length === 0)
        setActive(found.length ? 0 : -1)
        setOpen(true)
      } catch (err) {
        if (err.name !== 'AbortError') {
          setResults([])
          setNoMatch(true)
        }
      } finally {
        if (!controller.signal.aborted) setBusy(false)
      }
    }, 220)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query, countryHint])

  useEffect(() => {
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const choose = (place) => {
    setQuery('')
    setResults([])
    setOpen(false)
    setActive(-1)
    onSelect(place)
    inputRef.current?.blur()
  }

  const onKeyDown = (e) => {
    if (!open || results.length === 0) {
      if (e.key === 'Escape') setQuery('')
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % results.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + results.length) % results.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (active >= 0) choose(results[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showList = open && (results.length > 0 || noMatch)

  return (
    <div className={`search search-${size}`} ref={rootRef}>
      <label className="search-box">
        <span className="search-icon">{busy ? <Spinner /> : <SearchIcon />}</span>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-label="Search for a city"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          autoFocus={autoFocus}
          enterKeyHint="search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </label>
      {showList && (
        <ul className="search-list" id={listId} role="listbox">
          {results.map((place, i) => (
            <li
              key={place.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={i === active ? 'is-active' : ''}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(place)}
            >
              <span className="search-name">{place.name}</span>
              <span className="search-detail">{placeDetail(place)}</span>
            </li>
          ))}
          {noMatch && results.length === 0 && (
            <li className="search-empty" aria-live="polite">
              No towns match “{query.trim()}”. Try “City, Country”.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
