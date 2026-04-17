#!/usr/bin/env node
// Syncs non-default locale files against the default (en) locale.
// - Adds missing keys from en, optionally translating them via the Claude API.
// - Removes keys that no longer exist in en.
// - Preserves existing translations.
//
// With ANTHROPIC_API_KEY set (e.g., in .env.local), missing strings are
// translated by Claude. Without it, missing strings fall back to a bracketed
// placeholder ("[ES] Hello") so untranslated copy is visible in the browser.
//
// Flags:
//   --check         exit 1 if anything would change; no writes. CI-friendly.
//   --retranslate   treat every [ES]/[RO] placeholder as missing and re-run.
//   --no-translate  skip the API even if a key is configured.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const LOCALES_DIR = join(ROOT, 'public', 'locales');
const DEFAULT_LOCALE = 'en';
const TARGET_LOCALES = ['es', 'ro'];
const LOCALE_NAMES = { es: 'Spanish (Spain)', ro: 'Romanian' };
const MODEL = 'claude-opus-4-7';

const CHECK_MODE = process.argv.includes('--check');
const RETRANSLATE = process.argv.includes('--retranslate');
const NO_TRANSLATE = process.argv.includes('--no-translate');

loadEnvLocal();
const API_KEY = process.env.ANTHROPIC_API_KEY;
const USE_API = !NO_TRANSLATE && !!API_KEY;

const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// Minimal .env.local loader — no dotenv dep. Only sets vars that aren't already
// present in the environment so an explicit export wins.
function loadEnvLocal() {
  try {
    const raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
      if (!m) continue;
      const [, key, rawVal] = m;
      // Treat empty strings as unset — some shells export a blank value to
      // avoid leaking a real key, and we want .env.local to win in that case.
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

// Marks a slot as "needs a translation." Never written to disk.
const TRANSLATE_SENTINEL = Symbol('translate');

const placeholder = (locale, value) => {
  if (typeof value === 'string') return `[${locale.toUpperCase()}] ${value}`;
  if (Array.isArray(value)) return value.map((v) => placeholder(locale, v));
  if (isObject(value)) {
    const out = {};
    for (const k of Object.keys(value)) out[k] = placeholder(locale, value[k]);
    return out;
  }
  return value;
};

// Detects values that are unresolved placeholders from a prior run. If the user
// passed --retranslate, we also re-translate these. Otherwise they're kept as-is.
const isPlaceholder = (locale, value) =>
  typeof value === 'string' && value.startsWith(`[${locale.toUpperCase()}] `);

// Recursively reconcile `target` against `source`. Missing slots are filled
// with TRANSLATE_SENTINEL; a second pass either calls Claude or swaps in a
// placeholder string.
const reconcile = (source, target, locale, path = []) => {
  const out = Array.isArray(source) ? [] : {};
  const stats = { added: 0, removed: 0, kept: 0 };
  const toTranslate = []; // {path: [...], english: string}

  if (Array.isArray(source)) {
    for (let i = 0; i < source.length; i++) {
      const srcItem = source[i];
      const tgtItem = Array.isArray(target) ? target[i] : undefined;
      const childPath = [...path, i];

      if (isObject(srcItem) || Array.isArray(srcItem)) {
        const seed = isObject(tgtItem) || Array.isArray(tgtItem)
          ? tgtItem
          : Array.isArray(srcItem) ? [] : {};
        const sub = reconcile(srcItem, seed, locale, childPath);
        out[i] = sub.value;
        stats.added += sub.stats.added;
        stats.removed += sub.stats.removed;
        stats.kept += sub.stats.kept;
        toTranslate.push(...sub.toTranslate);
      } else {
        const { value, status, pending } = resolveLeaf(srcItem, tgtItem, locale, childPath);
        out[i] = value;
        stats[status]++;
        if (pending) toTranslate.push(pending);
      }
    }
    if (Array.isArray(target) && target.length > source.length) {
      stats.removed += target.length - source.length;
    }
    return { value: out, stats, toTranslate };
  }

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = isObject(target) ? target[key] : undefined;
    const childPath = [...path, key];

    if (isObject(srcVal) || Array.isArray(srcVal)) {
      const seed = (isObject(tgtVal) && !Array.isArray(srcVal)) ||
        (Array.isArray(tgtVal) && Array.isArray(srcVal))
        ? tgtVal
        : Array.isArray(srcVal) ? [] : {};
      const sub = reconcile(srcVal, seed, locale, childPath);
      out[key] = sub.value;
      stats.added += sub.stats.added;
      stats.removed += sub.stats.removed;
      stats.kept += sub.stats.kept;
      toTranslate.push(...sub.toTranslate);
    } else {
      const { value, status, pending } = resolveLeaf(srcVal, tgtVal, locale, childPath);
      out[key] = value;
      stats[status]++;
      if (pending) toTranslate.push(pending);
    }
  }

  if (isObject(target)) {
    for (const key of Object.keys(target)) {
      if (!(key in source)) stats.removed++;
    }
  }

  return { value: out, stats, toTranslate };
};

const resolveLeaf = (srcVal, tgtVal, locale, path) => {
  if (typeof srcVal !== 'string') {
    return { value: srcVal, status: tgtVal === srcVal ? 'kept' : 'added' };
  }
  const existing = typeof tgtVal === 'string' ? tgtVal : undefined;
  const hasRealTranslation =
    existing !== undefined && !isPlaceholder(locale, existing);
  if (hasRealTranslation && !RETRANSLATE) {
    return { value: existing, status: 'kept' };
  }
  // Needs translation or placeholder.
  return {
    value: TRANSLATE_SENTINEL,
    status: 'added',
    pending: { path, english: srcVal },
  };
};

const setByPath = (tree, path, value) => {
  let node = tree;
  for (let i = 0; i < path.length - 1; i++) node = node[path[i]];
  node[path[path.length - 1]] = value;
};

const pathKey = (path) => path.map(String).join('\u0001');

// Parse a JSON object out of a model response. Strips an optional ```json fence
// and leading prose if present.
const extractJsonObject = (text) => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1].trim() : trimmed;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`No JSON object in response: ${text.slice(0, 300)}`);
  }
  return JSON.parse(body.slice(start, end + 1));
};

