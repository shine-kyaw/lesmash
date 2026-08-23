#!/usr/bin/env node
/**
 * scripts/check-budgets.mjs
 *
 * Enforces the PRD 21.2 performance budgets against the built `dist/` output,
 * and the PRD 21.x rule of ZERO third-party render-blocking requests.
 *
 * For every HTML page in dist/ this walks the markup and accounts for:
 *   - the HTML document itself (raw + gzipped)
 *   - every same-origin <script src>       (gzipped)
 *   - every inline <script> body            (gzipped)
 *   - every same-origin <link rel=stylesheet> (gzipped)
 *   - every inline <style> body             (gzipped)
 *   - every font file referenced by url() from any of that CSS (raw bytes:
 *     woff2/woff are already compressed, so gzipping them again is meaningless)
 *
 * BUDGETS
 *   FAIL  JS per page     <=  75 KB gzipped
 *   FAIL  CSS per page    <=  30 KB gzipped
 *   FAIL  Fonts per page  <= 150 KB raw
 *   WARN  Total transfer  <= 500 KB for `/` and `/my`
 *                         <= 800 KB for `/menu` and `/my/menu`
 *                         <= 600 KB for every other page
 *   WARN  any <script src> or <link href> pointing at a third-party origin
 *
 * "Total transfer" is the sum of gzipped HTML + gzipped JS + gzipped CSS + raw
 * fonts, i.e. the initial render-blocking payload as the browser receives it
 * over a compressing connection. Images are lazy/responsive and out of scope.
 *
 * EXIT CODES
 *   1  any FAIL (a hard budget was exceeded)
 *   0  clean, or warnings only, or dist/ does not exist yet (so this is safe to
 *      run before a build without blowing up)
 *
 * Usage:  node scripts/check-budgets.mjs
 *
 * Zero dependencies  Node built-ins only.
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

/* ---------- output helpers (degrade to plain text when not a TTY) ---------- */
const TTY = Boolean(process.stdout.isTTY);
const paint = (code) => (s) => (TTY ? `\u001b[${code}m${s}\u001b[0m` : String(s));
const bold = paint('1');
const dim = paint('2');
const red = paint('31');
const yellow = paint('33');
const green = paint('32');

const out = (s = '') => process.stdout.write(`${s}\n`);
const rule = (ch = '-', n = 86) => out(dim(ch.repeat(n)));

/* ---------- budgets (PRD 21.2) ---------- */
const KB = 1024;
const BUDGET_JS_GZ = 75 * KB;
const BUDGET_CSS_GZ = 30 * KB;
const BUDGET_FONTS = 150 * KB;

function transferBudget(route) {
  if (route === '/' || route === '/my') return 500 * KB;
  if (route === '/menu' || route === '/my/menu') return 800 * KB;
  return 600 * KB;
}

const fmtKB = (b) => `${(b / KB).toFixed(1)}KB`;

/* ---------- own origin, for third-party detection ---------- */
const SELF_HOSTS = new Set(['localhost', '127.0.0.1']);
try {
  const { SITE } = await import(pathToFileURL(path.join(ROOT, 'src', 'lib', 'site.config.mjs')).href);
  if (SITE?.origin) {
    const h = new URL(SITE.origin).host;
    SELF_HOSTS.add(h);
    // Treat the www/apex pair as the same origin: the canonical host is still
    // unresolved (DS-08 / Q10) and either may appear in built markup.
    SELF_HOSTS.add(h.startsWith('www.') ? h.slice(4) : `www.${h}`);
  }
} catch {
  /* site.config is optional here  without it, every absolute URL is third-party */
}

/* ---------- dist/ presence ---------- */
try {
  const s = await stat(DIST);
  if (!s.isDirectory()) throw new Error('not a directory');
} catch {
  out();
  out(bold('Performance budgets (PRD 21.2)'));
  out(`${dim('dist/ not found at')} ${DIST}`);
  out('Nothing to check yet - run a build first (npm run build:only), then re-run this script.');
  out();
  process.exit(0);
}

/* ---------- walk dist/ for HTML pages ---------- */
async function walk(dir, acc = []) {
  let items;
  try {
    items = await readdir(dir, { withFileTypes: true });
  } catch {
    return acc;
  }
  for (const it of items) {
    const p = path.join(dir, it.name);
    if (it.isDirectory()) await walk(p, acc);
    else if (it.isFile() && it.name.endsWith('.html')) acc.push(p);
  }
  return acc;
}

function routeOf(file) {
  let rel = path.relative(DIST, file).split(path.sep).join('/');
  rel = rel.replace(/index\.html$/, '').replace(/\.html$/, '');
  rel = rel.replace(/\/$/, '');
  return `/${rel}`.replace(/^\/+/, '/');
}

