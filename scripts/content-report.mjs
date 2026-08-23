#!/usr/bin/env node
/**
 * scripts/content-report.mjs
 *
 * Pre-launch content-gap report for Le SMASH Burgers & Co.
 *
 * ENFORCES / IMPLEMENTS
 *   LANG-08   the missing-translation report. Every localised `{ en, my }`
 *             pair whose `my` is null is listed as `collection/slug -> field`.
 *   MENU-02   menu items with `price: null` (never fabricate a number).
 *   R-20      menu items with `verified: false` must not be published.
 *   PRD 17.1  unresolved data slots are reported, never guessed.
 *
 * Every finding is mapped back to the PRD 0.2 data slot (DS-xx) and/or the open
 * client question (Qn) that has to be answered to close it, so this report
 * doubles as the outstanding-questions list for the next client call.
 *
 * EXIT CODES
 *   0  always, in the default (audit) mode  this is a report, not a gate.
 *   1  when CONTENT_MODE=live and a launch-blocking gap remains:
 *        - missing Burmese translation on a PUBLISHED item/branch
 *        - null price on a PUBLISHED menu item
 *        - verified:false on a PUBLISHED menu item
 *        - a PUBLISHED branch missing opening hours, phone, or Foodpanda URL
 *        - a malformed (unparseable) content file
 *
 * Usage:  node scripts/content-report.mjs
 *         CONTENT_MODE=live node scripts/content-report.mjs
 *
 * Zero dependencies  Node built-ins only.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const LIVE = process.env.CONTENT_MODE === 'live';

/* ---------- output helpers (degrade to plain text when not a TTY) ---------- */
const TTY = Boolean(process.stdout.isTTY);
const paint = (code) => (s) => (TTY ? `\u001b[${code}m${s}\u001b[0m` : String(s));
const bold = paint('1');
const dim = paint('2');
const red = paint('31');
const yellow = paint('33');
const green = paint('32');
const cyan = paint('36');

const out = (s = '') => process.stdout.write(`${s}\n`);
const rule = (ch = '-') => out(dim(ch.repeat(72)));

/* ---------- PRD data-slot / open-question map (PRD 0.2, 19.7) ---------- */
const PRD = {
  hours: 'DS-01 / Q6',
  phone: 'DS-02 / Q7',
  itemName: 'DS-03 / Q14',
  price: 'DS-04 / Q5 + Q14',
  reviews: 'DS-05',
  social: 'DS-06',
  foodpanda: 'DS-07 / Q8',
  dns: 'DS-08 / Q10',
  placeId: 'DS-09 / Q26',
  burmese: 'DS-10 / Q13',
  dineIn: 'Q4',
  assets: 'Q9',
  brandName: 'Q11',
  none: '--',
};

/* ---------- collection loading ---------- */
async function readCollection(dirName) {
  const abs = path.join(CONTENT_DIR, dirName);
  let names;
  try {
    names = await readdir(abs);
  } catch {
    // A missing directory is a legitimate pre-population state, not a crash.
    return { name: dirName, missing: true, entries: [], broken: [] };
  }
  const entries = [];
  const broken = [];
  for (const n of names.sort()) {
    if (!n.endsWith('.json')) continue;
    const file = path.join(abs, n);
    const rel = path.relative(ROOT, file);
    try {
      const data = JSON.parse(await readFile(file, 'utf8'));
      entries.push({ file: rel, slug: data?.slug || n.replace(/\.json$/, ''), data: data ?? {} });
    } catch (err) {
      broken.push({ file: rel, slug: n.replace(/\.json$/, ''), message: err.message });
    }
  }
  return { name: dirName, missing: false, entries, broken };
}

/**
 * Walk a content record and collect every localised pair.
 * A localised pair is any object carrying BOTH an `en` and a `my` key  exactly
 * the storage shape defined in src/content.config.ts. Pairs are leaves, so we
 * stop descending once we find one.
 */
function collectLocalised(node, trail, acc) {
  if (node === null || typeof node !== 'object') return acc;
  if (Array.isArray(node)) {
    node.forEach((v, i) => collectLocalised(v, `${trail}[${i}]`, acc));
    return acc;
  }
  if ('en' in node && 'my' in node) {
    acc.push({ field: trail || '(root)', en: node.en, my: node.my });
    return acc;
  }
  for (const k of Object.keys(node)) {
    collectLocalised(node[k], trail ? `${trail}.${k}` : k, acc);
  }
  return acc;
}

