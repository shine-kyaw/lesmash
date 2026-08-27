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
    'American flavour. French precision. Yangon-born. Three rooms, five kitchens — and counting.'
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
    'Add the specifics only the kitchen knows: the ball weight, the time on the plancha, and how many patties come in each burger. Those numbers are what make this paragraph worth reading, and the patty count is the one fact the old copy promised and the menu cannot yet show.',
    'A smash burger is thin on purpose. A ball of beef hits a hot plancha and is pressed flat — once, hard — and that press is what builds the dark, lacy crust around the edge. Two thin patties eat differently from one thick one: more crust, more seasoning, more of the part people came for. It is a technique, not a size.'
  ),

  /**
   * C-15 — the founding. The brief says the founded year "must be included",
   * and it is exactly the kind of fact that must come from the client: a wrong
   * year on an About page is the sort of error that outlives the project.
   */
  founding: slot(
    'C-15',
    'client',
    'The founded year, which the brief says must appear, plus who started Le SMASH and why. No date, founder or origin story will be written for you.'
  ),

  /**
   * C-16 — what is next. Sits under "three rooms, and counting", so it needs
   * to be true about actual plans rather than aspirational.
   */
  future: slot(
    'C-16',
    'client',
    'Where Le SMASH is going: rooms planned, kitchens opening, anything already committed. Nothing speculative.'
  ),

  /**
   * C-17 — the franchise invitation. The brief asks for a tone that is
   * "selective and professional rather than like an open sales advertisement",
   * which is why this is three sentences and an email rather than a pitch.
   */
  franchise: slot(
    'C-17',
    'agency draft, client approve',
    'Confirm the invitation and who it is aimed at. Anything about investment level, territory or support belongs in the private follow-up, not here.',
    'Le SMASH is open to conversations with partners who want to bring a room to a new city. We are looking for operators who care about the food as much as the numbers, and we would rather have one good conversation than fifty enquiries.'
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

  /**
   * C-07 — the standfirst on the menu page.
   *
   * Prices are absent by decision, not omission: the brief states the menu can
   * be displayed without them and that the site is not an ordering channel. So
   * this says what the menu IS rather than apologising for what it lacks.
   */
  priceContext: slot(
    'C-07',
    'agency draft, client approve',
    'Confirm this framing. If prices should appear after all, that is a schema field and a card row, not a rebuild — but the brief says otherwise.',
    'The dishes Le SMASH is known for, without prices. Ask in the room, or on delivery, for what anything costs today.'
  ),

  /** C-14 — agency-authored, factual, ready. */
  orderExplainer: slot(
    'C-14',
    'agency',
    'Explains that delivery runs through Foodpanda.',
    'Delivery runs through Foodpanda. Pick your branch and we will take you straight to its listing.'
  ),
} as const;
