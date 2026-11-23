import { gsap } from 'gsap';
// Dev only: lets a background preview tab keep real time.
if (import.meta.env.DEV) gsap.ticker.lagSmoothing(0);
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
(window as any).__mcReady = true;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => Array.from(c.querySelectorAll(s)) as T[];
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ---------- Head: mask-rise lines ---------- */
if (!reduce) {
  const lines = $$('.mc-h1__line > span');
  gsap.set(lines, { yPercent: 110 });
  gsap.to(lines, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.12, delay: 0.1 });
}

/* ============================================================
   The rail. One damped loop drives every garment: spring sway,
   hover swing-out, drag-to-spin inertia, and the drop-in.
   ============================================================ */
interface Item {
  li: HTMLElement; btn: HTMLElement; pivot: HTMLElement; spin: HTMLElement; wall: HTMLElement;
  rest: number;          // 0 = front shows, 180 = back shows
  w: number; wt: number; // hover weight (current / target)
  side: number;          // which way the hover turn leans
  ang: number; av: number; hem: number; // spring swing (deg); hem trails the shoulders
  spinA: number; spinV: number; dragging: boolean; lastDrag: number;
  drop: number; hid: boolean; phase: number; dim: number;
}
interface Shot { label: string; src: string; w: number; h: number; alt: string }
interface Garment { id: string; name: string; tag: string; note: string; front: string; back: string; w: number; h: number; rest: 'front' | 'back'; frontAlt: string; backAlt: string; gallery: Shot[] }
const garments: Garment[] = JSON.parse($('#mc-garment-data')?.textContent || '[]');

const studio = $('[data-studio]');
const row3d = $('[data-row3d]');
const items: Item[] = $$('.mc-hang').map((li, i) => {
  const g = garments[i];
  const rest = g && g.rest === 'back' ? 180 : 0;
  return {
    li, btn: $('.mc-hang-btn', li)!, pivot: $('[data-pivot]', li)!, spin: $('[data-spin]', li)!, wall: $('.mc-wall', li)!,
    rest, w: 0, wt: 0, side: 1, ang: 0, av: 0, hem: 0, spinA: rest, spinV: 0, dragging: false, lastDrag: -9,
    drop: reduce ? 1 : 0, hid: false, phase: i * 1.7, dim: 0,
  };
});

let rackSeen = false;
let ptrX = -1e4, ptrIn = false, focusIdx = -1, tilt = 0, tiltT = 0, sheen = 50;
const nearest = (a: number) => Math.round(a / 180) * 180;

function paint(it: Item, t: number) {
  const idle = reduce ? 0 : Math.sin(t * 0.9 + it.phase) * 1.1 * (1 - it.w);
  if (it.drop < 1) it.li.style.opacity = String(Math.min(1, it.drop * 4)); else if (it.li.style.opacity !== "1") it.li.style.opacity = "1";
  const y = (1 - it.drop) * -520;
  const z = 170 * it.w - 70 * it.dim;
  const s = 1 + 0.2 * it.w - 0.05 * it.dim;
  // secondary motion: the hem lags the shoulders (a shear from the hanger down) and breathes on its own beat
  const breeze = reduce ? 0 : Math.sin(t * 0.9 + it.phase - 0.9) * 0.55 * (1 - it.w);
  const skew = clamp((it.ang - it.hem) * 0.9 + breeze, -5, 5);
  it.pivot.style.transform = `translate3d(0,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateZ(${(it.ang + idle).toFixed(2)}deg) rotateX(${(15 * it.w).toFixed(2)}deg) skewX(${skew.toFixed(2)}deg) scale(${s.toFixed(3)})`;
  it.spin.style.transform = `rotateY(${(it.spinA + 24 * it.w * it.side).toFixed(2)}deg)`;
  it.li.style.setProperty('--dim', it.dim.toFixed(3));
  it.li.style.setProperty('--hw', it.w.toFixed(3));
}

