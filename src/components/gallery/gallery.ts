import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
if (import.meta.env.DEV) gsap.ticker.lagSmoothing(0);

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = (n: number) => String(n).padStart(2, '0');
const root = document.documentElement;

/* =========================================================== lightbox ==== */
const lb = (() => {
  const dlg = $<HTMLDialogElement>('[data-gl-lb-dialog]');
  if (!dlg) return { open: (_g: string, _i: number) => {} };
  const img = $<HTMLImageElement>('[data-gl-lb-img]', dlg)!;
  const cap = $('[data-gl-lb-cap]', dlg)!;
  const count = $('[data-gl-lb-count]', dlg)!;
  const stage = $('[data-gl-lb-stage]', dlg)!;
  let items: HTMLElement[] = [];
  let idx = 0;
  let opener: HTMLElement | null = null;

  const srcOf = (el: HTMLElement) => el.dataset.full || (el as HTMLImageElement).currentSrc || (el as HTMLImageElement).src;
  const altOf = (el: HTMLElement) => (el instanceof HTMLImageElement ? el.alt : $<HTMLImageElement>('img', el)?.alt || '');

  function show(i: number, dir = 0) {
    idx = (i + items.length) % items.length;
    const el = items[idx];
    img.src = srcOf(el);
    img.alt = altOf(el);
    cap.textContent = el.dataset.cap || '';
    count.textContent = `${pad(idx + 1)} / ${pad(items.length)}`;
    if (!reduced) {
      gsap.fromTo(img, { scale: 0.86, rotation: dir ? dir * 3 : gsap.utils.random(-4, 4), autoAlpha: 0, x: dir * 60 },
        { scale: 1, rotation: 0, autoAlpha: 1, x: 0, duration: 0.55, ease: 'back.out(1.7)', overwrite: true });
    }
    // warm the neighbours
    [idx - 1, idx + 1].forEach((n) => { const e = items[(n + items.length) % items.length]; if (e) new Image().src = srcOf(e); });
  }
  function open(group: string, i: number) {
    items = $$(`[data-gl-lb="${group}"]`);
    if (!items.length) return;
    opener = items[i] || null;
    if (!dlg!.open) dlg!.showModal();
    root.classList.add('gl-lb-open');
    show(i);
  }
  function close() { if (dlg!.open) dlg!.close(); }
  dlg.addEventListener('close', () => {
    root.classList.remove('gl-lb-open');
    // Return focus to the thing that opened it (the ring hands it back to itself).
    const target = opener?.closest<HTMLElement>('[data-gl-ring]') || opener;
    target?.focus({ preventScroll: true });
  });
  $('[data-gl-lb-close]', dlg)!.addEventListener('click', close);
  $('[data-gl-lb-prev]', dlg)!.addEventListener('click', () => show(idx - 1, -1));
  $('[data-gl-lb-next]', dlg)!.addEventListener('click', () => show(idx + 1, 1));
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(idx - 1, -1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(idx + 1, 1); }
  });
  // click on the dark area closes
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target === stage) close(); });
  // swipe
  let sx = 0, sy = 0, down = false;
  stage.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', (e) => {
    if (!down) return; down = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  });
  stage.addEventListener('pointercancel', () => { down = false; });

  return { open };
})();

// Delegated opening for events, feed and the archive (the ring has its own handler).
document.addEventListener('click', (e) => {
  const t = (e.target as HTMLElement).closest<HTMLElement>('[data-gl-lb]');
  if (!t || t.hasAttribute('data-gl-card')) return;
  const g = t.dataset.glLb!;
  lb.open(g, $$(`[data-gl-lb="${g}"]`).indexOf(t));
});

// The archive tiles are plain <img>; make them openers without touching the shared component.
$$<HTMLImageElement>('[data-gl-archive] .tile img').forEach((im) => {
  im.dataset.glLb = 'archive';
  im.dataset.cap = '';
  im.tabIndex = 0;
  im.setAttribute('role', 'button');
  im.dataset.full = im.currentSrc || im.src;
  im.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); im.click(); }
  });
});

