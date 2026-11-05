/**
 * Merch cut-outs.  node scripts/merch-cutouts.mjs [products|art|garments|all]
 *
 * Turns the client's mockup photos into transparent PNG/WebP assets with sharp:
 *  - products   mugs, cups, tote, pixel-flame tee (flat-lay) and the YGN jersey,
 *               keyed off their backgrounds (flood fill + hand-traced guide polygons)
 *  - art        the print artwork only (monogram back print, chest marks, flame),
 *               fabric keyed out and re-inked so it can sit on any garment colour
 *  - garments   composed product shots: a tee silhouette with fabric shading,
 *               collar, seams, folds and the real print placed on it, on a hook
 * Output: public/media/merch/cut/
 */
import sharp from 'sharp';
import fs from 'node:fs';

const SRC = 'public/media/merch/';
const OUT = 'public/media/merch/cut/';
fs.mkdirSync(OUT, { recursive: true });
const which = process.argv[2] || 'all';

/* ---------- helpers ---------- */
async function load(file, box) {
  let img = sharp(SRC + file).removeAlpha();
  if (box) img = img.extract(box);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}
async function polyMask(w, h, polys) {
  const p = polys.map((pts) => `<polygon points="${pts.map(([x, y]) => `${x},${y}`).join(' ')}" fill="#fff"/>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#000"/>${p}</svg>`;
  return new Uint8Array(await sharp(Buffer.from(svg)).greyscale().raw().toBuffer());
}
const lum = (d, i) => 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];

/** connected-component flood over `pass` pixels starting at the border (or given seeds) */
function flood(w, h, pass, seeds) {
  const seen = new Uint8Array(w * h);
  const st = [];
  const push = (x, y) => { const k = y * w + x; if (!seen[k] && pass(k)) { seen[k] = 1; st.push(k); } };
  if (seeds) seeds.forEach(([x, y]) => push(x, y));
  else {
    for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  }
  while (st.length) {
    const k = st.pop(); const x = k % w, y = (k / w) | 0;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }
  return seen;
}
/** fill enclosed holes in an fg mask (1 = fg), except holes that contain a keep point */
function fillHoles(w, h, fg, keep = []) {
  const outer = flood(w, h, (k) => !fg[k]);
  const keepSeen = keep.length ? flood(w, h, (k) => !fg[k], keep) : new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let k = 0; k < w * h; k++) out[k] = fg[k] || (!outer[k] && !keepSeen[k]) ? 1 : 0;
  return out;
}
function rowFill(w, h, m, fromY) {
  const o = Uint8Array.from(m);
  for (let y = fromY; y < h; y++) {
    let a = -1, b = -1;
    for (let x = 0; x < w; x++) if (m[y * w + x]) { if (a < 0) a = x; b = x; }
    if (a >= 0) for (let x = a; x <= b; x++) o[y * w + x] = 1;
  }
  return o;
}
function largest(w, h, fg) {
  const lab = new Int32Array(w * h); let best = 0, bestN = 0, id = 0;
  for (let s = 0; s < w * h; s++) {
    if (!fg[s] || lab[s]) continue;
    id++; let n = 0; const st = [s]; lab[s] = id;
    while (st.length) {
      const k = st.pop(); n++; const x = k % w, y = (k / w) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        const nk = ny * w + nx; if (fg[nk] && !lab[nk]) { lab[nk] = id; st.push(nk); }
      }
    }
    if (n > bestN) { bestN = n; best = id; }
  }
  const out = new Uint8Array(w * h); for (let k = 0; k < w * h; k++) out[k] = lab[k] === best ? 1 : 0; return out;
}
async function soften(w, h, mask01, blur = 1.1) {
  const a = Buffer.from(mask01.map((v) => (v ? 255 : 0)));
  return new Uint8Array(await sharp(a, { raw: { width: w, height: h, channels: 1 } }).blur(blur).extractChannel(0).raw().toBuffer());
}
async function bake(name, rgb, w, h, alpha, pad = 6, maxDim = 900, fmt = 'png') {
  let x0 = w, y0 = h, x1 = 0, y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (alpha[y * w + x] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const rgba = Buffer.alloc(w * h * 4);
  for (let k = 0; k < w * h; k++) { rgba[k * 4] = rgb[k * 3]; rgba[k * 4 + 1] = rgb[k * 3 + 1]; rgba[k * 4 + 2] = rgb[k * 3 + 2]; rgba[k * 4 + 3] = alpha[k]; }
  const L = Math.max(0, x0 - pad), T = Math.max(0, y0 - pad);
  let img = sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: L, top: T, width: Math.min(w - L, x1 - x0 + 1 + pad * 2), height: Math.min(h - T, y1 - y0 + 1 + pad * 2) })
    .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true });
  img = fmt === 'webp' ? img.webp({ quality: 88, alphaQuality: 92 }) : img.png({ compressionLevel: 9 });
  const info = await img.toFile(`${OUT}${name}.${fmt}`);
  console.log(name, info.width + 'x' + info.height, (info.size / 1024).toFixed(0) + 'KB');
}

