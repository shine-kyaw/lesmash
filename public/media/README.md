# Media

Real photographs live here. Drop a file in and reference it from the page that
needs it — there is no naming contract any more, because the generative media
plane that used to depend on one is gone (see `docs/DECISIONS.md` §11).

| File | Where it appears |
|---|---|
| `burger.jpg` | The hero, beside the wordmark. Used at native size — never upscaled |
| `sear.jpg` | The pass, on the home page. Portrait 4:5 |
| `plate-01.jpg` | The kitchen, on the home page. Landscape 3:2 |

**These three are placeholders with a shelf life.** They were recovered from
Le SMASH's own Facebook page and cropped, because no photography had been
supplied to the project. They are the restaurant's own images, so nothing here
is borrowed — but they were shot for social posts rather than for this layout:
`burger.jpg` had promotional callouts cropped out of it, and none of the three
meets the acceptance criteria below. C-08 promises that "every picture shows the
plate as it leaves the pass"; these do not let the site keep that promise.

Any picture slot without a file renders `Shot.astro` — a designed panel at the
right aspect ratio, so nothing shifts when the real photograph lands. Never a
broken image, never stock.

## Brand assets

`public/brand/` holds the identity itself, which is not placeholder material:

| File | What it is |
|---|---|
| `logo-lockup-cream.png` | The cream wordmark knocked out of its red ground. Used in the header, the footer and the hero. Never place it on parchment |
| `logo-badge.png` | The full logo tile — red ground, cream script, black SMASH. The canonical mark |

`public/og.jpg`, `public/favicon-32.png` and `public/apple-touch-icon.png` are
generated from those two. Both are raster, traced back from social exports. If
the client supplies vector originals, regenerate all of them from the vector.

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
