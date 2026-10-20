import { HfiChip, HfiNumber } from './HfiBadge'
import { InfoIcon } from './Icons'
import { hfiLevel } from '../lib/hfi'
import { dayLabel, formatTemp, formatWind, hourLabel, intervalLabel } from '../lib/format'

/** Six-hourly table with a selectable row and an explanation panel. */
export default function DetailsView({ intervals, units, selected, onSelect }) {
  if (intervals.length === 0) {
    return <p className="muted">No forecast intervals are available right now.</p>
  }
  const current = intervals.find((iv) => iv.interval === selected) || intervals[0]
  const level = hfiLevel(current.hfi)

  return (
    <div className="details">
      <div className="table" role="table" aria-label="Forecast by time">
        <div className="table-head" role="row">
          <span role="columnheader">Time</span>
          <span role="columnheader">Temperature</span>
          <span role="columnheader">Wind</span>
          <span role="columnheader" className="col-hfi">HFI</span>
          <span role="columnheader" className="col-quality">Hair day</span>
        </div>
        {intervals.map((iv) => {
          const isCurrent = iv.interval === current.interval
          return (
            <button
              key={iv.interval}
              type="button"
              role="row"
              aria-selected={isCurrent}
              className={`table-row ${isCurrent ? 'is-selected' : ''}`}
              onClick={() => onSelect(iv.interval)}
            >
              <span role="cell" className="cell-time">
                <span className="cell-day">{dayLabel(iv.time)}</span>
                <span className="cell-hour">{hourLabel(iv.time)}</span>
              </span>
              <span role="cell">{formatTemp(iv.temperature_f, units)}</span>
              <span role="cell">{formatWind(iv.wind_mph, units)}</span>
              <span role="cell" className="col-hfi"><HfiNumber hfi={iv.hfi} /></span>
              <span role="cell" className="col-quality"><HfiChip hfi={iv.hfi} /></span>
            </button>
          )
        })}
      </div>

      <div className={`callout hfi-${level ? level.key : 'none'}`} aria-live="polite">
        <InfoIcon className="callout-icon" />
        <div>
          <div className="callout-title">
            {intervalLabel(current.time)} · {level ? level.label : 'No index'}
          </div>
          <p className="callout-text">{level ? level.description : ''}</p>
          <p className="callout-meta">
            Dew point {formatTemp(current.dewpoint_f, units)} · {formatTemp(current.temperature_f, units)} · {formatWind(current.wind_mph, units)}
          </p>
        </div>
      </div>
    </div>
  )
}
