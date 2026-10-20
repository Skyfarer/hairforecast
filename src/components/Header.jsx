import Logo from './Logo'
import LocationSearch from './LocationSearch'
import { CrosshairIcon, Spinner } from './Icons'

export default function Header({ onSelectPlace, onUseLocation, locating, countryHint }) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a href="/" className="topbar-logo" aria-label="Hair Forecast home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <Logo height={40} />
        </a>
        <div className="topbar-tools">
          <LocationSearch onSelect={onSelectPlace} countryHint={countryHint} placeholder="Change location" />
          <button
            type="button"
            className="btn btn-icon"
            onClick={onUseLocation}
            disabled={locating}
            aria-label="Use my location"
            title="Use my location"
          >
            {locating ? <Spinner /> : <CrosshairIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}
