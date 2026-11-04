import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
(window as any).__mcReady = true;

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => c.querySelector(s) as T | null;
const $$ = <T extends Element = HTMLElement>(s: string, c: ParentNode = document) => Array.from(c.querySelectorAll(s)) as T[];

/* ---------- Head: mask-rise lines, sticker pop ---------- */
if (!reduce) {
  const lines = $$('.mc-h1__line > span');
  gsap.set(lines, { yPercent: 110 });
  gsap.to(lines, { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.12, delay: 0.1 });
  $$('.mc-stk').forEach((s, i) => {
    const rot = [-9, 7, -4][i] ?? 0;
    gsap.fromTo(s, { scale: 0, rotation: rot - 25, opacity: 0 }, { scale: 1, rotation: rot, opacity: 1, duration: 0.8, ease: 'back.out(1.7)', delay: 0.5 + i * 0.15 });
  });
}

/* ---------- The rack ---------- */
const rack = $('[data-rack]');
const pivots = $$('[data-pivot]');

function swing(el: Element, amp: number, delay = 0) {
  if (reduce) return;
  gsap.killTweensOf(el, 'rotation');
  gsap
    .timeline({ delay })
    .to(el, { rotation: amp, duration: 0.16, ease: 'power2.out' })
    .to(el, { rotation: 0, duration: 2.6, ease: 'elastic.out(1, 0.2)' });
}

if (rack) {
  const btns = $$('.mc-hang-btn', rack);
  btns.forEach((btn, i) => {
    btn.addEventListener('pointerenter', (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const r = btn.getBoundingClientRect();
      const dir = e.clientX < r.left + r.width / 2 ? -1 : 1;
      swing(pivots[i], 6 * dir);
      if (pivots[i - 1]) swing(pivots[i - 1], 2.4 * dir, 0.05);
      if (pivots[i + 1]) swing(pivots[i + 1], -2.4 * dir, 0.05);
      if (pivots[i - 2]) swing(pivots[i - 2], 1.2 * dir, 0.12);
      if (pivots[i + 2]) swing(pivots[i + 2], -1.2 * dir, 0.12);
    });
    btn.addEventListener('focus', () => { if (btn.matches(':focus-visible')) swing(pivots[i], 5); });
  });

  /* Drop onto the rail one by one, with a bounce. */
  if (!reduce) {
    ScrollTrigger.create({
      trigger: rack, start: 'top 82%', once: true,
      onEnter: () => {
        gsap.fromTo(pivots,
          { y: -320, opacity: 0, rotation: () => gsap.utils.random(-14, 14) },
          { y: 0, opacity: 1, rotation: 0, duration: 1.05, ease: 'bounce.out', stagger: 0.13,
            onComplete: () => { gsap.set(pivots, { clearProps: 'opacity' }); } });
        pivots.forEach((p, i) => gsap.delayedCall(1.2 + i * 0.13, () => swing(p, (i % 2 ? 1 : -1) * 3)));
      },
    });
  }

  /* Mouse drag with inertia. Touch uses native scroll + scroll-snap. */
  let down = false, moved = false, startX = 0, startLeft = 0, lastX = 0, lastT = 0, vel = 0;
  const proxy = { x: 0 };
  rack.addEventListener('pointerdown', (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    if (rack.scrollWidth <= rack.clientWidth + 2) return;
    gsap.killTweensOf(proxy);
    down = true; moved = false; startX = lastX = e.clientX; startLeft = rack.scrollLeft; lastT = performance.now(); vel = 0;
  });
  window.addEventListener('pointermove', (e: PointerEvent) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 6) { moved = true; rack.classList.add('is-dragging'); }
    if (!moved) return;
    rack.scrollLeft = startLeft - dx;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    vel = 0.8 * vel + 0.2 * ((lastX - e.clientX) / dt);
    lastX = e.clientX; lastT = now;
  });
  const end = () => {
    if (!down) return;
    down = false;
    rack.classList.remove('is-dragging');
    if (moved && !reduce && Math.abs(vel) > 0.05) {
      proxy.x = rack.scrollLeft;
      gsap.to(proxy, { x: proxy.x + vel * 520, duration: 1.1, ease: 'power3.out', onUpdate: () => { rack.scrollLeft = proxy.x; } });
    }
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  rack.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  rack.addEventListener('dragstart', (e) => e.preventDefault());
}

/* ---------- Detail dialog ---------- */
interface View { label: string; src: string; pos: string; ar: number; alt: string }
interface Garment { id: string; name: string; tag: string; note: string; views: View[]; start: number }
const garments: Garment[] = JSON.parse($('#mc-garment-data')?.textContent || '[]');
const dlg = $<HTMLDialogElement>('#mc-detail');

