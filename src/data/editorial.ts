import type { Locale } from '../lib/i18n';

/**
 * Editorial copy — every block on this page makes a claim about the business,
 * so none of it may be written by the agency (PRD §17.1: "No invented facts").
 *
 * Each slot carries its content-register reference (C-xx) from PRD §17.2 and
 * stays `null` until the client supplies the text in writing. A null slot:
 *   - in preview builds, renders a visible, labelled placeholder;
 *   - in live builds (CONTENT_MODE=live), the block is omitted entirely.
 * Either way the site never states something unverified.
 */

export interface EditorialSlot {
  ref: string; // content register id (PRD §17.2)
  owner: 'client' | 'agency-draft-client-approve' | 'agency';
  note: string; // what is needed, for whoever fills it in
  value: Record<Locale, string | null>;
}

const slot = (
  ref: string,
  owner: EditorialSlot['owner'],
  note: string,
  value: Record<Locale, string | null> = { en: null, my: null }
): EditorialSlot => ({ ref, owner, note, value });

export const EDITORIAL = {
  /** C-01 — brand line (max 8 words) + positioning sentence (max 20 words). */
  heroLine: slot('C-01', 'agency-draft-client-approve', 'Brand line, max 8 words.'),
  heroPositioning: slot(
    'C-01',
    'agency-draft-client-approve',
    'One positioning sentence, max 20 words. Must be true and verifiable.'
  ),

  /** C-02 — three proof points. Must be true and verifiable; client supplies. */
  proofPoints: {
    ref: 'C-02',
    owner: 'client' as const,
    note: 'Three proof points, max 6 words each. Each must be a fact the client can stand behind.',
    value: { en: [] as string[], my: [] as string[] },
  },

  /** C-08 — the flagship expectation-setting copy (PRD §11.5). */
  howWeSmash: slot(
    'C-08',
    'agency-draft-client-approve',
    '100–150 words describing the actual smashing process, patty weight and how big a Le SMASH burger really is. Needs process detail from the kitchen before it can be drafted.'
  ),

  /** C-09 — breakfast intro. */
  breakfastIntro: slot(
    'C-09',
    'agency-draft-client-approve',
    '150–250 unique words. Cannot be finalised until breakfast service hours are confirmed (DS-01).'
  ),

  /** C-10 — brand story. No founder narrative, dates, awards or sourcing may be invented. */
  aboutStory: slot(
    'C-10',
    'client',
    '200–350 words. No founder story, opening date, awards, sourcing claims or certifications unless the client supplies them in writing.'
  ),

  /** C-11 — the brand's public commitment to accurate representation. */
  portionHonesty: slot(
    'C-11',
    'agency-draft-client-approve',
    "The brand's public commitment that photographs show the portion actually served."
  ),

  /** C-15 — seating / reservation policy (PRD §15.4). */
  seatingPolicy: slot(
    'C-15',
    'client',
    'Plain statement of the reservation policy and typical busy periods, so customers can self-select a quieter time.'
  ),

  /** C-07 — dine-in vs Foodpanda price context (MENU-13). Blocked on Q5. */
  priceContextStatement: slot(
    'C-07',
    'client',
    'Whether published prices are dine-in or delivery, and whether the two differ.',
    {
      en: 'Prices are not yet published on this site. Please check the current price on Foodpanda, or ask in store.',
      my: 'ဈေးနှုန်းများကို ဤဝက်ဘ်ဆိုက်တွင် မဖော်ပြရသေးပါ။ လက်ရှိဈေးနှုန်းကို Foodpanda တွင် စစ်ဆေးပါ သို့မဟုတ် ဆိုင်တွင် စုံစမ်းပါ။',
    }
  ),

  /** C-14 — agency-authored, factual, ready (PRD §17.2). */
  orderExplainer: slot('C-14', 'agency', 'Explains that delivery runs through Foodpanda.', {
    en: 'Delivery and online payment are handled by Foodpanda. Choose your branch below and we will take you straight to its listing.',
    my: 'ပို့ဆောင်မှုနှင့် အွန်လိုင်းငွေပေးချေမှုကို Foodpanda မှ ဆောင်ရွက်ပါသည်။ အောက်တွင် ဆိုင်ခွဲရွေးပါ၊ ထိုဆိုင်၏ စာမျက်နှာသို့ တိုက်ရိုက် ပို့ဆောင်ပေးပါမည်။',
  }),
} as const;

export type EditorialKey = keyof typeof EDITORIAL;

export function editorialText(slotObj: EditorialSlot, locale: Locale): string | null {
  return slotObj.value[locale] ?? slotObj.value.en ?? null;
}
