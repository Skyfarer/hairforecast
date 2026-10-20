import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchDetail, fetchGeohash, fetchSummary } from '../api'

/**
 * Loads the forecast for a {latitude, longitude} location. Summary and detail
 * are fetched together so switching views is instant. Previous data is kept
 * while a new location loads so the card does not blank out.
 */
export function useForecast(location) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null })
  const requestId = useRef(0)

  const load = useCallback(async () => {
    if (!location) {
      setState({ status: 'idle', data: null, error: null })
      return
    }
    const id = ++requestId.current
    setState((s) => ({ ...s, status: 'loading', error: null }))
    try {
      const geohash = await fetchGeohash(location.latitude, location.longitude)
      const [summary, detail] = await Promise.all([fetchSummary(geohash), fetchDetail(geohash)])
      if (id !== requestId.current) return
      setState({
        status: 'ready',
        error: null,
        data: { geohash, summary, run: detail.run, intervals: detail.intervals, fetchedAt: new Date() },
      })
    } catch (err) {
      if (id !== requestId.current) return
      setState((s) => ({ ...s, status: 'error', error: err.message || 'Something went wrong.' }))
    }
  }, [location])

  useEffect(() => {
    load()
  }, [load])

  return { ...state, reload: load }
}
