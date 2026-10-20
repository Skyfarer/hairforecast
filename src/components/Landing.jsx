import Logo from './Logo'
import LocationSearch from './LocationSearch'
import { CrosshairIcon, Spinner } from './Icons'

/** First screen: find a place by search or by device location. */
export default function Landing({ onSelectPlace, onUseLocation, geoStatus, geoError, countryHint }) {
  const locating = geoStatus === 'locating'
  return (
    <section className="card landing">
      <Logo height={72} className="landing-logo" />
      <h1 className="landing-title">What is your hair in for?</h1>
      <p className="landing-sub">
        Humidity, wind, rain and temperature, boiled down to one number for the next two days.
      </p>

      <LocationSearch onSelect={onSelectPlace} countryHint={countryHint} autoFocus size="lg" placeholder="Search city or town" />

      <div className="landing-or"><span>or</span></div>

      <button type="button" className="btn btn-primary btn-lg" onClick={onUseLocation} disabled={locating}>
        {locating ? <Spinner /> : <CrosshairIcon />}
        {locating ? 'Finding your location…' : 'Use my location'}
      </button>

      {geoStatus === 'error' && geoError && (
        <p className="landing-note" role="status">{geoError}</p>
      )}
    </section>
  )
}
