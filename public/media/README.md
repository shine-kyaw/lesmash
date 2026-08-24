# Media

Drop files here and the site picks them up on the next build. No code change is
needed — these filenames are the whole contract.

| Filename | Where it appears | Notes |
|---|---|---|
| `hero.mp4` | Full-bleed hero film | 10–30s silent loop, H.264, 1080p, 1,000–2,500 kbps. Keep it under ~4MB. |
| `hero-poster.jpg` | First frame of the hero | Same crop as the film's opening frame. |
| `sear.jpg` | The pass, on the home page | Portrait 4:5. A patty on the press, patties countable in profile. |
| `room-01.jpg` | The room, on the home page | Landscape 3:2. |

Anything missing renders a generative ember field instead (see
`public/scripts/ember.js`) — a graded warm plane rather than an empty box.

## The film is not served to everyone

A full-bleed autoplaying video is the most expensive thing this page can do, and
the audience is on a median 5 Mbps mobile connection. The canvas plane paints
immediately for everyone; the film is attached over it only on a viewport
wider than 54rem, and never when the browser reports a slow connection or the
visitor has asked to save data. Everyone else keeps a hero that is already
finished. That logic lives in `initVideo()` in `public/scripts/app.js`.

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

Compress to: hero film under 4MB, stills under 250KB each at 1× display width,
AVIF or WebP where possible. `npm run check:budgets` will fail the build if the
page weight goes past budget.
