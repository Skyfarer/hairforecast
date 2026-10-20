import { HfiTile, HfiNumber } from './HfiBadge'
import { ThermometerIcon, WindIcon } from './Icons'
import { hfiLevel } from '../lib/hfi'
import { dayLabel, formatTemp, formatWind, hourLabel } from '../lib/format'

/** The next-24-hours view: one number, one sentence, two metrics, a strip. */
export default function SummaryView({ summary, intervals, units, onPickInterval }) {
  const level = hfiLevel(summary.average_hfi)
  return (
    <div className="summary">
      <div className="summary-hero">
        <HfiTile hfi={summary.average_hfi} />
        <p className="summary-text">{level ? level.description : 'No index available.'}</p>
        <p className="summary-caption">Average Hair Forecast Index for the next 24 hours</p>
      </div>

      <div className="metrics">
        <div className="metric">
          <span className="metric-icon metric-temp"><ThermometerIcon /></span>
          <div>
            <div className="metric-value">{formatTemp(summary.high_temperature_f, units)}</div>
            <div className="metric-label">High temperature</div>
          </div>
        </div>
        <div className="metric">
          <span className="metric-icon metric-wind"><WindIcon /></span>
          <div>
            <div className="metric-value">{formatWind(summary.average_wind_mph, units)}</div>
            <div className="metric-label">Average wind</div>
          </div>
        </div>
      </div>

      {intervals.length > 0 && (
        <div className="strip" aria-label="Hair Forecast Index by time">
          {intervals.map((iv) => (
            <button
              key={iv.interval}
              type="button"
              className="strip-item"
              onClick={() => onPickInterval(iv.interval)}
              title={`${dayLabel(iv.time)}, ${hourLabel(iv.time)}: ${formatTemp(iv.temperature_f, units)}, ${formatWind(iv.wind_mph, units)}`}
            >
              <span className="strip-day">{dayLabel(iv.time)}</span>
              <span className="strip-hour">{hourLabel(iv.time)}</span>
              <HfiNumber hfi={iv.hfi} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
