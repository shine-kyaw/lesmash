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
    'Le SMASH Burgers & Co. Smash burgers in Yangon: American flavour, French precision, three rooms, five kitchens. Menu, photos and where to find us.',
  menu:
    'The full Le SMASH menu in Yangon: burgers, brunch, mains, salads, snacks, drinks and cocktails.',
  gallery:
    'Le SMASH posters, pop-ups, parties and plates, plus the rooms, the kitchen and the collabs.',
  story:
    'How Le SMASH got going in Yangon: pop-ups and bazaars, the Junction Square opening, then a new room.',
  collaborations:
    'Pop-ups, parties and projects Le SMASH has done in Yangon with Blind Tiger, Britto’s, TagU, RTH, Ellie’s, Ah-so and Ar-T.',
  merch:
    'Le SMASH merch: graphic tees, the YGN jersey, a tote, mugs and cups.',
  visit:
    'Find Le SMASH in Yangon: both rooms, where we deliver, and the crew behind the grill.',
  notFound:
    'Wrong turn. Head to the Le SMASH menu or back to the home page.',
};
