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

> **Superseded by §11.** The planes are gone; the reasoning against stock
> photography is not.

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

## 11. The palette, the type and the logo are the real brand

Sections 5 and 7 are superseded by this one.

The identity used to be invented, and the token file said so: no brand asset
was reachable from the build environment, so a dark "late-night bistro" palette
and Bodoni Moda stood in. The assets have since been recovered from Le SMASH's
own Facebook page, and everything invented is now sampled:

| Was | Is | Source |
|---|---|---|
| `--ember #b8401a` | `--red #d83536` | The logo file |
| — | `--cream #e1e8de` | The "Le" script |
| — | `--black #0a0a0a` | The SMASH lettering |
| `--brass #7d5f16` | `--brass #ffd9a7` on dark | The gold in their own social artwork |
| — | `--red-deep #810704`, `--red-dark #4e0708` | The field in that artwork |
| Bodoni Moda | Gasoek One | Closest available match to the hand-cut SMASH lettering |
| Bodoni Moda italic (`.serif-em`) | Grand Hotel | Closest match to the monoline "Le" script |

The three-register structure is unchanged: light parchment for everything you
read, a re-mapping under `.dark`, and now a third under `.brand-red` for the
deep-red field. `--red`, `--cream` and `--black` are the exception — they do not
re-map, because the logo is the same colour in a dim room as it is in daylight.

**The wordmark is artwork, not type.** Both hands in that logo are drawn and no
free font matches either exactly, so anywhere the wordmark stands for the brand
it is the real lockup — the cream knockout keyed off its red ground
(`src/components/Wordmark.astro`). The web faces carry headings only, which the
logo never has to do. The header stays in the dark register at every scroll
position, which is what lets one cream lockup serve the whole site.

The hero is no longer a plane. It was a generative ember field standing in for
footage nobody had shot; it is now a split — the lockup and the actions on the
red, the burger photograph beside them at its native size. Nothing is upscaled
and nothing has to buffer. `MediaPlane.astro` and `public/scripts/ember.js` went
with it: the hero was their last call site, and shipping a canvas animation that
can never run is a cost with no return. Picture slots that still have no
photograph render `Shot.astro`, as they already did on the menu.

