# Hair Forecast

**Live at [hairforecast.app](https://hairforecast.app)**

Hair Forecast answers one question: *what is the weather going to do to my hair today?*
It turns a global numerical weather model into a simple 1–10 "Hair Forecast Index" (HFI)
for any location on Earth, with a 3-day outlook in 6-hour steps.

It is a real, running product. But the reason it exists is to be a working, end-to-end
demonstration of how I build and operate software: from raw meteorological data to a
TLS-terminated, SEO-indexed web app, with a deployment that I can rebuild on a cloud
VM or on my own hardware from the files in this directory.

---

## What the app does

1. Locate the user — browser geolocation, or a country/city picker backed by a
   world-cities database, or a free-text search.
2. Snap that point to the nearest forecast grid cell (geohash-encoded).
3. Pull temperature, dewpoint, wind and precipitation for each 6-hour step over
   the next 72 hours from the latest ECMWF model run.
4. Score each step with the HFI algorithm (dewpoint-driven, penalized by rain and
   wind) and present a summary plus a detailed breakdown.
5. Serve pre-rendered, crawlable per-city pages (`/hair-forecast/<city>/`) so search
   engines can index real forecasts, not an empty JavaScript shell.

The idea is a revival of a project I first built years ago; this version is a
ground-up rebuild with a modern stack and a deliberately production-grade
operational posture.

---

## Why it's on my resume

This is not a tutorial app. It touches every layer I work in professionally, and every
layer is something I designed, built, deployed and now operate myself:

| Area | What's demonstrated here |
|---|---|
| **Data engineering** | Scheduled ingest of ECMWF GRIB2 model output from a public S3 bucket, decoded with ECCODES, clipped and packed into a custom memory-mapped binary grid format with a JSON header and atomic writes. |
| **Backend / API design** | Two small Flask services (`/wxapi`, `/geoapi`) with clean REST endpoints, geohash encode/decode, nearest-point lookup, graceful 503 when upstream data is missing. |
| **Algorithm packaging** | The HFI scoring logic is its own installable Python package (`hf_index`) with unit tests, consumed by the API as a wheel. |
| **Frontend** | React 19 + Vite SPA with React Router; a post-build step generates static, indexable city pages, a hub page, `sitemap.xml` and `robots.txt`. |
| **Containers & orchestration** | Each service has its own Dockerfile; the whole stack is a single `docker-compose.yml` with log rotation and restart policies. |
| **Infrastructure / ops** | nginx reverse proxy with HTTP→HTTPS redirect, HSTS, gzip, HTTP/2; Let's Encrypt via webroot with a systemd renewal timer; the ingest job is a systemd timer + service. |
| **Cloud and on-prem portability** | Same compose stack runs on an AWS EC2 host (`docker-compose.aws.yml`) and on my homelab (`docker-compose.walrus.yml`). The pipeline was *originally* EventBridge → Lambda → Fargate → Valkey; I replaced it with one timer, one container and one flat file because it was simpler, cheaper and easier to reason about. |
| **SEO / growth** | Per-city static pages with canonical URLs, Open Graph tags and JSON-LD, optionally baked with the day's live score so crawlers see real content. |
| **Mobile** | An early React Native client (`hairforecast_mobile_app`) that consumes the same APIs. |

The architectural decision I'm proudest of is the one that *removed* infrastructure:
a daily ingest writing a single memory-mapped file that the API opens directly, with no
database, cache tier or network hop between ingest and serving. Readers never see a
partial file because the writer renames into place atomically.

---

## Architecture

```
                 ECMWF public S3 (ecmwf-forecasts)
                               │  GRIB2, 00Z run, steps 0h..72h every 6h
                               ▼
   systemd timer ──▶ hf-ingest.sh ──▶ hf_grid container (ECCODES, build_grid.py)
                                                  │
                                                  ▼   atomic replace
                                       /mnt/hf/data/forecast.grid
                                                  │   (mmap, read-only)
                                                  ▼
   browser ──▶ nginx (TLS, static SPA + city pages) ──┬──▶ hf_weather_api  /wxapi/*
                                                     └──▶ hf_geoapi       /geoapi/*
                                                              │
                                                              ▼
                                                     world.sqlite3 (cities/countries)
```

### Deployment

The production site currently runs on a single Amazon EC2 instance, with DNS for
hairforecast.app managed in Route 53. Every component (nginx, the two Flask APIs, and
the ingest grid builder) runs as a Docker container, orchestrated with Docker Compose;
the daily ingest and certificate renewal are systemd timers on the host.

---

## License

Component repositories carry their own licenses. The `hf_index` scoring package is
proprietary.
