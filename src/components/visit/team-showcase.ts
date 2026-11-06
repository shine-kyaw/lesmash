/*
 * Meet the crew: behaviour.
 * Grid -> click -> the tiles fly (FLIP: measured slot rects -> computed ring rects,
 * applied as transforms) onto a slowly swaying ellipse around the profile card.
 * Phones (< 820px): tapping opens a full-width profile sheet with a swipeable strip.
 * Esc / "Back to the grid" reverse it. Arrow keys step through the crew.
 * Reduced motion: every switch is instant, nothing sways.
 */
import { gsap } from 'gsap';

if (import.meta.env.DEV) gsap.ticker.lagSmoothing(0);

const root = document.querySelector<HTMLElement>('[data-tm]');
if (root) init(root);

function init(root: HTMLElement) {
  const $ = <T extends HTMLElement = HTMLElement>(s: string, c: ParentNode = root) => c.querySelector<T>(s)!;
  const stage = $('[data-stage]');
  const grid = $('[data-grid]');
  const panel = $('[data-panel]');
  const back = $<HTMLButtonElement>('[data-back]');
  const cur = $('[data-cur]');
  const strip = $('[data-strip]');
  const sig = panel.querySelector<SVGPathElement>('[data-sig]')!;
  const imgs = Array.from(panel.querySelectorAll<HTMLImageElement>('[data-pimg]'));
  const tiles = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tile]'));
  const thumbs = Array.from(strip.querySelectorAll<HTMLButtonElement>('[data-go]'));
  const rows = (['name', 'role', 'quote'] as const).map((k) => {
    const row = $(`[data-row="${k}"]`);
    return { k, row, txt: $('[data-txt]', row), rule: $('[data-rule]', row) };
  });
  const frames = Array.from(panel.querySelectorAll<HTMLElement>('[data-frame]'));
  const N = tiles.length;
  const TAU = Math.PI * 2;
  const SP = 0.4; // flight stagger
  const ease = gsap.parseEase('power3.inOut');

  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const mobq = matchMedia('(max-width: 819.98px)');
  const calm = () => rmq.matches;
  const dur = (d: number) => (calm() ? 0 : d);

  let mode: 'grid' | 'ring' | 'sheet' = 'grid';
  let sel = 0;
  let busy = false;
  let curImg = 0;
  let slots: { cx: number; cy: number; s: number }[] = [];
  let geo = { W: 0, H: 0, rx: 0, ry: 0, S: 0 };
  const st = { ang: 0, mix: 0, sway: 0 };
  let swayTw: gsap.core.Tween | null = null;

  const frontAng = (i: number) => Math.PI / 2 - (i * TAU) / N;
  const nearest = (i: number) => {
    const b = frontAng(i);
    return b + Math.round((st.ang - b) / TAU) * TAU;
  };

  /* ---------------------------------------------------------------- layout */
  function measure() {
    slots = tiles.map((t) => ({
      cx: t.offsetLeft + t.offsetWidth / 2,
      cy: t.offsetTop + t.offsetHeight / 2,
      s: t.offsetWidth,
    }));
  }
  function layoutRing() {
    const W = stage.clientWidth;
    const S = Math.max(64, Math.min(112, W * 0.085));
    const half = S * 0.65;
    const ph = panel.offsetHeight;
    const ry = ph / 2 + half + 26;
    const rx = Math.min(W / 2 - half - 6, 600);
    geo = { W, H: Math.round(2 * (ry + half) + 28), rx, ry, S };
  }

  /* ------------------------------------------------------------- the ring */
  function render() {
    const { W, H, rx, ry, S } = geo;
    for (let i = 0; i < N; i++) {
      const el = tiles[i];
      const sl = slots[i];
      const rank = (i - sel + N) % N;
      const t = ease(Math.min(1, Math.max(0, st.mix * (1 + SP) - (rank / (N - 1)) * SP)));
      if (t <= 0 && st.mix <= 0) {
        el.style.transform = el.style.zIndex = el.style.opacity = el.style.borderRadius = '';
        el.style.removeProperty('--bw');
        continue;
      }
      const th = st.ang + st.sway + (i * TAU) / N;
      const d = (Math.sin(th) + 1) / 2;
      const size = S * (0.6 + 0.65 * d);
      const cx = W / 2 + rx * Math.cos(th);
      const cy = H / 2 + ry * Math.sin(th);
      const x = (cx - sl.cx) * t;
      const y = (cy - sl.cy) * t;
      const s = (sl.s + (size - sl.s) * t) / sl.s;
      el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${s.toFixed(4)})`;
      el.style.zIndex = String(Math.round(d * 40) + (i === sel ? 50 : 0));
      el.style.opacity = String(1 - t * (0.5 - 0.5 * d));
      el.style.borderRadius = `${(3 + 47 * t).toFixed(1)}%`;
      el.style.setProperty('--bw', `${(3 / s).toFixed(2)}px`);
    }
  }

  function startSway() {
    swayTw?.kill();
    if (calm() || mode !== 'ring') return;
    swayTw = gsap.to(st, {
      sway: 0.07, duration: 2.2, ease: 'sine.inOut',
      onComplete: () => {
        swayTw = gsap.to(st, { sway: -0.07, duration: 4.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      },
    });
  }

  /* --------------------------------------------------------------- profile */
  function fill(i: number, animate: boolean) {
    const d = tiles[i].dataset;
    cur.textContent = String(i + 1).padStart(2, '0');
    tiles.forEach((t, k) => {
      t.classList.toggle('is-front', mode === 'ring' && k === i);
      if (mode === 'ring') {
        t.tabIndex = k === i ? 0 : -1;
        t.setAttribute('aria-current', String(k === i));
      } else {
        t.removeAttribute('tabindex');
        t.removeAttribute('aria-current');
      }
    });
    thumbs.forEach((b, k) => b.setAttribute('aria-current', String(k === i)));

    // photo: clip-wipe the new frame over the old one
    const nxt = imgs[1 - curImg];
    const old = imgs[curImg];
    gsap.killTweensOf(imgs);
    nxt.src = d.src!;
    nxt.alt = d.alt!;
    gsap.set(old, { zIndex: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
    if (animate && !calm()) {
      gsap.fromTo(nxt, { zIndex: 2, clipPath: 'inset(0% 0% 100% 0%)', scale: 1.18 },
        { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 0.8, ease: 'power3.inOut' });
    } else {
      gsap.set(nxt, { zIndex: 2, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
    }
    curImg = 1 - curImg;

    // text: real text if present, else the ruled blank; mask-rise either
    rows.forEach((r, k) => {
      const v = d[r.k] || '';
      r.txt.textContent = v;
      r.row.dataset.empty = v ? '0' : '1';
      const target = v ? [r.txt] : r.rule.children.length ? Array.from(r.rule.children) : [r.rule];
      gsap.killTweensOf(target);
      if (animate && !calm()) {
        gsap.fromTo(target, v ? { yPercent: 110 } : { scaleX: 0 },
          { yPercent: 0, scaleX: 1, duration: 0.7, ease: 'power3.out', delay: 0.18 + k * 0.08, stagger: 0.06 });
      } else gsap.set(target, { yPercent: 0, scaleX: 1 });
    });

    // supporting frames
    frames.forEach((f) => {
      const src = (f.dataset.frame === 'atwork' ? d.atwork : d.dish) || '';
      const im = f.querySelector('img')!;
      f.classList.toggle('has-img', !!src);
      im.hidden = !src;
      if (src) im.src = src; else im.removeAttribute('src');
    });

    // signature draws itself on every switch
    gsap.killTweensOf(sig);
    if (animate && !calm()) {
      gsap.fromTo(sig, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', delay: 0.3 });
    } else gsap.set(sig, { strokeDashoffset: 0 });

    if (mode === 'sheet') {
      panel.scrollTop = 0;
      const b = thumbs[i];
      strip.scrollTo({ left: b.offsetLeft - strip.clientWidth / 2 + b.offsetWidth / 2, behavior: calm() ? 'auto' : 'smooth' });
    }
  }

  /* ------------------------------------------------------------ open / go */
  function open(i: number) {
    if (busy || mode !== 'grid') return;
    sel = i;
    if (mobq.matches) return openSheet(i);
    busy = true;
    measure();
    mode = 'ring';
    root.dataset.state = 'ring';
    layoutRing();
    fill(i, false);
    const h0 = stage.offsetHeight;
    stage.style.height = h0 + 'px';
    st.mix = 0;
    st.sway = 0;
    st.ang = frontAng(i) + 1.6;
    gsap.ticker.add(render);
    gsap.fromTo(stage, { height: h0 }, { height: geo.H, duration: dur(0.9), ease: 'power3.inOut' });
    gsap.to(st, { ang: frontAng(i), duration: dur(1.7), ease: 'power3.out' });
    gsap.to(st, { mix: 1, duration: dur(1.3), ease: 'none', onComplete: () => { busy = false; startSway(); } });
    gsap.fromTo(panel, { autoAlpha: 0, scale: 0.9, y: 24 },
      { autoAlpha: 1, scale: 1, y: 0, duration: dur(0.6), delay: dur(0.55), ease: 'back.out(1.5)' });
    gsap.delayedCall(dur(0.5), () => back.focus({ preventScroll: true }));
    if (!calm()) {
      const r = stage.getBoundingClientRect();
      const need = geo.H + 40;
      if (r.top < 70 || r.top + need > innerHeight) {
        scrollTo({ top: Math.max(0, scrollY + r.top - Math.max(70, (innerHeight - need) / 2)), behavior: 'smooth' });
      }
    }
  }

  function openSheet(i: number) {
    busy = true;
    mode = 'sheet';
    root.dataset.state = 'sheet';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Crew profile');
    grid.inert = true;
    document.documentElement.style.overflow = 'hidden';
    fill(i, false);
    gsap.fromTo(panel, { autoAlpha: 1, yPercent: 100 }, {
      yPercent: 0, duration: dur(0.55), ease: 'power3.out',
      onComplete: () => { busy = false; back.focus({ preventScroll: true }); },
    });
    if (calm()) back.focus({ preventScroll: true });
    // draw the signature once the sheet has landed
    gsap.fromTo(sig, { strokeDashoffset: calm() ? 0 : 1 }, { strokeDashoffset: 0, duration: dur(1.2), delay: dur(0.4), ease: 'power2.inOut' });
  }

  function go(i: number) {
    i = (i + N) % N;
    if (mode === 'grid') return open(i);
    if (i === sel) return;
    sel = i;
    if (mode === 'ring') {
      swayTw?.kill();
      gsap.killTweensOf(st, 'ang');
      gsap.to(st, { sway: 0, duration: dur(0.3) });
      fill(i, true);
      gsap.to(st, { ang: nearest(i), duration: dur(1.15), ease: 'power3.inOut', onComplete: startSway });
      if (calm()) render();
    } else {
      fill(i, true);
    }
  }

  function close(instant = false) {
    if (mode === 'grid' || (busy && !instant)) return;
    const was = mode;
    const done = () => {
      gsap.ticker.remove(render);
      swayTw?.kill();
      gsap.killTweensOf([st, stage, panel, ...imgs]);
      st.mix = 0;
      st.sway = 0;
      mode = 'grid';
      render();
      tiles.forEach((t) => {
        t.classList.remove('is-front');
        t.removeAttribute('tabindex');
        t.removeAttribute('aria-current');
      });
      stage.style.height = '';
      gsap.set(panel, { clearProps: 'all' });
      panel.removeAttribute('role');
      panel.removeAttribute('aria-modal');
      panel.removeAttribute('aria-label');
      grid.inert = false;
      document.documentElement.style.overflow = '';
      root.dataset.state = 'grid';
      busy = false;
      tiles[sel].focus({ preventScroll: true });
    };
    if (instant || calm()) return done();
    busy = true;
    if (was === 'sheet') {
      gsap.to(panel, { yPercent: 100, duration: 0.45, ease: 'power3.in', onComplete: done });
      return;
    }
    swayTw?.kill();
    gsap.killTweensOf(st);
    gsap.to(panel, { autoAlpha: 0, scale: 0.92, duration: 0.25, ease: 'power2.in' });
    gsap.to(st, { sway: 0, duration: 0.3 });
    gsap.to(st, { mix: 0, duration: 1.1, delay: 0.1, ease: 'none' });
    gsap.to(stage, { height: grid.offsetHeight, duration: 0.9, delay: 0.25, ease: 'power3.inOut', onComplete: done });
  }

  /* ---------------------------------------------------------------- events */
  tiles.forEach((t, i) => t.addEventListener('click', () => (mode === 'grid' ? open(i) : go(i))));
  thumbs.forEach((b, i) => b.addEventListener('click', () => go(i)));
  back.addEventListener('click', () => close());

  document.addEventListener('keydown', (e) => {
    if (mode === 'grid') return;
    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (!root.contains(document.activeElement)) return;
    const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const bwd = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!fwd && !bwd) return;
    e.preventDefault();
    const n = (sel + (fwd ? 1 : -1) + N) % N;
    go(n);
    if (mode === 'ring') tiles[n].focus({ preventScroll: true });
    else thumbs[n].focus({ preventScroll: true });
  });

  let rz = 0;
  addEventListener('resize', () => {
    cancelAnimationFrame(rz);
    rz = requestAnimationFrame(() => {
      if (mode === 'grid') return;
      if ((mode === 'sheet') !== mobq.matches) return close(true);
      if (mode === 'ring' && !busy) {
        measure();
        layoutRing();
        stage.style.height = geo.H + 'px';
      }
    });
  });
}
