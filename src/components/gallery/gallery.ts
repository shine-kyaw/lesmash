import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

/* ============================================================== ring ===== */
(() => {
  const ring = $<HTMLElement>('[data-gl-ring]');
  const rot = $<HTMLElement>('[data-gl-rot]');
  if (!ring || !rot) return;
  const cards = $$<HTMLButtonElement>('[data-gl-card]', rot);
  const shades = cards.map((c) => $<HTMLElement>('.gl-card__shade', c)!);
  const n = cards.length;
  const step = 360 / n;
  const numEl = $('[data-gl-ring-num]')!;
  const titleEl = $('[data-gl-ring-title]')!;
  const st = { rot: 0 };
  let R = 600, chord = 280, front = -1;
  let tween: gsap.core.Tween | null = null;
  let dragging = false, hovering = false, focused = false, inView = false, idleUntil = 0, moved = false;

  const layout = () => {
    const ws = cards.map((c) => c.offsetWidth).sort((a, b) => a - b);
    const wmax = ws[n - 1], wmid = ws[Math.floor(n / 2)];
    chord = (wmax + wmid) / 2 + 18;
    R = chord / (2 * Math.sin(Math.PI / n));
    ring.style.setProperty('--R', `${R}px`);
    cards.forEach((c, i) => c.style.setProperty('--a', `${i * step}deg`));
    render();
  };
  const wrap180 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
  function render() {
    gsap.set(rot, { z: -R, rotationY: -st.rot });
    for (let i = 0; i < n; i++) {
      const d = Math.abs(wrap180(i * step - st.rot));
      shades[i].style.opacity = String(Math.min(0.78, (d / 80) * 0.78));
    }
    const f = ((Math.round(st.rot / step) % n) + n) % n;
    if (f !== front) {
      front = f;
      numEl.textContent = `${pad(f + 1)} / ${pad(n)}`;
      titleEl.textContent = cards[f].dataset.cap || '';
    }
  }
  const settle = (target: number, dur = 1.1, ease = 'back.out(1.15)') => {
    tween?.kill();
    tween = gsap.to(st, { rot: Math.round(target / step) * step, duration: dur, ease, onUpdate: render, overwrite: true });
  };
  const go = (d: number) => { idleUntil = performance.now() + 3500; settle(Math.round(st.rot / step) * step + d * step, 0.9); };
  const degPerPx = () => step / chord;

  // drag
  let sx = 0, lx = 0, lt = 0, v = 0, pid = -1;
  ring.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    tween?.kill(); dragging = true; moved = false; sx = lx = e.clientX; lt = e.timeStamp; v = 0; pid = e.pointerId;
  });
  ring.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== pid) return;
    const dx = e.clientX - lx;
    if (!moved && Math.abs(e.clientX - sx) > 6) { moved = true; ring.classList.add('is-drag'); try { ring.setPointerCapture(pid); } catch {} }
    if (!moved) return;
    st.rot -= dx * degPerPx();
    const dt = Math.max(1, e.timeStamp - lt);
    v = 0.7 * v + 0.3 * (-dx * degPerPx() / dt);
    lx = e.clientX; lt = e.timeStamp;
    render();
  });
  const end = (e: PointerEvent) => {
    if (!dragging || e.pointerId !== pid) return;
    dragging = false; ring.classList.remove('is-drag');
    idleUntil = performance.now() + 3000;
    if (moved) {
      const fresh = performance.now() - lt < 120 ? v : 0;
      const dist = gsap.utils.clamp(-step * 6, step * 6, fresh * 380);
      settle(st.rot + dist, 0.8 + Math.min(1, Math.abs(dist) / (step * 4)), 'power3.out');
    }
  };
  ring.addEventListener('pointerup', end);
  ring.addEventListener('pointercancel', end);
  ring.addEventListener('click', (e) => {
    if (moved) { moved = false; return; }
    const c = (e.target as HTMLElement).closest<HTMLElement>('[data-gl-card]');
    if (c) lb.open('campaigns', cards.indexOf(c as HTMLButtonElement));
  });

  // wheel (sideways only, so page scroll is never hijacked)
  let wt = 0;
  ring.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.2) return;
    e.preventDefault();
    tween?.kill();
    st.rot += e.deltaX * degPerPx() * 0.9;
    render();
    idleUntil = performance.now() + 3000;
    clearTimeout(wt);
    wt = window.setTimeout(() => settle(st.rot, 0.6, 'power3.out'), 140);
  }, { passive: false });

  // keys
  ring.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lb.open('campaigns', front); }
  });
  $('[data-gl-ring-prev]')!.addEventListener('click', () => go(-1));
  $('[data-gl-ring-next]')!.addEventListener('click', () => go(1));

  ring.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hovering = true; });
  ring.addEventListener('pointerleave', () => { hovering = false; });
  ring.addEventListener('focusin', () => { focused = true; });
  ring.addEventListener('focusout', () => { focused = false; });

  // slow idle spin
  if (!reduced) {
    gsap.ticker.add((_t, dtMs) => {
      if (!inView || dragging || hovering || focused || tween?.isActive() || root.classList.contains('gl-lb-open')) return;
      if (performance.now() < idleUntil) return;
      st.rot += 0.045 * (dtMs / 16.7);
      render();
    });
  }

  layout();
  addEventListener('resize', () => { layout(); });
  let intro = false;
  new IntersectionObserver((es) => {
    inView = es[0].isIntersecting;
    if (inView && !intro && !reduced) {
      intro = true;
      st.rot = -step * 5; render();
      tween = gsap.to(st, { rot: 0, duration: 1.9, ease: 'power3.out', onUpdate: render });
    }
  }, { threshold: 0.25 }).observe(ring);
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