Contrast was measured, not assumed. Pure `--red` is 3.8:1 on parchment, so it is
only ever a fill with white or cream on it — never small red type; `--ember`
(#c02427) is the same red darkened to 4.9:1 for text. White on `--red` is 4.7:1,
which is what makes the primary button and the ticker legible at label size.

Photography is a separate matter. The three stills in `public/media/` are the
restaurant's own social posts, cropped — `burger.jpg` had promotional callouts
cropped out of it. They unblock the layout and they close nothing; the shot
brief and its acceptance criteria are in that folder's README, and C-08's last
sentence promises photography the site cannot yet keep.

---

## 12. The client's brief, and the five pages that answer it

The written brief (26 August) and the client's Canva board arrived together and
changed the project. Recorded here because much of what follows contradicts
earlier sections.

**The site is a portfolio, not a shop.** The brief opens with it: the site
"does not need to function as an e-commerce or ordering website at this stage",
the menu "can be displayed without prices", and it should read like "a museum,
gallery, or work of art rather than a conventional restaurant website". Section
11's ordering removal was the right call for the wrong reason; this is the
reason.

**Prices are gone from the card, not merely absent.** The dish card had a price
row that said "ask in store" 35 times over. A row that never carries a value is
not honesty, it is noise, so the element is gone. The `price` field stays in the
schema — if the client reverses this it is a card row and a field, not a
rebuild.

**The menu is now the real menu.** Every previous item was a placeholder guessed
from delivery listings, and every one of the 29 was wrong. The 35 food items and
~85 drinks now in `src/content/` are transcribed from the client's own Canva
board, pages 5 to 14, and marked `verified: true` with that provenance in
`sourceNote`. What is still missing is everything except the name: no
description, no photograph, no portion, and — this matters — no patty count.

**Drinks are a list, not 85 cards.** A drink has no photograph, no portion, no
patty count and no price, so a name is its entire record and a file per drink
would model nothing. `menuCategories` gained `layout: 'cards' | 'list'` plus
`listItems` / `listGroups`; a list category *is* its list. It also answers the
brief's instruction to focus on "the most recognizable products rather than
every possible menu variation" — the burgers get cards, the 51 coffees get a
well-set column.

### Seven sections, five pages

The brief proposes seven sections and the Canva sitemap adds Merch for eight.
This build ships five routes:

| Their section | Where it lives | Why |
|---|---|---|
| Home | `/` | |
| Our Story | `/story` | |
| Menu / Le SMASH Icons | `/menu` | |
| Gallery | `/gallery` | |
| Collaborations | a Gallery section | It is images with a short note each — the same shape as every other Gallery section. A route for one block would make the navigation longer than the site |
| Visit Us and Delivery | `/visit` | |
| Franchise | a Visit section | The brief asks for it to be brief, selective, and to route to a private conversation. That is three sentences and one link |
| Merch | not built | A shop, which is the one thing the brief says the site is not. Needs products, prices, stock and payment — a separate project, not a page |

Eight top-level pages for a portfolio is a navigation problem before it is a
budget one: it splits thin content across more routes and makes the site feel
emptier than it is. Five carries all of it. If the client wants Collaborations
or Franchise promoted later, both are already whole sections with their own
anchor — promoting one is a route file, not a rewrite.

### The opening film

The client asked for the landing page to open on a film and reveal their
proposed homepage on scroll, so `/` is two screens. The first is
`HeroFilm.astro`: a full viewport of the brand's red with the lockup on it, the
exact frame the film will occupy, and a dashed note naming the file to drop in
(`public/media/hero.mp4`, plus `hero-poster.jpg`). It says it is a placeholder
rather than pretending otherwise. The second screen is their homepage as drawn —
headline, standfirst, two actions, two pictures, the spinning SMASH seal they
asked for over the first, and their ticker line verbatim underneath.

The seal is `SpinRing.astro`, an SVG `textPath` rather than rotated HTML so the
letters follow the curve at any size. Frozen under `prefers-reduced-motion`.

### What is deliberately not invented

- **The franchise email.** Null, and the button is not rendered while it is.
  Guessing `hello@` at their domain would send real enquiries nowhere, and a
  section that admits it is not wired up beats one that silently fails.
- **The third address.** Their homepage copy says three rooms and five
  kitchens; this repo can verify two addresses. The Visit page states both
  facts and names the gap.
- **The ticker and the townships.** Kamayut, Yankin, Mayangone and Hlaing are
  transcribed from the client's own mock. They are the client's claim about
  their own coverage, published as theirs, not rebuilt from the two branch
  records.
- **Patty counts.** Every one is null, so C-08 no longer promises them. The
  paragraph now explains the technique and stops there.

### The agency credit

"Made by Aster" with the Aster mark sits in the last row of the footer, after
the copyright, linking out to astermade.com. Small, last, and outbound — a
signature, not a banner.

---

## 13. Our Story folds into Home, and the address is the map link

Four routes now, not five. `/story` is gone and the story sits on the home page
as two sections: where Le SMASH came from, and what the press does to a patty.
Where it is going closes the page on the red band, next to the rooms it is
about.

That is a better fit than it sounds. The brief warns the homepage should
"immediately establish the personality of Le SMASH without containing too much
information", which cuts against folding a page into it — so the story lost its
third block rather than being pasted in whole. It also means the one page a
first-time visitor actually lands on now carries the brand narrative instead of
linking away to it.

`/story` was live for about half an hour, so `vercel.json` redirects it to
`/#story` (301) rather than 404ing. The nav and footer point at the anchor.

**The address is the Google Maps link.** The brief lists "Google Maps links" as
a requirement of the Visit section. Rather than a button beside the address, the
address itself is the link — pin, address, and an "Open in Google Maps" cue —
because the address is the thing a visitor already wants to tap. The Call button
stays; a second button to the same URL would be noise, not emphasis.

One caveat worth knowing: `directionsUrl()` has no `googleMapsUrl`,
`googlePlaceId` or coordinates for either branch, so it falls back to a Maps
*search* on brand + name + address + Yangon. That is a real, working link and it
resolves correctly for a named restaurant, but it is a query rather than a pin.
Neither the client's Facebook page nor any public listing carries coordinates,
so this is now an explicit ask in the content register: two Google Maps share
links, or a place ID each.

---

## 14. The asset library arrived, and the placeholders came out

**Correction first.** Sections 12 and 13 record the client's Drive folder as
empty. It was not. The Drive MCP connector cannot enumerate the children of a
folder that was merely *shared* with us — `parentId = '<id>'` returns no results
whether the folder is empty or full, and `modifiedTime == createdTime` on the
folder made the wrong reading look confirmed. It held 134 files the whole time.

The way in is `https://drive.google.com/embeddedfolderview?id=<id>#list`, which
renders a plain HTML listing of any link-shared folder, ids included, with no
auth. Files then come down at web size from
`https://drive.google.com/thumbnail?id=<id>&sz=w1600`.

### What was there

Six subfolders (Burgers, Collaborations, Logos, Main Menu, Posters, Stickers)
and 94 loose files: campaign posters, editorial spreads, product shots, room and
exterior photography, behind-the-scenes, merchandise mockups, and a full logo
pack.

77 files are now in the repo, recompressed:

- **51 gallery pictures** across all seven sections. Every reserved frame on
  `/gallery` is now a photograph.
- **9 dish photographs**, on the nine items whose name matches a file with no
  guessing involved. The rest keep their reserved frame — see below.
- **The real logo pack.** `logo-lockup-cream.png` is now their own white
  lockup instead of the version I keyed by hand off a social post, and
  `logo-badge.png` is their red tile. Sharper, and no longer a reconstruction.
- **A cut-out burger on transparency** (`brand/hero-burger.png`), the one asset
  in the library that can sit on any ground. It stands on the monogram panel on
  the home page.
- **The monogram tile** their homepage mock asked for by name ("Loewe pattern —
  please add here"), as a seamless repeating background.
- **A film-frame still** for the opening screen.

### Two judgment calls worth recording

**The Burgers folder is editorial spreads, not product shots.** Every file in it
is a magazine layout with the burger name set in serif type, lorem ipsum body
copy, and a price (21K, 18K). They are beautiful and exactly the register the
brief asks for, so they are in Gallery. They are not dish photographs, and
using them as such would have put both placeholder Latin and prices on a menu
the brief says carries neither.

**Only nine dishes got a photograph.** The library has many gorgeous burger
shots, but nothing in the filenames or the frames says which burger each one
is — and "Miso Bacon" over a photograph of a different burger is exactly the
gap between marketing and plate this project exists to close. So the matched
nine are the ones where a filename names the dish (`chicken parm.jpg`,
`Steak and fries.jpg`) or the frame is unambiguous. The other 26 keep a
reserved frame, and the content register now lists them.

**The opening screen no longer announces itself as unfinished.** The dashed
"film goes here" note was the most placeholder-looking thing on the site. It
now appears in preview builds only, over a real still. A live visitor is never
told what the page is missing.

---

## 15. The whole archive, and no more preview furniture

**The banner is gone.** It said no photography had been supplied and the menu
was unconfirmed. Both were true when it was written; neither is now. A
client-facing list of gaps belongs in `docs/CONTENT-REGISTER.md`, not stapled to
the top of every page a customer sees. The dashed "film slot" note on the hero
went with it — the opening screen carries a real still and is finished, and a
visitor should never be told what a page is missing.

Removing the banner also retired `initBanner()`, the `[data-banner]` hook and
the `--banner-h` custom property that five CSS offsets were adding to a value
that no longer exists. Those offsets are plain numbers again.

**99 of the 134 Drive files are in the gallery**, up from 51. Sections now run
Campaigns 29, Food 20, Events 12, Behind the Scenes 12, Special Projects 15,
Spaces 6, Collaborations 5. 13 files are deliberately out and
`public/media/README.md` names each one and the reason — the short version is 8
logo colourways, one AI-generated image, two 50:1 print banners and two exact
duplicates.

### Artwork keeps its own proportions

Filling the gallery surfaced a real bug in how it was built. Campaigns is a 4:5
section, and most of what belongs in it is landscape or square poster artwork.
Cropping those to 4:5 turned "SMASH NOW" into "MASH OW", cut the lockup off the
brunch menu, and reduced the eight editorial spreads to a column of lorem ipsum.

The first fix was wrong in an instructive way. I set the CSS to `contain` and
mounted artwork on a mat — but the crop had already happened when the *files*
were generated, so `contain` was faithfully showing the whole of an
already-cropped image. No CSS can recover pixels that are not in the file. The
45 artwork files were regenerated at their native aspect ratio, and only then
did `contain` mean anything.

Letterboxing them turned out to be the wrong answer too: a 3:2 spread inside a
4:5 box is 47% mat, and half of Campaigns is landscape. So `fit` is part of the
gallery model, and artwork sizes its own row — `aspect-ratio: auto` with the
tiles aligned to the top of the row, so the ragged edge falls at the bottom
where it reads as an archive rather than as a broken grid. Photography is
unchanged: it still fills its tile at the section ratio, so a reserved frame and
a picture remain the same box.

The eight `Burgers/` editorial spreads are in Campaigns rather than on the menu,
for the reason given in §14: they carry lorem ipsum and prices. In a campaign
archive, at their own proportions, that reads as what it is — layout artwork.


---

## 16. The menu boards were the missing menu

The client's Drive contains two files called `Main Menu/m1.jpg` and
`Main Menu/m2.jpg`. Both had been treated as artwork and filed in the Gallery
under Special Projects. They are not artwork. They are the restaurant's actual
printed menu, and between them they carry, for twenty-eight dishes, a
photograph, an ingredient line and a price.

That is the single largest piece of confirmed content in the whole library and
it had been sitting in the gallery as decoration.

### What came out of them

Twenty-eight plate photographs were located on the two boards by masking the
red ground and taking the bounding box of every remaining region larger than
150px — a texture test rather than a colour test, because a plate of peri peri
chicken is as red and as saturated as the board behind it. Every box was
checked by eye against an overlay before anything was cropped.

Seven of those boxes were dishes the website had no record of at all:

| Added | Course |
|---|---|
| Eggs Shashuka | Brunch |
| Pain Perdu French Toast | Brunch |
| Peri Peri Chicken | Main |
| Spicy Garlic Prawns | Main |
| Beef Tartare | Snacks |
| Homemade Cured Salmon Toast | Snacks |
| Homemade Cured Salmon | Snacks |

The menu goes from 35 items to 42, from 9 photographs to 31, and from **no**
descriptions at all to 26.

### The boards were re-fetched at full size first

The proofs in the scratchpad were `thumbnail?sz=w1600` renders. The originals
are 3000×3600. Cropping a 424px box out of the 1600px proof gives a 424px dish
photograph; cropping the same box out of the original gives 795px. Every crop
was taken from the original and the box coordinates scaled by 1.875 — which is
the same lesson as §15, one step earlier in the pipeline: **check what
resolution you actually have before you decide the crop is good enough.**

### What was not taken

- **Prices.** The boards price every dish. The site publishes none, per §12 —
  the brief says the menu can be shown without prices and a portfolio site that
  quotes a number is a price list that goes stale in a kitchen's first
  re-print.
- **The seven burgers.** There is no burger board. The eight `Burgers/`
  spreads are magazine layouts set with lorem ipsum, and the burger imagery in
  them is composed into the page rather than sitting in it as a plate shot.
  Only `SMASH` gained a photograph, from `Le SMASH burger.jpg`, which is a
  clean studio frame the filename identifies by name.
- **A description for `Homemade Cured Salmon`.** The board prints that name
  above the line "Roasted Tomatoes, Burrata Cheese, Basil, Olive Oil", beside a
  photograph of sliced cured salmon and shaved onion. Name, line and picture
  do not agree, so the item ships with its name and its photograph and no
  description, and the conflict is in the content register for the client to
  settle. `Roasted Tomato & Burrata` stays as its own item because a separate
  photograph of that dish exists in the library.

Spelling was reproduced as printed, with three exceptions where the board has a
plain slip: `Chimmichurri`, `Bernaise` and `Marimara`. Item *names* were not
touched at all — `Eggs Shashuka` is their menu's spelling and it stays.

### The footer got shorter

The footer was 728px tall on a 1280px viewport, which is a whole screen on a
13" laptop before any browser chrome. The design is unchanged; the padding is
not. Top padding `--s8`→`--s7`, bottom `--s6`→`--s5`, grid gap `--s7`→`--s6`,
the rule above the bottom row `--s8`→`--s6`, and the oversized SMASH from
`clamp(4rem, 17vw, 17rem)` to `clamp(2.75rem, 12vw, 11rem)`. That is about
580px — still the dark bookend, still closed by a wordmark too big for the
page, but it no longer *is* the page.

The Aster credit went from 11px at 55% opacity to 13px at 72%, with the mark at
22px and the word "Aster" itself in full cream. A signature should be legible
without becoming a banner; at 55% on a dark ground it was neither.

---

## Not built, and why

| Not built | Reason |
|---|---|
| Hero film | Not shot, and no longer needed — the hero is a photograph beside the lockup |
| Commissioned food and room photography | Not shot. The brief calls this the single highest-leverage deliverable and it is right. Every Gallery slot and every dish card is a reserved frame at its final size |
| Merch | A shop. Out of scope for a portfolio site — see §12 |
| The Yangon delivery map | A drawn concept frame is in place on `/visit`. The real thing needs confirmed township boundaries and which kitchen serves which area |
| Google Search Console / Business Profile | Requires client account access |
| Analytics provider | Requires a client decision on vendor |
| Lighthouse against the PRD's 5 Mbps profile | Cannot be run from this environment; budgets are enforced statically instead |
