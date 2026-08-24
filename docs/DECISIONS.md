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

## 4. Scope cut to two pages, English only

The site was originally built to the PRD's nine-template bilingual spec. The
client then cut it to a home page and a menu, in English.

Removed: the breakfast, burgers, locations, about, order and privacy pages, the
entire `/my/` locale layer, the Myanmar webfont and its subsetting and shaping
checks, the branch chooser, and the per-branch landing pages. Branch information
moved into a section on the home page and the footer, which is where a
two-branch restaurant's contact details belong anyway.

**What this costs, so it is on the record:** the breakfast and burgers pages
existed to win "breakfast Yangon" and "smash burger Yangon" — distinct search
intents with their own landing pages. Folding them into one menu page means the
site competes for those terms with a page that is not about them. The branch
pages were the local-SEO surface for each township. If search visibility matters
later, those are the first pages to bring back.

The Burmese removal is a larger reach question — Burmese-speaking customers are
now served an English-only site — but that was an explicit client decision.

---

## 5. Design direction

> **Superseded by §11.** This records the reasoning behind the stand-in
> identity, which stood only until the real brand assets could be recovered.

Warm near-black rather than pure black, bone rather than white, one ember accent
with brass as support. Bodoni Moda / Archivo / IBM Plex Mono.

This was researched rather than assumed: award-winning restaurant sites cluster
on warm-dark grounds with a single heat accent, and the typeface pairing sits in
the "editorial premium" register those sites actually use. Two findings changed
the build:

- **Full-bleed autoplaying hero video is now an LCP liability**, not a feature.
  It is served only where it is affordable — see §6.
- **Fast marquees of oversized display type now read as a 2021 signature.** The
  ticker was rebuilt as a slow, small, tracked mono strip carrying real
  information: branches, townships, how delivery works.

The menu is an editorial typographic list, not a grid of photo cards. A uniform
photo grid is a delivery-aggregator pattern; the dish name doing the work is the
restaurant pattern — and it is the honest one here, since no photography exists.

One dish per course is promoted to a larger size so each section has a focal
point without needing a photograph of every item.

---

## 6. The hero film is an enhancement, not the hero

The client asked for a hero film. It is built — but the canvas plane paints
first and the film is attached over it only on a viewport wider than 54rem, and
never when the browser reports a slow connection or the visitor has asked to
save data.

The audience is on a median 5 Mbps mobile connection. Shipping a full-bleed
autoplaying video to that phone is the most expensive thing this page could do,
and it would attack the one metric the whole project is judged on. Everyone who
does not get the film gets a hero that is already complete rather than a
placeholder.

---

## 7. Generative planes instead of stock photography

No photography or footage was available, and the Facebook and Instagram accounts
holding the brand's real images are unreachable from this environment.

Stock food photography was rejected outright: it would recreate the exact gap
between marketing and plate that this project exists to close. A flat colour
block reads as unfinished.

So empty media planes render heat instead of food — soft blooms drifting like
light off a grill, with sparks rising through them. It reads as a graded plate
rather than a missing asset. Every plane is replaced the moment a real file
lands in `public/media/`; the filenames are the only contract.

---

## 8. The one orchestrated moment

On load the wordmark takes a press: `SMASH` compresses and springs back once,
the way a ball of beef does on the plancha.

It runs on type that is already painted, so it delays nothing, and it is skipped
entirely under `prefers-reduced-motion`. It is the only animation on the site
that exists for its own sake, and it is on the one word it belongs to. Everything
else that moves — scroll reveals, the ticker, the ember field — is either
carrying information or setting the room.

---

## 9. Structured data omits anything unconfirmed

`priceRange`, `telephone`, `openingHoursSpecification`, `geo` and per-item
`offers` are emitted **only** when the underlying value is confirmed. An empty
or guessed property is worse than an absent one: Google will surface it, and it
becomes a claim we cannot stand behind.

No `suitableForDiet` or halal-adjacent property is emitted at all pending Q15.

---

## 10. Analytics is a queue, not a vendor

The PRD §20.2 event taxonomy fires today, including outbound clicks on
`pointerdown` so they are not lost to the unload. No vendor is configured, so
events accumulate on `window.lesmashEvents`. Adding Plausible or Umami is one
config value plus one script tag. The ≤5KB analytics budget is currently unspent.

---

## 11. The palette, the type and the logo are now the real brand

The first build shipped a dark "late-night bistro" identity — warm near-black
ground, deep rust accent, Bodoni Moda display — and said so in the token file:
no brand asset was reachable at the time, so it was a considered stand-in.

They have since been recovered from Le SMASH's own Facebook page. Everything
invented has been replaced with something sampled:

| Was | Is | Source |
|---|---|---|
| `--void #12100e` ground | `--paper #f8f5ec` ground | The logo is a bright red tile. A dim room was the wrong read |
| `--ember #d24a1c` | `--red #d83536` | Sampled from the logo file |
| `--bone #f2ede4` | `--cream #e1e8de` | The "Le" script |
| `--brass #c69b3c` | `--gold #ffd9a7` | Their own social artwork |
| — | `--red-deep #810704`, `--red-dark #4e0708` | The field in that artwork |
| Bodoni Moda | Gasoek One | Closest available match to the hand-cut SMASH lettering |
| Bodoni Moda italic | Grand Hotel | Closest match to the monoline "Le" script |

**The wordmark is artwork, not type.** Both hands in that logo are drawn, and
no free font matches either exactly. So anywhere the wordmark stands for the
brand it is the real lockup — the cream knockout lifted from their artwork and
keyed off its red ground (`src/components/Wordmark.astro`). The web faces carry
headings only, which the logo never has to do.

Two consequences worth naming:

- **The header is a solid red bar.** It used to be transparent over the hero
  and fill in on scroll, to keep a hero film unframed. There is no film, and a
  logo that has to sit on both paper and red needs two versions of the artwork.
  One red bar removes the swap and the scroll dependency at once.
- **The hero is a split, not a plane.** The photograph is used at its native
  size beside the lockup, so nothing is upscaled and nothing buffers. The ember
  field survives as the fallback for a missing file, re-cut in brand reds.

Contrast was checked rather than assumed. `--red` is 4.3:1 on paper, so it is
restricted to large text, buttons and rules; small red text uses `--red-deep`
at 9.8:1. White on `--red` is 4.7:1, which is what makes the primary button
legible at label size.

The photography is a different matter — see `public/media/README.md`. Those
three files are the restaurant's own social posts, cropped. They unblock the
layout; they do not close the shoot.

---

## Not built, and why

| Not built | Reason |
|---|---|
| Hero film | Not shot. The hero no longer needs one; the drop-in contract survives in `public/media/README.md` |
| Commissioned food and room photography | Not shot. The three stills in `public/media/` are cropped from the client's own social posts as a stopgap. That folder's README lists the acceptance criteria they do not meet |
| Google Search Console / Business Profile | Requires client account access |
| Analytics provider | Requires a client decision on vendor |
| Lighthouse against the PRD's 5 Mbps profile | Cannot be run from this environment; budgets are enforced statically instead |