/* ---------- products ---------- */
async function products() {
  /* Pixel-flame tee, flat-lay on a light ground: flood the ground out, keep the garment. */
  {
    const { data, w, h } = await load('2.jpg');
    const bg = flood(w, h, (k) => lum(data, k * 3) > 190);
    let fg = new Uint8Array(w * h); for (let k = 0; k < w * h; k++) fg[k] = bg[k] ? 0 : 1;
    fg = fillHoles(w, h, fg);
    await bake('tee-pixel-back', data, w, h, await soften(w, h, fg, 1.0), 4, 1000);
  }
  /* Mugs (one file, two mugs). */
  {
    const { data, w, h } = await load('black-mockup-copy-2.jpg');
    // black mug: dark key, handle hole kept open
    const box = await polyMask(w, h, [[[780, 230], [1470, 230], [1470, 1040], [780, 1040]]]);
    const dark = new Uint8Array(w * h);
    const core = await polyMask(w, h, [[[830, 520], [900, 430], [1000, 385], [1100, 400], [1170, 450], [1230, 560], [1250, 700], [1230, 820], [1130, 930], [1050, 950], [1000, 930], [940, 850], [880, 740], [835, 620]]]);
    for (let k = 0; k < w * h; k++) dark[k] = (box[k] && lum(data, k * 3) < 95) || core[k] ? 1 : 0;
    const filled = fillHoles(w, h, dark, [[1310, 570]]);
    await bake('mug-black', data, w, h, await soften(w, h, filled, 1.2), 8, 800);
    // white mug: hand-traced outline, handle hole cut out (white on a light ground)
    const wm = await polyMask(w, h, [[
      [205, 385], [218, 338], [260, 296], [325, 288], [405, 298], [480, 290], [570, 288], [660, 320], [750, 380], [805, 440],
      [817, 475], [808, 510], [770, 600], [700, 700], [630, 800], [605, 845], [560, 852], [500, 845], [440, 815], [370, 750],
      [305, 660], [280, 620], [315, 575], [280, 560], [235, 548], [212, 515], [205, 460]]]);
    const hole = await polyMask(w, h, [[[245, 365], [290, 330], [350, 322], [402, 335], [385, 420], [352, 500], [325, 545], [280, 535], [250, 500], [240, 430]]]);
    const wf = new Uint8Array(w * h); for (let k = 0; k < w * h; k++) wf[k] = wm[k] && !hole[k] ? 1 : 0;
    await bake('mug-white', data, w, h, await soften(w, h, wf, 1.4), 8, 800);
  }
  /* Cups on red. */
  for (const n of ['1', '2']) {
    const { data, w, h } = await load(`cup-design-${n}.jpg`);
    const isBg = (k) => { const r = data[k * 3], g = data[k * 3 + 1], b = data[k * 3 + 2]; return r > 70 && g < 92 && b < 92 && r - g > 70; };
    const bg = flood(w, h, isBg);
    const fg = new Uint8Array(w * h); for (let k = 0; k < w * h; k++) fg[k] = bg[k] ? 0 : 1;
    await bake(`cup-${n}`, data, w, h, await soften(w, h, fillHoles(w, h, largest(w, h, fg)), 1.2), 8, 700);
  }
  /* Tote: the red bag body only (the straps are black on black); straps are drawn when composing. */
  {
    const { data, w, h } = await load('le-smash-totebag-3.jpg');
    const q = await polyMask(w, h, [[[606, 462], [1018, 462], [1022, 1040], [576, 1036]]]);
    const fg = new Uint8Array(w * h);
    for (let k = 0; k < w * h; k++) { const r = data[k * 3], g = data[k * 3 + 1], b = data[k * 3 + 2]; fg[k] = q[k] && ((r > 105 && r > g * 1.7) || (r > 150 && g > 120 && b < 170)) ? 1 : 0; }
    await bake('tote', data, w, h, await soften(w, h, largest(w, h, fillHoles(w, h, fg)), 1.2), 4, 700);
  }
  /* YGN jersey: photographic product shots (hanger included); two polygons because the shirts overlap. */
  {
    const { data, w, h } = await load('le-smash-jersey-final-1.jpg');
    const front = [[592, 168], [650, 168], [662, 212], [800, 330], [800, 525], [836, 545], [838, 585], [812, 600], [814, 1075], [385, 1075], [385, 368], [560, 205]];
    const back = [[958, 82], [1012, 82], [1030, 150], [1205, 255], [1205, 1075], [800, 1075], [800, 590], [800, 530], [800, 300], [940, 150]];
    const L = Buffer.alloc(w * h); for (let k = 0; k < w * h; k++) L[k] = lum(data, k * 3);
    const blurLum = new Uint8Array(await sharp(L, { raw: { width: w, height: h, channels: 1 } }).blur(2).extractChannel(0).raw().toBuffer());
    for (const [name, poly] of [['jersey-front', front], ['jersey-back', back]]) {
      const pm = await polyMask(w, h, [poly]);
      const fg = new Uint8Array(w * h);
      for (let k = 0; k < w * h; k++) fg[k] = pm[k] && blurLum[k] > 22 ? 1 : 0;
      const rf = rowFill(w, h, largest(w, h, fillHoles(w, h, fg)), 560);
      const sm = await soften(w, h, rf, 9);
      const cl0 = new Uint8Array(w * h); for (let k = 0; k < w * h; k++) cl0[k] = sm[k] > 120 ? 1 : 0; const cl = largest(w, h, cl0);
      await bake(name, data, w, h, await soften(w, h, cl, 1.4), 6, 1000);
    }
  }
}

