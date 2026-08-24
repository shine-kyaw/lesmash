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
  /**
   * C-01 — the line across the hero.
   *
   * Interim agency wording, in place so the page reads as finished while the
   * client decides. It states nothing that needs checking: no weights, no
   * dates, no sourcing, no founder story. Replace it freely.
   */
  heroLine: slot(
    'C-01',
    'agency draft, client approve',
    'The line across the hero. Eight words at most. It has to be true.',
    'Pressed thin. Served hot.'
  ),
  heroPositioning: slot(
    'C-01',
    'agency draft, client approve',
    'One sentence under the hero, twenty words at most. Must be verifiable.',
    'A French-leaning burger house in Yangon, with two rooms and one way of cooking a patty.'
  ),

  /** C-02 — three proof points. Must be true and verifiable. */
  proofPoints: {
    ref: 'C-02',
    owner: 'client' as const,
    note: 'Three proof points, six words each. Each one must be a fact you can stand behind.',
    value: [] as string[],
  },

  /**
   * C-08 — the flagship expectation-setting copy.
   *
   * Interim wording. It describes the smash method, which is true of the
   * technique itself, and stops short of anything only the kitchen can
   * confirm: no gram weights, no cooking times, no beef origin. Those are the
   * details worth adding, and they are what will make this paragraph land.
   */
  howWeSmash: slot(
    'C-08',
    'agency draft, client approve',
    'Add the specifics only the kitchen knows: the ball weight, the time on the plancha, how many patties come in each burger. Those numbers are what make this paragraph worth reading. The last sentence also commits the site to honest photography — it cannot stand while the stills in public/media are social crops rather than a real shoot.',
    'A smash burger is thin on purpose. A ball of beef hits a hot plancha and is pressed flat — once, hard — and that press is what builds the dark, lacy crust around the edge. Two thin patties eat differently from one thick one: more crust, more seasoning, more of the part people came for. It is a technique, not a size. So every burger here tells you its patty count before you order, and every picture shows the plate as it leaves the pass.'
  ),

  /** C-10 — brand story. */
  story: slot(
    'C-10',
    'client',
    'Two hundred words on where Le SMASH came from. No founder story, opening date, award, sourcing claim or certification will be written for you.'
  ),

  /**
   * C-11 — the public commitment to accurate representation.
   *
   * Interim wording, and the most important paragraph on the site: it is the
   * promise the whole project is built to keep. Only publish it once the
   * photography actually honours it.
   */
  portionHonesty: slot(
    'C-11',
    'agency draft, client approve',
    'Do not publish this until the photography honours it. A promise the pictures break is worse than no promise.',
    'Every photograph here is the portion you are served, plated the way the kitchen plates it during service. Nothing is built taller for the camera, and nothing is in the frame that is not in the price. If a burger comes with two patties, you can count two patties in the picture.'
  ),

  /** C-07 — dine-in vs Foodpanda price context. Blocked on Q5. */
  priceContext: slot(
    'C-07',
    'client',
    'Whether published prices are dine-in or delivery, and whether the two differ.',
    'Prices are not published here yet. Ask in store for the current price.'
  ),

  /** C-14 — agency-authored, factual, ready. */
  orderExplainer: slot(
    'C-14',
    'agency',
    'Explains that delivery runs through Foodpanda.',
    'Delivery runs through Foodpanda. Pick your branch and we will take you straight to its listing.'
  ),
} as const;
