/**
 * Lifts the prints off the client's worn-shirt photos so they can be put on the
 * photo-real rack tees:  node scripts/merch-art-extra.mjs
 *  - art-smashnow.png   dark ink keyed off white cloth  (Smash Now, Thank Us Later)
 *  - art-smash3.png     light + red ink keyed off black (Smash Smash Smash, red Le)
 *  - art-fries.png      light ink keyed off black       (Fries Before Guys)
 *  - art-blank.png      transparent, for the plain side of each tee
 * Output: public/media/merch/cut/
 */
import sharp from 'sharp';
const G = 'public/media/gallery/';
const OUT = 'public/media/merch/cut/';

async function crop(file, box) {
  const { data, info } = await sharp(G + file).removeAlpha().extract(box).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
const sstep = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
async function save(name, rgba, w, h) {
  const info = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 4 }).png({ compressionLevel: 9 }).toFile(OUT + name);
  console.log(name, info.width + 'x' + info.height);
}

/* dark ink on white: alpha from how much darker than the cloth, colour a flat near-black */
async function inkOnWhite(file, box, name) {
  const { data, w, h } = await crop(file, box);
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const red = r - Math.max(g, b) > 60 && r > 110; // the red cord line: drop it, it runs off the shirt
    const a = red ? 0 : sstep(170, 70, lum);
    out[i * 4] = 28; out[i * 4 + 1] = 26; out[i * 4 + 2] = 26; out[i * 4 + 3] = Math.round(a * 255);
  }
  await save(name, out, w, h);
}

/* light (and red) ink on black: alpha from brightness or redness, colour un-darkened */
async function inkOnBlack(file, box, name, lo = 55, hi = 150) {
  const { data, w, h } = await crop(file, box);
  const out = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = mx - mn;
    const a = Math.max(sstep(lo, hi, lum), sat > 70 && r > 120 ? sstep(70, 140, sat) : 0);
    const k = a > 0.02 ? Math.min(1.8, 1 / Math.max(a, 0.55)) : 1;
    out[i * 4] = Math.min(255, r * k); out[i * 4 + 1] = Math.min(255, g * k); out[i * 4 + 2] = Math.min(255, b * k);
    out[i * 4 + 3] = Math.round(a * 255);
  }
  await save(name, out, w, h);
}

await inkOnWhite('special-projects/09-smash-now-tee.jpg', { left: 225, top: 690, width: 520, height: 440 }, 'art-smashnow.png');
await inkOnBlack('behind-the-scenes/09-smash-smash-smash.jpg', { left: 355, top: 815, width: 760, height: 620 }, 'art-smash3.png');
await inkOnBlack('special-projects/12-fries-before-guys.jpg', { left: 540, top: 255, width: 250, height: 215 }, 'art-fries.png', 60, 140);
await sharp({ create: { width: 8, height: 8, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).png().toFile(OUT + 'art-blank.png');
console.log('art-blank.png 8x8');