if (which === 'products' || which === 'all') await products();

/* ---------- print artwork ---------- */
/** Ink-on-light artwork -> crisp alpha (4x lanczos + contrast curve), red kept red, ink recoloured. */
async function inkArt(file, box, outName, { up = 4 } = {}) {
  const { data, w, h } = await load(file, box);
  const L = Buffer.alloc(w * h), M = Buffer.alloc(w * h), R = Buffer.alloc(w * h);
  for (let k = 0; k < w * h; k++) L[k] = lum(data, k * 3);
  const bgb = new Uint8Array(await sharp(L, { raw: { width: w, height: h, channels: 1 } }).blur(10).extractChannel(0).raw().toBuffer());
  for (let k = 0; k < w * h; k++) {
    const r = data[k * 3], g = data[k * 3 + 1], b = data[k * 3 + 2];
    const mn = Math.min(r, g, b);
    const bgv = Math.max(bgb[k], 120);
    M[k] = Math.max(0, Math.min(255, ((bgv - mn) / bgv) * 255 * 1.15));
    R[k] = r - Math.max(g, b) > 45 ? 255 : 0;
  }
  const W = w * up, H = h * up;
  const upM = new Uint8Array(await sharp(M, { raw: { width: w, height: h, channels: 1 } }).resize(W, H, { kernel: 'lanczos3' }).extractChannel(0).raw().toBuffer());
  const upR = new Uint8Array(await sharp(R, { raw: { width: w, height: h, channels: 1 } }).resize(W, H, { kernel: 'lanczos3' }).extractChannel(0).raw().toBuffer());
  for (const [suffix, ink] of [['ink', [22, 18, 18]], ['light', [244, 236, 224]]]) {
    const rgba = Buffer.alloc(W * H * 4);
    for (let k = 0; k < W * H; k++) {
      const t = Math.max(0, Math.min(1, (upM[k] / 255 - 0.3) / 0.28));
      const a = t * t * (3 - 2 * t);
      const c = upR[k] > 110 ? [216, 53, 54] : ink;
      rgba[k * 4] = c[0]; rgba[k * 4 + 1] = c[1]; rgba[k * 4 + 2] = c[2]; rgba[k * 4 + 3] = Math.round(a * 255);
    }
    const info = await sharp(rgba, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 8 }).png({ compressionLevel: 9 }).toFile(`${OUT}${outName}-${suffix}.png`);
    console.log(`${outName}-${suffix}`, info.width + 'x' + info.height);
  }
}
async function flameArt() {
  const { data, w, h } = await load('1.jpg', { left: 1222, top: 462, width: 82, height: 90 });
  const up = 4, W = w * up, H = h * up;
  const rgba = Buffer.alloc(w * h * 4);
  for (let k = 0; k < w * h; k++) {
    const r = data[k * 3], g = data[k * 3 + 1], b = data[k * 3 + 2], mx = Math.max(r, g, b);
    const t = Math.max(0, Math.min(1, (mx - 45) / 50));
    rgba[k * 4] = Math.min(255, r * 1.1); rgba[k * 4 + 1] = g; rgba[k * 4 + 2] = b; rgba[k * 4 + 3] = Math.round(t * t * (3 - 2 * t) * 255);
  }
  const info = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).resize(W, H, { kernel: 'lanczos3' }).trim({ threshold: 20 }).png({ compressionLevel: 9 }).toFile(OUT + 'art-flame-chest.png');
  console.log('art-flame-chest', info.width + 'x' + info.height);
}
async function art() {
  await inkArt('le-smash-t-shirt-mockup.jpg', { left: 112, top: 200, width: 140, height: 150 }, 'art-monogram');
  await inkArt('le-smash-t-shirt-mockup.jpg', { left: 590, top: 222, width: 70, height: 40 }, 'art-chest', { up: 6 });
  await flameArt();
}

