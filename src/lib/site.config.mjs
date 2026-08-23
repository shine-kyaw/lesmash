/**
 * Single source of truth for site-level constants.
 *
 * Values marked DS-xx correspond to the PRD §0.2 data slots. Anything still
 * unresolved is `null` — never a guess. Nothing in this codebase invents a
 * value for a null slot; the UI degrades honestly instead (PRD §17.1).
 */

export const SITE = {
  // DS/Q10 — canonical domain is NOT yet decided (PRD §19.7, R-01).
  // This placeholder only affects absolute URLs in schema/sitemap/OG.
  // Change it in one place at DNS cutover (P9).
  origin: 'https://www.eatlesmash.com',
  originResolved: false,

  // Q11 — canonical brand strings. Proposed in PRD §19.7, pending client sign-off.
  brand: {
    legal: 'Le SMASH Burgers & Co.',
    display: 'Le SMASH',
    // "Le SMASH" is never transliterated into Burmese (PRD §16.5).
    displayMy: 'Le SMASH',
  },

  geoQualifier: { en: 'Yangon', my: 'ရန်ကုန်' },

  timeZone: 'Asia/Yangon', // UTC+06:30
  currency: 'MMK',

  // DS-06 — all three handles are @eatlesmash, confirmed from public search
  // result titles. The client should still confirm these are the accounts they
  // operate (there are look-alike "le_smashburger" accounts in circulation that
  // appear unrelated). A null here renders no link at all.
  social: {
    facebook: 'https://www.facebook.com/eatlesmash/',
    instagram: 'https://www.instagram.com/eatlesmash/',
    tiktok: 'https://www.tiktok.com/@eatlesmash',
  },

  // Q25 — numeral policy. 'western' | 'myanmar'. Applied sitewide, one policy.
  numerals: 'western',

  // Cookieless analytics endpoint (PRD §20.1). Null = no script is emitted at all.
  analytics: { provider: null, domain: null, src: null },

  locales: ['en', 'my'],
  defaultLocale: 'en',
};

export const LOCALES = SITE.locales;
export const DEFAULT_LOCALE = SITE.defaultLocale;