function rackStep(dt: number, t: number) {
  const rect = studio!.getBoundingClientRect();
  const lis = items.map((it) => it.li.getBoundingClientRect());
  // hover target by pointer proximity (or keyboard focus)
  let top = 0;
  items.forEach((it, i) => {
    let wt = 0;
    if (focusIdx === i) wt = 1;
    else if (ptrIn && !it.hid && !it.dragging) {
      const cx = lis[i].left + lis[i].width / 2;
      const d = Math.abs(ptrX - cx) / (lis[i].width * 0.62);
      wt = d < 1 ? Math.pow(1 - d * d, 1.4) : 0;
      if (ptrX < cx) it.side = -1; else it.side = 1;
    }
    it.wt = it.drop < 0.98 ? 0 : wt;
    if (it.dragging) it.wt = Math.max(it.wt, 0.9);
    top = Math.max(top, it.wt);
  });
  const k = 1 - Math.exp(-dt * 9);
  items.forEach((it, i) => {
    const prev = it.w;
    it.w += (it.wt - it.w) * k;
    // neighbours recede
    const dimT = clamp(top - it.wt, 0, 1) * 0.9;
    it.dim += (dimT - it.dim) * k;
    // spring swing: a hover nudge pushes neighbours, impact kicks everything
    it.av += (-26 * it.ang - 2.6 * it.av) * dt;
    const dw = it.w - prev;
    if (dw > 0.002) {
      const dir = it.side;
      it.av += -dir * dw * 260;
      [items[i - 1], items[i + 1]].forEach((n, j) => { if (n) n.av += (j === 0 ? 1 : -1) * dir * dw * 70; });
    }
    it.ang += it.av * dt;
    it.hem += (it.ang - it.hem) * (1 - Math.exp(-dt * 5.2));
    // spin inertia, then settle onto a face
    if (!it.dragging && !reduce) {
      if (Math.abs(it.spinV) > 22) {
        it.spinA += it.spinV * dt;
        it.spinV *= Math.exp(-dt * 2.1);
      } else {
        it.spinV = 0;
        it.spinA += (nearest(it.spinA) - it.spinA) * (1 - Math.exp(-dt * 5));
      }
    }
    // wall shadow under each piece
    it.wall.style.opacity = String(clamp(0.5 + it.w * 0.5 - it.dim * 0.2, 0, 1) * clamp(it.drop, 0, 1));
    if (!it.hid) paint(it, t);
  });
  // whole rail turns a touch toward the pointer
  tiltT = ptrIn ? clamp(((ptrX - (rect.left + rect.width / 2)) / rect.width) * -5, -3, 3) : 0;
  tilt += (tiltT - tilt) * (1 - Math.exp(-dt * 3));
  row3d!.style.transform = `rotateY(${tilt.toFixed(2)}deg)`;
  // light + chrome sheen follow the pointer (or drift when nobody is there)
  const sT = ptrIn ? clamp(((ptrX - rect.left) / rect.width) * 100, 0, 100) : 50 + Math.sin(t * 0.25) * 18;
  sheen += (sT - sheen) * (1 - Math.exp(-dt * 4));
  studio!.style.setProperty('--sx', sheen.toFixed(1) + '%');
}

