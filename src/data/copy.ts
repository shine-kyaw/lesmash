/**
 * Interface strings.
 *
 * These are UI labels the agency may author. Anything that makes a claim about
 * the business lives in src/data/editorial.ts and stays empty until the client
 * supplies it (PRD §17.1).
 */
export const COPY = {
  nav: { home: 'Home', menu: 'Menu' },
  cta: {
    menu: 'See the menu',
    directions: 'Directions',
    call: 'Call',
  },
  state: {
    priceUnset: 'Ask in store',
    unavailable: 'Off the menu',
    soldOut: 'Sold out today',
    hoursUnknown: 'Hours not yet published',
    unconfirmed: 'Not yet confirmed',
    pending: 'Unconfirmed',
  },
  labels: {
    patty: (n: number) => (n === 1 ? 'Single patty' : n === 2 ? 'Double patty' : `${n} patties`),
    spice: 'Spice',
    dineIn: 'Dine-in',
    delivery: 'Delivery',
    takeaway: 'Takeaway',
    skip: 'Skip to content',
    branches: 'Branches',
    scroll: 'Scroll',
  },
  spice: { none: 'Not spicy', mild: 'Mild', medium: 'Medium', hot: 'Hot' },
  footer: {
    delivery: 'Delivery is handled by Foodpanda.',
    follow: 'Follow',
    rights: 'All rights reserved.',
  },
} as const;