/* ---------- gap bookkeeping ---------- */
const sections = [];
let totalGaps = 0;
const blockers = [];

function section(title, slot, lines) {
  sections.push({ title, slot, lines });
  totalGaps += lines.length;
}

/* ---------- load everything ---------- */
const [branches, menuItems, menuCategories, modifierGroups] = await Promise.all([
  readCollection('branches'),
  readCollection('menu-items'),
  readCollection('menu-categories'),
  readCollection('modifier-groups'),
]);
const collections = [branches, menuItems, menuCategories, modifierGroups];

let SITE = null;
let siteError = null;
try {
  const mod = await import(pathToFileURL(path.join(ROOT, 'src', 'lib', 'site.config.mjs')).href);
  SITE = mod.SITE ?? null;
  if (!SITE) siteError = 'site.config.mjs did not export SITE';
} catch (err) {
  siteError = err.message;
}

/* ---------- header ---------- */
out();
out(bold('Le SMASH - pre-launch content gap report'));
out(dim(`mode: ${LIVE ? 'live (gates the build)' : 'audit (report only)'}    root: ${ROOT}`));
rule('=');
out(
  dim(
    collections
      .map((c) => `${c.name}: ${c.missing ? 'no directory' : `${c.entries.length} file(s)`}`)
      .join('    ')
  )
);
out();

/* ---------- 0. malformed files ---------- */
{
  const lines = [];
  for (const col of collections) {
    for (const b of col.broken) {
      lines.push(`${col.name}/${b.slug} -> ${b.message}`);
      blockers.push(`malformed content file: ${b.file}`);
    }
  }
  section('Malformed content files (cannot be parsed)', PRD.none, lines);
}

/* ---------- 1. missing Burmese translations (LANG-08) ---------- */
{
  const lines = [];
  for (const col of collections) {
    for (const e of col.entries) {
      for (const p of collectLocalised(e.data, '', [])) {
        if (p.my !== null) continue;
        const emptyEn = p.en === null || p.en === '';
        const slot =
          col.name === 'menu-items' && p.field.startsWith('name') ? PRD.itemName : PRD.burmese;
        lines.push(
          `${col.name}/${e.slug} -> ${p.field}   ${dim(`[${slot}]`)}` +
            (emptyEn ? dim('  (en also empty)') : '')
        );
        // Blocking only when the record is actually going out to the public.
        const published =
          (col.name === 'menu-items' && e.data.status === 'published') ||
          (col.name === 'branches' && e.data.isPublished === true);
        if (published) {
          blockers.push(`untranslated field on published record: ${col.name}/${e.slug} -> ${p.field}`);
        }
      }
    }
  }
  section('Missing Burmese translations (my: null)  [LANG-08]', PRD.burmese, lines);
}

/* ---------- 2..5 menu-item gaps ---------- */
{
  const noPrice = [];
  const unverified = [];
  const noImage = [];
  const draft = [];
  for (const e of menuItems.entries) {
    const d = e.data;
    const pub = d.status === 'published';
    const tag = pub ? red(' [PUBLISHED]') : '';
    if (d.price === null || d.price === undefined) {
      noPrice.push(`menu-items/${e.slug}   priceContext=${d.priceContext ?? 'unset'}${tag}`);
      if (pub) blockers.push(`published menu item with no price: menu-items/${e.slug}`);
    }
    if (d.verified !== true) {
      unverified.push(`menu-items/${e.slug}   sourceNote=${d.sourceNote ? JSON.stringify(d.sourceNote) : 'none'}${tag}`);
      if (pub) blockers.push(`published menu item not client-verified: menu-items/${e.slug}`);
    }
    if (!d.image || !d.image.src) noImage.push(`menu-items/${e.slug}${tag}`);
    if (d.status === 'draft') draft.push(`menu-items/${e.slug}`);
  }
  section('Menu items with no published price (price: null)  [MENU-02]', PRD.price, noPrice);
  section('Menu items not client-verified (verified: false)  [R-20]', PRD.price, unverified);
  section('Menu items with no image', PRD.assets, noImage);
  section('Menu items still in draft status', PRD.none, draft);
}

