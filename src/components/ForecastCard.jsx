import { useState } from 'react'
import Segmented from './Segmented'
import SummaryView from './SummaryView'
import DetailsView from './DetailsView'
import { PinIcon, RefreshIcon, Spinner } from './Icons'
import { runLabel } from '../lib/format'

const VIEWS = [
  { value: 'summary', label: 'Summary' },
  { value: 'details', label: 'Details' },
]
const UNITS = [
  { value: 'imperial', label: '°F' },
  { value: 'metric', label: '°C' },
]

export default function ForecastCard({ placeName, placeDetail, status, data, error, units, onUnits, onReload }) {
  const [view, setView] = useState('summary')
  const [selected, setSelected] = useState(null)

  const showDetail = (interval) => {
    setSelected(interval)
    setView('details')
  }

  return (
    <section className={`card forecast-card ${status === 'loading' ? 'is-loading' : ''}`} aria-busy={status === 'loading'}>
      <header className="card-head">
        <div className="card-title">
          <h1>Weather &amp; Hair Forecast</h1>
          <div className="card-place">
            <PinIcon className="place-icon" />
            <span className="place-name">{placeName || 'Your location'}</span>
            {placeDetail && <span className="place-detail">{placeDetail}</span>}
            {status === 'loading' && <Spinner className="place-spinner" />}
          </div>
        </div>
        <div className="card-controls">
          <Segmented label="View" value={view} options={VIEWS} onChange={setView} />
          <Segmented label="Units" value={units} options={UNITS} onChange={onUnits} />
        </div>
      </header>

      {status === 'error' && (
        <div className="alert" role="alert">
          <span>{error}</span>
          <button type="button" className="btn btn-ghost" onClick={onReload}>
            <RefreshIcon /> Retry
          </button>
        </div>
      )}

      {!data && status === 'loading' && <SkeletonBody />}

      {data && view === 'summary' && (
        <SummaryView summary={data.summary} intervals={data.intervals} units={units} onPickInterval={showDetail} />
      )}
      {data && view === 'details' && (
        <DetailsView intervals={data.intervals} units={units} selected={selected} onSelect={setSelected} />
      )}

      {data && data.run && (
        <p className="card-foot">ECMWF model run {runLabel(data.run)} · times shown in your local time zone</p>
      )}
    </section>
  )
}

function SkeletonBody() {
  return (
    <div className="skeleton" aria-hidden="true">
      <div className="sk sk-tile" />
      <div className="sk sk-line" />
      <div className="sk-row">
        <div className="sk sk-metric" />
        <div className="sk sk-metric" />
      </div>
    </div>
  )
}
