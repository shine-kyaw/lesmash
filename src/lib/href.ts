/**
 * Internal links, base-path aware.
 *
 * GitHub Pages serves this site from /lesmash/ rather than the domain root, so
 * a hard-coded "/menu" would 404 there while working locally — the worst kind
 * of bug, because it only appears once deployed. Every internal link goes
 * through here; Astro rewrites BASE_URL per build.
 */
const BASE = import.meta.env.BASE_URL || '/';

export function href(path = '/'): string {
  if (/^(https?:|tel:|mailto:|#)/.test(path)) return path;
  const base = BASE.replace(/\/+$/, '');
  const clean = '/' + path.replace(/^\/+/, '');
  // In-page anchors on the current route keep their leading hash.
  if (clean === '/') return base || '/';
  return base + clean;
}

/** Same, for assets under public/ (fonts, scripts, media, icons). */
export const asset = href;