if (dlg && garments.length) {
  const d = dlg;
  const panel = $('[data-panel]', d)!;
  const frame = $('[data-frame]', d)!;
  const img = $<HTMLImageElement>('[data-d-img]', d)!;
  const copy = $('[data-copy]', d)!;
  const viewsEl = $('[data-d-views]', d)!;
  let trigger: HTMLElement | null = null;
  let busy = false;
  const sheet = () => matchMedia('(max-width: 760px)').matches;

  function setView(g: Garment, idx: number, animate: boolean) {
    const v = g.views[idx];
    frame.style.setProperty('--ar', String(v.ar));
    const apply = () => { img.src = v.src; img.alt = v.alt; img.style.objectPosition = v.pos; };
    if (animate && !reduce) {
      gsap.to(img, { opacity: 0, duration: 0.12, onComplete: () => { apply(); gsap.to(img, { opacity: 1, duration: 0.25 }); } });
    } else apply();
    $$('button', viewsEl).forEach((b, i) => b.setAttribute('aria-pressed', String(i === idx)));
  }

  function open(id: string, btn: HTMLElement) {
    const g = garments.find((x) => x.id === id);
    if (!g || busy) return;
    trigger = btn;
    $('[data-d-tag]', d)!.textContent = g.tag;
    $('[data-d-name]', d)!.textContent = g.name;
    $('[data-d-note]', d)!.textContent = g.note;
    viewsEl.innerHTML = '';
    g.views.forEach((v, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'mc-d-view'; b.textContent = v.label;
      b.addEventListener('click', () => setView(g, i, true));
      viewsEl.appendChild(b);
    });
    setView(g, g.start, false);

    const photo = $('[data-photo]', btn)!;
    const from = photo.getBoundingClientRect();
    d.showModal();
    document.documentElement.classList.add('mc-locked');
    photo.classList.add('is-off');
    if (reduce) return;
    gsap.fromTo(d, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    const pv = $('[data-pivot]', btn);
    if (pv) swing(pv, 5);
    if (sheet()) {
      gsap.fromTo(panel, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: 'power3.out' });
    } else {
      const to = frame.getBoundingClientRect();
      gsap.fromTo(frame,
        { x: from.left + from.width / 2 - (to.left + to.width / 2), y: from.top + from.height / 2 - (to.top + to.height / 2), scale: from.width / to.width, rotation: -2 },
        { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.8, ease: 'power3.out' });
      gsap.fromTo(copy, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.25, ease: 'power2.out' });
    }
  }

  function close() {
    if (!d.open || busy) return;
    const btn = trigger;
    const photo = btn ? $('[data-photo]', btn) : null;
    const done = () => {
      d.close();
      document.documentElement.classList.remove('mc-locked');
      gsap.set([d, frame, panel, copy], { clearProps: 'all' });
      busy = false;
      if (photo) {
        photo.classList.remove('is-off');
        if (!reduce) {
          gsap.from(photo, { y: -34, duration: 0.7, ease: 'bounce.out' });
          const pv = btn && $('[data-pivot]', btn);
          if (pv) swing(pv, -4);
        }
      }
      btn?.focus({ preventScroll: true });
    };
    if (reduce) return done();
    busy = true;
    if (sheet() || !photo) {
      gsap.to(panel, { yPercent: 100, duration: 0.4, ease: 'power3.in' });
      gsap.to(d, { opacity: 0, duration: 0.4, onComplete: done });
    } else {
      const from = photo.getBoundingClientRect();
      const to = frame.getBoundingClientRect();
      gsap.to(copy, { opacity: 0, duration: 0.15 });
      gsap.to(d, { opacity: 0, duration: 0.45, delay: 0.1 });
      gsap.to(frame, {
        x: from.left + from.width / 2 - (to.left + to.width / 2), y: from.top + from.height / 2 - (to.top + to.height / 2),
        scale: from.width / to.width, duration: 0.55, ease: 'power3.inOut', onComplete: done,
      });
    }
  }

  $$('.mc-hang-btn').forEach((b) => b.addEventListener('click', () => open(b.dataset.garment!, b)));
  $('[data-close]', d)!.addEventListener('click', close);
  d.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  d.addEventListener('click', (e) => { if (e.target === d || (e.target as Element).classList.contains('mc-d-fig')) close(); });
  (window as any).__mcOpen = (id: string) => { const b = $(`.mc-hang-btn[data-garment="${id}"]`); if (b) open(id, b); };
  (window as any).__mcClose = close;
}