if (studio && row3d && items.length) {
  items.forEach((it) => paint(it, 0));
  if (!reduce) {
    new IntersectionObserver((e) => { rackSeen = e[0].isIntersecting; }, { rootMargin: '120px' }).observe(studio);
    gsap.ticker.add((time, deltaMs) => { if (rackSeen) rackStep(Math.min(0.05, deltaMs / 1000), time); });
    studio.addEventListener('pointermove', (e: PointerEvent) => { if (e.pointerType === 'mouse' || e.pointerType === 'pen') { ptrX = e.clientX; ptrIn = true; } });
    studio.addEventListener('pointerleave', () => { ptrIn = false; });
    items.forEach((it, i) => {
      it.btn.addEventListener('focus', () => { if (it.btn.matches(':focus-visible')) focusIdx = i; });
      it.btn.addEventListener('blur', () => { if (focusIdx === i) focusIdx = -1; });
    });

    /* Drop onto the rail one after another, then let the spring settle it. */
    items.forEach((it) => { it.li.style.opacity = '0'; });
    ScrollTrigger.create({
      trigger: studio, start: 'top 85%', once: true,
      onEnter: () => {
        items.forEach((it, i) => {
          gsap.delayedCall(i * 0.14, () => {
            gsap.to(it, { drop: 1, duration: 0.55, ease: 'power3.in', onComplete: () => { it.av += 70 * (i % 2 ? -1 : 1); } });
          });
        });
      },
    });

    /* Drag a piece sideways to spin it (mouse / pen). Touch scrolls the rail instead. */
    let cur: Item | null = null, sx = 0, lx = 0, lt = 0, moved = false;
    items.forEach((it) => {
      it.btn.addEventListener('pointerdown', (e: PointerEvent) => {
        if (e.pointerType === 'touch' || e.button !== 0) return;
        cur = it; sx = lx = e.clientX; lt = performance.now(); moved = false; it.spinV = 0;
      });
    });
    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!cur) return;
      if (!moved && Math.abs(e.clientX - sx) > 6) { moved = true; cur.dragging = true; studio.classList.add('is-dragging'); }
      if (!moved) return;
      const now = performance.now();
      const dx = e.clientX - lx;
      cur.spinA += dx * 0.7;
      cur.spinV = 0.75 * cur.spinV + 0.25 * ((dx * 0.7) / Math.max(0.008, (now - lt) / 1000));
      lx = e.clientX; lt = now;
    });
    const end = () => {
      if (!cur) return;
      cur.dragging = false;
      cur.lastDrag = performance.now();
      if (!moved) cur.spinV = 0;
      cur = null; studio.classList.remove('is-dragging');
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    studio.addEventListener('click', (e) => { if (performance.now() - (items.reduce((m, i) => Math.max(m, i.lastDrag), 0)) < 120 && moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    studio.addEventListener('dragstart', (e) => e.preventDefault());
  }
}

/* ============================================================
   Detail: the garment large, turning slowly in 3D; See it worn.
   ============================================================ */
const dlg = $<HTMLDialogElement>('#mc-detail');
if (dlg && garments.length && items.length) {
  const d = dlg;
  const stage = $('[data-stage]', d)!;
  const dspin = $('[data-dspin]', d)!;
  const fImg = $<HTMLImageElement>('[data-f]', d)!;
  const bImg = $<HTMLImageElement>('[data-b]', d)!;
  const eImgs = $$<HTMLImageElement>('[data-e]', d);
  const copy = $('[data-copy]', d)!;
  const worn = $('[data-worn]', d)!;
  const wimg = $<HTMLImageElement>('[data-wimg]', d)!;
  const thumbs = $('[data-thumbs]', d)!;
  const cap = $('[data-d-cap]', d)!;
  const hint = $('[data-hint]', d)!;
  const threeD = $('[data-3d]', d)!;
  let g: Garment | null = null, src: Item | null = null, trigger: HTMLElement | null = null;
  let ang = 0, vel = 0, drag = false, lastTouch = -99, busy = false, shot = -1, raf = 0, last = 0;

  const tick = (time: number) => {
    const dt = Math.min(0.05, (time - last) / 1000); last = time;
    if (!drag) {
      if (Math.abs(vel) > 6) { ang += vel * dt; vel *= Math.exp(-dt * 2.2); }
      else if (!reduce && performance.now() - lastTouch > 1800) ang += 16 * dt;
    }
    dspin.style.transform = `rotateY(${ang.toFixed(2)}deg)`;
    raf = requestAnimationFrame(tick);
  };

  let dx0 = 0, dl = 0, dtm = 0, sx0 = 0, swiping = false;
  stage.addEventListener('pointerdown', (e: PointerEvent) => {
    if (shot >= 0) { sx0 = e.clientX; swiping = true; return; }
    drag = true; dx0 = dl = e.clientX; dtm = performance.now(); vel = 0; lastTouch = performance.now();
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e: PointerEvent) => {
    if (!drag) return;
    const now = performance.now(); const dx = e.clientX - dl;
    ang += dx * 0.6;
    vel = 0.75 * vel + 0.25 * ((dx * 0.6) / Math.max(0.008, (now - dtm) / 1000));
    dl = e.clientX; dtm = now; lastTouch = now;
  });
  const up = () => { drag = false; lastTouch = performance.now(); };
  stage.addEventListener('pointerup', (e: PointerEvent) => {
    if (swiping) { swiping = false; const dx = e.clientX - sx0; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); }
    up();
  });
  stage.addEventListener('pointercancel', up);
  d.addEventListener('keydown', (e) => {
    const dir = e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0;
    if (!dir) return;
    if (shot >= 0 || e.shiftKey) { step(dir); e.preventDefault(); } else { ang += 40 * dir; lastTouch = performance.now(); }
  });

  /** idx -1 = the garment turning in 3D; 0.. = a real photo from the gallery */
  function setShot(idx: number) {
    if (!g) return;
    const n = g.gallery.length;
    if (idx >= n) idx = -1; else if (idx < -1) idx = n - 1;
    const was = shot;
    shot = idx;
    const on = idx >= 0;
    $$('button', thumbs).forEach((b, i) => b.setAttribute('aria-pressed', String(i - 1 === idx)));
    if (on) {
      const v = g.gallery[idx];
      d.style.setProperty('--wr', String(v.w / v.h));
      wimg.src = v.src; wimg.alt = v.alt;
      cap.textContent = v.label;
      worn.removeAttribute('aria-hidden');
    } else { cap.textContent = 'Spin it'; worn.setAttribute('aria-hidden', 'true'); }
    hint.textContent = on ? 'Swipe for the next one' : 'Drag to turn it';
    d.classList.toggle('is-worn', on);
    if (was === idx) return;
    if (!reduce) {
      gsap.to(threeD, { opacity: on ? 0 : 1, scale: on ? 0.94 : 1, duration: 0.45, ease: 'power2.out' });
      gsap.fromTo(worn, { opacity: on ? (was >= 0 ? 0.2 : 0) : 1, scale: 1.02 }, { opacity: on ? 1 : 0, scale: 1, duration: 0.45, ease: 'power2.out' });
    } else { gsap.set(threeD, { opacity: on ? 0 : 1 }); gsap.set(worn, { opacity: on ? 1 : 0 }); }
  }
  const step = (dir: number) => setShot(shot + dir);

  function open(id: string, btn: HTMLElement) {
    const gi = garments.findIndex((x) => x.id === id);
    if (gi < 0 || busy) return;
    g = garments[gi]; src = items[gi]; trigger = btn; busy = false;
    $('[data-d-tag]', d)!.textContent = g.tag;
    $('[data-d-name]', d)!.textContent = g.name;
    $('[data-d-note]', d)!.textContent = g.note;
    d.style.setProperty('--ar', `${g.w}/${g.h}`);
    fImg.src = g.front; fImg.alt = g.frontAlt; bImg.src = g.back; bImg.alt = '';
    eImgs.forEach((e) => { e.src = g!.front; });
    thumbs.innerHTML = '';
    const mk = (label: string, img: string, i: number) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'mc-d-thumb'; b.setAttribute('aria-label', i < 0 ? 'Spin it, the garment in 3D' : label);
      b.innerHTML = `<img src="${img}" alt="" draggable="false" decoding="async" /><span>${i < 0 ? 'Spin it' : label}</span>`;
      b.addEventListener('click', () => setShot(i));
      thumbs.appendChild(b);
    };
    mk('Spin it', g.rest === 'back' ? g.back : g.front, -1);
    g.gallery.forEach((v, i) => mk(v.label, v.src, i));
    shot = -2; setShot(-1);
    gsap.set(threeD, { opacity: 1, scale: 1 }); gsap.set(worn, { opacity: 0, scale: 1 });
    ang = src.spinA; vel = 0; lastTouch = performance.now();

    const from = src.pivot.getBoundingClientRect();
    d.showModal();
    document.documentElement.classList.add('mc-locked');
    src.hid = true; src.li.classList.add('is-off');
    dspin.style.transform = `rotateY(${ang}deg)`;
    last = performance.now();
    // Land on the piece being worn: the 3D garment flies down, then the photo of a person wearing it takes over.
    const opened = g;
    if (g.gallery.length) gsap.delayedCall(reduce ? 0 : 1.15, () => { if (d.open && g === opened && shot === -1) setShot(0); });
    cancelAnimationFrame(raf);
    if (!reduce) raf = requestAnimationFrame(tick);
    if (reduce) return;
    gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    const to = stage.getBoundingClientRect();
    gsap.fromTo(stage,
      { x: from.left + from.width / 2 - (to.left + to.width / 2), y: from.top + from.height / 2 - (to.top + to.height / 2), scale: Math.min(1, from.height / to.height) },
      { x: 0, y: 0, scale: 1, duration: 0.85, ease: 'power3.out' });
    gsap.fromTo(copy.children, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55, delay: 0.25, ease: 'power2.out', stagger: 0.06 });
  }

  function close() {
    if (!d.open || busy || !src) return;
    busy = true;
    const it = src;
    const done = () => {
      cancelAnimationFrame(raf);
      d.close();
      document.documentElement.classList.remove('mc-locked');
      gsap.set([d, stage, copy.children, threeD, worn], { clearProps: 'all' });
      busy = false;
      it.spinA = nearest(ang); it.spinV = 0;
      it.hid = false; it.li.classList.remove('is-off');
      if (!reduce) { it.drop = 0.72; gsap.to(it, { drop: 1, duration: 0.45, ease: 'power3.in', onComplete: () => { it.av += 55; } }); }
      trigger?.focus({ preventScroll: true });
    };
    if (reduce) return done();
    const from = it.pivot.getBoundingClientRect();
    const to = stage.getBoundingClientRect();
    gsap.to(copy.children, { opacity: 0, duration: 0.15 });
    gsap.to(d, { opacity: 0, duration: 0.45, delay: 0.1 });
    gsap.to(stage, {
      x: from.left + from.width / 2 - (to.left + to.width / 2), y: from.top - to.top - to.height * 0.04,
      scale: Math.min(1, from.height / to.height), duration: 0.55, ease: 'power3.inOut', onComplete: done,
    });
  }

  items.forEach((it) => it.btn.addEventListener('click', () => open(it.btn.dataset.garment!, it.btn)));
  $('[data-close]', d)!.addEventListener('click', close);
  d.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  d.addEventListener('click', (e) => { const t = e.target as Element; if (t === d || t.classList.contains('mc-d-fig')) close(); });
  (window as any).__mcOpen = (id: string) => { const b = $(`.mc-hang-btn[data-garment="${id}"]`); if (b) open(id, b); };
  (window as any).__mcClose = close;
}