/* ---------- composed garments ---------- */
const CW = 640, CH = 760;
const HOOK = 'M320 134 L320 100 C320 84 340 80 340 62 C340 38 308 30 298 50';
const WIRE = '<linearGradient id="wire" x1="0" x2="1"><stop offset="0" stop-color="#6d7378"/><stop offset=".35" stop-color="#f3f5f6"/><stop offset=".6" stop-color="#a5abb0"/><stop offset="1" stop-color="#555b60"/></linearGradient>';
const hookSvg = `<path d="${HOOK}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="7" stroke-linecap="round" transform="translate(2 3)"/><path d="${HOOK}" fill="none" stroke="url(#wire)" stroke-width="5" stroke-linecap="round"/>`;

function teeSVG({ face, base, dark, art = [] }) {
  const sh = dark ? 'rgba(0,0,0,' : 'rgba(70,64,56,';
  const hi = 'rgba(255,255,255,';
  const inner = dark ? '#0c0c0e' : '#c9c6bf';
  const rib = dark ? ['#2a2a2e', '#121214'] : ['#f6f5f1', '#d5d2cb'];
  const D = 'M250 128 C280 140 360 140 390 128 L538 156 C574 166 598 204 614 246 L588 336 L528 310 C532 420 534 540 530 660 C440 684 200 684 110 660 C106 540 108 420 112 310 L52 336 L26 246 C42 204 66 166 102 156 Z';
  const front = face === 'front';
  const neckOuter = front ? 'M244 128 C262 204 378 204 396 128' : 'M250 130 C282 150 358 150 390 130';
  const neckHole = 'M256 131 C274 184 366 184 384 131 Z';
  const arts = art.map((a) => `<image href="data:image/png;base64,${a.b64}" x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" preserveAspectRatio="xMidYMid meet"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CW}" height="${CH}" viewBox="0 0 ${CW} ${CH}">
<defs>
  <clipPath id="c"><path d="${D}"/></clipPath>
  <linearGradient id="side" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="${dark ? 0.5 : 0.3}"/><stop offset=".16" stop-color="#000" stop-opacity="${dark ? 0.12 : 0.07}"/><stop offset=".42" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#000" stop-opacity="0.02"/><stop offset=".84" stop-color="#000" stop-opacity="${dark ? 0.16 : 0.09}"/><stop offset="1" stop-color="#000" stop-opacity="${dark ? 0.5 : 0.32}"/></linearGradient>
  <linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${dark ? 0.16 : 0.5}"/><stop offset=".22" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${dark ? 0.35 : 0.16}"/></linearGradient>
  <radialGradient id="chest" cx=".47" cy=".4" r=".5"><stop offset="0" stop-color="#fff" stop-opacity="${dark ? 0.1 : 0.55}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="slL" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="${dark ? 0.35 : 0.2}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
  <linearGradient id="slR" x1="1" x2="0"><stop offset="0" stop-color="#000" stop-opacity="${dark ? 0.35 : 0.2}"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
  <linearGradient id="rib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rib[0]}"/><stop offset="1" stop-color="${rib[1]}"/></linearGradient>
  ${WIRE}
  <filter id="b8" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="b4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.5"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${dark ? 0.1 : 0.08} 0"/></filter>
  <filter id="drop" x="-10%" y="-5%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="7"/><feOffset dy="8"/><feComponentTransfer><feFuncA type="linear" slope=".22"/></feComponentTransfer></filter>
</defs>
<path d="${D}" filter="url(#drop)" opacity=".9"/>
<g clip-path="url(#c)">
  <rect width="${CW}" height="${CH}" fill="${base}"/>
  <rect x="0" y="120" width="${CW}" height="580" fill="url(#top)"/>
  <rect x="0" y="120" width="${CW}" height="580" fill="url(#side)"/>
  <ellipse cx="300" cy="300" rx="230" ry="190" fill="url(#chest)"/>
  <path d="M26 246 L112 160 L134 330 L52 336 Z" fill="url(#slL)"/>
  <path d="M614 246 L528 160 L506 330 L588 336 Z" fill="url(#slR)"/>
  <g filter="url(#b8)" fill="none" stroke-linecap="round">
    <path d="M136 336 C196 404 236 470 254 584" stroke="${sh}${dark ? 0.55 : 0.2})" stroke-width="26"/>
    <path d="M506 336 C450 406 412 478 394 590" stroke="${sh}${dark ? 0.55 : 0.2})" stroke-width="24"/>
    <path d="M150 360 C206 420 244 484 262 570" stroke="${hi}${dark ? 0.1 : 0.7})" stroke-width="14"/>
    <path d="M494 366 C444 424 408 488 392 572" stroke="${hi}${dark ? 0.08 : 0.6})" stroke-width="12"/>
    <path d="M300 170 C292 300 306 470 296 640" stroke="${hi}${dark ? 0.09 : 0.55})" stroke-width="46"/>
    <path d="M114 636 C200 654 262 626 332 644 C410 660 468 640 528 650" stroke="${sh}${dark ? 0.5 : 0.22})" stroke-width="14"/>
    <path d="M130 250 C180 262 220 290 250 330" stroke="${sh}${dark ? 0.35 : 0.14})" stroke-width="16"/>
    <path d="M510 250 C460 262 420 290 392 330" stroke="${sh}${dark ? 0.35 : 0.14})" stroke-width="16"/>
  </g>
  <g fill="none" stroke-linecap="round">
    <path d="M102 156 C130 220 122 270 112 310" stroke="${sh}${dark ? 0.7 : 0.3})" stroke-width="2.4"/>
    <path d="M106 156 C134 220 126 270 116 310" stroke="${hi}${dark ? 0.12 : 0.8})" stroke-width="1.6"/>
    <path d="M538 156 C510 220 518 270 528 310" stroke="${sh}${dark ? 0.7 : 0.3})" stroke-width="2.4"/>
    <path d="M534 156 C506 220 514 270 524 310" stroke="${hi}${dark ? 0.12 : 0.8})" stroke-width="1.6"/>
    <path d="M34 252 L59 328" stroke="${sh}${dark ? 0.55 : 0.28})" stroke-width="1.6" stroke-dasharray="4 3"/>
    <path d="M606 252 L581 328" stroke="${sh}${dark ? 0.55 : 0.28})" stroke-width="1.6" stroke-dasharray="4 3"/>
    <path d="M118 648 C200 668 440 668 524 648" stroke="${sh}${dark ? 0.55 : 0.3})" stroke-width="1.6" stroke-dasharray="5 3"/>
    <path d="M102 156 L250 128 M538 156 L390 128" stroke="${hi}${dark ? 0.16 : 0.9})" stroke-width="2"/>
  </g>
  ${front ? `<path d="${neckHole}" fill="${inner}"/><path d="M262 134 C280 172 360 172 378 134" fill="none" stroke="#000" stroke-opacity="${dark ? 0.5 : 0.1}" stroke-width="10" filter="url(#b4)"/>` : ''}
  <path d="${neckOuter}" fill="none" stroke="url(#rib)" stroke-width="15" stroke-linecap="round"/>
  <path d="${neckOuter}" fill="none" stroke="${sh}${dark ? 0.7 : 0.3})" stroke-width="1.5" transform="translate(0 7.5)"/>
  <path d="${neckOuter}" fill="none" stroke="${hi}${dark ? 0.2 : 0.9})" stroke-width="1.4" transform="translate(0 -6.5)"/>
  ${arts}
  <rect width="${CW}" height="${CH}" filter="url(#grain)"/>
</g>
${hookSvg}
</svg>`;
}
const b64 = (f) => fs.readFileSync(OUT + f).toString('base64');
async function dims(f) { const m = await sharp(OUT + f).metadata(); return { w: m.width, h: m.height }; }

/** trim each face, align hooks on a shared centre line, pad to a common canvas, write webp (+ png). */
async function alignSet(prefix, faces, scaleH) {
  const items = [];
  for (const [side, buf] of Object.entries(faces)) {
    const trimmed = await sharp(buf).trim({ threshold: 6 }).png().toBuffer();
    const { data, info } = await sharp(trimmed).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let sx = 0, n = 0;
    for (let y = 0; y < 14; y++) for (let x = 0; x < info.width; x++) if (data[(y * info.width + x) * 4 + 3] > 128) { sx += x; n++; }
    items.push({ side, buf: trimmed, w: info.width, h: info.height, hx: n ? sx / n : info.width / 2 });
  }
  const half = Math.ceil(Math.max(...items.flatMap((i) => [i.hx, i.w - i.hx])));
  const Wd = half * 2, Ht = Math.max(...items.map((i) => i.h));
  for (const i of items) {
    const base = await sharp({ create: { width: Wd, height: Ht, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: i.buf, left: Math.round(half - i.hx), top: 0 }]).png().toBuffer();
    const scale = scaleH / Ht;
    const fw = Math.round(Wd * scale), fh = Math.round(Ht * scale);
    const pipe = sharp(base).resize(fw, fh, { kernel: 'lanczos3' });
    await pipe.clone().png({ compressionLevel: 9 }).toFile(`${OUT}${prefix}-${i.side}.png`);
    const info = await pipe.clone().webp({ quality: 86, alphaQuality: 90 }).toFile(`${OUT}${prefix}-${i.side}.webp`);
    console.log(`${prefix}-${i.side}`, fw + 'x' + fh, (info.size / 1024).toFixed(0) + 'KB webp');
  }
}
async function garments() {
  const mono = { ink: b64('art-monogram-ink.png'), light: b64('art-monogram-light.png') };
  const chest = { ink: b64('art-chest-ink.png'), light: b64('art-chest-light.png') };
  const md = await dims('art-monogram-ink.png'), cd = await dims('art-chest-ink.png'), fd = await dims('art-flame-chest.png');
  const place = (d, cx, cy, wid) => ({ x: Math.round(cx - wid / 2), y: Math.round(cy - (wid * d.h) / d.w / 2), w: wid, h: Math.round((wid * d.h) / d.w) });
  const rend = async (o) => sharp(Buffer.from(teeSVG(o))).png().toBuffer();
  for (const [prefix, dark] of [['tee-white', false], ['tee-black', true]]) {
    const base = dark ? '#18181b' : '#ecebe6';
    const back = await rend({ face: 'back', base, dark, art: [{ b64: dark ? mono.light : mono.ink, ...place(md, 320, 330, 150) }] });
    const front = await rend({ face: 'front', base, dark, art: [{ b64: dark ? chest.light : chest.ink, ...place(cd, 400, 250, 56) }] });
    await alignSet(prefix, { front, back }, 700);
  }
  /* pixel-flame tee: real flat-lay photo for the back, composed plain black for the front */
  {
    const front = await rend({ face: 'front', base: '#18181b', dark: true, art: [{ b64: b64('art-flame-chest.png'), ...place(fd, 400, 250, 58) }] });
    const photo = await sharp(OUT + 'tee-pixel-back.png').toBuffer();
    const pm = await sharp(photo).metadata();
    const hook = `<svg xmlns="http://www.w3.org/2000/svg" width="${pm.width}" height="${pm.height + 110}"><defs>${WIRE}</defs><g transform="translate(${pm.width / 2 - 320} -26)">${hookSvg}</g></svg>`;
    const back = await sharp({ create: { width: pm.width, height: pm.height + 110, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: photo, left: 0, top: 108 }, { input: Buffer.from(hook), left: 0, top: 0 }]).png().toBuffer();
    const fr = await sharp(front).trim({ threshold: 6 }).resize({ width: pm.width, fit: 'inside' }).png().toBuffer();
    await alignSet('tee-pixel', { back, front: fr }, 700);
  }
  /* jersey: the real photographs, hooks aligned */
  await alignSet('jersey', { front: fs.readFileSync(OUT + 'jersey-front.png'), back: fs.readFileSync(OUT + 'jersey-back.png') }, 820);

  /* tote: real bag body + drawn straps */
  {
    const t = await sharp(OUT + 'tote.png').toBuffer();
    const m = await sharp(t).metadata();
    const w = m.width, h = m.height, top = Math.round(h * 0.62);
    const sp = `M${w * 0.3} ${top + 12} C${w * 0.27} 0 ${w * 0.73} 0 ${w * 0.7} ${top + 12}`;
    const straps = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h + top}"><defs><linearGradient id="s" x1="0" x2="1"><stop offset="0" stop-color="#0d0d0f"/><stop offset=".5" stop-color="#3b3b42"/><stop offset="1" stop-color="#0d0d0f"/></linearGradient></defs><path d="${sp}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="30" transform="translate(2 4)"/><path d="${sp}" fill="none" stroke="url(#s)" stroke-width="26"/></svg>`;
    const buf = await sharp({ create: { width: w, height: h + top, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([{ input: Buffer.from(straps), left: 0, top: 0 }, { input: t, left: 0, top }]).png().toBuffer();
    await sharp(buf).png({ compressionLevel: 9 }).toFile(OUT + 'tote-bag.png');
  }
}

if (which === 'art' || which === 'all') await art();
if (which === 'garments' || which === 'all') await garments();
if (which === 'webp' || which === 'all') {
  for (const n of ['mug-white', 'mug-black', 'cup-1', 'cup-2', 'tote-bag']) {
    const info = await sharp(`${OUT}${n}.png`).webp({ quality: 86, alphaQuality: 90 }).toFile(`${OUT}${n}.webp`);
    console.log(n + '.webp', (info.size / 1024).toFixed(0) + 'KB');
  }
}
