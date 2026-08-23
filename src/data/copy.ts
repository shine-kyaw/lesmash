import type { Locale } from '../lib/i18n';

/**
 * UI chrome strings, both locales.
 *
 * These are interface labels, not editorial copy — the agency may author them
 * (PRD §17.2, C-14/C-16). Anything that makes a claim about the business lives
 * in src/content/editorial/ and stays empty until the client supplies it.
 *
 * Burmese here is Myanmar Unicode and still requires the native-speaker review
 * pass before launch (PRD §32, Bilingual QA).
 */
export interface Copy {
  brandTagline: string;
  nav: Record<'menu' | 'breakfast' | 'burgers' | 'locations' | 'about' | 'order' | 'home', string>;
  cta: {
    seeMenu: string; order: string; orderShort: string; directions: string;
    directionsShort: string; call: string; callShort: string; viewBranch: string;
    fullMenu: string; changeBranch: string; chooseBranch: string; chooseBranchHint: string;
    backHome: string;
  };
  state: {
    openNow: string; closedNow: string; hoursUnconfirmed: string; checkHours: string;
    unavailable: string; soldOutToday: string; branchOnly: (b: string) => string;
    priceOnRequest: string; noPhoto: string; contentPending: string;
  };
  labels: {
    address: string; phone: string; hours: string; today: string; menu: string;
    price: string; patty: (n: number) => string; portion: string; weight: string;
    spice: string; allergens: string; dietary: string; combo: string; includes: string;
    dineIn: string; delivery: string; takeaway: string; breakfastService: string;
    unconfirmed: string; skipToContent: string; openMenu: string; closeMenu: string;
    language: string; branches: string; filters: string; all: string; drinks: string;
    pricesAsOf: string; showing: string; items: string;
  };
  spice: Record<'none' | 'mild' | 'medium' | 'hot', string>;
  tags: Record<'popular' | 'new' | 'chef-pick' | 'spicy' | 'value', string>;
  dietary: Record<string, string>;
  footer: { rights: string; followUs: string; privacy: string; deliveryVia: string };
  a11y: {
    mainNav: string; branchActions: string; categoryNav: string;
    externalLink: string; itemDetails: string;
  };
}

const en: Copy = {
  brandTagline: 'Smash burgers in Yangon',
  nav: {
    home: 'Home', menu: 'Menu', breakfast: 'Breakfast', burgers: 'Burgers',
    locations: 'Locations', about: 'About', order: 'Order',
  },
  cta: {
    seeMenu: 'See the menu',
    order: 'Order on Foodpanda',
    orderShort: 'Order',
    directions: 'Get directions',
    directionsShort: 'Directions',
    call: 'Call this branch',
    callShort: 'Call',
    viewBranch: 'View this branch',
    fullMenu: 'See the full menu',
    changeBranch: 'Change branch',
    chooseBranch: 'Choose a branch',
    chooseBranchHint: 'Delivery runs through Foodpanda. Pick the branch nearest you.',
    backHome: 'Back to home',
  },
  state: {
    openNow: 'Open now',
    closedNow: 'Closed now',
    hoursUnconfirmed: 'Opening hours not yet published',
    checkHours: 'Please call the branch to confirm',
    unavailable: 'Currently unavailable',
    soldOutToday: 'Sold out today',
    branchOnly: (b) => `${b} only`,
    priceOnRequest: 'Ask in store',
    noPhoto: 'Photograph coming soon',
    contentPending: 'Content pending client sign-off',
  },
  labels: {
    address: 'Address', phone: 'Phone', hours: 'Opening hours', today: 'Today',
    menu: 'Menu', price: 'Price', patty: (n) => (n === 1 ? '1 patty' : `${n} patties`),
    portion: 'Portion', weight: 'Weight', spice: 'Spice', allergens: 'Allergens',
    dietary: 'Dietary', combo: 'Combo', includes: 'Includes',
    dineIn: 'Dine-in', delivery: 'Delivery', takeaway: 'Takeaway',
    breakfastService: 'Breakfast service',
    unconfirmed: 'Not yet confirmed', skipToContent: 'Skip to content',
    openMenu: 'Open navigation', closeMenu: 'Close navigation', language: 'Language',
    branches: 'Branches', filters: 'Filters', all: 'All', drinks: 'Drinks',
    pricesAsOf: 'Prices as of', showing: 'Showing', items: 'items',
  },
  spice: { none: 'Not spicy', mild: 'Mild', medium: 'Medium', hot: 'Hot' },
  tags: { popular: 'Popular', new: 'New', 'chef-pick': "Chef's pick", spicy: 'Spicy', value: 'Value' },
  dietary: {
    vegetarian: 'Vegetarian', vegan: 'Vegan', 'contains-pork': 'Contains pork',
    'contains-beef': 'Contains beef', 'contains-alcohol': 'Contains alcohol',
  },
  footer: {
    rights: 'All rights reserved.',
    followUs: 'Follow us',
    privacy: 'Privacy',
    deliveryVia: 'Delivery is handled by Foodpanda.',
  },
  a11y: {
    mainNav: 'Main navigation', branchActions: 'Branch actions',
    categoryNav: 'Menu categories', externalLink: 'opens in a new tab',
    itemDetails: 'Show item details',
  },
};