const SYSTEM_PROMPT = `You translate UI copy from English into other languages for a marketing website. The site is for Fellowship Event Hall, an event venue in Dacula, Georgia, USA owned by St. Mary Romanian Orthodox Church.

Follow these rules exactly:

1. PLACEHOLDERS — keep every placeholder literally identical, in the same order:
   - Double-brace variables like {{count}}, {{eventType}}, {{damage}} — copy verbatim, do not translate the name inside.
   - Numbered tags like <1>text</1>, <3>text</3> — keep the numbers, keep the tag structure, translate only the inner text.
   - HTML entities (&amp;, &apos;, etc.) — copy verbatim.

2. PROPER NOUNS — do NOT translate:
   - "Fellowship Event Hall", "St. Mary", "St. Mary's", "Saint Mary", "Saint Mary's"
   - US place names: Dacula, Georgia, GA, Lawrenceville, Buford, Hoschton, Duluth, Suwanee, Gwinnett County, Atlanta, North Atlanta
   - Brand names: WhatsApp, Facebook, Instagram
   - Street addresses (e.g., "2875 Winder Hwy")

3. FORMATTING — preserve:
   - Leading/trailing whitespace and punctuation.
   - Capitalization style (Title Case stays title-cased per target-language convention; ALL CAPS stays ALL CAPS; sentence case stays sentence case).
   - Numbers, currency symbols, and price formatting ($2,000 stays $2,000 — US audience).
   - Units written in English ("Guests", "People", "sq ft") may be translated if natural in the target language.

4. TONE — warm, elegant, hospitality-focused. Match the register of the English original.

5. OUTPUT — return strictly valid JSON matching the requested schema. Do not wrap values in quotes that weren't in the source. Do not add commentary.`;

