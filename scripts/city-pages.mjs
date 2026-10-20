#!/usr/bin/env node
// Post-build: static, indexable city pages for search engines.
//
//   node scripts/city-pages.mjs                     # after `vite build` (npm run build does this)
//   node scripts/city-pages.mjs --live <api-origin> # also bake today's HFI into each page
//
// For every city in scripts/cities.json this writes dist/hair-forecast/<slug>/index.html:
// the built index.html with its own title, description, canonical URL, Open Graph tags,
// JSON-LD, and a crawlable HTML body (heading, today's score when --live, nearby cities).
// The React bundle still loads and shows the live forecast for that city
// (window.__HF_CITY__). It also writes the /hair-forecast/ hub page, sitemap.xml and
// robots.txt.
//
// --live calls <api-origin>/wxapi/hfi-summary per city (e.g. https://hairforecast.app,
// or http://localhost on the server). Run it daily after the forecast ingest so the
// pages carry fresh numbers; cities whose lookup fails just omit today's line.
//
// Env: SITE_URL (default https://hairforecast.app), DIST (default ./dist).

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SITE = (process.env.SITE_URL || 'https://hairforecast.app').replace(/\/$/, '')
const DIST = process.env.DIST || join(HERE, '..', 'dist')
const HUB = '/hair-forecast/'
const liveIdx = process.argv.indexOf('--live')
const API = liveIdx > -1 ? (process.argv[liveIdx + 1] || SITE).replace(/\/$/, '') : null

const cities = JSON.parse(readFileSync(join(HERE, 'cities.json'), 'utf8'))
const template = readFileSync(join(DIST, 'index.html'), 'utf8')
const today = new Date().toISOString().slice(0, 10)

// ---------- helpers ----------

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const cityUrl = (c) => `${HUB}${c.slug}/`
const isUS = (c) => c.country_code === 'US'
/** "Houston, TX" in the US, "London, United Kingdom" elsewhere. */
const shortName = (c) => (isUS(c) ? `${c.name}, ${c.state_code}` : `${c.name}, ${c.country}`)
const regionName = (c) => (isUS(c) ? c.state : c.country)

