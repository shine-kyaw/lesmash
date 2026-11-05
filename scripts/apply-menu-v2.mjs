#!/usr/bin/env node
/**
 * One-off: applies the 4 Nov 2026 menu facts to src/content.
 *
 * Sources, all the client's own:
 *  - Prices for brunch / mains / salads / snacks: the printed boards
 *    (Main Menu m1.jpg, m2.jpg). These are dine-in prices.
 *  - Burger descriptions: the restaurant's own Foodpanda listings (Sayarsan
 *    and Junction Square), read 4 Nov 2026. Foodpanda prices are delivery
 *    prices and are NOT used.
 *  - Burger photography: Drive "Burger Menu Tab".
 *  - Drink prices: Drive "Drink Menu" price sheet (viber image, 2 Nov 2026).
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const DIR = new URL('../src/content/menu-items/', import.meta.url);
const CAT = new URL('../src/content/menu-categories/', import.meta.url);
const TODAY = '2026-11-04';

const BOARD = "Price from the client's printed menu board (Main Menu m1.jpg / m2.jpg), supplied again in the 4 Nov 2026 Drive.";

// slug: [price, priceDisplay]
const PRICES = {
  'english-breakfast': [42000, '42K'],
  'chicken-and-waffles': [25000, '25K'],
  'potato-rosti-cured-salmon': [42000, '42K'],
  'steak-and-eggs': [60000, '60K'],
  'eggs-shashuka': [24000, '24K'],
  'pain-perdu-french-toast': [22000, '22K'],
  'smash-benedict': [30000, '30K'],
  'pancake': [18000, 'Original 18K · Strawberries & cream 23K'],
  'steak-frites': [60000, '60K'],
  'peri-peri-chicken': [20000, 'Half 20K · Whole 65K'],
  'mixed-mushroom': [25000, '25K'],
  'soft-scrambled-eggs': [18000, '18K'],
  'smashed-avocado': [25000, '25K'],
  'potato-balls': [12000, '12K'],
  'chicken-tenders': [14500, '3 pcs 14.5K · 5 pcs 21.5K'],
  'chicken-wings': [15000, '5 pcs 15K · 8 pcs 20K'],
  'animal-frites': [18000, '18K'],
  'beef-tartare': [32000, '32K'],
  'homemade-cured-salmon-toast': [35000, '35K'],
  'chicken-parm': [45000, '45K'],
  'corn-ribs': [10000, '10K'],
  'homemade-cured-salmon': [20000, '20K'],
  'spicy-garlic-prawns': [40000, '40K'],
  'crispy-chicken-caesar': [28000, '28K'],
  'fish-and-chips': [30000, '30K'],
  'grilled-cheese-tomato-soup': [35000, '35K'],
  'guacamole-rice-crisp': [14000, '14K'],
};

const BURGERS = {
  'smash': ['Double beef patty, diced onions, house pickles, Le SMASH sauce, American cheese x2', 'The Le SMASH burger: two smashed patties and melted American cheese in a brioche bun'],
  'onion-smash': ['Double beef patty, diced onions, smash onions, house pickles, Le SMASH sauce, dijon aioli, American cheese x2', 'Onion SMASH: two patties smashed with onions, cheese running over the edge'],
  'miso-bacon': ['Homemade miso sauce, diced onions, diced pickles, double patty, double cheese, smoked bacon', 'Miso Bacon: double patty and cheese with smoked bacon'],
  'spicy-bacon': ['Double beef patty, house pickles, BBQ sauce, fried onions, spicy bacon relish, American cheese x2', 'Spicy Bacon: double patty, cheese and spicy bacon relish'],
  'pulled-pork': ['Pork shoulder, diced onions, house pickles, house slaw, American cheese x1', 'Pulled Pork: pulled pork shoulder under house slaw and cheese'],
  'le-coq-buffalo-chicken': ['Fried boneless chicken thigh, buffalo sauce, house pickles, house slaw, ranch', 'Le COQ: fried chicken thigh in buffalo sauce with slaw'],
  'smash-o-filet': ['A fish patty with tartare sauce and double American cheese', 'SMASH O Filet: a fried fish patty, tartare sauce and double cheese'],
  'kimchi-cheese': [null, 'Kimchi Cheese: double patty with kimchi and melted cheese'],
};
const FP = "Description from the restaurant's own Foodpanda listing (read 4 Nov 2026). Photograph from the Drive 'Burger Menu Tab'. Dine-in price not yet confirmed: the Foodpanda price is a delivery price and the magazine-spread prices are layout placeholders.";

async function load(slug) { return JSON.parse(await readFile(new URL(`${slug}.json`, DIR), 'utf8')); }
async function save(slug, j) { await writeFile(new URL(`${slug}.json`, DIR), JSON.stringify(j, null, 2) + '\n'); }

for (const [slug, [price, display]] of Object.entries(PRICES)) {
  const j = await load(slug);
  j.price = price; j.priceDisplay = display; j.priceContext = 'dine-in';
  j.updatedAt = TODAY;
  if (!j.sourceNote?.includes('printed menu board (Main Menu')) j.sourceNote = `${j.sourceNote ?? ''} ${BOARD}`.trim();
  // The originals replaced the board crops; drop the now-false crop claim.
  j.sourceNote = j.sourceNote.replace(/Photograph cropped from (that|the same) board[^.]*\./g, "Photograph supplied as its own file in the 4 Nov 2026 Drive.");
  await save(slug, j);
}

// The half-chicken has its own photo; keep it as the gallery shot.
{
  const j = await load('peri-peri-chicken');
  j.imageGallery = [{ src: '/media/dishes/peri-peri-chicken-half.jpg', alt: 'A half peri peri chicken with frites' }];
  await save('peri-peri-chicken', j);
}

let sort = 5;
for (const [slug, [desc, alt]] of Object.entries(BURGERS)) {
  let j;
  if (existsSync(new URL(`${slug}.json`, DIR))) j = await load(slug);
  else {
    j = { ...(await load('smash')), slug, name: 'Kimchi Cheese', isFeatured: false,
      description: null, sortOrder: 75 };
    j.sourceNote = "Name and photograph from the Drive 'Burger Menu Tab' (Kimchi Cheese Burger.png, 4 Nov 2026). Not on Foodpanda or any board; description and price outstanding.";
  }
  if (desc) { j.description = desc; j.sourceNote = FP; }
  j.image = { src: `/media/burgers/${slug}.jpg`, alt };
  j.price = null; j.priceDisplay = null; j.priceContext = 'unconfirmed';
  j.updatedAt = TODAY;
  await save(slug, j);
  sort++;
}

/* Drinks: prices for the names the price sheet covers. Sheet names are mapped
   onto the list's own names where the sheet is terser ("Americano" is the hot
   one, because the sheet lists "Ice Americano" separately). */
