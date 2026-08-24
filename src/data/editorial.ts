/**
 * Editorial copy — every block here makes a claim about the business, so none
 * of it may be written by the agency (PRD §17.1: "No invented facts").
 *
 * Each slot carries its content-register reference and stays `null` until the
 * client supplies the text. A null slot renders a labelled placeholder in
 * preview builds and nothing at all in live builds. Either way the site never
 * states something unverified.
 */
export interface Slot {
  ref: string;
  owner: 'client' | 'agency draft, client approve' | 'agency';
  note: string;
  value: string | null;
}

const slot = (ref: string, owner: Slot['owner'], note: string, value: string | null = null): Slot =>
  ({ ref, owner, note, value });

export const EDITORIAL = {
  /** C-01 — the line across the hero. */
  heroLine: slot(
    'C-01',
    'agency draft, client approve',
    'The line across the hero. Eight words at most. It has to be true.',
    'Pressed once, hard.'
  ),
  heroPositioning: slot(
    'C-01',
    'agency draft, client approve',
    'One sentence under the hero, twenty words at most. Must be verifiable.'
  ),

  /** C-02 — three proof points. Must be true and verifiable. */
  proofPoints: {
    ref: 'C-02',
    owner: 'client' as const,
    note: 'Three proof points, six words each. Each one must be a fact you can stand behind.',
    value: [] as string[],
  },

  /** C-08 — the flagship expectation-setting copy. */
  howWeSmash: slot(
    'C-08',
    'agency draft, client approve',
    'What actually happens at the pass, in a hundred words or fewer: the press, the crust, and how big the finished burger really is. Client to confirm the kitchen detail before this goes live.',
    'A smash burger is thin on purpose. A ball of beef hits a hot plancha and is pressed flat — once, hard — and that press is what builds the dark, lacy crust around the edge. Two thin patties eat differently from one thick one: more crust, more seasoning, more of the part people came for. It is a technique, not a size. So every burger here tells you how many patties it holds before you order, and every photograph shows the plate as it leaves the pass.'
  ),

  /** C-10 — brand story. */
  story: slot(
    'C-10',
    'client',
    'Two hundred words on where Le SMASH came from. No founder story, opening date, award, sourcing claim or certification will be written for you.'
  ),

  /** C-11 — the public commitment to accurate representation. */
  portionHonesty: slot(
    'C-11',
    'agency draft, client approve',
    'Your public commitment that the photograph shows the portion actually served. Recommended, and the highest-value paragraph on the site.'
  ),

  /** C-07 — dine-in vs Foodpanda price context. Blocked on Q5. */
  priceContext: slot(
    'C-07',
    'client',
    'Whether published prices are dine-in or delivery, and whether the two differ.',
    'No prices are published on this site yet. Check the current price on Foodpanda, or ask in store.'
  ),

  /** C-14 — agency-authored, factual, ready. */
  orderExplainer: slot(
    'C-14',
    'agency',
    'Explains that delivery runs through Foodpanda.',
    'Delivery runs through Foodpanda. Pick your branch and we will take you straight to its listing.'
  ),
} as const;