/* ---------- tiny HTML attribute reader ---------- */
function attr(attrs, name) {
  const m =
    attrs.match(new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i')) ||
    attrs.match(new RegExp(`\\b${name}\\s*=\\s*'([^']*)'`, 'i')) ||
    attrs.match(new RegExp(`\\b${name}\\s*=\\s*([^\\s>]+)`, 'i'));
  return m ? m[1] : null;
}

/**
 * Resolve a markup reference to something we can weigh.
 * Returns one of: {kind:'file', file}, {kind:'third-party', host}, {kind:'data'},
 * {kind:'skip'}.
 */
function resolveRef(ref, pageFile) {
  if (!ref) return { kind: 'skip' };
  const t = ref.trim();
  if (t === '' || t.startsWith('#')) return { kind: 'skip' };
  if (t.startsWith('data:')) return { kind: 'data', bytes: Buffer.byteLength(t, 'utf8') };

  const isProtocolRelative = t.startsWith('//');
  if (isProtocolRelative || /^[a-z][a-z0-9+.-]*:/i.test(t)) {
    let u;
    try {
      u = new URL(isProtocolRelative ? `https:${t}` : t);
    } catch {
      return { kind: 'skip' };
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return { kind: 'skip' };
    if (!SELF_HOSTS.has(u.host)) return { kind: 'third-party', host: u.host };
    return { kind: 'file', file: path.join(DIST, decodeURIComponent(u.pathname)) };
  }

  const clean = decodeURIComponent(t.replace(/[?#].*$/, ''));
  const file = clean.startsWith('/')
    ? path.join(DIST, clean)
    : path.resolve(path.dirname(pageFile), clean);
  // Never read outside dist/.
  if (!file.startsWith(DIST + path.sep) && file !== DIST) return { kind: 'skip' };
  return { kind: 'file', file };
}

const FONT_RE = /\.(woff2|woff|ttf|otf|eot)$/i;

async function readBytes(file) {
  try {
    return await readFile(file);
  } catch {
    return null;
  }
}

/* ---------- per-page analysis ---------- */
async function analyse(pageFile) {
  const route = routeOf(pageFile);
  const htmlBuf = (await readBytes(pageFile)) ?? Buffer.alloc(0);
  const html = htmlBuf.toString('utf8');

  const page = {
    route,
    file: path.relative(ROOT, pageFile),
    htmlRaw: htmlBuf.length,
    htmlGz: gzipSync(htmlBuf).length,
    jsGz: 0,
    cssGz: 0,
    fonts: 0,
    thirdParty: [],
    missing: [],
  };

  const seen = new Set(); // one file counted once per page
  const cssSources = []; // { text, baseFile } for font url() resolution

  // --- <script> ---
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = scriptRe.exec(html)) !== null) {
    const [, attrs, body] = m;
    const type = (attr(attrs, 'type') || '').toLowerCase();
    // Non-executable payloads (JSON-LD etc.) ride inside the HTML, already counted.
    const isData = type && !/javascript|module/.test(type);
    const src = attr(attrs, 'src');
    if (src) {
      const r = resolveRef(src, pageFile);
      if (r.kind === 'third-party') {
        page.thirdParty.push(`<script src> ${r.host} (${src})`);
      } else if (r.kind === 'file' && !seen.has(r.file)) {
        seen.add(r.file);
        const buf = await readBytes(r.file);
        if (buf) page.jsGz += gzipSync(buf).length;
        else page.missing.push(src);
      }
    } else if (body.trim() && !isData) {
      page.jsGz += gzipSync(Buffer.from(body, 'utf8')).length;
    }
  }

  // --- <link> ---
  const linkRe = /<link\b([^>]*)>/gi;
  while ((m = linkRe.exec(html)) !== null) {
    const attrs = m[1];
    const rel = (attr(attrs, 'rel') || '').toLowerCase();
    const href = attr(attrs, 'href');
    if (!href) continue;
    const r = resolveRef(href, pageFile);
    if (r.kind === 'third-party') {
      page.thirdParty.push(`<link rel="${rel || 'unknown'}"> ${r.host} (${href})`);
      continue;
    }
    if (r.kind !== 'file') continue;

    if (rel.split(/\s+/).includes('stylesheet')) {
      if (seen.has(r.file)) continue;
      seen.add(r.file);
      const buf = await readBytes(r.file);
      if (!buf) {
        page.missing.push(href);
        continue;
      }
      page.cssGz += gzipSync(buf).length;
      cssSources.push({ text: buf.toString('utf8'), baseFile: r.file });
    } else if (FONT_RE.test(r.file)) {
      // A directly preloaded font counts against the font budget too.
      if (seen.has(r.file)) continue;
      seen.add(r.file);
      const buf = await readBytes(r.file);
      if (buf) page.fonts += buf.length;
      else page.missing.push(href);
    }
  }

  // --- inline <style> ---
  const styleRe = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  while ((m = styleRe.exec(html)) !== null) {
    const body = m[1];
    if (!body.trim()) continue;
    page.cssGz += gzipSync(Buffer.from(body, 'utf8')).length;
    cssSources.push({ text: body, baseFile: pageFile });
  }

  // --- fonts referenced from CSS ---
  const urlRe = /url\(\s*(['"]?)([^'")]+)\1\s*\)/gi;
  for (const src of cssSources) {
    let u;
    while ((u = urlRe.exec(src.text)) !== null) {
      const ref = u[2].trim();
      if (!FONT_RE.test(ref.replace(/[?#].*$/, ''))) continue;
      const r = resolveRef(ref, src.baseFile);
      if (r.kind === 'third-party') {
        page.thirdParty.push(`css url() font ${r.host} (${ref})`);
        continue;
      }
      if (r.kind !== 'file' || seen.has(r.file)) continue;
      seen.add(r.file);
      const buf = await readBytes(r.file);
      if (buf) page.fonts += buf.length;
      else page.missing.push(ref);
    }
  }

  page.total = page.htmlGz + page.jsGz + page.cssGz + page.fonts;
  page.transferBudget = transferBudget(route);
  page.fails = [];
  page.warns = [];
  if (page.jsGz > BUDGET_JS_GZ) {
    page.fails.push(`JS ${fmtKB(page.jsGz)} gz > ${fmtKB(BUDGET_JS_GZ)} budget`);
  }
  if (page.cssGz > BUDGET_CSS_GZ) {
    page.fails.push(`CSS ${fmtKB(page.cssGz)} gz > ${fmtKB(BUDGET_CSS_GZ)} budget`);
  }
  if (page.fonts > BUDGET_FONTS) {
    page.fails.push(`fonts ${fmtKB(page.fonts)} > ${fmtKB(BUDGET_FONTS)} budget`);
  }
  if (page.total > page.transferBudget) {
    page.warns.push(`total ${fmtKB(page.total)} > ${fmtKB(page.transferBudget)} budget`);
  }
  for (const tp of page.thirdParty) {
    page.warns.push(`third-party render-blocking request: ${tp}`);
  }
  for (const mi of page.missing) {
    page.warns.push(`referenced asset not found in dist/: ${mi}`);
  }
  return page;
}

/* ---------- run ---------- */
const files = (await walk(DIST)).sort();

out();
out(bold('Performance budgets (PRD 21.2)'));
out(dim(`dist: ${DIST}    pages: ${files.length}`));
rule('=');

if (files.length === 0) {
  out('No HTML pages found in dist/ — nothing to check.');
  out();
  process.exit(0);
}

const pages = [];
for (const f of files) pages.push(await analyse(f));

/* ---------- table ---------- */
const routeWidth = Math.min(40, Math.max(6, ...pages.map((p) => p.route.length)));
const head =
  'route'.padEnd(routeWidth) +
  '  ' + 'HTML'.padStart(9) +
  '  ' + 'HTMLgz'.padStart(9) +
  '  ' + 'JSgz'.padStart(9) +
  '  ' + 'CSSgz'.padStart(9) +
  '  ' + 'fonts'.padStart(9) +
  '  ' + 'total'.padStart(9) +
  '  ' + 'budget'.padStart(8) +
  '  status';
out(bold(head));
rule('-', head.length);

for (const p of pages) {
  const status = p.fails.length ? red('FAIL') : p.warns.length ? yellow('WARN') : green('ok');
  const cell = (v, over) => {
    const s = fmtKB(v).padStart(9);
    return over ? red(s) : s;
  };
  out(
    (p.route.length > routeWidth ? `${p.route.slice(0, routeWidth - 1)}…` : p.route.padEnd(routeWidth)) +
      '  ' + fmtKB(p.htmlRaw).padStart(9) +
      '  ' + fmtKB(p.htmlGz).padStart(9) +
      '  ' + cell(p.jsGz, p.jsGz > BUDGET_JS_GZ) +
      '  ' + cell(p.cssGz, p.cssGz > BUDGET_CSS_GZ) +
      '  ' + cell(p.fonts, p.fonts > BUDGET_FONTS) +
      '  ' + cell(p.total, p.total > p.transferBudget) +
      '  ' + fmtKB(p.transferBudget).padStart(8) +
      '  ' + status
  );
}

/* ---------- detail ---------- */
const failing = pages.filter((p) => p.fails.length);
const warning = pages.filter((p) => p.warns.length);

if (warning.length) {
  out();
  out(bold('Warnings'));
  for (const p of warning) for (const w of p.warns) out(`  ${yellow('WARN')} ${p.route}  ${w}`);
}

if (failing.length) {
  out();
  out(bold('Failures'));
  for (const p of failing) for (const f of p.fails) out(`  ${red('FAIL')} ${p.route}  ${f}`);
}

out();
rule('=');
const warnCount = pages.reduce((n, p) => n + p.warns.length, 0);
const failCount = pages.reduce((n, p) => n + p.fails.length, 0);
out(
  bold(
    `${pages.length} page(s) checked - ${failCount} failure(s), ${warnCount} warning(s)`
  )
);

if (failCount > 0) {
  out(red('BUDGET CHECK FAILED — a hard PRD 21.2 budget was exceeded.'));
  out();
  process.exit(1);
}
out(green(warnCount > 0 ? 'Budgets held (warnings only).' : 'All budgets held.'));
out();
process.exit(0);