/* ---------- 6. branch gaps ---------- */
{
  const checks = [
    {
      title: 'Branches with no phone number',
      slot: PRD.phone,
      test: (d) => !Array.isArray(d.phone) || d.phone.length === 0,
      what: 'phone',
    },
    {
      title: 'Branches with no opening hours',
      slot: PRD.hours,
      test: (d) => !Array.isArray(d.openingHours) || d.openingHours.length === 0,
      what: 'opening hours',
    },
    {
      title: 'Branches with no Foodpanda URL (no Order CTA renders)',
      slot: PRD.foodpanda,
      test: (d) => !d.foodpandaUrl,
      what: 'Foodpanda URL',
    },
    {
      title: 'Branches with no Google Place ID',
      slot: PRD.placeId,
      test: (d) => !d.googlePlaceId,
    },
    {
      title: 'Branches with no latitude/longitude',
      slot: PRD.placeId,
      test: (d) =>
        d.latitude === null || d.latitude === undefined ||
        d.longitude === null || d.longitude === undefined,
    },
    {
      title: 'Branches with no exterior photo',
      slot: PRD.assets,
      test: (d) =>
        !Array.isArray(d.images) || !d.images.some((i) => i && i.kind === 'exterior' && i.src),
    },
    {
      title: 'Branches with unconfirmed dine-in status (hasDineIn: null)',
      slot: PRD.dineIn,
      test: (d) => d.hasDineIn === null || d.hasDineIn === undefined,
    },
  ];

  for (const chk of checks) {
    const lines = [];
    for (const e of branches.entries) {
      if (!chk.test(e.data)) continue;
      const pub = e.data.isPublished === true;
      lines.push(`branches/${e.slug}${pub ? red(' [PUBLISHED]') : ''}`);
      if (chk.what && pub) {
        blockers.push(`published branch missing ${chk.what}: branches/${e.slug}`);
      }
    }
    section(chk.title, chk.slot, lines);
  }
}

/* ---------- 7. site-level unresolved slots ---------- */
{
  const lines = [];
  if (siteError) {
    lines.push(`site.config.mjs could not be read -> ${siteError}   ${dim(`[${PRD.none}]`)}`);
    blockers.push(`site.config.mjs could not be read: ${siteError}`);
  } else {
    const siteChecks = [
      ['origin not confirmed (originResolved: false)', SITE.originResolved === false, PRD.dns],
      ['Instagram handle unknown (social.instagram: null)', SITE.social?.instagram === null, PRD.social],
      ['TikTok handle unknown (social.tiktok: null)', SITE.social?.tiktok === null, PRD.social],
      ['no analytics provider configured (analytics.provider: null)', SITE.analytics?.provider === null, PRD.none],
    ];
    for (const [label, failed, slot] of siteChecks) {
      if (failed) lines.push(`site.config -> ${label}   ${dim(`[${slot}]`)}`);
    }
  }
  section('Site-level unresolved slots', PRD.none, lines);
}

/* ---------- render ---------- */
for (const s of sections) {
  if (s.lines.length === 0) {
    out(`${green('OK  ')} ${s.title} ${dim(`- none  [${s.slot}]`)}`);
    continue;
  }
  out();
  out(`${yellow('GAP ')} ${bold(s.title)}  ${cyan(`(${s.lines.length})`)}  ${dim(`[${s.slot}]`)}`);
  for (const l of s.lines) out(`       ${l}`);
}

out();
rule('=');

/* Slots no content file can answer  surfaced so they are not forgotten. */
out(
  dim(
    `Not tracked in content, still open: review scores [${PRD.reviews}], ` +
      `canonical brand name sign-off [${PRD.brandName}]`
  )
);
out();
out(bold(`TOTAL GAPS: ${totalGaps}`));

if (!LIVE) {
  out(dim('Mode is audit - exiting 0. Run with CONTENT_MODE=live to gate on launch blockers.'));
  out();
  process.exit(0);
}

const unique = [...new Set(blockers)];
if (unique.length === 0) {
  out(green('LIVE CHECK PASSED - no launch-blocking gaps remain.'));
  out();
  process.exit(0);
}

out();
out(red(bold(`LAUNCH BLOCKED - ${unique.length} blocking gap(s) under CONTENT_MODE=live:`)));
for (const b of unique) out(red(`  x ${b}`));
out();
out(dim('Fix these, or run without CONTENT_MODE=live to build with known gaps.'));
out();
process.exit(1);
