/**
 * Single source of truth for site-level constants.
 *
 * Values marked DS-xx / Qx correspond to the PRD data slots and open client
 * questions. Anything still unresolved is `null` — never a guess. Nothing in
 * this codebase invents a value for a null slot; the UI degrades honestly.
 */
export const SITE = {
  // Q10 — canonical domain is NOT yet decided. This placeholder only affects
  // absolute URLs in schema, sitemap and OG tags. Change it at DNS cutover.
  origin: 'https://www.eatlesmash.com',
  originResolved: false,

  // Q11 — canonical brand strings, pending client sign-off.
  brand: {
    legal: 'Le SMASH Burgers & Co.',
    display: 'Le SMASH',
  },

  geo: 'Yangon',
  timeZone: 'Asia/Yangon', // UTC+06:30
  currency: 'MMK',

  // DS-06 — all three handles resolve to @eatlesmash, confirmed from public
  // search results. The client should still confirm they operate these
  // accounts. A null renders no link at all.
  social: {
    facebook: 'https://www.facebook.com/eatlesmash/',
    instagram: 'https://www.instagram.com/eatlesmash/',
    tiktok: 'https://www.tiktok.com/@eatlesmash',
  },

  // Cookieless analytics (PRD §20.1). Null = no script is emitted at all.
  analytics: { provider: null, domain: null, src: null },
};

export function absoluteUrl(path = '/') {
  return new URL(path, SITE.origin).toString().replace(/\/$/, '') || SITE.origin;
}
