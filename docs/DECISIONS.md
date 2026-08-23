# Implementation decisions

Where the build interpreted the PRD, departed from it, or hit something the PRD
did not anticipate. Each entry says what was decided and what would reverse it.

---

## 1. No fabricated content, and a build mode that enforces it

**The PRD says:** no invented facts; every unknown becomes a labelled
placeholder, never agency fiction (§17.1).

**What was built:** two build modes.

- `preview` (default) — unconfirmed records render, marked as unconfirmed, under
  a standing site-wide notice.
- `live` (`CONTENT_MODE=live`) — unconfirmed records do not render, the notice
  disappears, and `content-report` exits non-zero while launch-blocking gaps
  remain.

The point is that "don't publish placeholder content" stops being a discipline
someone has to remember and becomes a build failure.

**Consequence to be aware of:** the client is reviewing a site where no price
appears. That is deliberate. The alternative — plausible-looking invented prices
in a design review — is how a fabricated number ends up in front of a customer.

---

## 2. Ten categories, not eleven

**The PRD lists** eleven category slugs including `popular`, while also stating
that Popular is a view populated from `tags: popular`, not a home for items
(§13.3).

**Decision:** ten category records; Popular is a filter chip and a homepage
module. Duplicating a record into a Popular category is how a menu starts
contradicting itself — one copy gets a price change and the other does not.

---

## 3. Open-now is computed in the browser

**The PRD requires** open-now state in Asia/Yangon with no hydration flash
(BR-03).

**The tension:** this is a static site. Baking the state in at build time would
be wrong within the hour.

**Decision:** the hours table renders server-side and is always correct. The
badge starts as the neutral label "Opening hours" and script upgrades it to
"Open now" / "Closed now" using the same logic as the server module
(`src/lib/hours.ts` and its mirror in `app.js`).

There is no flash because the pre-script state states nothing that could be
wrong. Without JavaScript the visitor still gets the full weekly hours table.

---

## 4. No Latin webfont

**The PRD budgets** ≤150KB of webfonts including the Myanmar subset (PERF-05)
and anticipates falling back to a system Myanmar stack if the budget cannot be
met (§16.2).

**What we found:** the Myanmar face is ~150KB before subsetting. Any Latin
display face on top of that breaks the budget.

**Decision:** drop the Latin webfont entirely and use a system serif stack. It
costs zero bytes, paints on the first frame, and on the target mid-range Android
maps to Noto Serif. English pages now make **no font request at all**, and the
whole budget goes to Myanmar, where it is genuinely needed.

**Reverses if** the brand's real typeface arrives (Q9) and the client accepts a
Burmese page reaching ~170KB of fonts, or if that face subsets small enough.

---

## 5. The Myanmar font keeps the whole Unicode block

Subsetting to only the 62 codepoints currently on the site produces a 58KB file
that shapes every existing string correctly — measured and verified.

**We ship the 141KB whole-block build anyway.** This site is CMS-driven: a staff
member adds a Burmese menu item name on a Friday evening, and if that name uses
a codepoint outside the frozen subset, the customer sees an empty box in the
middle of a dish name. Saving 83KB is not worth a font that is correct only for
the copy that happened to exist when the subsetter last ran.

`npm run check:shaping` runs every Burmese string through HarfBuzz and fails on
a missing glyph. This exists because **headless browsers in CI have no Myanmar
system font**, so screenshot review cannot catch the failure — during this build
a correct medial-*ra* cluster was initially misread as a missing glyph, and a
genuine missing-space glyph was initially missed.

---

## 6. Inline Burmese needs its own `font-family` declaration

The language toggle sits in the header of English pages and is Burmese text.

Redefining `--font-body` under `[lang='my']` does **not** change it: `font-family`
is inherited from `<body>` as an already-computed value, so a descendant
redefining the variable has no effect unless it declares `font-family` itself.

Fixed in `global.css`. Worth knowing before anyone "tidies up" that rule — the
symptom is subtle and only appears where Burmese is embedded in an English page.

---

## 7. The sticky action bar is mobile-only

**The PRD says** the bar is visible on 100% of pages (NAV-04), and separately
describes a desktop navigation carrying a filled "Order Now" button (§9.5).

**Decision:** below 62rem the sticky bar carries Order / Directions / Call.
Above it, the header carries Order inline and the bar is hidden. Pinning a bar
to the bottom of a 900px-tall desktop viewport covers content to solve a
thumb-reach problem that does not exist there.

The mobile guarantee the PRD actually cares about — two taps to Order,
Directions or Call from any page — holds on every viewport.

---

## 8. Item detail is `<details>`, not a route

**The PRD specifies** in-page expansion rather than per-item URLs (§11.3),
reasoning that 44 items × 2 locales would be 88 thin duplicated pages.

**Decision:** a native `<details>` element. No JavaScript, no layout shift, and
it works with script disabled. `menu_item_expand` is still tracked, so the
analytics that would justify promoting items to real URLs in Phase 2 accrues
from launch.

---

## 9. Directions degrade through three levels

Without a Google Place ID (DS-09), a Directions link would otherwise be dead.
`directionsUrl()` tries, in order: an explicit Maps URL → place ID → coordinates
→ a name-and-address search. The last usually finds the right pin but is not
guaranteed, which is why DS-09 is still tracked as a gap rather than closed.

---

## 10. Structured data omits anything unconfirmed

`priceRange`, `telephone`, `openingHoursSpecification`, `geo` and per-item
`offers` are emitted **only** when the underlying value is confirmed. An empty
or guessed property is worse than an absent one: Google will surface it, and it
becomes a claim we cannot stand behind.

No `suitableForDiet` or halal-adjacent property is emitted at all pending Q15.

---

## 11. Analytics is a queue, not a vendor

The full PRD §20.2 event taxonomy fires today — including `foodpanda_outbound`
before navigation, on `pointerdown`, so it is not lost to the unload.

No vendor is configured, so events accumulate on `window.lesmashEvents`. Adding
Plausible or Umami is one config value plus one script tag, and the events flow
without touching any component. The ≤5KB analytics budget is currently unspent.

---

## 12. Images are designed placeholders

No photography exists. A broken image and a stock photograph are both explicitly
rejected by the PRD, and stock food photography would recreate the exact
expectation gap the project exists to close.

Every image slot renders a branded placeholder at the correct aspect ratio, so
there will be no layout shift when real photographs replace them. Compression
targets when the shoot lands: menu card ≤35KB, hero ≤120KB, gallery ≤80KB,
static map ≤60KB, all AVIF at 1× display width.

---

## Not built, and why

| Not built | Reason |
|---|---|
| Google Search Console / GBP verification | Requires client account access |
| Static map images | Requires a Maps API key and confirmed coordinates |
| OG share image | Requires brand assets (Q9) and photography |
| Enquiry form | PRD makes it conditional on the client naming a monitored channel and a response-time commitment (§15.4) |
| Homepage social-proof module | Requires DS-05 review data |
| Analytics provider | Requires a client decision on vendor |
| Lighthouse run against the PRD profile | Cannot be run from this environment; budgets are enforced statically instead |
| Real-device Myanmar testing | Mandated by the PRD (A11Y-05) and cannot be substituted with emulation |
