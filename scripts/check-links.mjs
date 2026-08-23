#!/usr/bin/env node
/**
 * scripts/check-links.mjs
 *
 * Validates the outbound URLs the site hands to real customers:
 *   - every branch `foodpandaUrl`   (DS-07 / Q8 — the only Order CTA there is)
 *   - every branch `googleMapsUrl`  (DS-09 / Q26 — the Directions CTA)
 *   - the social profile URLs in src/lib/site.config.mjs (DS-06)
 *
 * A dead Order or Directions link is worse than no link at all, so these are
 * checked — but per PRD ORD-05 this script WARNS and never fails a build. It
 * ALWAYS exits 0. Outbound reachability depends on the network the build runs
 * on, and a CI egress policy must never be able to block a release.
 *
 * METHOD
 *   HEAD request, 10s timeout, redirects followed. Many CDNs answer HEAD with
 *   405 Method Not Allowed, so a 405 is retried as GET before being believed.
 *
 * CLASSIFICATION — this matters more than the checking itself
 *   OK          final status < 400
 *   BROKEN      a real 4xx/5xx from the destination. Loud. Fix before launch.
 *   BLOCKED     403, or 429. Ambiguous: Foodpanda and Google routinely refuse
 *               non-browser clients, and this environment's egress proxy also
 *               answers CONNECT with 403. Reported, but NOT called broken —
 *               crying wolf on these trains people to ignore the report.
 *   SKIPPED     the request never reached the destination: DNS failure,
 *   UNREACHABLE connection refused, TLS failure, proxy CONNECT rejection, or
 *               timeout. Explicitly NOT a 404 — nothing was learned about the
 *               URL, and it must be verified by hand.
 *   INVALID     the string in the content file is not a usable http(s) URL.
 *               That IS a content bug and is reported loudly.
 *
 * EXIT CODE
 *   0  always (PRD ORD-05).
 *
 * Usage:  node scripts/check-links.mjs
 *
 * Zero dependencies — Node built-ins only.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRANCH_DIR = path.join(ROOT, 'src', 'content', 'branches');
const TIMEOUT_MS = 10_000;
const CONCURRENCY = 4;

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
const rule = (ch = '-') => out(dim(ch.repeat(78)));

/* ---------- gather URLs ---------- */
const targets = []; // { url, source, slot }

async function collectBranches() {
  let names;
  try {
    names = await readdir(BRANCH_DIR);
  } catch {
    return { missing: true, count: 0 };
  }
  let count = 0;
  for (const n of names.sort()) {
    if (!n.endsWith('.json')) continue;
    const file = path.join(BRANCH_DIR, n);
    let data;
    try {
      data = JSON.parse(await readFile(file, 'utf8'));
    } catch (err) {
      out(`${yellow('WARN')} could not parse ${path.relative(ROOT, file)}: ${err.message}`);
      continue;
    }
    count++;
    const slug = data?.slug || n.replace(/\.json$/, '');
    if (data?.foodpandaUrl) {
      targets.push({ url: String(data.foodpandaUrl), source: `branches/${slug}.foodpandaUrl`, slot: 'DS-07 / Q8' });
    }
    if (data?.googleMapsUrl) {
      targets.push({ url: String(data.googleMapsUrl), source: `branches/${slug}.googleMapsUrl`, slot: 'DS-09 / Q26' });
    }
  }
  return { missing: false, count };
}

async function collectSocial() {
  try {
    const { SITE } = await import(pathToFileURL(path.join(ROOT, 'src', 'lib', 'site.config.mjs')).href);
    for (const [k, v] of Object.entries(SITE?.social ?? {})) {
      if (v) targets.push({ url: String(v), source: `site.config.social.${k}`, slot: 'DS-06' });
    }
    return true;
  } catch (err) {
    out(`${yellow('WARN')} could not read src/lib/site.config.mjs: ${err.message}`);
    return false;
  }
}

/* ---------- checking ---------- */
const UA =
  'Mozilla/5.0 (compatible; LeSmashLinkCheck/1.0; +https://www.eatlesmash.com) Node/' +
  process.versions.node;

/**
 * Distinguish "the destination answered" from "we never got there".
 * Anything thrown by fetch is a transport failure — DNS, TLS, refused
 * connection, an egress proxy refusing CONNECT, or our own timeout. None of
 * those tell us anything about the URL itself.
 */
function transportReason(err) {
  const codes = [];
  for (let e = err; e; e = e.cause) {
    if (e.code) codes.push(e.code);
    if (e.name && e.name !== 'Error') codes.push(e.name);
    if (e === e.cause) break;
  }
  const joined = [...new Set(codes)].join('/');
  const msg = (err?.message || String(err)).replace(/\s+/g, ' ').trim();
  if (/abort|timeout|TimeoutError/i.test(joined) || /timed? ?out/i.test(msg)) {
    return `timeout after ${TIMEOUT_MS / 1000}s`;
  }
  if (/403/.test(msg) && /proxy|connect/i.test(msg)) return 'egress proxy refused CONNECT (403)';
  return joined ? `${joined}: ${msg}` : msg;
}

