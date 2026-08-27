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

  // The brief asks Franchise to route to an enquiry form or a contact email. A
  // mailto needs no backend, no spam handling and no privacy notice, which is
  // the right trade for a section expecting a handful of enquiries a year.
  //
  // Null until the client gives us the address. It is deliberately NOT guessed
  // from the domain: a franchise enquiry that bounces is worse than a section
  // that admits it is not wired up yet, and the button is not rendered at all
  // while this is null.
  franchiseEmail: null,

  /**
   * The number on the client's own Facebook page, verified there twice. Held at
   * brand level rather than on a branch because that page is brand-level: which
   * room it actually rings is not stated anywhere public, so attributing it to
   * one would be a guess. Both branch records still have empty `phone` arrays,
   * so no branch card claims it.
   *
   * `display` is exactly as they publish it. `e164` is the mechanical
   * conversion for the tel: link — drop the trunk 0, prepend +95.
   */
  phone: {
    display: '09 758 542661',
    e164: '+959758542661',
    source: 'facebook.com/eatlesmash',
    reachesBranch: null,
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
