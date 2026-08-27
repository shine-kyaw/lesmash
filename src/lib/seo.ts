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
  home:
    'Le SMASH Burgers & Co. — an American-flavoured, French-precision burger house born in Yangon. Three rooms, five kitchens. See the menu, the archive, and where to find us.',
  menu:
    'The full Le SMASH menu in Yangon — the burger collection, brunch, mains, salads, snacks, drinks and cocktails.',
  gallery:
    'The Le SMASH archive — campaigns, pop-ups, food and product photography, spaces, behind the scenes and collaborations.',
  visit:
    'Le SMASH locations in Yangon, where we deliver across the city, and how to start a franchise conversation.',
  notFound:
    'That page could not be found. Head to the Le SMASH menu or back to the home page.',
};
