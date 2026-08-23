/**
 * Bundle the built site into one self-contained page.
 *
 * The client needs to click through the site before it is hosted anywhere.
 * This takes dist/ and folds all 21 routes into a single HTML document with
 * hash routing, so the real navigation — header, footer, sticky bar, language
 * toggle — all still work.
 *
 * It is a preview harness, not a build target. It ships nothing to customers,
 * and the deployable artefact remains dist/.
 *
 *   node scripts/build-preview-artifact.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const OUT = join(ROOT, 'preview', 'lesmash-preview.html');

if (!existsSync(DIST)) {
  console.error('dist/ not found — run `npm run build` first.');
  process.exit(1);
}

/* ------------------------------------------------------ collect routes ---- */

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (entry.endsWith('.html')) out.push(p);
  }
  return out;
}

const files = walk(DIST).sort();
const routes = files.map((file) => {
  const rel = '/' + relative(DIST, file).replace(/\\/g, '/');
  const route = rel === '/404.html' ? '/404' : rel.replace(/\/index\.html$/, '') || '/';
  return { file, route };
});

/* ------------------------------------- shared stylesheet + inlined font ---- */

const first = readFileSync(routes[0].file, 'utf8');
let css = /<style>([\s\S]*?)<\/style>/.exec(first)?.[1] ?? '';

// The font must travel inside the document: the artifact host blocks requests
// to anything but its own origin, and there is no /fonts/ path there.
const fontPath = join(ROOT, 'public/fonts/noto-myanmar-400.woff2');
if (existsSync(fontPath)) {
  const b64 = readFileSync(fontPath).toString('base64');
  css = css.replace(
    /url\(\/fonts\/noto-myanmar-400\.woff2\)/g,
    `url(data:font/woff2;base64,${b64})`
  );
}

const appJs = readFileSync(join(ROOT, 'public/scripts/app.js'), 'utf8');

/* ------------------------------------------------------- rewrite a page ---- */

const knownRoutes = new Set(routes.map((r) => r.route));

function extractBody(html) {
  const open = html.indexOf('<body>');
  const close = html.lastIndexOf('</body>');
  let body = html.slice(open + 6, close);

  // Strip the per-page copies of the shared stylesheet and the script tag;
  // both are hoisted to the document once.
  body = body.replace(/<style>[\s\S]*?<\/style>/g, '');
  body = body.replace(/<script[^>]*src="\/scripts\/app\.js"[^>]*><\/script>/g, '');

  // Internal links become hash routes. External links, tel:, mailto: and
  // in-page anchors are left exactly as they are — the point of the preview is
  // that the real Foodpanda and Maps links still behave like the real thing.
  body = body.replace(/href="(\/[^"#]*)"/g, (match, href) => {
    const clean = href.replace(/\/$/, '') || '/';
    if (!knownRoutes.has(clean)) return match; // favicon, sitemap, assets
    return `href="#${clean}"`;
  });

  return body;
}

const sections = routes
  .map(({ file, route }) => {
    const body = extractBody(readFileSync(file, 'utf8'));
    const lang = route === '/my' || route.startsWith('/my/') ? 'my' : 'en';
    return `<div class="route" data-route="${route}" lang="${lang}" hidden>${body}</div>`;
  })
  .join('\n');

/* ------------------------------------------------------------- document ---- */

const router = `
/*
 * Hash router for the preview only.
 *
 * Each route is a complete copy of that page's real markup, so switching
 * routes is a show/hide, and the site's own header, footer and sticky bar keep
 * working untouched. app.js is re-run after each switch because it binds to
 * elements inside the route that just became visible.
 */
(function () {
  var routes = Array.prototype.slice.call(document.querySelectorAll('.route'));
  var map = {};
  routes.forEach(function (el) { map[el.dataset.route] = el; });

  function currentRoute() {
    var hash = location.hash.replace(/^#/, '') || '/';
    return map[hash] ? hash : (map['/404'] ? '/404' : '/');
  }

  function show() {
    var route = currentRoute();
    routes.forEach(function (el) { el.hidden = el.dataset.route !== route; });
    document.documentElement.setAttribute('lang', map[route].getAttribute('lang'));
    window.scrollTo(0, 0);
    if (window.__lesmashBoot) window.__lesmashBoot();
  }

  window.addEventListener('hashchange', show);
  show();
})();
`;

const html = `<title>Le SMASH Yangon</title>
<style>
${css}

/* --- preview harness ---------------------------------------------------- */
/* The site is a committed light design; the harness paints the same ground so
   the page holds regardless of the viewer's theme. */
html, body { background: var(--paper); color: var(--ink); }
body { margin: 0; }
.route[hidden] { display: none; }
</style>

${sections}

<script>${appJs}</script>
<script>${router}</script>
`;

writeFileSync(OUT, html);
console.log(
  `preview: ${routes.length} routes -> ${OUT} (${(html.length / 1024).toFixed(0)}KB)`
);
