import { useCallback, useState } from 'react'

function describe(err) {
  if (!err) return 'Location is not available.'
  if (err.code === 1) {
    return window.isSecureContext
      ? 'Location access was denied. Search for a city instead.'
      : 'Location needs a secure (https) connection. Search for a city instead.'
  }
  if (err.code === 3) return 'Finding your location took too long. Try again or search for a city.'
  return 'Your location could not be determined. Search for a city instead.'
}

/** Wraps navigator.geolocation with a status and a friendly error message. */
export function useGeolocation() {
  const [status, setStatus] = useState('idle') // idle | locating | done | error
  const [error, setError] = useState(null)

  const locate = useCallback(
    () =>
      new Promise((resolve) => {
        if (!('geolocation' in navigator)) {
          setStatus('error')
          setError('This browser does not support location. Search for a city instead.')
          resolve(null)
          return
        }
        setStatus('locating')
        setError(null)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setStatus('done')
            resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
          },
          (err) => {
            setStatus('error')
            setError(describe(err))
            resolve(null)
          },
          { timeout: 10000, maximumAge: 5 * 60 * 1000 },
        )
      }),
    [],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setError(null)
  }, [])

  return { status, error, locate, reset, supported: 'geolocation' in navigator }
}
