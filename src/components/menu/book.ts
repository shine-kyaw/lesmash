import { gsap } from 'gsap';

/**
 * The flip-book. The page markup is a plain stack of pages (that is the no-JS
 * and "view as list" layout). This script lifts those same nodes into 3D leaves:
 * two pages per leaf on desktop, one on mobile, and turns the leaves with GSAP.
 */
const root = document.querySelector<HTMLElement>('[data-mn]')!;
const stage = root.querySelector<HTMLElement>('[data-stage]')!;
const book = root.querySelector<HTMLElement>('[data-book]')!;
const pagesEl = root.querySelector<HTMLElement>('[data-pages]')!;
const pageNodes = Array.from(pagesEl.querySelectorAll<HTMLElement>(':scope > .mn-page'));
const toggle = root.querySelector<HTMLButtonElement>('[data-toggle]')!;
const toggleLabel = root.querySelector<HTMLElement>('[data-toggle-label]')!;
const controls = root.querySelector<HTMLElement>('[data-controls]')!;
const help = root.querySelector<HTMLElement>('[data-help]')!;
const curl = root.querySelector<HTMLButtonElement>('[data-curl]')!;
const prevBtn = root.querySelector<HTMLButtonElement>('[data-prev]')!;
const nextBtn = root.querySelector<HTMLButtonElement>('[data-next]')!;
const countEl = root.querySelector<HTMLElement>('[data-count]')!;
const dotsEl = root.querySelector<HTMLElement>('[data-dots]')!;
const jumpLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-jump]'));

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const wide = matchMedia('(min-width: 900px)');
const pad = (n: number) => String(n).padStart(2, '0');
const total = pageNodes.length;

type Leaf = { el: HTMLElement; front: HTMLElement; back: HTMLElement | null };
let leaves: Leaf[] = [];
let f = 0; // how many leaves are turned
let mode: 'list' | 'book' = 'list';
let desktop = false;
let busy = false;
let dragging = false;
let keepPage = 0;
let peekTimer: number | undefined;
const dur = () => (reduced.matches ? 0 : 0.95);

/* ------------------------------------------------------------ build / tear */
function teardown() {
  pageNodes.forEach((p) => {
    p.classList.remove('mn-page--l', 'mn-page--r');
    p.removeAttribute('inert');
    p.removeAttribute('aria-hidden');
    pagesEl.appendChild(p);
  });
  book.querySelector('.mn-leaves')?.remove();
  leaves = [];
}

function build() {
  const wrap = document.createElement('div');
  wrap.className = 'mn-leaves';
  const per = desktop ? 2 : 1;
  const n = Math.ceil(total / per);
  for (let k = 0; k < n; k++) {
    const el = document.createElement('div');
    el.className = 'mn-leaf';
    const front = document.createElement('div');
    front.className = 'mn-face mn-face--front';
    front.appendChild(pageNodes[k * per]);
    el.appendChild(front);
    let back: HTMLElement | null = null;
    if (desktop && pageNodes[k * 2 + 1]) {
      back = document.createElement('div');
      back.className = 'mn-face mn-face--back';
      back.appendChild(pageNodes[k * 2 + 1]);
      el.appendChild(back);
    }
    if (desktop) {
      pageNodes[k * 2].classList.add('mn-page--r');
      pageNodes[k * 2 + 1]?.classList.add('mn-page--l');
    }
    wrap.appendChild(el);
    leaves.push({ el, front, back });
  }
  book.insertBefore(wrap, curl);
}

const maxF = () => (desktop ? leaves.length : leaves.length - 1);

/* progress p: 0 = flat on the right, 1 = fully turned */
function setLeaf(l: Leaf, p: number) {
  const shade = String(Math.sin(Math.min(Math.max(p, 0), 1) * Math.PI) * (desktop ? 0.45 : 0.5));
  l.el.style.setProperty('--shade', shade);
  if (desktop) {
    gsap.set(l.el, { rotationY: -180 * p, transformPerspective: 2600 });
  } else {
    gsap.set(l.el, {
      rotationY: -100 * p,
      transformPerspective: 1800,
      opacity: p > 0.9 ? Math.max(0, 1 - (p - 0.9) * 10) : 1,
    });
  }
}