function km(a, b) {
  const r = Math.PI / 180
  const dLat = (b.latitude - a.latitude) * r
  const dLon = (b.longitude - a.longitude) * r
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin(dLon / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

function hfiBand(hfi) {
  if (hfi >= 8) return { key: 'great', label: 'great hair weather' }
  if (hfi >= 5) return { key: 'moderate', label: 'moderate hair weather, some frizz possible' }
  return { key: 'bad', label: 'bad hair weather, high frizz risk' }
}

function units(c, s) {
  if (isUS(c)) return { temp: `${Math.round(s.high_temperature_f)}°F`, wind: `${Math.round(s.average_wind_mph)} mph` }
  return {
    temp: `${Math.round(((s.high_temperature_f - 32) * 5) / 9)}°C`,
    wind: `${Math.round(s.average_wind_mph * 1.60934)} km/h`,
  }
}

async function fetchSummaries() {
  const out = new Map()
  if (!API) return out
  let next = 0
  async function worker() {
    while (next < cities.length) {
      const c = cities[next++]
      try {
        const res = await fetch(`${API}/wxapi/hfi-summary?lat=${c.latitude}&lon=${c.longitude}`,
          { signal: AbortSignal.timeout(15000) })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const body = await res.json()
        if (typeof body.average_hfi === 'number') out.set(c.slug, body)
      } catch (err) {
        console.warn(`  ${c.slug}: no live summary (${err.message})`)
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker))
  console.log(`live summaries: ${out.size}/${cities.length} from ${API}`)
  return out
}

/** Swap a <meta>/<link> tag identified by attr=value, or add it before </head>. */
function setTag(html, tag, keyAttr, keyVal, attrs) {
  const re = new RegExp(`<${tag}\\b[^>]*\\b${keyAttr}="${keyVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>\\s*`, 'i')
  const el = `<${tag} ${keyAttr}="${keyVal}" ${Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ')} />\n    `
  return re.test(html) ? html.replace(re, el) : html.replace('</head>', `${el}</head>`)
}

function headFor(html, { title, description, url, jsonLd, extraHead = '' }) {
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
  html = setTag(html, 'meta', 'name', 'description', { content: description })
  html = setTag(html, 'link', 'rel', 'canonical', { href: url })
  html = setTag(html, 'meta', 'property', 'og:type', { content: 'website' })
  html = setTag(html, 'meta', 'property', 'og:site_name', { content: 'Hair Forecast' })
  html = setTag(html, 'meta', 'property', 'og:title', { content: title })
  html = setTag(html, 'meta', 'property', 'og:description', { content: description })
  html = setTag(html, 'meta', 'property', 'og:url', { content: url })
  html = setTag(html, 'meta', 'property', 'og:image', { content: `${SITE}/images/logo.png` })
  html = setTag(html, 'meta', 'name', 'twitter:card', { content: 'summary' })
  const ld = `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
  return html.replace('</head>', `    ${ld}\n    ${extraHead}</head>`)
}

function breadcrumbs(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })),
  }
}

function linkList(list) {
  return `<ul class="city-links">${list.map((c) => `<li><a href="${cityUrl(c)}">${esc(shortName(c))}</a></li>`).join('')}</ul>`
}

// ---------- city pages ----------

function cityPage(c, summary) {
  const name = shortName(c)
  const place = [c.name, c.state && c.state !== c.name ? c.state : null, c.country].filter(Boolean).join(', ')
  const nearby = cities.filter((o) => o !== c)
    .map((o) => [o, km(c, o)]).sort((a, b) => a[1] - b[1]).slice(0, 8).map(([o]) => o)
  const sameRegion = cities.filter((o) => o !== c && regionName(o) === regionName(c) && !nearby.includes(o))

  let todayLine = ''
  let description = `Will humidity, wind and rain wreck your hair in ${name}? `
    + 'The Hair Forecast Index rates the next two days from 1 (frizz) to 10 (style stays put).'
  if (summary) {
    const hfi = Math.round(summary.average_hfi * 10) / 10
    const band = hfiBand(hfi)
    const u = units(c, summary)
    todayLine = `<p class="city-today"><span class="chip hfi-${band.key}">${hfi.toFixed(1)} / 10</span> `
      + `Next 24 hours in ${esc(c.name)}: ${esc(band.label)}. High of ${u.temp}, average wind ${u.wind}. `
      + `<span class="muted">Updated ${today}.</span></p>`
    description = `Hair forecast for ${name}: ${hfi.toFixed(1)}/10 (${band.label}), high ${u.temp}. `
      + 'Humidity, wind and rain boiled down to one frizz score.'
  }

  const info = `<section id="city-info" class="card city-info">
  <h2>Hair weather in ${esc(c.name)}</h2>
  ${todayLine}
  <p>The Hair Forecast Index for ${esc(place)} starts from the dew point, the best single measure of how much
  moisture the air will push into your hair, then subtracts for strong wind and heavy rain and adds a little for
  cool temperatures. Scores of 8 to 10 mean your style should hold; 1 to 4 means frizz, flyaways and a good day
  to wear it up. The forecast comes from the ECMWF global model and covers the next two days in six-hour steps.</p>
  <h3>Hair forecasts near ${esc(c.name)}</h3>
  ${linkList(nearby)}
  ${sameRegion.length ? `<h3>More in ${esc(regionName(c))}</h3>${linkList(sameRegion)}` : ''}
  <p><a href="${HUB}">All city hair forecasts</a> · <a href="/">Check any town</a></p>
</section>`

  const url = `${SITE}${cityUrl(c)}`
  const title = `${name} Hair Forecast: Today's Frizz & Humidity`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage', '@id': url, url, name: title, description,
        dateModified: today,
        about: {
          '@type': 'City', name: c.name,
          containedInPlace: { '@type': 'Place', name: [c.state, c.country].filter(Boolean).join(', ') },
          geo: { '@type': 'GeoCoordinates', latitude: c.latitude, longitude: c.longitude },
        },
      },
      breadcrumbs([['Hair Forecast', `${SITE}/`], ['Cities', `${SITE}${HUB}`], [name, url]]),
    ],
  }
  const cityData = {
    slug: c.slug, name: c.name, state_code: c.state_code, state: c.state, country: c.country,
    country_code: c.country_code, latitude: c.latitude, longitude: c.longitude,
  }
  const extraHead = `<script>window.__HF_CITY__=${JSON.stringify(cityData).replace(/</g, '\\u003c')}</script>\n  `

  let html = headFor(template, { title, description, url, jsonLd, extraHead })
  // Crawlable body; React replaces #root on load but keeps #city-info (see main.jsx).
  const fallback = `<main class="main"><section class="card"><h1>Hair Forecast for ${esc(name)}</h1>`
    + `<p class="muted">Loading the live forecast…</p></section>${info}</main>`
  html = html.replace('<div id="root"></div>', `<div id="root">${fallback}</div>`)
  return html
}

