# Revision 01 plan

Source: Reyy's feedback deck, "Le SMASH Website Revision First Feedback File 21Nov_2026.pdf"
(email 21 Nov 2026, from the team's 16 Nov meeting). Eleven points, numbered as in the deck.

## Decisions (Shine, 22 Nov 2026)

- **We do everything on our side.** We don't ask the client for file formats or specs.
- **Fonts:** keep the fonts matched to the real logo (Gasoek One display, Grand Hotel script)
  and tidy them into one system. Their deck is set in Calibri, which isn't a brand font.
- **Big changes** (LINE UP, train, menu) get built and pushed live, same as always. There's no
  separate sign-off round.
- **Prices come off.** This supersedes the 4 Nov brief, which showed them.

## Open facts (asked in the reply to Reyy)

- **Zigar.** The deck's priority rooms are "Le SMASH Eatery at Junction Square" and "Le SMASH
  Eatery at Zigar". The site has Junction Square and Yankin (No. 2 Thazin Myaing St, Parami Ave).
  Zigar isn't on Google Maps, Facebook search or the web.
  Until Reyy answers: build the train for two stops and keep the Yankin data, ready to rename.
- **Wine Su music video.** Not confirmed. Her newest is "Pssht! (Pepper Spray)", released
  11 Nov 2026 (youtube.com/watch?v=3wlAU815kBE), but its credits don't mention Le SMASH.
  Don't publish it until Reyy confirms which video it is.
- **AR-T, confirmed:** "Chit Pay Par (Official Music Video)", 22 Mar 2026, youtube.com/watch?v=CcG4Nragmiw.

## Work list

### 1. Copy fixes: rooms and townships (deck 03)
"3 rooms, 5 kitchens" becomes "2 rooms, 4 kitchens", and Hlaing is removed everywhere, not only on the banner:
- `src/components/Ticker.astro` (lines 11, 12, 16)
- `src/data/editorial.ts:86` ("Three rooms. Five kitchens. Kamayut, Yankin, Mayangone, Hlaing.")
- `src/pages/index.astro:28` (Outlets card caption)
- `src/pages/visit.astro:37` (townships list)
- `src/lib/seo.ts:15` (site description)
- `src/pages/gallery.astro:44` ("Three rooms, five kitchens")
- Then grep for `rooms|kitchens|Hlaing` again to confirm nothing is left.

Keep the banner's animation style. Only adjust spacing if the shorter copy leaves a gap in the loop.

### 2. Menu (deck 08)
- Remove every price: data, flip-book pages, and any "Ks" or "MMK" in labels or alt text.
- Make browsing better. Use a sticky category bar, and keep the current category in view
  while scrolling. Moving between a category and a dish should be one smooth step.
  Burger photos stay the focus.

### 3. Collaborations in date order (deck 09)
- Sort `src/data/collabs.ts` oldest to newest. Use one date format: "12 Apr 2025", and for
  date ranges "3–12 Apr 2025".
- Entries with no year (e.g. "Sunset Ibiza, August 9th") get their year from the matching
  Facebook post date. If none can be found, the entry goes last and is marked as missing a year.

### 4. New Music Video tab (deck 10)
- Add a standalone nav item and page, `/music-video`, separate from Collaborations.
- Each video is a YouTube embed (privacy-enhanced youtube-nocookie.com, click-to-load poster so
  the page stays fast and the CSP holds) with title, artist and date.
- AR-T goes in now. Add Wine Su once confirmed.
- Update the nav, footer, sitemap and SEO description to include it.

### 5. Train: Visit Us footer (deck 06)
- Two stops only: Junction Square and Zigar (Yankin until confirmed).
- At each stop the doors slide open and burgers are revealed inside the carriages, then the
  doors close and the train moves on. Keep the stops short, as already tuned.
- Burger images: cut-outs from our existing burger photos.

### 6. LINE UP (deck 04)
- Replace the up/down swipe with a calmer layout that's easy to scan. Desktop: a horizontal
  line-up with snap and arrow keys. Mobile: one item per screen, swiped sideways with
  snap-scrolling. Both use the same motion.

### 7. Typography system (deck 01, 02, 11)
- Use the brand fonts (Gasoek One, Grand Hotel) everywhere, and drop Permanent Marker.
- Set one scale for headings, body, nav, buttons and labels, and apply it to every page,
  including the Merch tab.
- Navigation, imagery and page labels should be easy to tell apart.

### 8. Desktop and mobile pass (deck 05)
- Check every page at 375, 768, 1280 and 1920 px for sizes, spacing, crops, touch targets
  (44 px minimum) and gestures.
- Fix as I go.

### Unchanged
- Our Story (deck 07) changes only through the typography pass.

## Order of work
1, 2, 3 (quick and certain), then 4, 5, 6, 7, 8.
Push each step live when it's done. `npm run build` must end with "All budgets held."

## Status (23 Nov 2026): all eight items live

| # | Item | Commit |
|---|---|---|
| 1 | Two rooms, four kitchens; Hlaing removed | bbda9be |
| 2 | Prices off (`SHOW_PRICES`); sticky category bar | bbda9be, d5e3321 |
| 3 | Collaborations in date order | bbda9be |
| 4 | Music Video tab (AR-T); AR-T out of Collaborations | 8f0552e, e7b79d5 |
| 5 | Train: two stops, doors open on burgers | b6fc6eb |
| 6 | LINE UP: lit shelf, no scroll-pinned ring | 45a5b8d |
| 7 | One type system; marker font retired | dd7f5ec |
| 8 | Phone menu, 44px tap targets, call button, size checks | ecea135 |

Still waiting on Reyy: what Zigar is (the train's second stop shows Yankin until
then; rename `src/content/branches/yankin.json` and it follows everywhere), and
which Wine Su video to add (`src/data/music.ts`).
