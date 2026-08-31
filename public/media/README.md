# Media

Everything here came from the client's own Drive library (the "Main Drive Link"
on their Canva board — 134 files), recompressed for the web. Nothing is stock
and nothing is borrowed.

| Folder | What is in it |
|---|---|
| `gallery/<section>/` | 51 pictures, one folder per section in `src/data/gallery.ts` |
| `dishes/` | Dish photographs, named after the menu item slug they belong to |
| `rooms/` | The exterior, the counter, the room in the evening, the menu wall |
| `story/` | The press, the onions, a patty in profile |
| `home/` | Spares for the home page |
| `hero-still.jpg` | The opening screen. 16:9, 1920px |

`brand/` (one level up) holds the identity: their real white lockup, the red
badge tile, the seamless monogram tile, the cut-out burger on transparency, and
the meat stickers.

## Adding a picture to the gallery

Two steps, no code:

1. Drop the file in `public/media/gallery/<section>/`, named so it sorts where
   it should appear (`09-...`).
2. Add one line to that section's `items` array in `src/data/gallery.ts` with
   its filename and alt text.

A section with an empty `items` array renders reserved `Shot` frames at its
ratio instead, so a new section can be declared before its photography exists.
Export at the section's ratio, longest edge 1200–1400px, WebP or JPEG, under
250KB.

## Adding a dish photograph

Set `image` on the item's JSON in `src/content/menu-items/`:

```json
"image": { "src": "/media/dishes/<slug>.jpg", "alt": "What is in frame" }
```

Export 4:3, 900px wide. **Only do this when you know which dish the photograph
shows.** 26 items are still without one, and that is deliberate — the library
has many burger shots and nothing identifies which burger each one is. A card
labelled "Miso Bacon" over a photograph of something else is precisely the gap
between marketing and plate this site exists to close.

## The hero film

`hero.mp4` plus `hero-poster.jpg`. Silent, 15–30s, seamless loop, H.264, 1080p,
1,000–2,500 kbps, under 4MB. The poster is the film's first frame at the same
crop. Until they land, the opening screen carries `hero-still.jpg` and is
finished as it stands — the film is an upgrade, not a gap.

## Before the next shoot

Portion honesty is still the point, so the brief has acceptance criteria:

- Photograph the portion a paying customer receives, plated as the kitchen
  plates it during service.
- **Name the file after the dish.** This is the whole reason 26 cards have no
  photograph.
- Every multi-patty burger needs one frame where the patties are countable in
  profile.
- Every hero item needs a visible scale cue in frame — the actual plate, a
  hand, the serving basket.
- Both branches get their own exterior shot. A branch page illustrated with the
  other branch's room is a small dishonesty that undermines the whole position.
