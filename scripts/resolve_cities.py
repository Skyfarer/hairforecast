#!/usr/bin/env python3
"""Resolve scripts/city-list.txt against hf_geoapi/world.sqlite3 into scripts/cities.json.

Run from react/hairforecast after editing the city list:
    python3 scripts/resolve_cities.py [path/to/world.sqlite3]

The match is the exact city name in the given state code; if the state code
does not match, the same name anywhere in the country is used (and reported) so
a guessed region code does not drop a city. Unresolved names are listed and
skipped. Output is committed so the web build needs no database.
"""
import json
import re
import sqlite3
import sys
import unicodedata
from pathlib import Path

HERE = Path(__file__).resolve().parent
DB = Path(sys.argv[1]) if len(sys.argv) > 1 else HERE.parents[2] / 'hf_geoapi' / 'world.sqlite3'

SQL = """
    SELECT trim(c.name) AS name, c.state_code, trim(s.name) AS state,
           co.name AS country, co.iso2 AS country_code, c.latitude, c.longitude
    FROM cities c
    JOIN countries co ON co.id = c.country_id
    LEFT JOIN states s ON s.id = c.state_id
    WHERE trim(c.name) = ? COLLATE NOCASE AND co.iso2 = ? {extra}
    ORDER BY c.id LIMIT 1
"""


def slugify(*parts):
    text = '-'.join(parts).replace('.', '')
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def main():
    db = sqlite3.connect(DB)
    db.row_factory = sqlite3.Row
    cities, seen, missing = [], set(), []

    for line in (HERE / 'city-list.txt').read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        fields = [p.strip() for p in line.split('|')]
        name, region, cc = fields[:3]
        display_name = fields[3] if len(fields) > 3 else None
        row = db.execute(SQL.format(extra='AND c.state_code = ?'), (name, cc, region)).fetchone()
        if row is None:
            row = db.execute(SQL.format(extra=''), (name, cc)).fetchone()
            if row is not None:
                print(f'note: {name} | {region} | {cc} matched in region {row["state_code"]} ({row["state"]})')
        if row is None:
            missing.append(line)
            continue

        # US pages read "houston-tx"; elsewhere the country code disambiguates.
        region_part = row['state_code'] if cc == 'US' else cc
        display_name = display_name or row['name']
        slug = slugify(display_name)
        if not slug.endswith('-' + region_part.lower()):  # "Washington, D.C." -> washington-dc
            slug = slugify(display_name, region_part)
        if slug in seen:
            print(f'skip duplicate slug {slug}')
            continue
        seen.add(slug)
        cities.append({
            'slug': slug,
            'name': display_name,
            'state_code': row['state_code'],
            'state': row['state'],
            'country': row['country'],
            'country_code': row['country_code'],
            'latitude': round(float(row['latitude']), 4),
            'longitude': round(float(row['longitude']), 4),
        })

    (HERE / 'cities.json').write_text(json.dumps(cities, indent=1, ensure_ascii=False) + '\n')
    print(f'{len(cities)} cities written to scripts/cities.json')
    if missing:
        print('unresolved (fix the name or region and rerun):')
        for m in missing:
            print('  ', m)


if __name__ == '__main__':
    main()
