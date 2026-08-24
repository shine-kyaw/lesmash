import { SITE } from './site.config.mjs';

/**
 * Every title carries a geo qualifier without exception (PRD SEO-01). This
 * brand shares its name with an unrelated Dutch chain, and geo-qualification is
 * the main lever the site has for winning its own brand searches in Myanmar.
 */
export function title(pageTitle: string | null): string {
  if (!pageTitle) return `${SITE.brand.legal} — Smash Burgers in ${SITE.geo}`;
  return `${pageTitle} — ${SITE.brand.display}, ${SITE.geo}`;
}

export const DESCRIPTIONS: Record<string, string> = {
  home: 'Le SMASH Burgers & Co. smashes every patty to order in Yangon, with branches at Junction Square in Kamayut and Yankin. See the menu, find us, or order delivery.',
  menu: 'The full Le SMASH menu in Yangon — burgers, combos, breakfast, sides and shakes, listed with patty counts and portions so you know exactly what arrives.',
  notFound: 'That page could not be found. Head to the Le SMASH menu or back to the home page.',
};
