#!/usr/bin/env node
// Pulls the Google reviewer profile photos for the reviews curated in
// src/utils/Reviews.ts and stores them under public/reviews/, so the site
// serves them itself instead of hot-linking Google (no per-visit API cost,
// no next/image remote host, and the cards render the same offline).
//
// Reviews stay curated by hand: this script only matches the reviewers by
// name (from public/locales/en/home.json) against what the Places API
// returns and downloads their avatar. Reviewers the API does not return
// (it caps at 5 per place) keep their initials fallback in the UI.
//
// Needs GOOGLE_PLACES_API_KEY (Places API (New) enabled) in .env.local.
// GOOGLE_PLACE_ID is optional; when unset the venue is looked up by name
// and the resolved id is printed so it can be pinned.
//
// Google's Places policy allows caching this content for up to 30 days, so
// re-run it now and then (or whenever a reviewer changes their photo).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const AVATAR_DIR = join(ROOT, 'public', 'reviews');
const MANIFEST_PATH = join(ROOT, 'src', 'utils', 'reviewAvatars.json');
const HOME_LOCALE_PATH = join(ROOT, 'public', 'locales', 'en', 'home.json');
const PLACES_API = 'https://places.googleapis.com/v1';
const VENUE_QUERY = "Saint Mary's Fellowship Hall, 2875 Winder Hwy, Dacula, GA";
const AVATAR_SIZE = 192;

loadEnvLocal();
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('GOOGLE_PLACES_API_KEY is not set (see .env.sample). Nothing to do.');
  process.exit(1);
}

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const [, key, rawVal] = m;
      if (process.env[key]) continue;
      let val = rawVal.trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  } catch {
    // no .env.local — that's fine
  }
}

const placesFetch = async (path, fieldMask, init = {}) => {
  const res = await fetch(`${PLACES_API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': fieldMask,
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`Places API ${path} → ${res.status} ${res.statusText}: ${await res.text()}`);
  }
  return res.json();
};

const resolvePlaceId = async () => {
  if (process.env.GOOGLE_PLACE_ID) return process.env.GOOGLE_PLACE_ID;
  const data = await placesFetch('/places:searchText', 'places.id,places.displayName', {
    method: 'POST',
    body: JSON.stringify({ textQuery: VENUE_QUERY, maxResultCount: 1 }),
  });
  const place = data.places?.[0];
  if (!place) throw new Error(`No place found for "${VENUE_QUERY}"`);
  console.log(
    `Resolved "${place.displayName?.text}" → ${place.id}\n  Pin it with GOOGLE_PLACE_ID=${place.id} to skip this lookup.`
  );
  return place.id;
};

const normalize = (s) =>
  s
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9. ]+/g, ' ')
    .trim()
    .split(/\s+/);

// "Yuritzia A." matches "Yuritzia Alvarez"; "Laura Pop" only matches "Laura Pop".
const namesMatch = (curated, fromApi) => {
  const a = normalize(curated);
  const b = normalize(fromApi);
  if (a.length === 0 || a.length > b.length) return false;
  return a.every((token, i) =>
    token.endsWith('.') ? b[i].startsWith(token.slice(0, -1)) : b[i] === token
  );
};

const extensionFor = (contentType) => {
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  return 'jpg';
};

const downloadAvatar = async (key, photoUri) => {
  // lh3 URLs carry their size after the last '=' (`=s128-c…` or `=w72-h72-…`).
  const url = `${photoUri.replace(/=[^=]*$/, '')}=s${AVATAR_SIZE}-c`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Avatar download for ${key} → ${res.status}`);
  const ext = extensionFor(res.headers.get('content-type') ?? '');
  const file = `${key}.${ext}`;
  mkdirSync(AVATAR_DIR, { recursive: true });
  writeFileSync(join(AVATAR_DIR, file), Buffer.from(await res.arrayBuffer()));
  return `/reviews/${file}`;
};

const readJson = (path, fallback) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
};

const main = async () => {
  const curated = readJson(HOME_LOCALE_PATH, {}).reviews?.items ?? {};
  const manifest = readJson(MANIFEST_PATH, {});
  const placeId = await resolvePlaceId();
  const { reviews = [] } = await placesFetch(
    `/places/${placeId}`,
    'reviews.authorAttribution,reviews.publishTime'
  );
  console.log(`Google returned ${reviews.length} review(s).`);

  const unmatched = [];
  for (const [key, { name }] of Object.entries(curated)) {
    const review = reviews.find((r) => namesMatch(name, r.authorAttribution?.displayName ?? ''));
    if (!review?.authorAttribution?.photoUri) {
      unmatched.push(name);
      continue;
    }
    manifest[key] = await downloadAvatar(key, review.authorAttribution.photoUri);
    console.log(`✓ ${name} → ${manifest[key]}`);
  }

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  if (unmatched.length > 0) {
    console.log(
      `No photo for: ${unmatched.join(', ')} (not among the reviews Google returned, or no profile photo). They keep the initials fallback.`
    );
  }
};

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