// ---------- hub page ----------

function hubPage() {
  const groups = new Map()
  for (const c of cities) {
    const key = isUS(c) ? `United States|${c.state}` : `${c.country}|`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(c)
  }
  const keys = [...groups.keys()].sort((a, b) => {
    const [ca, sa] = a.split('|'); const [cb, sb] = b.split('|')
    if ((ca === 'United States') !== (cb === 'United States')) return ca === 'United States' ? -1 : 1
    return ca.localeCompare(cb) || sa.localeCompare(sb)
  })
  const sections = keys.map((k) => {
    const [country, state] = k.split('|')
    const list = groups.get(k).sort((a, b) => a.name.localeCompare(b.name))
    return `<section class="hub-group"><h2>${esc(state || country)}</h2>${linkList(list)}</section>`
  }).join('\n')

  const url = `${SITE}${HUB}`
  const title = 'Hair Forecasts by City: Frizz & Humidity | Hair Forecast'
  const description = `Hair weather forecasts for ${cities.length} cities. Humidity, wind, rain and temperature `
    + 'turned into one 1 to 10 frizz score for the next two days.'
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'CollectionPage', '@id': url, url, name: title, description, dateModified: today },
      breadcrumbs([['Hair Forecast', `${SITE}/`], ['Cities', url]]),
    ],
  }
  let html = headFor(template, { title, description, url, jsonLd })
  // Static page: drop the app bundle (its router would redirect this path home).
  html = html.replace(/\s*<script type="module"[^>]*><\/script>/, '')
  html = html.replace('<div id="root"></div>', `<div id="root"><div class="app"><main class="main">
  <section class="card hub">
    <p><a href="/" class="hub-home"><img src="/images/hf_logo_light.png" alt="Hair Forecast" height="48" /></a></p>
    <h1>Hair forecasts by city</h1>
    <p class="muted">Pick a city to see what the next two days of humidity, wind and rain will do to your hair,
    or <a href="/">check any town</a>.</p>
    ${sections}
  </section>
</main></div></div>`)
  return html
}

// ---------- write ----------

function write(rel, content) {
  const path = join(DIST, rel)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

const summaries = await fetchSummaries()
for (const c of cities) write(join('hair-forecast', c.slug, 'index.html'), cityPage(c, summaries.get(c.slug)))
write(join('hair-forecast', 'index.html'), hubPage())

const urls = [
  [`${SITE}/`, 'daily', '1.0'],
  [`${SITE}${HUB}`, 'weekly', '0.8'],
  ...cities.map((c) => [`${SITE}${cityUrl(c)}`, 'daily', '0.7']),
]
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, freq, pri]) => `  <url><loc>${loc}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`).join('\n')}
</urlset>
`)
// The APIs stay crawlable: Google renders the page and needs them to show the forecast.
write('robots.txt', `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`)

console.log(`wrote ${cities.length} city pages, ${HUB}index.html, sitemap.xml (${urls.length} URLs), robots.txt`)
