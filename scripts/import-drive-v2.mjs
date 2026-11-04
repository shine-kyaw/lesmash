#!/usr/bin/env node
/**
 * One-off importer for the 4 Nov 2026 asset drop (Reyy's "Website Photo
 * Collection" Drive). Reads the downloaded originals from SRC and writes web
 * sizes into public/media. Re-runnable: it overwrites its own outputs.
 *
 *   node scripts/import-drive-v2.mjs <path-to-downloaded-files>
 *
 * Nothing is cropped. Every file keeps its own aspect ratio; layouts decide
 * framing with object-fit, which is reversible, rather than at export time,
 * which is not (see docs/DECISIONS.md §15).
 */
import sharp from 'sharp';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = process.argv[2];
if (!SRC) { console.error('usage: import-drive-v2.mjs <src>'); process.exit(1); }
const OUT = fileURLToPath(new URL('../public/media/', import.meta.url));

const slug = (s) => s.toLowerCase()
  .replace(/\.[a-z0-9]+$/, '').replace(/ö/g, 'o').replace(/&/g, 'and')
  .replace(/\bw\b/g, 'with').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/* Brunch Menu Tab file → menu-item slug. Everything not listed is skipped. */
const DISHES = {
  'Animal Frites.jpg': 'animal-frites',
  'Beef Tartare.jpg': 'beef-tartare',
  'Chicken & waffles.jpg': 'chicken-and-waffles',
  'Chicken Parm.jpg': 'chicken-parm',
  'Chicken Tenders.jpg': 'chicken-tenders',
  'Chicken Wings.jpg': 'chicken-wings',
  'Corn Ribs.jpg': 'corn-ribs',
  'Crispy Chicken Caesar.jpg': 'crispy-chicken-caesar',
  'Eggs Shashuka.jpg': 'eggs-shashuka',
  'English Breakfast.jpg': 'english-breakfast',
  'Fish and Chips w tartare.jpg': 'fish-and-chips',
  'Grilled Cheese w Tomato Soup.jpg': 'grilled-cheese-tomato-soup',
  'Guacamole w Rice Crisp.jpg': 'guacamole-rice-crisp',
  'Homemade Cured Salmon Toast.jpg': 'homemade-cured-salmon-toast',
  'Homemade Cured Salmon.jpg': 'homemade-cured-salmon',
  'Mixed Mushroom.jpg': 'mixed-mushroom',
  'Pain Perdu French Toast.jpg': 'pain-perdu-french-toast',
  'Pancake.jpg': 'pancake',
  'Peri peri Chicken.jpg': 'peri-peri-chicken',
  'Peri peri Chicken half.jpg': 'peri-peri-chicken-half',
  'Potato Balls.jpg': 'potato-balls',
  'Potato Rösti w Cured Salmon.jpg': 'potato-rosti-cured-salmon',
  'Smash Benedict.jpg': 'smash-benedict',
  'Smashed Avocado.jpg': 'smashed-avocado',
  'Soft Scrambled Eggs.jpg': 'soft-scrambled-eggs',
  'Spicy Garlic Prawns.jpg': 'spicy-garlic-prawns',
  'Steak & Eggs.jpg': 'steak-and-eggs',
  'Steak Frites.jpg': 'steak-frites',
};

const BURGERS = {
  'Le SMASH.png': 'smash',
  'Onion SMASH.png': 'onion-smash',
  'Miso Bacon.png': 'miso-bacon',
  'Spicy bacon.png': 'spicy-bacon',
  'Pulled Pork.jpg': 'pulled-pork',
  'Le Coq ( Buffalo Chicken).png': 'le-coq-buffalo-chicken',
  'Fish (smash o filet).png': 'smash-o-filet',
  'Kimchi Cheese Burger.png': 'kimchi-cheese',
};

/* Folder → output directory and long edge. Files keep a slug of their name. */
const FOLDERS = [
  ['Our Story', 'story', 1600],
  ['Meet Our Team Tab', 'team', 1200],
  ['Merch', 'merch', 1600],
  ['Campaign Highlight', 'campaigns', 1400],
  ['Event Highlight', 'events', 1600],
  ['Restaurant Highlights', 'highlights', 1600],
  ['Gallery', 'social', 1400],
  ['HOME Tab', 'home', 1920],
];

const manifest = [];

async function emit(src, dir, name, long, quality = 80) {
  await mkdir(join(OUT, dir), { recursive: true });
  const img = sharp(src, { failOn: 'none' }).rotate();
  const m = await img.metadata();
  const w0 = m.autoOrient?.width ?? m.width, h0 = m.autoOrient?.height ?? m.height;
  const scale = Math.min(1, long / Math.max(w0, h0));
  const w = Math.round(w0 * scale), h = Math.round(h0 * scale);
  const file = join(OUT, dir, `${name}.jpg`);
  await img.resize(w, h).flatten({ background: '#ffffff' })
    .jpeg({ quality, mozjpeg: true, progressive: true }).toFile(file);
  manifest.push({ path: `/media/${dir}/${name}.jpg`, width: w, height: h, source: basename(src) });
}

for (const [file, s] of Object.entries(DISHES)) {
  await emit(join(SRC, 'Brunch Menu Tab', file), 'dishes', s, 1400);
}
for (const [file, s] of Object.entries(BURGERS)) {
  await emit(join(SRC, 'Burger Menu Tab', file), 'burgers', s, 1400);
}
for (const [folder, dir, long] of FOLDERS) {
  const seen = new Set();
  for (const f of (await readdir(join(SRC, folder))).sort()) {
    if (!/\.(jpe?g|png)$/i.test(f)) continue;
    let s = slug(f.replace(/__[-_A-Za-z0-9]{20,}(?=\.)/, ''));
    while (seen.has(s)) s += '-b';
    seen.add(s);
    await emit(join(SRC, folder, f), dir, s, long);
  }
}

await writeFile(new URL('../src/data/media-manifest.json', import.meta.url),
  JSON.stringify(manifest, null, 2) + '\n');
console.log(`wrote ${manifest.length} images`);
