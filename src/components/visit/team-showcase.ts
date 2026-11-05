/*
 * Meet Our Team: behaviour.
 * Wide + motion allowed: pin the section, scrub one timeline, ~1 viewport per member.
 * Narrow + motion allowed: no pin, each block reveals as it scrolls in.
 * Reduced motion: nothing runs; CSS shows every member stacked and complete.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const root = document.querySelector<HTMLElement>('[data-tm]');

if (root) {
  gsap.registerPlugin(ScrollTrigger);
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-m]'));
  const N = items.length;
  const q = (el: HTMLElement, s: string) => el.querySelector<HTMLElement>(s)!;
  const parts = (el: HTMLElement) => ({
    photo: q(el, '[data-photo]'),
    img: q(el, '[data-photo] img'),
    card: q(el, '[data-card]'),
    name: q(el, '[data-name]'),
    role: q(el, '[data-role]'),
    quote: q(el, '[data-quote]'),
    sigRow: q(el, '[data-sig]'),
    stroke: q(el, '.vs-m__stroke'),
  });
  const SHOW = 'inset(0% 0% 0% 0%)';

  const cur = root.querySelector<HTMLElement>('[data-cur]')!;
  const fill = root.querySelector<HTMLElement>('[data-fill]')!;
  const btns = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-go]'));

  const mm = gsap.matchMedia();
  mm.add(
    {
      wide: '(min-width: 820px) and (prefers-reduced-motion: no-preference)',
      narrow: '(max-width: 819px) and (prefers-reduced-motion: no-preference)',
    },
    (ctx) => {
      const { wide } = ctx.conditions as { wide: boolean };

      /* ------------------------------------------------------- narrow */
      if (!wide) {
        items.forEach((el) => {
          const p = parts(el);
          const tl = gsap.timeline({
            defaults: { ease: 'power3.out' },
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          });
          tl.fromTo(p.photo, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: SHOW, duration: 0.8, ease: 'power2.inOut' }, 0)
            .fromTo(p.img, { scale: 1.2 }, { scale: 1, duration: 1.1 }, 0)
            .fromTo(p.card, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5 }, 0.45)
            .fromTo([p.name, p.role], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08 }, 0.7)
            .fromTo(p.quote, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5 }, 0.95)
            .fromTo(p.stroke, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power1.inOut' }, 1.2);
        });
        return;
      }

      /* -------------------------------------------------------- wide */
      root.classList.add('is-pinned');
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          pin: true,
          start: 'top top',
          end: () => `+=${N * window.innerHeight}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(N - 1, Math.floor(self.progress * N));
            cur.textContent = String(i + 1).padStart(2, '0');
            btns.forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
            fill.style.transform = `scaleX(${self.progress})`;
          },
        },
      });

      items.forEach((el, i) => {
        // Member one reveals while the section scrolls into place, so the pin
        // never opens on an empty stage; the rest reveal inside the pin.
        const host = i === 0
          ? gsap.timeline({ scrollTrigger: { trigger: root, start: "top 75%", end: "top 10%", scrub: 0.6 } })
          : tl;
        const at = i === 0 ? 0 : i;
        const p = parts(el);
        // portrait wipes in (left to right) with a settling scale
        host.fromTo(p.photo, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: SHOW, duration: 0.3, ease: 'power2.inOut' }, at)
          .fromTo(p.img, { scale: 1.22 }, { scale: 1.02, duration: 0.95, ease: 'power2.out' }, at)
          // then the card frame, name and role, the quote, the signature
          .fromTo(p.card, { opacity: 0, xPercent: 4 }, { opacity: 1, xPercent: 0, duration: 0.2, ease: 'power2.out' }, at + 0.18)
          .fromTo([p.name, p.role], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.12, stagger: 0.05, ease: 'power2.out' }, at + 0.28)
          .fromTo(p.quote, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, at + 0.42)
          .fromTo(p.stroke, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.26, ease: 'power1.inOut' }, at + 0.58);
        if (i < N - 1) {
          // the previous member slides out as the next one wipes in
          tl.to(p.photo, { xPercent: -14, opacity: 0, duration: 0.3, ease: 'power2.in' }, i + 1)
            .to(p.card, { opacity: 0, xPercent: -3, duration: 0.2, ease: 'power2.in' }, i + 0.98);
        }
      });
      tl.set({}, {}, N); // hold the last member to the end of the pin

      const st = tl.scrollTrigger!;
      const onClick = (e: Event) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>('[data-go]');
        if (!b) return;
        const i = Number(b.dataset.go);
        const y = st.start + ((i + 0.85) / N) * (st.end - st.start);
        window.scrollTo({ top: y, behavior: 'smooth' });
      };
      root.addEventListener('click', onClick);

      return () => {
        root.removeEventListener('click', onClick);
        root.classList.remove('is-pinned');
        fill.style.transform = '';
        cur.textContent = '01';
        btns.forEach((b, k) => (k === 0 ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
      };
    }
  );
}
