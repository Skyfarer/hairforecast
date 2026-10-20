// Thin fetchers for the two backend services. nginx proxies both under the
// site origin, so paths are relative.

async function getJson(url) {
  let response
  try {
    response = await fetch(url)
  } catch {
    throw new Error('Network error. Check your connection and try again.')
  }
  let body = null
  try {
    body = await response.json()
  } catch {
    // Non-JSON error page from nginx; fall through to the status check.
  }
  if (!response.ok) {
    const detail = body && (body.error || body.message)
    throw new Error(detail || `Request failed (${response.status})`)
  }
  return body
}

/** Nearest forecast grid point for a coordinate. Returns a geohash string. */
export async function fetchGeohash(latitude, longitude) {
  const data = await getJson(`/wxapi/nearby?lat=${latitude}&lon=${longitude}`)
  const hit = data.results && data.results[0]
  if (!hit || !hit.geohash) throw new Error('No forecast is available for this location.')
  return hit.geohash
}

/** 24-hour summary: average HFI, high temperature (°F), average wind (mph). */
export function fetchSummary(geohash) {
  return getJson(`/wxapi/hfi-summary?geohash=${encodeURIComponent(geohash)}`)
}

/** Up to 8 six-hourly intervals; unavailable ones are dropped. */
export async function fetchDetail(geohash) {
  const data = await getJson(`/wxapi/hfi-detail?geohash=${encodeURIComponent(geohash)}`)
  const intervals = (data.intervals || [])
    .filter((i) => i.available && i.valid_time)
    .map((i) => ({ ...i, time: new Date(i.valid_time) }))
  return { run: data.run ? new Date(data.run) : null, intervals }
}

/** One-box place search. `cc` is an ISO2 country code to rank first. */
export async function searchPlaces(query, cc, signal) {
  const params = new URLSearchParams({ q: query })
  if (cc) params.set('cc', cc)
  const data = await getJson(`/geoapi/search?${params}`)
  if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError')
  return data.results || []
}

/** Closest city to a coordinate, used to label a geolocated position. */
export async function fetchNearestCity(latitude, longitude) {
  const data = await getJson(`/geoapi/nearest_city?lat=${latitude}&lon=${longitude}`)
  return data.city || null
}
