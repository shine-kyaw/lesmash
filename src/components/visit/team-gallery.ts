/*
 * Meet Our Team — behaviour.
 *
 * Modes: 'grid' (squares), 'ring' (desktop/tablet: tiles FLIP into an orbit
 * around a centre panel), 'profile' (phones: full-width profile + swipe strip).
 * Reduced motion: no orbit drift, every transition is instant.
 */
import { gsap } from 'gsap';

type M = { name: string | null; role: string | null; quote: string | null; alt: string; src: string; w: number; h: number };

const stage = document.querySelector<HTMLElement>('[data-stage]');

if (stage) {
  const members: M[] = JSON.parse(stage.dataset.members || '[]');
  const N = members.length;
  const STEP = 360 / N;
  const grid = stage.querySelector<HTMLElement>('[data-grid]')!;
  const cells = Array.from(stage.querySelectorAll<HTMLElement>('[data-cell]'));
  const tiles = cells.map((c) => c.querySelector<HTMLButtonElement>('.vs-tile')!);
  const chips = Array.from(stage.querySelectorAll<HTMLButtonElement>('.vs-chip'));
  const strip = stage.querySelector<HTMLElement>('[data-strip]')!;
  const profile = stage.querySelector<HTMLElement>('[data-profile]')!;
  const pphoto = stage.querySelector<HTMLElement>('[data-pphoto]')!;
  const ptag = stage.querySelector<HTMLElement>('[data-ptag]')!;
  const pcount = stage.querySelector<HTMLElement>('[data-pcount]')!;
  const backBtn = stage.querySelector<HTMLElement>('[data-back]')!;
  const hint = document.querySelector<HTMLElement>('[data-hint]');
  const fields = {
    name: stage.querySelector<HTMLElement>('[data-pname]')!,
    role: stage.querySelector<HTMLElement>('[data-prole]')!,
    quote: stage.querySelector<HTMLElement>('[data-pquote]')!,
  };

  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ringMQ = window.matchMedia('(min-width: 820px)');
  const dur = (s: number) => (reduceMQ.matches ? 0 : s);
  const HINT_GRID = 'Pick a face to step inside the ring';

  let mode: 'grid' | 'ring' | 'profile' = 'grid';
  let active = 0;
  let rot = 0; // ring rotation offset, degrees
  let busy = false;
  let paused = false;
  let spinning = false; // a rotate-to-front tween is running
  let dims = { w: 0, h: 0, rx: 0, ry: 0, tile: 0 };
  let lastFocus: HTMLElement | null = null;

  const textEls = () =>
    [ptag, ...Object.values(fields)].filter((e) => !e.hidden).map((e) => (e.firstElementChild as HTMLElement) || e);

  /* ------------------------------------------------------------ profile */

  function fillText(i: number) {
    const m = members[i];
    (['name', 'role', 'quote'] as const).forEach((k) => {
      const el = fields[k];
      const v = m[k];
      el.hidden = !v;
      (el.firstElementChild as HTMLElement).textContent = v ? (k === 'quote' ? `“${v}”` : v) : '';
    });
    pcount.textContent = `${i + 1} / ${N}`;
  }

  function showPhoto(i: number, animate: boolean) {
    const m = members[i];
    const img = document.createElement('img');
    img.src = m.src;
    img.alt = m.alt;
    img.width = m.w;
    img.height = m.h;
    img.decoding = 'async';
    const old = Array.from(pphoto.children) as HTMLElement[];
    pphoto.appendChild(img);
    if (animate && old.length && !reduceMQ.matches) {
      gsap.fromTo(
        img,
        { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.12 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          onComplete: () => old.forEach((o) => o.remove()),
        }
      );
    } else {
      old.forEach((o) => o.remove());
    }
  }

  function setActive(i: number, animate = true) {
    active = (i + N) % N;
    tiles.forEach((t, k) => (k === active ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
    chips.forEach((t, k) => (k === active ? t.setAttribute('aria-current', 'true') : t.removeAttribute('aria-current')));
    fillText(active);
    showPhoto(active, animate);
    if (animate && !reduceMQ.matches) {
      gsap.fromTo(textEls(), { yPercent: 115 }, { yPercent: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08, overwrite: 'auto' });
    }
    if (mode === 'profile') {
      const c = chips[active];
      strip.scrollTo({
        left: c.offsetLeft - (strip.clientWidth - c.offsetWidth) / 2,
        behavior: reduceMQ.matches ? 'auto' : 'smooth',
      });
    }
  }

  /* --------------------------------------------------------------- ring */

  function measure() {
    const W = stage!.clientWidth;
    const H = Math.max(560, Math.min(780, window.innerHeight * 0.92));
    const D = Math.min(W, H);
    const tile = Math.round(D * 0.19);
    const ry = H / 2 - tile / 2 - 6;
    const rx = Math.min(W / 2 - tile / 2 - 8, ry * 1.55);
    dims = { w: W, h: H, rx, ry, tile };
    const pw = Math.min((rx - tile * 0.5) * 1.1, 460);
    const ph = Math.min(2 * (ry - tile * 0.62) - 12, pw * 1.25);
    stage!.style.setProperty('--ring-h', `${H}px`);
    stage!.style.setProperty('--tile', `${tile}px`);
    stage!.style.setProperty('--pw', `${Math.round(pw)}px`);
    stage!.style.setProperty('--ph', `${Math.round(ph)}px`);
  }

  function place(k: number) {
    const th = ((90 + k * STEP + rot) * Math.PI) / 180;
    const depth = (Math.sin(th) + 1) / 2; // 1 at the front
    return {
      x: Math.cos(th) * dims.rx,
      y: Math.sin(th) * dims.ry,
      s: (0.82 + depth * 0.22) * (k === active ? 1.1 : 1),
      r: (k % 2 ? 1 : -1) * (1.5 + (k % 3)),
      z: Math.round(depth * 10) + (k === active ? 20 : 0),
    };
  }

  function layout() {
    cells.forEach((c, k) => {
      const p = place(k);
      gsap.set(c, { x: p.x, y: p.y, scale: p.s, rotation: p.r, zIndex: p.z });
    });
  }

  gsap.ticker.add((_t: number, dt: number) => {
    if (mode !== 'ring' || busy || paused || spinning || reduceMQ.matches || document.hidden) return;
    rot += (dt / 1000) * 4; // a lap in 90 seconds
    layout();
  });

  function rotateTo(i: number) {
    // Shortest way round so tile `i` ends at the front (bottom) of the ring.
    const cur = ((rot % 360) + 360) % 360;
    const delta = ((((-i * STEP - cur) % 360) + 540) % 360) - 180;
    const target = rot + delta;
    spinning = true;
    const o = { v: rot };
    gsap.killTweensOf(o);
    gsap.to(o, {
      v: target,
      duration: dur(1.1),
      ease: 'power3.inOut',
      onUpdate: () => {
        rot = o.v;
        layout();
      },
      onComplete: () => {
        rot = target;
        spinning = false;
        layout();
      },
    });
  }

  function enterRing(i: number) {
    busy = true;
    lastFocus = tiles[i];
    const first = cells.map((c) => c.getBoundingClientRect());
    stage!.dataset.state = 'ring';
    mode = 'ring';
    measure();
    active = i;
    rot = -i * STEP;
    const sr = stage!.getBoundingClientRect();
    const cx = sr.left + sr.width / 2;
    const cy = sr.top + sr.height / 2;
    const tl = gsap.timeline({
      onComplete: () => {
        busy = false;
        layout();
      },
    });
    cells.forEach((c, k) => {
      const f = first[k];
      const p = place(k);
      tl.fromTo(
        c,
        { x: f.left + f.width / 2 - cx, y: f.top + f.height / 2 - cy, scale: f.width / dims.tile, rotation: 0, zIndex: 5 },
        { x: p.x, y: p.y, scale: p.s, rotation: p.r, zIndex: p.z, duration: dur(1), ease: 'power3.inOut' },
        k * (reduceMQ.matches ? 0 : 0.035)
      );
    });
    profile.hidden = false;
    setActive(i, false);
    tl.fromTo(
      profile,
      { scale: 0.6, opacity: 0, rotation: -4 },
      { scale: 1, opacity: 1, rotation: 0, duration: dur(0.7), ease: 'back.out(1.7)' },
      dur(0.55)
    );
    tl.fromTo(textEls(), { yPercent: 115 }, { yPercent: 0, duration: dur(0.6), ease: 'power3.out', stagger: 0.08 }, dur(0.9));
    if (hint) hint.textContent = 'Tap another face to bring it to the front';
    tiles[i].focus({ preventScroll: true });
  }

  function exitRing() {
    busy = true;
    const first = cells.map((c) => c.getBoundingClientRect());
    const rots = cells.map((c) => Number(gsap.getProperty(c, 'rotation')));
    gsap.killTweensOf(cells);
    gsap.killTweensOf(profile);
    stage!.dataset.state = 'grid';
    mode = 'grid';
    stage!.style.removeProperty('--ring-h');
    profile.hidden = true;
    gsap.set(profile, { clearProps: 'all' });
    gsap.set(cells, { x: 0, y: 0, scale: 1, rotation: 0, zIndex: 'auto' });
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(cells, { clearProps: 'all' });
        busy = false;
      },
    });
    cells.forEach((c, k) => {
      const l = c.getBoundingClientRect();
      const f = first[k];
      tl.fromTo(
        c,
        {
          x: f.left + f.width / 2 - (l.left + l.width / 2),
          y: f.top + f.height / 2 - (l.top + l.height / 2),
          scale: f.width / l.width,
          rotation: rots[k],
          zIndex: 5,
        },
        { x: 0, y: 0, scale: 1, rotation: 0, duration: dur(0.9), ease: 'power3.inOut' },
        k * (reduceMQ.matches ? 0 : 0.03)
      );
    });
    if (hint) hint.textContent = HINT_GRID;
    (lastFocus || tiles[active]).focus({ preventScroll: true });
  }

  /* ------------------------------------------------------- phone profile */

  function enterProfile(i: number) {
    lastFocus = tiles[i];
    mode = 'profile';
    stage!.dataset.state = 'profile';
    grid.hidden = true;
    profile.hidden = false;
    strip.hidden = false;
    setActive(i, false);
    const top = stage!.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
    gsap.fromTo(profile, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: dur(0.5), ease: 'back.out(1.4)' });
    gsap.fromTo(chips, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: dur(0.4), stagger: dur(0.03), ease: 'back.out(1.7)', delay: dur(0.2) });
    backBtn.focus({ preventScroll: true });
    if (hint) hint.textContent = 'Swipe the strip for more of the crew';
  }

  function exitProfile() {
    mode = 'grid';
    stage!.dataset.state = 'grid';
    grid.hidden = false;
    profile.hidden = true;
    strip.hidden = true;
    gsap.set([profile, ...chips], { clearProps: 'all' });
    if (hint) hint.textContent = HINT_GRID;
    (lastFocus || tiles[active]).focus({ preventScroll: true });
  }

  function hardReset() {
    gsap.killTweensOf([...cells, profile, ...chips]);
    gsap.set([...cells, profile, ...chips], { clearProps: 'all' });
    stage!.dataset.state = 'grid';
    stage!.style.removeProperty('--ring-h');
    grid.hidden = false;
    profile.hidden = true;
    strip.hidden = true;
    mode = 'grid';
    busy = false;
    spinning = false;
    if (hint) hint.textContent = HINT_GRID;
  }

  /* -------------------------------------------------------------- events */

  function select(i: number) {
    if (busy) return;
    if (mode === 'grid') {
      if (ringMQ.matches) enterRing(i);
      else enterProfile(i);
      return;
    }
    if (i === active) return;
    setActive(i);
    if (mode === 'ring') rotateTo(active);
  }

  function back() {
    if (busy) return;
    if (mode === 'ring') exitRing();
    else if (mode === 'profile') exitProfile();
  }

  stage.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-i], [data-back], [data-prev], [data-next]');
    if (!t) return;
    if (t.hasAttribute('data-back')) return back();
    if (t.hasAttribute('data-prev')) return select(active - 1);
    if (t.hasAttribute('data-next')) return select(active + 1);
    select(Number(t.dataset.i));
  });

  document.addEventListener('keydown', (e) => {
    if (mode === 'grid') return;
    if (e.key === 'Escape') {
      e.preventDefault();
      back();
    } else if (stage.contains(document.activeElement) && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      const next = (active + (e.key === 'ArrowRight' ? 1 : -1) + N) % N;
      select(next);
      (mode === 'ring' ? tiles[next] : chips[next]).focus({ preventScroll: true });
    }
  });

  stage.addEventListener('pointerenter', () => (paused = true));
  stage.addEventListener('pointerleave', () => (paused = false));
  stage.addEventListener('focusin', () => (paused = true));
  stage.addEventListener('focusout', () => (paused = false));

  let rt = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(rt);
    rt = window.setTimeout(() => {
      if (mode === 'ring' && ringMQ.matches) {
        measure();
        layout();
      } else if (mode === 'ring' || (mode === 'profile' && ringMQ.matches)) {
        hardReset();
      }
    }, 120);
  });

  // Handle for tests and the console.
  (stage as any).__vs = {
    select,
    back,
    get mode() {
      return mode;
    },
    get active() {
      return active;
    },
  };
}