/* ---------- The line-up ---------- */
const stage = $('[data-stage]');
const lu = $('[data-lu]');
if (stage && lu) {
  const items = $$('.mc-lu-item', lu);
  const ins = $$('[data-in]', lu);
  const n = items.length;
  const info: { name: string; note: string }[] = JSON.parse($('#mc-lineup-data')?.textContent || '[]');
  const nameN = $('[data-name-n]')!;
  const nameD = $('[data-name-d]')!;
  const st = { f: (n - 1) / 2 };
  let shown = -1;

  const scrolling = () => lu.scrollWidth > lu.clientWidth + 2;

  function render() {
    const soft = scrolling();
    items.forEach((el, i) => {
      const d = i - st.f;
      const w = Math.exp(-d * d * 1.25);
      const ad = Math.abs(d);
      const x = d * (soft ? 10 : 34) * w;
      const y = d * d * (soft ? 6 : 10) - 44 * w;
      const z = -ad * 60 + 140 * w;
      const ry = Math.max(-40, Math.min(40, -d * (soft ? 8 : 12)));
      const s = 0.94 + 0.4 * w;
      el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${s.toFixed(3)})`;
      el.style.setProperty('--w', w.toFixed(3));
      el.style.zIndex = String(Math.round(w * 10));
    });
    const near = Math.max(0, Math.min(n - 1, Math.round(st.f)));
    if (near !== shown) {
      shown = near;
      items.forEach((el, i) => el.classList.toggle('is-on', i === near));
      const set = () => { nameN.textContent = info[near]?.name ?? ''; nameD.textContent = info[near]?.note ?? ''; };
      if (reduce) set();
      else gsap.fromTo(nameN.parentElement, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', onStart: set });
    }
  }

  function to(f: number) {
    f = Math.max(0, Math.min(n - 1, f));
    gsap.killTweensOf(st);
    if (reduce) { st.f = f; render(); return; }
    gsap.to(st, { f, duration: 0.7, ease: 'power3.out', onUpdate: render });
  }

  function fromScroll() {
    const mid = lu!.scrollLeft + lu!.clientWidth / 2;
    const c = items.map((el) => el.offsetLeft + el.offsetWidth / 2);
    let f = 0;
    if (mid <= c[0]) f = 0;
    else if (mid >= c[n - 1]) f = n - 1;
    else for (let i = 0; i < n - 1; i++) if (mid >= c[i] && mid <= c[i + 1]) { f = i + (mid - c[i]) / (c[i + 1] - c[i]); break; }
    gsap.killTweensOf(st);
    st.f = f; render();
  }

  stage.addEventListener('pointermove', (e: PointerEvent) => {
    if (e.pointerType === 'touch' || scrolling()) return;
    const r = lu.getBoundingClientRect();
    to(((e.clientX - r.left) / r.width) * (n - 1));
  });
  stage.addEventListener('pointerleave', (e: PointerEvent) => {
    if (e.pointerType === 'touch' || scrolling()) return;
    to((n - 1) / 2);
  });
  lu.addEventListener('scroll', () => { if (scrolling()) fromScroll(); }, { passive: true });
  items.forEach((el, i) => {
    const b = $('button', el)!;
    const pick = () => {
      if (scrolling()) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
      else to(i);
    };
    b.addEventListener('focus', pick);
    b.addEventListener('click', pick);
  });
  window.addEventListener('resize', () => { if (scrolling()) fromScroll(); else render(); });
  (window as any).__mcFocus = (f: number) => { st.f = f; render(); };

  if (scrolling()) {
    const mid = items[Math.floor(n / 2)];
    lu.scrollLeft = mid.offsetLeft + mid.offsetWidth / 2 - lu.clientWidth / 2;
    fromScroll();
  } else render();

  /* Scroll-in: sweep the pieces up into the arc, then pass the light across. */
  if (!reduce) {
    ScrollTrigger.create({
      trigger: stage, start: 'top 80%', once: true,
      onEnter: () => {
        gsap.fromTo(ins,
          { x: () => -120 - Math.random() * 80, y: 110, opacity: 0, rotation: -14 },
          { x: 0, y: 0, opacity: 1, rotation: 0, duration: 1, ease: 'back.out(1.5)', stagger: 0.12,
            onComplete: () => gsap.set(ins, { clearProps: 'all' }) });
        if (!scrolling()) {
          st.f = 0; render();
          gsap.timeline({ delay: 0.5 })
            .to(st, { f: n - 1, duration: 1.8, ease: 'sine.inOut', onUpdate: render })
            .to(st, { f: (n - 1) / 2, duration: 1, ease: 'power3.out', onUpdate: render });
        }
      },
    });
  }
}
