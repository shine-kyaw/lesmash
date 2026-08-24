# Media

Drop files here and the site picks them up on the next build. No code change is
needed — these filenames are the whole contract.

| Filename | Where it appears | Notes |
|---|---|---|
| `burger.jpg` | The hero, beside the wordmark | Portrait-ish, roughly square. Used at native size — no upscaling. |
| `sear.jpg` | The pass, on the home page | Portrait 4:5. A patty on the press, patties countable in profile. |
| `plate-01.jpg` | The kitchen, on the home page | Landscape 3:2. |

The three files currently in this folder were recovered from Le SMASH's own
Facebook page and cropped, because no photography had been supplied to the
project. **They are placeholders with a shelf life.** They are the
restaurant's own images so nothing here is borrowed, but they were shot for
social posts rather than for this layout: `burger.jpg` had promotional callouts
cropped out of it, and none of them meet the acceptance criteria below.

Anything missing renders a generative brand field instead (see
`public/scripts/ember.js`) — a graded red plane rather than an empty box.

## Brand assets

`public/brand/` holds the identity itself, which is not placeholder material:

| File | What it is |
|---|---|
| `logo-lockup-cream.png` | The cream wordmark knocked out of its red ground. Used in the header, footer and hero. Never place it on paper. |
| `logo-badge.png` | The full logo tile — red ground, cream script, black SMASH. The canonical mark. |

`public/og.jpg`, `public/favicon-32.png` and `public/apple-touch-icon.png` are
generated from those two. If the client supplies vector originals, regenerate
all of them from the vector and delete the raster sources.

## Before you shoot

Portion honesty is the point of this site, so the photography brief has
acceptance criteria, not just a shot list:

- Photograph the portion a paying customer receives, plated as the kitchen
  plates it during service.
- Every multi-patty burger needs one frame where the patties are countable in
  profile.
- Every hero item needs a visible scale cue in frame — the actual plate, a
  hand, the serving basket.
- A combo is photographed with everything the combo includes, and nothing else.
- Both branches get their own exterior shot. A branch page illustrated with the
  other branch's room is a small dishonesty that undermines the whole position.

Compress to: stills under 250KB each at 1× display width, AVIF or WebP where
possible. `npm run check:budgets` will fail the build if the render-blocking
payload goes past budget.