const DRINK_PRICES = {
  drinks: {
    'Strawberry Smoothie': 10000, 'Mango Smoothie': 10000, 'Passion Mint Smoothie': 10000,
    'Lemon Tea Freeze': 6000, 'Strawberry Milkshake': 10000, 'Chocolate Milkshake': 10000,
    'Hot Lemon Tea': 5500, 'Iced Lemon Tea': 6000, 'Hot Espresso': 5000, 'Iced Espresso': 6000,
    'Hot Americano': 6000, 'Iced Americano': 7000, 'Hot Latte': 12000, 'Iced Latte': 13000,
    'Hot Cappuccino': 12000, 'Iced Cappuccino': 13000, 'Flat White': 12000,
    'Hot Mocha': 12000, 'Iced Mocha': 13000,
    'Fruit Beer (Strawberry)': 12000, 'Fruit Beer (Mango)': 12000, 'Fruit Beer (Passion)': 12000,
  },
  cocktails: {
    'Hogwarts House': 24000, 'Strawberry Trap': 15000, 'Gryffindor': 28000,
    'Baby Russian': 20000, 'Jager Bomb': 15000,
  },
};
const NEW_COCKTAILS = ['Hogwarts House', 'Strawberry Trap', 'Gryffindor', 'Baby Russian'];

for (const [cat, prices] of Object.entries(DRINK_PRICES)) {
  const f = new URL(`${cat}.json`, CAT);
  const j = JSON.parse(await readFile(f, 'utf8'));
  if (cat === 'cocktails') {
    for (const n of NEW_COCKTAILS) if (!j.listItems.includes(n)) j.listItems.push(n);
    j.listItems.sort((a, b) => a.localeCompare(b));
  }
  if (cat === 'drinks') {
    const g = j.listGroups.find((x) => x.label === 'Smoothies & Coolers');
    if (g && !g.items.includes('Pineapple Smoothie')) { g.items.push('Pineapple Smoothie'); g.items.sort(); }
    prices['Pineapple Smoothie'] = 10000;
  }
  j.listPrices = prices;
  await writeFile(f, JSON.stringify(j, null, 2) + '\n');
}
console.log('menu v2 applied');