/* ============================================================
   The line-up: a 3D ring. Scroll scrubs it (pinned on desktop);
   drag, swipe, arrows and buttons turn it too.
   ============================================================ */
const arc = $('[data-arc]');
const ring = $('[data-ring]');
if (arc && ring) {
  const lis = $$('.mc-ri', ring);
  const n = lis.length;
  const info: { name: string; note: string; glow: string }[] = JSON.parse($('#mc-lineup-data')?.textContent || '[]');
  const glows = info.map((x) => x.glow.split(' ').map(Number));
  const nameBox = $('[data-name]')!;
  const nameN = $('[data-name-n]')!;
  const nameD = $('[data-name-d]')!;
  let manual = 0, scrollP = 0, cur = 0, shown = -1, seen = false;
  let dragging = false, dragVel = 0;
  const target = () => scrollP * (n - 1) + manual;
  const wrapD = (d: number) => { d = ((d % n) + n) % n; return d > n / 2 ? d - n : d; };

  function render() {
    const R = clamp(arc!.clientWidth * 0.36, 190, 440);
    const front = ((Math.round(cur) % n) + n) % n;
    lis.forEach((li, i) => {
      const d = wrapD(i - cur);
      const th = d * (360 / n);
      const rad = (th * Math.PI) / 180;
      const w = Math.exp(-d * d * 1.6);
      const x = Math.sin(rad) * R;
      const z = (Math.cos(rad) - 1) * R * 0.9;
      const y = -34 * w;
      const s = 1 + 0.2 * w;
      const op = clamp(1.25 - Math.abs(d) * 0.5, 0, 1);
      li.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${(th * 0.82).toFixed(1)}deg) scale(${s.toFixed(3)})`;
      li.style.opacity = op.toFixed(2);
      li.style.zIndex = String(Math.round((w + 0.01) * 100) + (op > 0.02 ? 0 : -50));
      li.style.setProperty('--lw', w.toFixed(3));
      li.style.visibility = op < 0.02 ? 'hidden' : 'visible';
      li.classList.toggle('is-on', i === front);
      li.firstElementChild!.toggleAttribute('tabindex', false);
    });
    // light colour: blend the two nearest pieces
    const i0 = Math.floor(((cur % n) + n) % n), f = ((cur % n) + n) % n - i0;
    const a = glows[i0], b = glows[(i0 + 1) % n];
    const rgb = a.map((v, k) => Math.round(v + (b[k] - v) * f)).join(' ');
    (arc as HTMLElement).style.setProperty('--glow', rgb);
    if (front !== shown) {
      shown = front;
      const set = () => { nameN.textContent = info[front].name; nameD.textContent = info[front].note; };
      if (reduce) set(); else gsap.fromTo(nameBox, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', onStart: set });
    }
  }
  render();

  const stepTo = (i: number) => { manual = Math.round(manual + wrapD(i - cur)); if (reduce) { cur = target(); render(); } };
  const go = (dir: number) => { manual = Math.round(manual) + dir; if (reduce) { cur = target(); render(); } };
  $('[data-prev]')!.addEventListener('click', () => go(-1));
  $('[data-next]')!.addEventListener('click', () => go(1));
  lis.forEach((li, i) => li.addEventListener('click', () => { if (!dragMoved) stepTo(i); }));
  arc.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { go(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(-1); e.preventDefault(); }
  });

  /* drag / swipe */
  let sx = 0, lx = 0, lt = 0, dragMoved = false;
  const stepPx = () => clamp(arc.clientWidth * 0.22, 110, 260);
  arc.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true; dragMoved = false; sx = lx = e.clientX; lt = performance.now(); dragVel = 0;
  });
  window.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragging) return;
    if (!dragMoved && Math.abs(e.clientX - sx) > 6) { dragMoved = true; arc.setPointerCapture?.(e.pointerId); arc.classList.add('is-dragging'); }
    if (!dragMoved) return;
    const dx = e.clientX - lx, now = performance.now();
    manual -= dx / stepPx();
    dragVel = 0.7 * dragVel + 0.3 * (-dx / stepPx() / Math.max(0.008, (now - lt) / 1000));
    lx = e.clientX; lt = now;
    if (reduce) { cur = target(); render(); }
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false; arc.classList.remove('is-dragging');
    if (dragMoved) manual = Math.round(manual + clamp(dragVel, -6, 6) * 0.25);
    if (reduce) { cur = target(); render(); }
    setTimeout(() => { dragMoved = false; }, 0);
  };
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  arc.addEventListener('dragstart', (e) => e.preventDefault());

  /* scroll scrub (desktop, motion allowed) + the damped loop */
  if (!reduce) {
    new IntersectionObserver((e) => { seen = e[0].isIntersecting; }, { rootMargin: '200px' }).observe(arc);
    gsap.ticker.add((_t, deltaMs) => {
      if (!seen) return;
      const t = target();
      if (Math.abs(t - cur) < 0.0006) { if (cur !== t) { cur = t; render(); } return; }
      cur += (t - cur) * (1 - Math.exp(-(deltaMs / 1000) * 7));
      render();
    });
    const mm = gsap.matchMedia();
    mm.add('(min-width: 761px)', () => {
      const st = ScrollTrigger.create({
        trigger: '#lineup', start: 'top top', end: () => `+=${Math.round(innerHeight * 0.5 * (n - 1))}`,
        pin: '[data-pin]', pinSpacing: true, anticipatePin: 1,
        snap: { snapTo: 1 / (n - 1), duration: { min: 0.2, max: 0.55 }, ease: 'power2.inOut' },
        onUpdate: (self) => { scrollP = self.progress; },
      });
      return () => { st.kill(); scrollP = 0; };
    });
    window.addEventListener('resize', render);
  } else {
    cur = target(); render();
    window.addEventListener('resize', render);
  }
  (window as any).__mcRing = (p: number) => { manual = p; cur = p; render(); };
}
