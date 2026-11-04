# Immersive build — shared brief (4 Nov 2026)

The client (Le SMASH Burgers & Co., Yangon) met Aster on 2 Nov and sent a
25-slide briefing. They want **a fun, immersive site that shows what Le SMASH
really is**. This file is the contract every page is built against. Read it
fully before touching anything.

## The brand, in one paragraph

A loud, playful smash-burger house. Red, cream, black. Hand-drawn lettering,
stickers, scribbled loops, monogram wrapping paper, neon, a dining room that is
literally a subway carriage (red bench seats, ring handles, poles). Their own
posters are cheeky ("I came, I saw, I smashed", "Fries before guys", "Pickle
your taste buds"). The site should feel like their posters and their rooms, not
like a corporate restaurant template. **Playful, tactile, confident — never
gloomy, never generic.**

## Stack and rules

- Astro 5 static site. Node is at `C:\Users\user\tools\node-v24.19.0-win-x64`
  and is NOT on PATH. In Bash always prefix:
  `export PATH="/c/Users/user/tools/node-v24.19.0-win-x64:$PATH";`
- Build: `npm run build:only` (must pass before you finish).
  Dev: `npx astro dev --port <your port>` (run in background).
- **GSAP 3.13 is installed** (`import { gsap } from 'gsap'`,
  `import { ScrollTrigger } from 'gsap/ScrollTrigger'`). Use it in an Astro
  `<script>` block (bundled, same-origin). No other libraries, no CDNs.
- Budgets (scripts/check-budgets.mjs): JS ≤ 75 KB gz/page, CSS ≤ 30 KB
  gz/page, fonts ≤ 150 KB. Don't add fonts.
- **You own only your files** (listed in your task). Never edit
  `src/layouts/*`, `src/components/Header.astro`, `Footer.astro`,
  `src/styles/global.css|components.css|tokens.css`, `src/content/**`,
  `src/lib/**`, or another agent's page. If you need a shared change, say so
  in your report instead.
- Page CSS: `src/styles/pages/<page>.css`, imported in the page frontmatter.
  Prefix every class with your page key (e.g. `.hm-`, `.st-`) so nothing
  collides. Page JS: an Astro `<script>` in your page.
- Do not commit. Do not run git commands that change state.
- Files use LF in the editor; that's fine.

## Design tokens (src/styles/tokens.css — use them, don't hard-code)

- Colours: `--red #d83536` (logo field), `--cream #e1e8de`, `--black`,
  `--red-deep #810704`, `--paper #f4ece0` (page ground), `--paper-2`,
  `--ink`, `--ink-2`, `--ink-3`, `--ember` (red text on paper).
- Fonts: `--font-display` Gasoek One (heavy display, use uppercase),
  `--font-script` Grand Hotel (script accents — the "Le"), `--font-body`
  Archivo, `--font-mono` IBM Plex Mono (labels).
- Spacing `--s1…--s10`, type `--t-hero, --t-xl, --t-lg, --t-md, --t-body,
  --t-sm, --t-xs`, `--wide`, `--gutter`, `--r`, `--ease`.
- Existing helpers in global.css: `.wrap`, `.section`, `.label`,
  `.label--ember`, `.btn .btn--ember .btn--cream .btn--ghost .btn-row`,
  `.script`, `.lede`, `.dark`, `.band--red`, `.band--ink`.
- Brand art in `public/brand/`: `logo-lockup-cream.png`, `logo-badge.png`,
  `pattern-monogram.png` (the wrapping-paper monogram), `hero-burger.png`
  (cut-out), `sticker-beef.png`, `sticker-fish.png`, `sticker-lecoq.png`,
  `sticker-pork.png`. Use stickers and the monogram generously — they ARE the
  brand.
- Header is fixed, dark, ~72px tall. A red ticker band and the footer are
  added by the layout on every page (don't add your own ticker).

## Motion language (shared, so the site feels like one thing)

- **The smash**: things land with weight — fast in, a squash on impact
  (scaleY ~0.9 → 1, scaleX ~1.06 → 1), `power4.in` then `back.out(2)`.
- **Pop-ups**: snapshots, stickers, cards appear with a little overshoot
  (`back.out(1.7)`) and a random-ish rotation (−6° … 6°).
- **Hover**: lift + tilt (translateY −6px, rotate ±2°), 240–400 ms.
- **Scroll**: GSAP ScrollTrigger for scrubbed or triggered reveals. Keep it
  smooth: animate transform/opacity only.
- **Reduced motion**: under `prefers-reduced-motion: reduce` every page must
  be fully usable and complete — show end states, no autoplay movement.
- **Mobile (375px)**: every interaction needs a touch equivalent. No
  horizontal page scroll, ever. Test 375, 768, 1280, 1440 widths.

## Content rules (non-negotiable)

- **Never invent facts**: no made-up names, roles, quotes, dates, awards,
  prices, reviews or claims. Use only what's in `src/content`, the media
  files, and the facts in your task. If something is missing, design a
  graceful slot and list it in your report under "Needs from client".
- Read posters by opening the image files with the Read tool if you need their
  exact wording (dates, names). Quote only what is printed.
- Alt text on every meaningful image; decorative art gets `alt=""`.
- Keep all real text in the DOM (accessible, indexable). No text baked into
  canvas.

## Media

All web-sized images are listed with real dimensions in
`src/data/media-manifest.json` (path, width, height, source filename). Folders
under `public/media/`:

- `home/` — `hero.mp4` (1920, 1.5 MB), `hero-720.mp4`, `hero-poster.jpg`,
  `post-1-2.jpg` (Ko Nyi's back in the Le SMASH tee), `copy-of-38.jpg` (party
  crowd, campaign night), `mhk1766-copy.jpg` (the bar under the big SMASH
  sign), `spicy-bacon.jpg` (burger studio shot).
- `burgers/` — 8 studio shots on grey, one per burger slug.
- `dishes/` — one photograph per brunch/main/salad/snack item, named by slug.
- `story/` — `1.jpg` (two people on stools hanging the Le SMASH sign on a
  shopfront), `2.jpg` (painting / fitting out the shopfront), `3.jpg` (first
  patties and bacon on the grill), `ko-nyi.jpg`, `le-smash-js-grand-opening*`
  (ribbon cutting / crowd at the Junction Square opening), `le-smash-chit-thu-bazzar.jpg`
  (two of the team at the Chit Thu Bazaar stall), `pop-up*.jpg` (balloon-arch
  shopfront, the bar).
- `team/` — 10 kitchen/crew photos, no names yet.
- `merch/` — tees, jersey, tote, mugs, cups.
- `campaigns/` — 13 posters (their own campaigns and collaborations).
- `events/` — 7 party/event photos. `highlights/` — 14 restaurant/room
  photos. `social/` — 8 social-post collages.
- Older archive (still valid): `public/media/gallery/**`, `public/media/rooms/`.

## Known facts you may use

- Soft opening: 16 Nov – 3 Dec (2025), "please feel free to stop by anytime".
- Official grand opening (a new location): 3 Dec 2025. Their poster: "Celebrate a new
  beginning with us at Le SMASH. Our Grand Opening marks not only a new
  location but a new upgrade in taste, design, and experience."
- Le SMASH × Ellie's at Chit Thu Bazaar: 1st–2nd March 2026, The
  Secretariat, Yangon, Booth FB-24.
- Le SMASH Pop-up @ RTH Junction Square: April 3–12, 2025 (poster).
- Grand Opening, May 10, 2025: the easel poster in `/media/story/pop-up-b.jpg`
  ("Grand Opening … Mystery draw … May 10, 2025") at the tiled-roof shopfront
  the client's files call "JS Grand Opening" (Junction Square).
- CORRECTION: the 3 Dec 2025 opening was a *new location*; which room is not
  stated. Do not attach it to Junction Square.
- Rooms: Junction Square (Crystal Tower Residence, Ground Floor, Kamayut) and
  Yankin (No. 2, Thazin Myaing Street, Parami Avenue). Ticker line: "Smashed to
  order · 3 rooms · 5 kitchens · Kamayut · Yankin · Mayangone · Hlaing · Dine
  in · Takeaway".
- Tagline in their mocks: "Officially the best burger in town." / "American
  flavour. French precision. Yangon-born. Three rooms, five kitchens — and
  counting."
- Phone (brand level): 09 758 542661.

## Report back with

1. Files created/changed. 2. What the interactions do, desktop and mobile.
3. Build result. 4. "Needs from client" list. 5. Any shared-file change you
need from the lead.