function stack() {
  leaves.forEach((l, k) => {
    const turned = k < f;
    l.el.style.zIndex = String(turned ? k + 1 : leaves.length - k);
    l.el.style.visibility = !desktop && turned ? 'hidden' : 'visible';
    setLeaf(l, turned ? 1 : 0);
  });
  // Only the pages actually on show are reachable by keyboard or screen reader.
  const visible = new Set<number>();
  if (desktop) {
    if (f > 0) visible.add(2 * f - 1);
    if (f < leaves.length) visible.add(2 * f);
  } else visible.add(f);
  pageNodes.forEach((p, i) => {
    p.toggleAttribute('inert', !visible.has(i));
    p.setAttribute('aria-hidden', visible.has(i) ? 'false' : 'true');
  });
  shiftBook(false);
  ui();
}

function shiftBook(animate: boolean) {
  if (!desktop) {
    gsap.set(book, { xPercent: 0 });
    return;
  }
  const x = f === 0 ? -25 : f === leaves.length ? 25 : 0;
  if (animate) gsap.to(book, { xPercent: x, duration: dur() * 0.9, ease: 'power2.inOut' });
  else gsap.set(book, { xPercent: x });
  book.classList.toggle('is-closed-front', f === 0);
  book.classList.toggle('is-closed-back', f === leaves.length);
}

/* ---------------------------------------------------------------------- UI */
const views = () => maxF() + 1;
const currentPageIndex = () => (desktop ? Math.max(0, f * 2 - 1) : f);

function ui() {
  countEl.textContent = desktop
    ? f === 0
      ? '01'
      : f === leaves.length
        ? pad(total)
        : `${pad(2 * f)}–${pad(2 * f + 1)}`
    : pad(f + 1);
  prevBtn.disabled = f === 0;
  nextBtn.disabled = f >= maxF();
  curl.hidden = f >= maxF() || mode !== 'book';
  root.dataset.view = String(f);
  Array.from(dotsEl.children).forEach((d, i) => {
    d.classList.toggle('is-on', i === f);
    d.setAttribute('aria-current', i === f ? 'true' : 'false');
  });
  jumpLinks.forEach((a) => {
    const target = Number(a.dataset.jump);
    const view = desktop ? Math.ceil(target / 2) : target;
    a.classList.toggle('is-on', mode === 'book' && view === f);
  });
  nextBtn.querySelector('.mn-nav__tx')!.textContent = f === 0 ? 'Flip' : 'Next';
}

function buildDots() {
  dotsEl.innerHTML = '';
  for (let i = 0; i < views(); i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'mn-dot';
    b.setAttribute(
      'aria-label',
      desktop ? (i === 0 ? 'Cover' : i === leaves.length ? 'Back cover' : `Pages ${2 * i}–${2 * i + 1}`) : `Page ${i + 1}`
    );
    b.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(b);
  }
}

/* --------------------------------------------------------------- animation */
function flipLeaf(k: number, toTurned: boolean, from?: number, delay = 0, z = 200): Promise<void> {
  const l = leaves[k];
  return new Promise((res) => {
    l.el.style.visibility = 'visible';
    l.el.style.zIndex = String(z);
    const o = { p: from ?? (toTurned ? 0 : 1) };
    const remaining = toTurned ? 1 - o.p : o.p;
    gsap.to(o, {
      p: toTurned ? 1 : 0,
      duration: reduced.matches ? 0 : dur() * remaining + 0.15,
      delay,
      ease: 'power2.inOut',
      onUpdate: () => setLeaf(l, o.p),
      onComplete: () => res(),
    });
  });
}

