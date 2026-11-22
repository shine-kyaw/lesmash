/**
 * Cut the eight burger photographs out of their grey studio backdrops, for the
 * footer train's doorways (client revision 01: "doors open and reveal burgers").
 *
 *   node scripts/burger-cutouts.mjs
 *
 * public/media/burgers/*.jpg -> public/media/burgers/cut/*.webp (transparent).
 *
 * The backdrop is a near-neutral grey sweep; every burger is strongly coloured
 * (bun, cheese) or dark (patty). So: flood-fill from the frame edges through
 * pixels with little colour AND not dark, which takes the sweep and the plate but
 * cannot cross into the food. Then soften the edge and crop to the burger.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'public/media/burgers';
const OUT = path.join(SRC, 'cut');
fs.mkdirSync(OUT, { recursive: true });

const CHROMA_MAX = 0.13; // backdrop is greyer than this (max-min channel spread)
const LUM_MIN = 0.22;  // and lighter than this (charred patty is darker)
const H = 700;         // output height before cropping

for (const file of fs.readdirSync(SRC).filter((f) => f.endsWith('.jpg'))) {
  const { data, info } = await sharp(path.join(SRC, file)).resize({ height: H }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const n = w * h;
  const isBg = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const r = data[i * 3] / 255, g = data[i * 3 + 1] / 255, b = data[i * 3 + 2] / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const l = (mx + mn) / 2;
    isBg[i] = mx - mn < CHROMA_MAX && l > LUM_MIN ? 1 : 0;
  }
  // Flood from every border pixel through background-like pixels.
  const bg = new Uint8Array(n);
  const stack = [];
  const push = (i) => { if (isBg[i] && !bg[i]) { bg[i] = 1; stack.push(i); } };
  for (let x = 0; x < w; x++) { push(x); push((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { push(y * w); push(y * w + w - 1); }
  while (stack.length) {
    const i = stack.pop(); const x = i % w, y = (i / w) | 0;
    if (x > 0) push(i - 1); if (x < w - 1) push(i + 1);
    if (y > 0) push(i - w); if (y < h - 1) push(i + w);
  }
  // Clean the mask: an opening (erode, keep the largest blob, grow back inside
  // the original) cuts the thin bridges that let backdrop patches cling on.
  const fg = new Uint8Array(n); for (let i = 0; i < n; i++) fg[i] = bg[i] ? 0 : 1;
  const R = 7;
  const morph = (m, grow) => {
    // separable square erosion/dilation of radius R
    const t = new Uint8Array(n), o = new Uint8Array(n);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = grow ? 0 : 1;
      for (let k = -R; k <= R; k++) { const xx = x + k; const p = xx < 0 || xx >= w ? 0 : m[y * w + xx]; v = grow ? v | p : v & p; }
      t[y * w + x] = v;
    }
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let v = grow ? 0 : 1;
      for (let k = -R; k <= R; k++) { const yy = y + k; const p = yy < 0 || yy >= h ? 0 : t[yy * w + x]; v = grow ? v | p : v & p; }
      o[y * w + x] = v;
    }
    return o;
  };
  const er = morph(fg, false);
  const lab = new Int32Array(n).fill(-1);
  let best = -1, bestSize = 0, id = 0;
  for (let s0 = 0; s0 < n; s0++) {
    if (!er[s0] || lab[s0] >= 0) continue;
    let size = 0; const q = [s0]; lab[s0] = id;
    while (q.length) {
      const i = q.pop(); size++; const x = i % w, y = (i / w) | 0;
      for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) {
        if (j >= 0 && er[j] && lab[j] < 0) { lab[j] = id; q.push(j); }
      }
    }
    if (size > bestSize) { bestSize = size; best = id; }
    id++;
  }
  const keep = new Uint8Array(n); for (let i = 0; i < n; i++) keep[i] = lab[i] === best ? 1 : 0;
  const grown = morph(keep, true);
  const mask = new Uint8Array(n); for (let i = 0; i < n; i++) mask[i] = grown[i] & fg[i];
  // Trim the table reflection: below the widest row of the lower half, stop at
  // the first row narrower than 62% of it.
  const rowW = new Int32Array(h);
  for (let y = 0; y < h; y++) { let c = 0; for (let x = 0; x < w; x++) c += mask[y * w + x]; rowW[y] = c; }
  let wy = (h / 2) | 0; for (let y = (h / 2) | 0; y < h; y++) if (rowW[y] > rowW[wy]) wy = y;
  let cut = h; for (let y = wy; y < h; y++) if (rowW[y] < rowW[wy] * 0.62) { cut = y; break; }
  for (let y = cut; y < h; y++) for (let x = 0; x < w; x++) mask[y * w + x] = 0;
  const alpha = Buffer.alloc(n);
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let i = 0; i < n; i++) {
    if (mask[i]) {
      alpha[i] = 255; const x = i % w, y = (i / w) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  // Soft edge: blur the mask a touch, then pull it back in so no grey halo shows.
  const soft = await sharp(alpha, { raw: { width: w, height: h, channels: 1 } }).blur(1.2).linear(1.25, -50).extractChannel(0).raw().toBuffer();
  const pad = 4;
  const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
  const cw = Math.min(w, x1 + pad + 1) - left, ch = Math.min(h, y1 + pad + 1) - top;
  const name = file.replace(/\.jpg$/, '.webp');
  const rgba = await sharp(data, { raw: { width: w, height: h, channels: 3 } })
    .joinChannel(soft, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
  const res = await sharp(rgba)
    .extract({ left, top, width: cw, height: ch })
    .resize({ width: 280, withoutEnlargement: true })
    .webp({ quality: 82, alphaQuality: 90 })
    .toFile(path.join(OUT, name));
  console.log(name, [x0,y0,x1,y1].join(','), `${res.width}x${res.height}`, `${(res.size / 1024).toFixed(1)}KB`, `fg ${(bestSize / n * 100).toFixed(1)}%`);
}
