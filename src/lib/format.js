// Unit conversion and time formatting. The APIs always return °F and mph.

export const UNIT_SYSTEMS = { imperial: 'imperial', metric: 'metric' }

/** Default unit system from the browser locale: only a few countries use °F. */
export function defaultUnits() {
  try {
    const region = new Intl.Locale(navigator.language).maximize().region
    return ['US', 'LR', 'MM', 'BS', 'BZ', 'KY', 'PW'].includes(region) ? 'imperial' : 'metric'
  } catch {
    return 'metric'
  }
}

export function formatTemp(tempF, units) {
  if (tempF == null) return '—'
  if (units === 'metric') return `${Math.round(((tempF - 32) * 5) / 9)}°C`
  return `${Math.round(tempF)}°F`
}

export function formatWind(mph, units) {
  if (mph == null) return '—'
  if (units === 'metric') return `${(mph * 1.60934).toFixed(1)} km/h`
  return `${mph.toFixed(1)} mph`
}

const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const hourFormatter = new Intl.DateTimeFormat(undefined, { hour: 'numeric' })
const fullFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric',
})
const runFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  timeZone: 'UTC', timeZoneName: 'short',
})

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** "Today", "Tomorrow" or a short weekday, relative to `now` in local time. */
export function dayLabel(date, now = new Date()) {
  const diffDays = Math.round((startOfDay(date) - startOfDay(now)) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  return dayFormatter.format(date)
}

/** "5 PM" in en-US, "17" in most other locales. */
export function hourLabel(date) {
  return hourFormatter.format(date)
}

/** "Today, 5 PM" style label for a forecast interval. */
export function intervalLabel(date, now = new Date()) {
  return `${dayLabel(date, now)}, ${hourLabel(date)}`
}

export function fullLabel(date) {
  return fullFormatter.format(date)
}

export function runLabel(date) {
  return runFormatter.format(date)
}

/** The town name on its own; `placeDetail` carries the region and country. */
export function placeLabel(place) {
  return (place && place.name) || ''
}

/** "California, United States" or just "Suriname" when the state repeats the name. */
export function placeDetail(place) {
  const parts = []
  if (place.state && place.state !== place.name) parts.push(place.state)
  if (place.country) parts.push(place.country)
  return parts.join(', ')
}
