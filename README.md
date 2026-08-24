# Le SMASH Burgers & Co. — website

A statically generated, CMS-ready website for a two-branch smash burger
restaurant in Yangon.

Two pages: a film-led home page and the menu. Dark, type-led, English only.
The site's job is to be **fast, honest, searchable, useful and maintainable** —
ahead of feature count.

## Design

Warm near-black ground, bone text, one ember accent with brass as support.
Bodoni Moda for display, Archivo for body, IBM Plex Mono for prices and labels.
The menu is set as an editorial typographic list rather than a grid of photo
cards — that is the restaurant pattern rather than the delivery-app one, and it
means the page carries no weight it does not need on a slow phone.

The one orchestrated moment is the wordmark: on load `SMASH` takes a press,
compressing and springing back the way a ball of beef does on the plancha. It
animates type that is already painted, so it delays nothing, and it is skipped
entirely under `prefers-reduced-motion`.

Design tokens live in `src/styles/tokens.css`. Adopting the real brand identity
is a change to that one file.

---

## Quick start

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # static output in dist/ + performance budget gate
npm run preview        # serve the built site
```

Useful checks:

```bash
npm run content:report    # what the client still owes us, mapped to PRD slots
npm run check:budgets     # performance budgets against dist/
npm run check:links       # Foodpanda / Maps / social URLs still resolve
npm run verify            # all of the above, in order
```

---

## Current status: **preview build, not launchable**

The site is structurally complete. Its content is not.

Menu item names, all prices, opening hours and phone numbers were never
available — the Foodpanda listings that hold them are unreachable from this
environment, and they are client-supplied items in the PRD regardless (DS-01
through DS-04, Q6/Q7/Q14).

Nothing has been invented to paper over that. Instead:

- **No price is published anywhere.** Every item renders "Ask in store".
- **No photography exists.** Every image plane renders a generative ember field
  rather than stock imagery, which would recreate the exact expectation gap this
  site is built to close. Drop real files into `public/media/` and they appear —
  see `public/media/README.md`.
- **Menu records are marked `verified: false`** and carry a `sourceNote`
  explaining where the name came from. Names either surfaced in public customer
  and creator posts, or are generic category placeholders.
- **Opening hours are absent, not guessed.** Branch pages say the hours are not
  yet published and point the customer at the phone instead.
- **`hasDineIn` is `null` for both branches**, which renders as
  "Dine-in: not yet confirmed" rather than a claim in either direction.
- **A standing preview banner** says all of this on every page.

Run `npm run content:report` for the itemised list. It currently reports 131
gaps, each mapped to its PRD data slot or client question.

### Going live

```bash
CONTENT_MODE=live npm run verify
```

In live mode: unverified records stop rendering, the preview banner disappears,
and `content-report` **exits non-zero** while any launch-blocking gap remains.
That is the mechanism that stops placeholder content reaching a customer — the
build fails rather than publishing something untrue.

---

## What was built

Two pages, plus a 404.

| Route | Purpose |
|---|---|
| `/` | The film-led opening, the portion thesis, signatures, the room, the branches |
| `/menu` | The full menu: sticky course rail, oversized course numerals, portion facts on every row |
| `/404` | Useful, not cute |

### The decisions that shaped the code

**Expectation management is the product.** Patty count, portion note and price
render in the menu *list* view, never behind a tap. A fact renders only when it
is set — an unset portion is absent, never padded out with something plausible.
Unavailable items are dimmed and labelled rather than hidden, because hiding
shrinks the apparent menu while labelling manages the expectation.

**Ordering deep-links to Foodpanda.** No cart, no payments, no order queue. The
data model (branch, item, modifier, analytics) is shaped so a Phase 2 cart could
consume it without a migration.

**Nothing third-party sits on a critical path.** Zero social SDKs, zero embeds,
zero pixels, no interactive map iframe, no webfont from someone else's origin.
The site is fully functional with Facebook and Instagram blocked at the network
level, and renders its core content with JavaScript disabled.

**Portion facts sit on the row.** Patty count and portion note render in the
list, never behind a tap. A customer must be able to learn the size of what
they are buying without opening anything — that is the premise of the project.

---

## Performance

Budgets from PRD §21.2 are enforced by `scripts/check-budgets.mjs`, which the
build runs automatically and which **fails** the build on a JS, CSS or font
overrun.

Current build, worst page:

| Metric | Budget | Actual |
|---|---|---|
| JavaScript (gzipped) | ≤ 75 KB | **4.5 KB** |
| CSS (gzipped) | ≤ 30 KB | **4.0 KB** |
| Fonts | ≤ 150 KB | **94 KB** (three faces, Latin subsets) |
| Total transfer, `/` | ≤ 500 KB | ~111 KB |
| Total transfer, `/menu` | ≤ 800 KB | ~111 KB |
| Third-party render-blocking requests | 0 | **0** |

Those totals do not yet include photography, which is the single biggest
remaining weight. The per-image budgets in `docs/DECISIONS.md` exist to protect
these numbers when the shoot lands.

> Lighthouse against the PRD's throttled 5 Mbps / 4× CPU profile, and a test on
> a real Myanmar mobile network, are both still outstanding. They cannot be run
> from this environment.

Those figures exclude photography and the hero film, which are the biggest
remaining weight. `public/media/README.md` carries the compression targets that
keep them inside these budgets.

---

## Content and the CMS

Content lives in `src/content/` as JSON, structured field-for-field to the PRD's
data model. `sanity/` holds the matching Sanity Studio v3 schemas — the drop-in
CMS layer, including a one-page guide written for a shift supervisor editing a
price on a phone. See `sanity/README.md`.

```
src/content/branches/          two branch records
src/content/menu-categories/   ten categories
src/content/menu-items/        29 provisional item records
src/content/modifier-groups/   display-only modifiers
src/data/copy.ts               UI strings
src/data/editorial.ts          client-supplied copy slots (mostly empty by design)
```

"Popular" is a filter over `tags`, not a category. Duplicating a record into a
Popular category is how a menu starts contradicting itself.

---

## Documentation

| Document | What it covers |
|---|---|
| `docs/CONTENT-REGISTER.md` | Everything the client still owes, who owns it, what it blocks |
| `docs/LAUNCH-CHECKLIST.md` | PRD §32 as an actionable, signed-off checklist |
| `docs/DECISIONS.md` | Where the implementation interpreted or departed from the PRD, and why |
| `docs/DEPLOY.md` | Connecting Vercel, environment variables, headers, caching |
| `sanity/README.md` | CMS schema mapping, setup, webhook, and the staff one-pager |

---

## Deployment

Configured for Vercel — `vercel.json` sets the build, security headers and
caching; import the repo and it configures itself. Full instructions, including
the two environment variables and the CSP caveat for analytics, are in
`docs/DEPLOY.md`.

Two things worth knowing before the first deploy:

- **Absolute URLs follow the deployed origin.** Canonical tags, hreflang, the
  sitemap and OG URLs resolve from `SITE_ORIGIN`, falling back to the Vercel
  domain. Nothing hard-codes a domain nobody owns yet.
- **Budget overruns fail the deploy.** `npm run build` runs the budget check
  after Astro. On a ~5 Mbps connection a page-weight regression is a product
  regression, and it stops a deploy the way a failing test would.

Preview deployments serve `robots.txt` with `Disallow: /`, so a preview URL
never competes with the real domain for the brand terms this project exists to
win back.

## Stack

Astro 5 (static output), zero UI framework, self-hosted subset font, JSON
content collections, Sanity-ready schemas. No adapter and no serverless
functions — the output is plain static files and will host anywhere.

---

## Deploying

`vercel.json` is committed and configures the build, cache headers and a strict
Content-Security-Policy. A root deployment leaves `BASE_PATH` unset, so
everything resolves from `/`; the base-path plumbing in `src/lib/href.ts` only
engages when a subpath deployment sets it. The CSP is genuinely strict — `default-src 'self'` with
no third-party origins allowed — because the site loads nothing from anyone
else. That closes the security items on the launch checklist.

**Import the repo at [vercel.com/new](https://vercel.com/new).** Framework
detects as Astro; build command `npm run build`; output directory `dist`.
Nothing else needs configuring.

`main` is the production branch — every push to it deploys to
`eatlesmash.vercel.app`. Set it under **Settings → Git → Production Branch** in
the Vercel project, or deployments land as previews and the live URL goes
stale.

That is the whole setup — every push then deploys itself, with no secrets and
no workflow.

Or from a machine with the Vercel CLI:

```bash
npx vercel            # preview deployment
npx vercel --prod     # production
```

The build runs the performance budget gate, so a change that breaks the JS, CSS
or font budget fails the deploy rather than shipping.

### What `vercel.json` sets, and why

Keep this file free of comments. Vercel validates it strictly and rejects any
key outside the schema — including a `"//"` key used as a comment, which fails
the deployment before the build even starts. The reasoning lives here instead.

| Header | Value | Why |
|---|---|---|
| `Content-Security-Policy` | `default-src 'self'`, no third-party origins | The site loads nothing from anyone else, so the policy can be genuinely strict. `style-src` needs `'unsafe-inline'` only because Astro inlines the stylesheet to save a round trip on slow connections. The one inline script is `application/ld+json`, which is never executed and is still read from the DOM by crawlers. |
| `Strict-Transport-Security` | 2 years, subdomains, **no `preload`** | Preload lists are slow to undo, so it waits until the canonical domain is settled. |
| `Permissions-Policy` | geolocation, camera, microphone, payment all denied | The site asks for no device permissions. Geolocation is refused deliberately — branch choice is never prompted for. |
| `Cache-Control` on `/fonts/` and `/_astro/` | 1 year, immutable | Content-hashed or changed by filename only. |
| `Cache-Control` on `/scripts/` | must-revalidate | `app.js` is not content-hashed, so a fix would otherwise never reach returning visitors. |

### A note on the Content-Security-Policy

The policy is `script-src 'self'` with no third-party origins, which the site
can afford because it loads nothing from anyone else. That means **no inline
`<script>` will run in production**. An inline script works locally and is
blocked only once deployed, which is the worst kind of bug — so anything that
needs to run belongs in `public/scripts/`.

### Environment variables

| Variable | Set it to | Effect |
|---|---|---|
| `CONTENT_MODE` | *(unset)* | Preview build — unconfirmed content renders under a standing notice. **This is what you want today.** |
| `CONTENT_MODE` | `live` | Unconfirmed content stops rendering. Only set this once `npm run content:report` passes in live mode, or pages will be missing content rather than showing it. |

### Before pointing a real domain at it

Set the canonical origin in `src/lib/site.config.mjs` (`origin`, and flip
`originResolved` to `true`). Until then, every absolute URL — canonicals,
hreflang, sitemap, structured data, OG tags — points at a placeholder domain,
which will actively damage search if it goes live uncorrected. That is Q10 on
the content register.