/* ========================================================== showcase ===== */
(() => {
  const sec = $('[data-gl-show]');
  const track = $('[data-gl-track]');
  if (!sec || !track) return;
  const pairs = $$('[data-gl-pair]', track);
  const n = pairs.length;
  const cur = $('[data-gl-cur]')!;
  const bar = $('[data-gl-bar]')!;
  const prev = $<HTMLButtonElement>('[data-gl-prev]')!;
  const next = $<HTMLButtonElement>('[data-gl-next]')!;
  let shown = -1;

  const setIdx = (i: number, animate = true) => {
    i = Math.max(0, Math.min(n - 1, i));
    if (i === shown) return;
    shown = i;
    cur.textContent = pad(i + 1);
    gsap.set(bar, { scaleX: (i + 1) / n });
    if (animate && !reduced) gsap.fromTo(cur, { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.4, ease: 'back.out(2)', overwrite: true });
  };
  setIdx(0, false);

  // ---- track mode: native swipe, buttons, auto-advance
  let pinned = false;
  const trackIdx = () => Math.round(track.scrollLeft / track.clientWidth);
  const goTrack = (i: number) => track.scrollTo({ left: ((i + n) % n) * track.clientWidth, behavior: reduced ? 'auto' : 'smooth' });
  track.addEventListener('scroll', () => { if (!pinned) setIdx(trackIdx()); }, { passive: true });
  prev.addEventListener('click', () => { pause(9000); goTrack(trackIdx() - 1); });
  next.addEventListener('click', () => { pause(9000); goTrack(trackIdx() + 1); });
  let hold = 0, inView = true;
  const pause = (ms: number) => { hold = performance.now() + ms; };
  ['pointerdown', 'touchstart', 'wheel', 'focusin'].forEach((ev) => track.addEventListener(ev, () => pause(9000), { passive: true }));
  new IntersectionObserver((es) => { inView = es[0].isIntersecting; }).observe(sec);
  if (!reduced) {
    setInterval(() => {
      if (pinned || !inView || document.hidden || performance.now() < hold) return;
      goTrack(trackIdx() + 1);
    }, 4200);
  }

  // ---- desktop pinned, scroll-scrubbed mode
  const mm = gsap.matchMedia();
  mm.add('(min-width: 62rem) and (prefers-reduced-motion: no-preference)', () => {
    pinned = true;
    sec.classList.add('gl-show--pin');
    track.scrollLeft = 0;
    const figs = pairs.map((p) => $$('[data-gl-pic]', p));
    const tilt = (i: number, j: number) => (j ? 1 : -1) * (2 + ((i * 37) % 3));
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true,
        end: () => `+=${Math.round((n - 1 + 0.7) * innerHeight * 0.75)}`,
        onUpdate: () => setIdx(Math.floor(tl.time() + 0.55)),
      },
    });
    figs.forEach((f, i) => {
      if (i === 0) { gsap.set(f, { rotation: (j: number) => tilt(0, j) }); return; }
      gsap.set(f, { autoAlpha: 0, scale: 0.55, yPercent: 40, rotation: (j: number) => tilt(i, j) * 3 });
    });
    for (let i = 0; i < n - 1; i++) {
      tl.to(figs[i][0], { xPercent: -70, yPercent: -14, rotation: -16, scale: 0.85, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, i)
        .to(figs[i][1], { xPercent: 70, yPercent: 14, rotation: 18, scale: 0.85, autoAlpha: 0, duration: 0.55, ease: 'power2.in' }, i + 0.07)
        .to(figs[i + 1], {
          autoAlpha: 1, scale: 1, yPercent: 0, rotation: (j: number) => tilt(i + 1, j),
          duration: 0.7, ease: 'back.out(1.7)', stagger: 0.12,
        }, i + 0.3);
    }
    tl.to({}, { duration: 0.01 }, n - 1 + 0.69);
    setIdx(0, false);
    return () => {
      pinned = false;
      sec.classList.remove('gl-show--pin');
      gsap.set(figs.flat(), { clearProps: 'all' });
      setIdx(trackIdx(), false);
    };
  });
})();

/* ========================================================= campaigns ===== */
/* Desktop: one pinned stage. A ribbon of nine poster cards is placed every
   update from a parametric curve (position, tangent rotateZ, twist rotateY/X,
   translateZ swell), then each card is blended from its ribbon pose into its
   grid slot. Mobile: a bent, swipeable band. Reduced motion: the grid only. */