const my: Copy = {
  brandTagline: 'ရန်ကုန်မြို့မှ Smash ဘာဂါများ',
  nav: {
    home: 'ပင်မစာမျက်နှာ', menu: 'မီနူး', breakfast: 'မနက်စာ', burgers: 'ဘာဂါများ',
    locations: 'ဆိုင်ခွဲများ', about: 'ကျွန်ုပ်တို့အကြောင်း', order: 'မှာယူရန်',
  },
  cta: {
    seeMenu: 'မီနူးကြည့်ရန်',
    order: 'Foodpanda တွင် မှာယူရန်',
    orderShort: 'မှာယူရန်',
    directions: 'လမ်းညွှန်ကြည့်ရန်',
    directionsShort: 'လမ်းညွှန်',
    call: 'ဤဆိုင်ခွဲသို့ ဖုန်းခေါ်ရန်',
    callShort: 'ဖုန်းခေါ်ရန်',
    viewBranch: 'ဤဆိုင်ခွဲကို ကြည့်ရန်',
    fullMenu: 'မီနူးအပြည့်အစုံ ကြည့်ရန်',
    changeBranch: 'ဆိုင်ခွဲ ပြောင်းရန်',
    chooseBranch: 'ဆိုင်ခွဲ ရွေးချယ်ပါ',
    chooseBranchHint: 'ပို့ဆောင်မှုကို Foodpanda မှ ဆောင်ရွက်ပါသည်။ အနီးဆုံးဆိုင်ခွဲကို ရွေးပါ။',
    backHome: 'ပင်မစာမျက်နှာသို့ ပြန်သွားရန်',
  },
  state: {
    openNow: 'ယခု ဖွင့်ထားသည်',
    closedNow: 'ယခု ပိတ်ထားသည်',
    hoursUnconfirmed: 'ဖွင့်ချိန်ကို မထုတ်ပြန်ရသေးပါ',
    checkHours: 'ဆိုင်ခွဲသို့ ဖုန်းဆက်၍ အတည်ပြုပါ',
    unavailable: 'ယခုအချိန် မရရှိနိုင်ပါ',
    soldOutToday: 'ယနေ့ ကုန်သွားပါပြီ',
    branchOnly: (b) => `${b} တွင်သာ`,
    priceOnRequest: 'ဆိုင်တွင် စုံစမ်းပါ',
    noPhoto: 'ဓာတ်ပုံ မကြာမီ တင်ပါမည်',
    contentPending: 'အကြောင်းအရာကို အတည်ပြုရန် ကျန်ရှိသေးသည်',
  },
  labels: {
    address: 'လိပ်စာ', phone: 'ဖုန်း', hours: 'ဖွင့်ချိန်', today: 'ယနေ့',
    menu: 'မီနူး', price: 'ဈေးနှုန်း',
    patty: (n) => `အသားပြား ${n} ချပ်`,
    portion: 'ပမာဏ', weight: 'အလေးချိန်', spice: 'အစပ်', allergens: 'ဓာတ်မတည့်နိုင်သည့် ပါဝင်ပစ္စည်း',
    dietary: 'အစားအသောက် အချက်အလက်', combo: 'ကွန်ဘို', includes: 'ပါဝင်သည်များ',
    dineIn: 'ဆိုင်တွင်း စားသုံးခြင်း', delivery: 'အိမ်တိုင်ရာရောက် ပို့ဆောင်ခြင်း',
    takeaway: 'ထုပ်ပိုး ယူဆောင်ခြင်း',
    breakfastService: 'မနက်စာ ဝန်ဆောင်ချိန်',
    unconfirmed: 'အတည်မပြုရသေးပါ', skipToContent: 'အကြောင်းအရာသို့ ကျော်သွားရန်',
    openMenu: 'မီနူး ဖွင့်ရန်', closeMenu: 'မီနူး ပိတ်ရန်', language: 'ဘာသာစကား',
    branches: 'ဆိုင်ခွဲများ', filters: 'စစ်ထုတ်ရန်', all: 'အားလုံး', drinks: 'သောက်စရာများ',
    pricesAsOf: 'ဈေးနှုန်း အတည်ပြုသည့်ရက်', showing: 'ပြသနေသည်', items: 'မျိုး',
  },
  spice: { none: 'အစပ်မပါ', mild: 'အနည်းငယ် စပ်', medium: 'အလယ်အလတ် စပ်', hot: 'အလွန် စပ်' },
  tags: { popular: 'လူကြိုက်များ', new: 'အသစ်', 'chef-pick': 'စားဖိုမှူး ရွေးချယ်မှု', spicy: 'အစပ်', value: 'တန်ဖိုးရှိ' },
  dietary: {
    vegetarian: 'သက်သတ်လွတ်', vegan: 'သက်သတ်လွတ် (တိရစ္ဆာန်ထွက် လုံးဝမပါ)',
    'contains-pork': 'ဝက်သား ပါဝင်သည်', 'contains-beef': 'အမဲသား ပါဝင်သည်',
    'contains-alcohol': 'အရက် ပါဝင်သည်',
  },
  footer: {
    rights: 'မူပိုင်ခွင့် အားလုံး ရယူထားပါသည်။',
    followUs: 'ကျွန်ုပ်တို့ကို စောင့်ကြည့်ရန်',
    privacy: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ',
    deliveryVia: 'ပို့ဆောင်မှုကို Foodpanda မှ ဆောင်ရွက်ပါသည်။',
  },
  a11y: {
    mainNav: 'အဓိက လမ်းညွှန်', branchActions: 'ဆိုင်ခွဲ လုပ်ဆောင်ချက်များ',
    categoryNav: 'မီနူး အမျိုးအစားများ', externalLink: 'တဘ်အသစ်တွင် ဖွင့်ပါမည်',
    itemDetails: 'အသေးစိတ် ကြည့်ရန်',
  },
};

const COPY: Record<Locale, Copy> = { en, my };

export function t(locale: Locale): Copy {
  return COPY[locale];
}
