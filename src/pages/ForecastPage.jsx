import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Landing from '../components/Landing'
import ForecastCard from '../components/ForecastCard'
import Footer from '../components/Footer'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useForecast } from '../hooks/useForecast'
import { useGeolocation } from '../hooks/useGeolocation'
import { fetchNearestCity } from '../api'
import { defaultUnits, placeDetail, placeLabel } from '../lib/format'

function localeCountry() {
  try {
    return new Intl.Locale(navigator.language).maximize().region || ''
  } catch {
    return ''
  }
}

/**
 * The whole app on one page. A location is either a search result (with a
 * name) or a device position (labelled afterwards by the nearest-city lookup).
 * The last location and the unit system are remembered in localStorage.
 *
 * On a city page (`city` set) the city is shown instead of the remembered
 * location; picking another place saves it and goes back to the home page.
 */
export default function ForecastPage({ city = null, cityInfoHtml = null }) {
  const [savedLocation, setSavedLocation] = useLocalStorage('hf.location', null)
  const navigate = useNavigate()
  const cityLocation = useMemo(
    () => city && { latitude: city.latitude, longitude: city.longitude, source: 'city', place: city },
    [city],
  )
  const location = cityLocation || savedLocation
  const setLocation = useCallback((next) => {
    setSavedLocation(next)
    if (city) navigate('/')
  }, [city, navigate, setSavedLocation])
  const [units, setUnits] = useLocalStorage('hf.units', defaultUnits)
  const [place, setPlace] = useState(null)
  const geo = useGeolocation()
  const forecast = useForecast(location)
  const autoLocated = useRef(false)

  const locateDevice = useCallback(async () => {
    const pos = await geo.locate()
    if (pos) {
      setPlace(null)
      setLocation({ ...pos, source: 'device' })
    }
  }, [geo, setLocation])

  // First visit with nothing remembered: try the device once, like the old app
  // did, but keep the search box usable in the meantime. A remembered device
  // position is refreshed silently when permission is already granted.
  useEffect(() => {
    if (autoLocated.current) return
    autoLocated.current = true
    if (!location) {
      locateDevice()
      return
    }
    if (location.source !== 'device' || !navigator.permissions) return
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((p) => { if (p.state === 'granted') locateDevice() })
      .catch(() => {})
  }, [location, locateDevice])

  // Label device positions with the nearest town.
  useEffect(() => {
    if (!location) return undefined
    if (location.place) {
      setPlace(location.place)
      return undefined
    }
    let cancelled = false
    fetchNearestCity(location.latitude, location.longitude)
      .then((city) => { if (!cancelled) setPlace(city) })
      .catch(() => { if (!cancelled) setPlace(null) })
    return () => { cancelled = true }
  }, [location])

  const selectPlace = (p) => {
    geo.reset()
    setLocation({ latitude: p.latitude, longitude: p.longitude, source: 'search', place: p })
  }

  // Leaving a city page for the home page in-app: drop the city's title.
  useEffect(() => {
    if (!city) document.title = 'Hair Forecast: Frizz & Humidity Forecast for Your Hair'
  }, [city])

  const countryHint = useMemo(() => (place && place.country_code) || localeCountry(), [place])

  const placeName = location && location.source === 'device' && place
    ? `Near ${placeLabel(place)}`
    : placeLabel(place)

  return (
    <div className="app">
      {location && (
        <Header
          onSelectPlace={selectPlace}
          onUseLocation={locateDevice}
          locating={geo.status === 'locating'}
          countryHint={countryHint}
        />
      )}
      <main className="main">
        {!location ? (
          <Landing
            onSelectPlace={selectPlace}
            onUseLocation={locateDevice}
            geoStatus={geo.status}
            geoError={geo.error}
            countryHint={countryHint}
          />
        ) : (
          <>
            {geo.status === 'error' && geo.error && (
              <p className="page-note" role="status">{geo.error}</p>
            )}
            <ForecastCard
              heading={city ? `Hair Forecast for ${city.name}` : undefined}
              placeName={placeName}
              placeDetail={place ? placeDetail(place) : ''}
              status={forecast.status}
              data={forecast.data}
              error={forecast.error}
              units={units}
              onUnits={setUnits}
              onReload={forecast.reload}
            />
            {city && cityInfoHtml && <div dangerouslySetInnerHTML={{ __html: cityInfoHtml }} />}
          </>
        )}
        <Footer />
      </main>
    </div>
  )
}