(() => {
  const pin = $<HTMLElement>('[data-cp-pin]');
  const ribbon = $<HTMLElement>('[data-cp-ribbon]');
  if (!pin || !ribbon) return;
  const items = $$<HTMLElement>('[data-cp-item]', ribbon);
  const N = items.length;
  const a = $<HTMLElement>('[data-cp-a]')!;
  const b = $<HTMLElement>('[data-cp-b]')!;
  const label = $<HTMLElement>('[data-cp-label]')!;
  const hint = $<HTMLElement>('[data-cp-hint]')!;
  const buttons = items.map((it) => $<HTMLButtonElement>('button', it)!);
  const open = (i: number) => lb.open('campaigns', i);
  ribbon.addEventListener('click', (e) => {
    const it = (e.target as HTMLElement).closest<HTMLElement>('[data-cp-item]');
    if (it) open(Number(it.dataset.cpI));
  });

  const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const outCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const smooth = (t: number) => t * t * (3 - 2 * t);
  const mm = gsap.matchMedia();

  /* ----------------------------------------------------------- desktop --- */
  mm.add('(min-width: 56.25rem) and (prefers-reduced-motion: no-preference)', () => {
    type Pose = { x: number; y: number; z: number; rz: number; ry: number; rx: number; s: number };
    const GAP = 0.125;                         // card spacing along the curve
    const HEAD_END = 1 + (N - 1) * GAP + 0.14; // head travel until the last card has left
    const FLY0 = 0.6, FLY_STAGGER = 0.018, FLY_DUR = 0.2, SETTLE = 0.945;
    let W = 0, H = 0, gw = 250, gh = 333;
    let grid: Pose[] = [];
    let settled = false;
    const st = { p: 0 };

    // The ribbon curve. s runs 0..1 from off the bottom-left to off the top-right.
    const px = (s: number) => (-1.4 + 2.8 * s) * W * 0.5;
    const py = (s: number) => (0.9 - 1.8 * s - 0.5 * Math.sin(6.9115 * s)) * H * 0.5;
    const ribbonPose = (s: number): Pose => {
      const e = 0.01;
      const rz = Math.atan2(py(s + e) - py(s - e), px(s + e) - px(s - e)) * 57.2958;
      const swell = Math.exp(-(((s - 0.5) / 0.22) ** 2));
      return {
        x: px(s), y: py(s), z: 340 * swell,
        rz: Math.max(-30, Math.min(30, rz)),
        ry: 46 * Math.sin(6.2832 * s + 0.6),
        rx: 26 * Math.sin(5.0265 * s + 1.2),
        s: 0.95,
      };
    };

    const measure = () => {
      W = pin.clientWidth; H = pin.clientHeight;
      const top = 88, bottom = 52, gx = 16, gy = 16;
      const areaH = H - top - bottom;
      gw = Math.min((W - 2 * (W * 0.04) - 4 * gx) / 5, (areaH - gy) / 2 / (4 / 3));
      gh = gw * (4 / 3);
      pin.style.setProperty('--cw', `${gw}px`);
      pin.style.setProperty('--ch', `${gh}px`);
      ribbon.style.setProperty('--cw', `${gw}px`);
      ribbon.style.setProperty('--ch', `${gh}px`);
      const cy = (top + (H - bottom)) / 2 - H / 2;
      grid = items.map((_, i) => {
        const row = i < 5 ? 0 : 1, count = row ? N - 5 : 5, col = row ? i - 5 : i;
        const x = (col - (count - 1) / 2) * (gw + gx);
        const y = cy + (row - 0.5) * (gh + gy);
        return { x, y, z: 0, rz: 0, ry: 0, rx: 0, s: 1 };
      });
    };

    const render = (p: number) => {
      const head = clamp01((p - 0.08) / (FLY0 - 0.08)) * HEAD_END;
      for (let i = 0; i < N; i++) {
        const q = clamp01((p - (FLY0 + i * FLY_STAGGER)) / FLY_DUR);
        let o: Pose;
        if (q <= 0) o = ribbonPose(head - i * GAP);
        else {
          const f = ribbonPose(Math.min(HEAD_END - i * GAP, 1.25)), g = grid[i], t = outCubic(q);
          o = {
            x: f.x + (g.x - f.x) * t,
            y: f.y + (g.y - f.y) * t - Math.sin(Math.PI * q) * H * 0.1,
            z: f.z * (1 - t), rz: f.rz * (1 - t), ry: f.ry * (1 - t), rx: f.rx * (1 - t),
            s: f.s + (1 - f.s) * t,
          };
        }
        items[i].style.transform =
          `translate3d(${o.x.toFixed(1)}px,${o.y.toFixed(1)}px,${o.z.toFixed(1)}px) rotateZ(${o.rz.toFixed(2)}deg) rotateY(${o.ry.toFixed(2)}deg) rotateX(${o.rx.toFixed(2)}deg) scale(${o.s.toFixed(3)})`;
      }
      // headline: slides in from opposite sides, then leaves as the grid arrives
      const inn = outCubic(clamp01(p / 0.12)), out = smooth(clamp01((p - 0.5) / 0.14));
      const fade = String(1 - out);
      a.style.transform = `translate3d(${(-(1 - inn) * W * 0.8 - out * W * 0.25).toFixed(1)}px,0,0)`;
      b.style.transform = `translate3d(${((1 - inn) * W * 0.8 + out * W * 0.25).toFixed(1)}px,0,0)`;
      a.style.opacity = b.style.opacity = label.style.opacity = fade;
      hint.style.opacity = String(smooth(clamp01((p - 0.93) / 0.05)));
      const s = p >= SETTLE;
      if (s !== settled) {
        settled = s;
        ribbon.classList.toggle('is-settled', s);
        buttons.forEach((bt) => { bt.tabIndex = s ? 0 : -1; });
      }
    };

    measure(); render(0);
    const ro = new ResizeObserver(() => { measure(); render(st.p); });
    ro.observe(pin);
    gsap.to(st, {
      p: 1, ease: 'none', onUpdate: () => render(st.p),
      scrollTrigger: { trigger: pin, start: 'top top', end: () => `+=${Math.round(innerHeight * 3.8)}`, pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true },
    });
    return () => {
      ro.disconnect();
      ribbon.classList.remove('is-settled');
      [...items, a, b, label, hint].forEach((el) => { el.style.transform = ''; el.style.opacity = ''; });
      buttons.forEach((bt) => { bt.tabIndex = -1; });
    };
  });

  /* ------------------------------------------------------------ mobile --- */
  mm.add('(max-width: 56.24rem) and (prefers-reduced-motion: no-preference)', () => {
    let raf = 0, centres: number[] = [], half = 1;
    const measure = () => {
      half = ribbon.clientWidth / 2;
      centres = items.map((it) => it.offsetLeft + it.offsetWidth / 2);
    };
    const bend = () => {
      raf = 0;
      const mid = ribbon.scrollLeft + half;
      for (let i = 0; i < N; i++) {
        const d = Math.max(-1.6, Math.min(1.6, (centres[i] - mid) / half));
        items[i].style.transform =
          `translate3d(0,${(d * d * 16).toFixed(1)}px,${(-Math.abs(d) * 90).toFixed(1)}px) rotateY(${(-d * 30).toFixed(1)}deg) rotateZ(${(d * 3).toFixed(2)}deg)`;
      }
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(bend); };
    buttons.forEach((bt) => { bt.tabIndex = 0; });
    measure(); bend();
    ribbon.addEventListener('scroll', queue, { passive: true });
    const ro = new ResizeObserver(() => { measure(); bend(); });
    ro.observe(ribbon);
    // images lazy-load after first layout; remeasure once they settle
    addEventListener('load', () => { measure(); bend(); }, { once: true });
    return () => {
      ribbon.removeEventListener('scroll', queue);
      ro.disconnect(); cancelAnimationFrame(raf);
      items.forEach((it) => { it.style.transform = ''; });
      buttons.forEach((bt) => { bt.tabIndex = -1; });
    };
  });
})();

/* ===================================================== events wall pop === */
(() => {
  const snaps = $$('[data-gl-snap]');
  if (!snaps.length || reduced) return;
  gsap.set(snaps, { autoAlpha: 0 });
  ScrollTrigger.batch(snaps, {
    start: 'top 88%', once: true,
    onEnter: (els) => gsap.fromTo(els,
      { autoAlpha: 0, scale: 0.6, y: 50, rotation: () => gsap.utils.random(-8, 8) },
      { autoAlpha: 1, scale: 1, y: 0, rotation: (_i, t: HTMLElement) => parseFloat(getComputedStyle(t).getPropertyValue('--rot')) || 0,
        duration: 0.8, ease: 'back.out(1.7)', stagger: 0.1, clearProps: 'transform' }),
  });
})();