async function request(url, method) {
  return fetch(url, {
    method,
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': UA, accept: '*/*' },
  });
}

async function check(target) {
  let parsed;
  try {
    parsed = new URL(target.url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`unsupported protocol ${parsed.protocol}`);
    }
  } catch (err) {
    return { ...target, state: 'INVALID', detail: err.message };
  }

  let res;
  let method = 'HEAD';
  try {
    res = await request(target.url, 'HEAD');
    // Plenty of CDNs reject HEAD outright; retry before believing the status.
    if (res.status === 405 || res.status === 501) {
      method = 'GET';
      res = await request(target.url, 'GET');
    }
  } catch (err) {
    return { ...target, state: 'SKIPPED-UNREACHABLE', detail: transportReason(err) };
  }

  const finalUrl = res.url && res.url !== target.url ? res.url : null;
  const base = { ...target, status: res.status, method, finalUrl };

  if (res.status < 400) return { ...base, state: 'OK' };
  if (res.status === 403 || res.status === 429) {
    return {
      ...base,
      state: 'BLOCKED',
      detail:
        res.status === 403
          ? 'refused this client (bot protection or egress proxy) — verify by hand in a browser'
          : 'rate limited — verify by hand',
    };
  }
  return { ...base, state: 'BROKEN', detail: `destination returned ${res.status} ${res.statusText || ''}`.trim() };
}

async function runPool(items, worker, limit) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i]);
    }
  });
  await Promise.all(runners);
  return results;
}

/* ---------- run ---------- */
out();
out(bold('Outbound link check (PRD ORD-05 — warns, never fails)'));

const branchInfo = await collectBranches();
await collectSocial();

out(
  dim(
    `branches: ${branchInfo.missing ? 'no directory' : `${branchInfo.count} file(s)`}    ` +
      `urls to check: ${targets.length}    timeout: ${TIMEOUT_MS / 1000}s`
  )
);
rule('=');

if (targets.length === 0) {
  out();
  out(green('No outbound URLs in content yet — nothing to check.'));
  out(dim('Foodpanda URLs (DS-07/Q8), Google Maps URLs (DS-09/Q26) and socials (DS-06) are still unresolved.'));
  out();
  process.exit(0);
}

const results = await runPool(targets, check, CONCURRENCY);

const badge = {
  OK: green('OK       '),
  BROKEN: red('BROKEN   '),
  BLOCKED: yellow('BLOCKED  '),
  'SKIPPED-UNREACHABLE': cyan('SKIPPED  '),
  INVALID: red('INVALID  '),
};

out();
for (const r of results) {
  const status = r.status ? String(r.status) : '---';
  out(`${badge[r.state]} ${status.padStart(3)}  ${bold(r.source)}  ${dim(`[${r.slot}]`)}`);
  out(`          ${r.url}`);
  if (r.finalUrl) out(`          ${dim(`-> redirected to ${r.finalUrl}`)}`);
  if (r.detail) out(`          ${dim(r.detail)}`);
}

/* ---------- summary ---------- */
const by = (s) => results.filter((r) => r.state === s);
const broken = by('BROKEN');
const invalid = by('INVALID');
const blocked = by('BLOCKED');
const skipped = by('SKIPPED-UNREACHABLE');
const ok = by('OK');

out();
rule('=');
out(
  bold(
    `${results.length} checked   ` +
      `${ok.length} ok, ${broken.length} broken, ${invalid.length} invalid, ` +
      `${blocked.length} blocked, ${skipped.length} unreachable`
  )
);

if (broken.length || invalid.length) {
  out();
  out(red(bold('!! ATTENTION — these links are genuinely bad and face customers:')));
  for (const r of [...invalid, ...broken]) {
    out(red(`   x ${r.source}  ${r.url}`));
    out(red(`     ${r.status ? `${r.status} — ` : ''}${r.detail}`));
  }
  out(red(bold('   Fix these before launch. (Not failing the build — PRD ORD-05.)')));
}

if (blocked.length) {
  out();
  out(yellow(`${blocked.length} link(s) refused this client (403/429) — verify by hand, they may be fine:`));
  for (const r of blocked) out(yellow(`   ? ${r.source}  ${r.url}`));
}

if (skipped.length) {
  out();
  out(cyan(`${skipped.length} link(s) unreachable from this network — NOT a 404, nothing was proven:`));
  for (const r of skipped) out(cyan(`   - ${r.source}  ${r.url}  ${dim(r.detail)}`));
}

if (!broken.length && !invalid.length) {
  out();
  out(green('No confirmed broken links.'));
}
out();
process.exit(0);