async function step(dir: 1 | -1) {
  if (busy || mode !== 'book') return;
  const next = f + dir;
  if (next < 0 || next > maxF()) {
    gsap.fromTo(book, { rotationZ: 0 }, { rotationZ: dir * 0.6, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.inOut' });
    return;
  }
  busy = true;
  const k = dir === 1 ? f : f - 1;
  f = next;
  shiftBook(true);
  ui();
  await flipLeaf(k, dir === 1);
  busy = false;
  stack();
  markFlipped();
}

async function goTo(target: number) {
  if (mode !== 'book') return;
  target = Math.max(0, Math.min(maxF(), target));
  if (busy || target === f) return;
  if (Math.abs(target - f) === 1) return step(target > f ? 1 : -1);
  if (reduced.matches) {
    f = target;
    stack();
    return;
  }
  // A long jump riffles through the leaves quickly rather than snapping.
  busy = true;
  const dir = target > f ? 1 : -1;
  const ks: number[] = [];
  for (let k = dir === 1 ? f : f - 1; dir === 1 ? k < target : k >= target; k += dir) ks.push(k);
  f = target;
  shiftBook(true);
  ui();
  await Promise.all(ks.map((k, i) => flipLeaf(k, dir === 1, undefined, i * 0.07, 100 + (dir === 1 ? i : ks.length - i))));
  busy = false;
  stack();
  markFlipped();
}

/* ---------------------------------------------------------------- flip cues */
function markFlipped() {
  try {
    localStorage.setItem('lesmash-menu-flipped', '1');
  } catch {}
}

function peek() {
  if (mode !== 'book' || busy || dragging || reduced.matches || f >= maxF()) return;
  gsap
    .timeline()
    .to(curl, { '--curl': 1, duration: 0.5, ease: 'power2.out' })
    .to(curl, { '--curl': 0, duration: 0.7, ease: 'back.in(1.4)' }, '+=0.6');
  const l = leaves[f];
  if (l && desktop) {
    const s = { v: 0 };
    gsap
      .timeline()
      .to(s, { v: 1, duration: 0.5, ease: 'power2.out', onUpdate: () => !busy && setLeaf(l, s.v * 0.05) })
      .to(s, { v: 0, duration: 0.7, delay: 0.6, ease: 'back.in(1.4)', onUpdate: () => !busy && setLeaf(l, s.v * 0.05) });
  }
}

function startPeeking() {
  window.clearInterval(peekTimer);
  if (reduced.matches) return;
  let seen = false;
  try {
    seen = localStorage.getItem('lesmash-menu-flipped') === '1';
  } catch {}
  // First visit: the corner peels once on its own, soon after the page settles.
  if (!seen) window.setTimeout(peek, 1100);
  peekTimer = window.setInterval(peek, 6500);
}

/* -------------------------------------------------------------------- drag */
function bindDrag() {
  let startX = 0, startY = 0, k = -1, dir: 1 | -1 = 1, id = -1;
  let moved = false, locked = false, lastX = 0, lastT = 0, vx = 0, p0 = 0;
  const pageW = () => leaves[0]?.el.getBoundingClientRect().width || 400;

  book.addEventListener('pointerdown', (e) => {
    if (mode !== 'book' || busy) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if ((e.target as HTMLElement).closest('a, button')) return;
    startX = lastX = e.clientX;
    startY = e.clientY;
    lastT = performance.now();
    vx = 0;
    moved = locked = false;
    id = e.pointerId;
    k = -1;
    p0 = 0;
    dragging = true;
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== id) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (!locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        dragging = false; // a vertical gesture is the page scrolling
        return;
      }
      const toNext = dx < 0;
      if (desktop) {
        // Only the half you grabbed turns, and only in its natural direction.
        const r = book.getBoundingClientRect();
        const grabbedRight = startX - r.left > r.width / 2;
        if (grabbedRight !== toNext) {
          dragging = false;
          return;
        }
      }
      dir = toNext ? 1 : -1;
      if ((dir === 1 && f >= maxF()) || (dir === -1 && f <= 0)) {
        dragging = false;
        return;
      }
      locked = moved = true;
      k = dir === 1 ? f : f - 1;
      leaves[k].el.style.visibility = 'visible';
      leaves[k].el.style.zIndex = '200';
      try { book.setPointerCapture(id); } catch {}
      book.classList.add('is-dragging');
    }
    const w = desktop ? pageW() * 1.4 : pageW() * 0.9;
    p0 = dir === 1 ? Math.min(1, Math.max(0, -dx / w)) : Math.min(1, Math.max(0, 1 + dx / w));
    setLeaf(leaves[k], p0);
    const now = performance.now();
    vx = (e.clientX - lastX) / Math.max(1, now - lastT);
    lastX = e.clientX;
    lastT = now;
  });

  const end = async (e: PointerEvent) => {
    if (!dragging || e.pointerId !== id) return;
    dragging = false;
    book.classList.remove('is-dragging');
    if (!locked || k < 0) return;
    const fling = dir === 1 ? vx < -0.4 : vx > 0.4;
    const done = dir === 1 ? p0 > 0.3 || fling : p0 < 0.7 || fling;
    busy = true;
    if (done) {
      f += dir;
      shiftBook(true);
      ui();
    }
    await flipLeaf(k, dir === 1 ? done : !done, p0);
    if (done) markFlipped();
    busy = false;
    stack();
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  // A plain click on a page turns it, as it would on paper.
  book.addEventListener('click', (e) => {
    if (mode !== 'book') return;
    if (moved) {
      moved = false;
      return;
    }
    if ((e.target as HTMLElement).closest('a, button') || !desktop) return;
    const r = book.getBoundingClientRect();
    step(e.clientX - r.left > r.width / 2 ? 1 : -1);
  });
}

/* ------------------------------------------------------------- mode switch */
function enterBook() {
  teardown();
  desktop = wide.matches;
  mode = 'book';
  busy = false;
  root.classList.add('mn--book');
  root.classList.remove('mn--list');
  root.classList.toggle('mn--wide', desktop);
  build();
  // keep the same page on screen across a resize
  f = desktop ? Math.ceil(keepPage / 2) : keepPage;
  f = Math.min(f, maxF());
  buildDots();
  stack();
  controls.hidden = false;
  help.hidden = false;
  toggle.setAttribute('aria-pressed', 'false');
  toggleLabel.textContent = 'View as list';
  startPeeking();
}

function enterList() {
  if (mode === 'book') keepPage = currentPageIndex();
  mode = 'list';
  window.clearInterval(peekTimer);
  gsap.killTweensOf('*');
  teardown();
  root.classList.remove('mn--book', 'mn--wide');
  root.classList.add('mn--list');
  gsap.set(book, { clearProps: 'all' });
  controls.hidden = true;
  help.hidden = true;
  curl.hidden = true;
  toggle.setAttribute('aria-pressed', 'true');
  toggleLabel.textContent = 'Flip-book view';
  jumpLinks.forEach((a) => a.classList.remove('is-on'));
}

toggle.hidden = false;
toggle.addEventListener('click', () => (mode === 'book' ? enterList() : enterBook()));

wide.addEventListener('change', () => {
  if (mode !== 'book') return;
  keepPage = currentPageIndex();
  gsap.killTweensOf('*');
  enterBook();
});

/* ---------------------------------------------------------------- controls */
prevBtn.addEventListener('click', () => step(-1));
nextBtn.addEventListener('click', () => step(1));
curl.addEventListener('click', () => step(1));
curl.addEventListener('pointerenter', () => !reduced.matches && gsap.to(curl, { '--curl': 0.75, duration: 0.3 }));
curl.addEventListener('pointerleave', () => !reduced.matches && gsap.to(curl, { '--curl': 0, duration: 0.4 }));

document.addEventListener('keydown', (e) => {
  if (mode !== 'book') return;
  const t = e.target as HTMLElement;
  if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    step(1);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    step(-1);
  }
});