async function translateBatch(locale, items) {
  if (items.length === 0) return new Map();

  const client = new Anthropic({ apiKey: API_KEY });
  const targetName = LOCALE_NAMES[locale] ?? locale;

  // We key each string by its index so the model doesn't have to echo our
  // full dotted paths (which can contain array indices and are noisy). The
  // response schema forces a map from these short IDs back to strings.
  const inputs = {};
  items.forEach((item, i) => {
    inputs[`t${i}`] = item.english;
  });

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        // Stable across all invocations and both locales — cache it.
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Translate every value below into ${targetName}. Respond with ONLY a JSON object mapping each id to its translated string — no prose, no markdown code fence. Every id in the input must appear in the output. Preserve placeholders exactly per the rules.\n\nInput:\n${JSON.stringify(inputs, null, 2)}`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) {
    throw new Error('Claude returned no text block');
  }
  const translations = extractJsonObject(textBlock.text);
  const out = new Map();
  items.forEach((item, i) => {
    const t = translations[`t${i}`];
    if (typeof t === 'string') out.set(pathKey(item.path), t);
  });

  const usage = response.usage;
  if (usage) {
    const cacheRead = usage.cache_read_input_tokens ?? 0;
    const cacheWrite = usage.cache_creation_input_tokens ?? 0;
    const input = usage.input_tokens ?? 0;
    const output = usage.output_tokens ?? 0;
    console.log(
      `  ${locale}: ${items.length} string${items.length === 1 ? '' : 's'} translated — tokens in ${input} (cache read ${cacheRead}, write ${cacheWrite}), out ${output}`
    );
  }

  return out;
}

function applyResolutions(tree, pending, translations, locale) {
  for (const item of pending) {
    const key = pathKey(item.path);
    const translated = translations.get(key);
    const value = translated ?? placeholder(locale, item.english);
    setByPath(tree, item.path, value);
  }
}

const readJson = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
};

const toJson = (obj) => `${JSON.stringify(obj, null, 2)}\n`;

async function main() {
  const namespaces = readdirSync(join(LOCALES_DIR, DEFAULT_LOCALE))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''));

  if (USE_API) {
    console.log(`Translating via Claude (${MODEL}).`);
  } else if (NO_TRANSLATE) {
    console.log('API translation disabled via --no-translate — using placeholders.');
  } else {
    console.log('No ANTHROPIC_API_KEY found — using placeholders. (Set one in .env.local to enable Claude translation.)');
  }
  if (RETRANSLATE) console.log('Re-translating existing [LOCALE] placeholders.');

  let totalChanged = 0;
  let totalAdded = 0;
  let totalRemoved = 0;
  let totalTranslated = 0;

  for (const locale of TARGET_LOCALES) {
    // First pass: reconcile every namespace and collect pending translations
    // across all of them so we can batch-translate in one API call per locale.
    const nsResults = [];
    const allPending = [];
    for (const ns of namespaces) {
      const srcPath = join(LOCALES_DIR, DEFAULT_LOCALE, `${ns}.json`);
      const tgtPath = join(LOCALES_DIR, locale, `${ns}.json`);
      const source = readJson(srcPath);
      const target = readJson(tgtPath);
      const { value, stats, toTranslate } = reconcile(source, target, locale);
      // Tag pending items with the namespace so we can route them back.
      const scoped = toTranslate.map((item) => ({ ...item, ns }));
      allPending.push(...scoped);
      nsResults.push({ ns, srcPath, tgtPath, value, stats, target });
    }

    // Second pass: resolve every pending slot.
    let translations = new Map();
    if (USE_API && allPending.length > 0 && !CHECK_MODE) {
      try {
        translations = await translateBatch(locale, allPending);
        totalTranslated += translations.size;
      } catch (err) {
        console.error(`  ${locale}: translation failed — ${err.message}`);
        console.error('  Falling back to placeholders for this locale.');
      }
    }

    for (const result of nsResults) {
      const pendingForNs = allPending.filter((p) => p.ns === result.ns);
      applyResolutions(result.value, pendingForNs, translations, locale);
      const nextJson = toJson(result.value);
      const prevJson = toJson(result.target);
      if (nextJson !== prevJson) {
        totalChanged++;
        totalAdded += result.stats.added;
        totalRemoved += result.stats.removed;
        console.log(
          `${locale}/${result.ns}.json  +${result.stats.added} -${result.stats.removed}  (${result.stats.kept} kept)`
        );
        if (!CHECK_MODE) writeFileSync(result.tgtPath, nextJson);
      }
    }
  }

  if (totalChanged === 0) {
    console.log('All locales are in sync with en.');
    return;
  }

  const verb = CHECK_MODE ? 'would change' : 'updated';
  console.log(
    `\n${totalChanged} file${totalChanged === 1 ? '' : 's'} ${verb} — +${totalAdded} key${totalAdded === 1 ? '' : 's'} added, -${totalRemoved} removed${USE_API ? `, ${totalTranslated} translated` : ''}.`
  );

  if (CHECK_MODE) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
