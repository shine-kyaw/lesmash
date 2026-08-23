# Le SMASH Burgers & Co. — website

A bilingual (English + Burmese), statically generated, CMS-ready website for a
two-branch smash burger restaurant in Yangon, built to the project PRD.

The site's job, in the PRD's own priority order, is to be **fast, honest,
bilingual, searchable, useful and maintainable** — ahead of feature count.

---

## Quick start

```bash
npm install
npm run dev            # http://localhost:4321
npm run build          # static output in dist/ + performance budget gate
npm run preview        # serve the built site
npm run preview:bundle # regenerate the shareable single-file preview
```

`preview/lesmash-preview.html` is the whole site folded into one self-contained
file, for review before hosting exists. It is generated — see `preview/README.md`.

Useful checks:

```bash
npm run content:report    # what the client still owes us, mapped to PRD slots
npm run check:budgets     # performance budgets against dist/
npm run check:zawgyi      # Burmese must be Unicode, never Zawgyi
npm run check:shaping     # every Burmese string shapes without a missing glyph
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

Nine templates × two locales = 21 routes, all static HTML.

| Route | Purpose |
|---|---|
| `/` | Comprehension in one screen for a cold arrival from social |
| `/menu` | The canonical menu: categories, anchors, filters, portion facts |
| `/breakfast` | Own the breakfast daypart in search; answer "when and where" |
| `/burgers` | Own "smash burger Yangon"; carries the "How we smash" explainer |
| `/locations` | Branch comparison; also absorbs the contact page's job |
| `/locations/{slug}` | Local-SEO landing page per branch |
| `/about` | Justify the price point; carry the rooms as a brand asset |
| `/order` | Thin, `noindex`; exists for QR codes, bio links and measurement |
| `/legal/privacy` | Short, plain, bilingual |
| `/404` | Useful, not cute |

Burmese mirrors every route under `/my/`.

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

**Bilingual is architectural, not a translation layer.** Burmese has its own
type scale, line-height, URL namespace, metadata and QA pass. `my: null` on any
field is a legitimate state meaning "not translated yet" — it falls back to
English and is reported, so bilingual content cannot decay silently.

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
| Fonts | ≤ 150 KB | **141 KB** (Burmese pages only; English pages request **no font**) |
| Total transfer, `/` | ≤ 500 KB | ~135 KB |
| Total transfer, `/menu` | ≤ 800 KB | ~136 KB |
| Third-party render-blocking requests | 0 | **0** |

Those totals do not yet include photography, which is the single biggest
remaining weight. The per-image budgets in `docs/DECISIONS.md` exist to protect
these numbers when the shoot lands.

> Lighthouse against the PRD's throttled 5 Mbps / 4× CPU profile, and a test on
> a real Myanmar mobile network, are both still outstanding. They cannot be run
> from this environment.

### Fonts

No Latin webfont ships at all — display type uses a system serif stack, which
costs zero bytes and paints on the first frame. That frees the whole font budget
for the Myanmar face, which genuinely needs it.

The Myanmar font is self-hosted, subset, and scoped by `unicode-range` so an
English page never downloads it. Regenerate after changing Burmese copy:

```bash
npm run fonts:subset && npm run check:shaping
```

`check:shaping` runs every Burmese string in the source through HarfBuzz and
fails if any would render a missing glyph. This matters because headless
browsers in CI have no Myanmar system font, so screenshots cannot catch it —
and the failure appears as an empty box in the middle of a dish name.

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
src/data/copy.ts               bilingual UI strings
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