jumpLinks.forEach((a) =>
  a.addEventListener('click', (e) => {
    if (mode !== 'book') return; // list view: the plain anchor scrolls to the page
    e.preventDefault();
    const target = Number(a.dataset.jump);
    goTo(desktop ? Math.ceil(target / 2) : target);
    const top = stage.getBoundingClientRect().top + scrollY - 96;
    if (Math.abs(scrollY - top) > 40) window.scrollTo({ top, behavior: reduced.matches ? 'auto' : 'smooth' });
  })
);

bindDrag();
(window as any).lesmashMenu = {
  get state() {
    return { mode, f, desktop, busy, views: views(), total };
  },
  step,
  goTo,
  enterList,
  enterBook,
};

/* /menu#onion-smash or /menu#brunch opens the book on the page that holds it. */
function pageForHash(): number {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return -1;
  const el = document.getElementById(id);
  const pg = el?.closest<HTMLElement>('.mn-page');
  return pg ? Number(pg.dataset.page) : -1;
}
function openHash(scroll: boolean) {
  const i = pageForHash();
  if (i < 0) return;
  if (mode === 'book') {
    goTo(desktop ? Math.ceil(i / 2) : i);
    if (scroll) window.scrollTo({ top: stage.getBoundingClientRect().top + scrollY - 96, behavior: 'auto' });
  } else document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}
window.addEventListener('hashchange', () => openHash(true));

// Reduced-motion visitors start on the plain list; everyone else gets the book.
const hashPage = pageForHash();
if (hashPage >= 0) keepPage = hashPage;
if (reduced.matches) enterList();
else {
  enterBook();
  if (hashPage >= 0) requestAnimationFrame(() => window.scrollTo({ top: stage.getBoundingClientRect().top + scrollY - 96 }));
}
if (hashPage >= 0 && mode === 'list') document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
