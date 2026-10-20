import { hfiLevel, roundHfi } from '../lib/hfi'

/** Big index tile (summary) or small chip (details), coloured by band. */
export function HfiTile({ hfi }) {
  const level = hfiLevel(hfi)
  if (!level) return null
  return (
    <div className={`hfi-tile hfi-${level.key}`} role="img" aria-label={`Hair Forecast Index ${roundHfi(hfi)} of 10, ${level.label}`}>
      <div className="hfi-tile-number">{roundHfi(hfi)}</div>
      <div className="hfi-tile-label">{level.label}</div>
    </div>
  )
}

export function HfiChip({ hfi, compact = false }) {
  const level = hfiLevel(hfi)
  if (!level) return <span className="muted">—</span>
  return <span className={`chip hfi-${level.key}`}>{compact ? level.short : level.label}</span>
}

export function HfiNumber({ hfi }) {
  const level = hfiLevel(hfi)
  if (!level) return <span className="muted">—</span>
  return <span className={`hfi-number hfi-${level.key}`}>{roundHfi(hfi)}</span>
}
