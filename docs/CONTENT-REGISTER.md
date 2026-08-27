# Content register — what is still needed before launch

Everything below is a value the website needs and does not have. Nothing in the
codebase invents a value for any of it; each renders an honest "not confirmed"
state instead.

Run `npm run content:report` for the live, itemised version generated from the
actual content files.

---

## Blocking — the site cannot go live without these

| Ref | What we need | Why it blocks | Owner |
|---|---|---|---|
| **DS-03 / Q14** | Exact menu item names, all items | Every item record is currently a placeholder marked `verified: false` | Client |
| **DS-04 / Q5** | Prices, and whether dine-in and Foodpanda prices differ | No price is published anywhere today; every item reads "Ask in store" | Client |
| **DS-01 / Q6** | Opening hours per branch, per day, plus any breakfast window | Branch pages, `/breakfast`, opening-hours schema, and the entire open-now feature | Client |
| **DS-02 / Q7** | Phone number per branch | Tap-to-call renders nowhere; the sticky bar's call button falls back to the locations page | Client |
| **Q4** | Is Yankin dine-in, delivery-only, or both? | Both branches currently publish "Dine-in: not yet confirmed" | Client |
| **Q11** | The canonical brand name and casing | Four variants are in public circulation; NAP consistency depends on picking one | Client |
| **Q10 / DS-08** | Canonical domain, and whether `.com.mm` is wanted | Every absolute URL, the sitemap, schema and OG tags. `src/lib/site.config.mjs` carries a placeholder marked `originResolved: false` | Client + agency |
| **Q9** | Brand identity assets — logo, colours, typefaces | The current palette and type are a neutral stand-in designed to be swapped in one token file | Client |
| **C-10** | Brand story, 200–350 words | `/about` renders a labelled empty slot. No founder narrative, date, award or sourcing claim will be written for you | Client |
| **C-02** | Three proof points, ≤6 words each, each verifiable | Homepage positioning strip | Client |
| **C-18** | Privacy notice review | A plain-language notice is drafted and describes what the site actually does; it needs legal sign-off | Client |

## Blocking, but partially resolved

| Ref | Status |
|---|---|
| **DS-07 / Q8** | ✅ Foodpanda listing URLs found for both branches and wired to the Order CTAs. Confirm they are the correct current listings. |
| **DS-06** | ✅ Facebook, Instagram and TikTok all resolve to `@eatlesmash`. **Confirm these are the accounts you operate** — look-alike accounts using `le_smashburger` are in circulation and appear unrelated. |
| **DS-09 / Q26** | ❌ No Google Place ID or coordinates for either branch. Directions links currently fall back to a name-and-address search, which usually finds the right pin but is not guaranteed. Needs Google Business Profile access. |

## Non-blocking, but the site is weaker without them

| Ref | What we need | Effect today |
|---|---|---|
| **Photography** | Food shots with countable patties and a scale reference, and the rooms | Three stills cropped from the client's own social posts are standing in, and every other picture slot renders a designed placeholder. Still the single highest-leverage deliverable in the project — the brief and its acceptance criteria are in `public/media/README.md` |
| **The logo, in vector** | An `.ai`, `.svg` or `.eps` original | Supplied as raster: recovered from the client's Facebook page and in use in `public/brand/`. A vector original would sharpen the header lockup and let the favicon and the share card be regenerated cleanly |
| **The founded year** | The year Le SMASH opened | The brief says it "must be included". `/story` renders a labelled gap where it goes (C-15) |
| **The third address** | The address and hours of the third room | Their homepage says three rooms; two are confirmed. `/visit` names the gap rather than showing two and calling it all of them |
| **Google Maps pins** | The Maps share link for each branch, or its place ID | The Visit page links the address to a Maps *search* on brand plus address. It works, but it is a query rather than a pin. Nothing public carries coordinates for either room |
| **Which room the phone rings** | Confirm 09 758 542661, and whether each room has its own line | The number is published on their own Facebook page and appears once, at brand level, on Visit and in the footer. No branch card claims it |
| **Franchise enquiry address** | The email franchise enquiries should reach | The Franchise section renders a note instead of a button. Deliberately not guessed from the domain |
| **Patty counts** | How many patties are in each burger | Every card omits it, and C-08 no longer promises it |
| **Delivery coverage** | Which township each kitchen serves, and the boundaries | `/visit` has a drawn map frame and the four townships from the client's own copy. The areas themselves are unconfirmed |
| **Menu descriptions** | A line per dish, at least for the burgers and the brunch | 35 cards carry a name and nothing else |
| **Gallery photography** | Files per section, per `src/data/gallery.ts` | 42 reserved frames at final size. This is the deliverable the brief itself calls highest-leverage |
| **The hero film** | A silent 15–30s loop, 1080p, under 4MB | `/` opens on a full-viewport placeholder naming the file to drop in |
| **C-08** | "How we smash" — 100–150 words on the actual process and patty size | The flagship expectation-setting block on `/burgers` is an empty slot |
| **C-11** | Portion-honesty statement | Recommended; high value; drafted only once the client approves the principle |
| **C-09** | Breakfast intro, 150–250 words | `/breakfast` has no unique intro copy, which weakens it for search |
| **C-15 / Q16** | Seating and reservation policy | `/about` has an empty slot where the policy should be |
| **C-06 / Q18** | Allergen data and approved disclaimer wording | A scope disclaimer renders; no allergen data does. Nothing will be published without written confirmation |
| **Q15** | Halal / pork-handling policy | No dietary indicator and no `suitableForDiet` schema is emitted. This will not change without a written statement |
| **DS-05** | Review scores and volumes | The homepage social-proof module is not built; it would render as static text, never a third-party widget |
| **Q12** | Who maintains the site after launch | Determines whether the Sanity studio is stood up and who is trained |

---

## How the placeholders behave

| Situation | What the customer sees |
|---|---|
| Price not set | "Ask in store" — never a number |
| Hours not set | "Opening hours not yet published" + "Please call the branch to confirm" |
| Phone not set | No `tel:` link renders at all |
| `hasDineIn: null` | "Dine-in: not yet confirmed" |
| No photograph | A branded placeholder at the correct aspect ratio, labelled "Photograph coming soon" |
| Item not client-confirmed | A "Content pending" badge in preview builds; the item does not render at all in live builds |
| Editorial slot empty | A labelled slot naming its reference and owner in preview; nothing at all in live builds |

---

## Filling a gap

Most values live in `src/content/`. For example, adding hours and a phone number
to a branch:

```jsonc
// src/content/branches/junction-square.json
"phone": [{ "e164": "+959XXXXXXXXX", "display": "09 XXX XXX XXX" }],
"openingHours": [
  { "day": 1, "open": "10:00", "close": "22:00" },  // 0 = Sunday
  { "day": 2, "open": "10:00", "close": "22:00" }
],
"hasDineIn": true
```

A `close` earlier than `open` means the shift runs past midnight; two entries
for the same day mean a split shift. Both are handled.

Then re-run `npm run content:report` to confirm the gap has closed.
