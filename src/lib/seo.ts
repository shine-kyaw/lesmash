import { SITE, type Locale } from './i18n';

/**
 * Titles and descriptions.
 *
 * Every title carries a geo qualifier without exception (SEO-01). That is not
 * a style preference: this brand shares its name with an unrelated Dutch chain,
 * and geo-qualification is the main lever the site has for winning its own
 * brand searches in Myanmar (PRD F7, §19.1).
 */

const GEO: Record<Locale, string> = { en: 'Yangon', my: 'ရန်ကုန်' };

export function title(locale: Locale, pageTitle: string | null): string {
  const brand = SITE.brand.legal;
  const geo = GEO[locale];
  if (!pageTitle) return `${brand} — Smash Burgers in ${geo}`;
  const composed = `${pageTitle} — ${SITE.brand.display}, ${geo}`;
  return composed;
}

export function branchTitle(locale: Locale, branchName: string, township: string): string {
  return locale === 'my'
    ? `${SITE.brand.display} ${branchName} — ${township}၊ ${GEO.my}`
    : `${SITE.brand.display} ${branchName} — Smash Burgers in ${township}, Yangon`;
}

/** 140–158 characters, geo + a concrete differentiator + an action (§19.3). */
export const DESCRIPTIONS: Record<Locale, Record<string, string>> = {
  en: {
    home: 'Le SMASH Burgers & Co. serves smashed-to-order burgers in Yangon, with branches at Junction Square (Kamayut) and Yankin. See the menu, find us, or order delivery.',
    menu: 'The full Le SMASH menu in Yangon — burgers, combos, breakfast, sides and shakes, with patty counts and portion details so you know exactly what arrives.',
    breakfast: 'Breakfast and brunch at Le SMASH in Yangon. See what is served, at which branch, and when — then get directions or order delivery through Foodpanda.',
    burgers: 'Smash burgers in Yangon, cooked to order. See every burger with its patty count and portion, so you know how much food you are getting before you order.',
    locations: 'Le SMASH has two branches in Yangon: Junction Square in Kamayut Township and Yankin. Addresses, opening hours, directions and phone numbers for both.',
    about: 'Le SMASH Burgers & Co. is a premium-casual smash burger restaurant in Yangon. Read about the food, the rooms, and our commitment to honest portions.',
    order: 'Order Le SMASH delivery in Yangon. Choose Junction Square or Yankin and we will take you straight to that branch on Foodpanda.',
    privacy: 'How Le SMASH Burgers & Co. handles data on this website. We use no cookies for tracking and load no third-party social scripts.',
    notFound: 'That page could not be found. Head to the Le SMASH menu, our Yangon branches, or the home page.',
  },
  my: {
    home: 'Le SMASH Burgers & Co. သည် ရန်ကုန်တွင် မှာယူချိန်မှစ၍ ချက်ပြုတ်သော smash ဘာဂါများကို တင်ဆက်ပါသည်။ Junction Square နှင့် ရန်ကင်း ဆိုင်ခွဲနှစ်ခု ရှိပါသည်။',
    menu: 'ရန်ကုန်ရှိ Le SMASH မီနူး အပြည့်အစုံ — ဘာဂါများ၊ ကွန်ဘိုများ၊ မနက်စာ၊ ဘေးတွဲများနှင့် အဖျော်ယမကာများကို အသားပြားအရေအတွက်နှင့်အတူ ကြည့်ရှုနိုင်ပါသည်။',
    breakfast: 'ရန်ကုန်ရှိ Le SMASH တွင် မနက်စာနှင့် brunch။ မည်သည့်ဆိုင်ခွဲတွင် မည်သည့်အချိန်၌ ရရှိနိုင်သည်ကို ကြည့်ပြီး လမ်းညွှန်ကြည့်ရှုပါ သို့မဟုတ် မှာယူပါ။',
    burgers: 'ရန်ကုန်ရှိ smash ဘာဂါများ။ ဘာဂါတိုင်း၏ အသားပြားအရေအတွက်နှင့် ပမာဏကို မမှာယူမီ ကြိုတင်သိရှိနိုင်ရန် ဖော်ပြထားပါသည်။',
    locations: 'Le SMASH တွင် ရန်ကုန်၌ ဆိုင်ခွဲနှစ်ခုရှိသည် — ကမာရွတ်မြို့နယ်ရှိ Junction Square နှင့် ရန်ကင်း။ လိပ်စာ၊ ဖွင့်ချိန်၊ လမ်းညွှန်နှင့် ဖုန်းနံပါတ်များ။',
    about: 'Le SMASH Burgers & Co. သည် ရန်ကုန်ရှိ premium-casual smash ဘာဂါ စားသောက်ဆိုင်ဖြစ်ပါသည်။ ကျွန်ုပ်တို့၏ အစားအစာနှင့် ရိုးသားမှုအကြောင်း ဖတ်ရှုပါ။',
    order: 'ရန်ကုန်တွင် Le SMASH ပို့ဆောင်မှု မှာယူရန်။ Junction Square သို့မဟုတ် ရန်ကင်းကို ရွေးချယ်ပါ၊ Foodpanda သို့ တိုက်ရိုက် ပို့ဆောင်ပေးပါမည်။',
    privacy: 'Le SMASH Burgers & Co. ဝက်ဘ်ဆိုက်တွင် အချက်အလက်များကို မည်သို့ကိုင်တွယ်သည်ကို ဖော်ပြထားပါသည်။ ခြေရာခံ cookie များ မသုံးပါ။',
    notFound: 'ထိုစာမျက်နှာကို ရှာမတွေ့ပါ။ Le SMASH မီနူး၊ ကျွန်ုပ်တို့၏ ဆိုင်ခွဲများ သို့မဟုတ် ပင်မစာမျက်နှာသို့ သွားပါ။',
  },
};

export function description(locale: Locale, key: string): string {
  return DESCRIPTIONS[locale][key] ?? DESCRIPTIONS.en[key] ?? '';
}
