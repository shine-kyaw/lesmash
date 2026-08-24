# Launch checklist

From PRD §32. Every item needs a named sign-off; anything unchecked blocks
launch.

Status keys: **✅ done** · **⚙️ automated** (a script enforces it) ·
**⛔ blocked** (waiting on the client) · **☐ outstanding** (needs a person)

---

## Content

- ⛔ All menu items published with accurate names, descriptions and prices — *DS-03/DS-04*
- ⛔ Patty counts populated for every applicable item
- ⛔ Portion notes / weights populated wherever confirmed
- ⛔ Combo contents itemised exactly
- ⚙️ Zero placeholder or lorem text on any published page — enforced by `CONTENT_MODE=live npm run content:report`
- ✅ Zero invented facts — no founder story, date, award, sourcing claim or certification appears anywhere
- ⛔ Price-context statement published and approved — *Q5*
- ⛔ Seating / reservation policy statement published — *Q16*

## Menu

- ✅ Renders correctly with JavaScript disabled — all 29 items are server-rendered
- ✅ Category anchors work; filters apply client-side and restore from the URL
- ✅ Unavailable items dimmed and labelled, not hidden
- ✅ Branch-limited items badged
- ✅ Every item has a branded placeholder — zero broken images
- ⛔ "Prices as of" date accurate — *renders once prices exist*

## Branches

- ✅ Both branches published on the home page and in the footer
- ☐ Addresses verified against reality and Google Business Profile
- ⛔ Hours verified with the client within 7 days of launch — *DS-01*
- ✅ Open-now correct at open, at close, and across midnight in Asia/Yangon — *logic verified; needs real hours as input*
- ⛔ Dine-in / delivery status explicitly stated per branch — *currently states "not yet confirmed", which is honest but not launchable*
- ⛔ Exterior photograph present for each branch

## Links, Foodpanda, phone, maps

- ✅ Zero broken internal links
- ⚙️ Outbound links validated — `npm run check:links`
- ☐ Foodpanda link tested per branch on a real phone — *URLs are wired; the domain is unreachable from this environment*
- ⛔ Every `tel:` link dials the correct number — *DS-02; no number renders today*
- ☐ Every Directions link opens the correct pin in native Maps — *falls back to address search until DS-09*
- ✅ All external links carry `target="_blank" rel="noopener noreferrer"`

## SEO and schema

- ✅ Unique geo-qualified title and meta description on every page
- ✅ One H1 per page; heading order logical — audited across all 21 pages
- ✅ Restaurant / Menu / Organization / WebSite / BreadcrumbList / ItemList schema emitted and parsing
- ☐ Schema validated in Google's Rich Results Test — *needs a public URL*
- ✅ `sitemap.xml` complete
- ☐ Sitemap submitted to Search Console — *needs client account access*
- ✅ `robots.txt` correct; `/order` disallowed
- ✅ Self-referencing canonicals
- ☐ NAP identical across site, both GBP listings, Facebook, Instagram and both Foodpanda listings
- ☐ OG previews verified in Facebook, Viber and Telegram — *needs a public URL and an OG image*

## Analytics

- ✅ Full event taxonomy firing, including `foodpanda_outbound` before navigation
- ⛔ Analytics provider chosen and connected — *events currently queue on `window.lesmashEvents`*
- ✅ Analytics payload ≤5KB, non-blocking — *0KB today; budget unspent*
- ☐ Search Console verified

## Accessibility

- ☐ axe-core: zero critical/serious issues on every template — *manual audit passed; automated run outstanding*
- ✅ Visible focus throughout, ≥3:1 against adjacent colour
- ✅ Focus trapped in the drawer and returned to the trigger on close
- ✅ AA contrast for every token pair — ratios documented in `src/styles/tokens.css`
- ✅ Alt text on every content image — audited; build has zero `<img>` without `alt`
- ✅ Touch targets ≥44×44px
- ✅ `prefers-reduced-motion` respected
- ✅ Skip link is the first focusable element
- ✅ Spice level and service badges never conveyed by icon or colour alone
- ☐ Manual screen-reader pass on every template

## Performance

- ☐ LCP <2.5s on `/` and `/menu` under the agreed profile — *cannot be measured here*
- ☐ Hero film compressed inside the budget in `public/media/README.md` — *no film supplied yet*
- ☐ CLS <0.1, INP <200ms
- ⚙️ Page-weight, JS, CSS and font budgets met — `npm run check:budgets`, wired into `npm run build`
- ✅ Zero render-blocking third-party requests
- ☐ Lighthouse mobile performance ≥90

## Mobile and Myanmar connectivity

- ☐ Verified on ≥3 real Myanmar-market Android devices plus iOS
- ☐ Tested on a real Myanmar mobile network, not only throttled emulation
- ✅ Sticky bar does not obscure content; safe-area insets respected
- ✅ Site renders fully with all third-party domains blocked — there are none
- ✅ Site renders fully with Facebook and Instagram blocked — they are outbound links only
- ✅ Site renders core content with JavaScript disabled

## Security

- ✅ HTTPS enforced; HSTS enabled with preload; certificate auto-renewal — *`vercel.json`, automatic on Vercel*
- ✅ Security headers set — CSP restricted to `'self'`, nosniff, Referrer-Policy, Permissions-Policy, frame denial. Verified against the built site with zero violations. **Adding analytics will require amending the CSP**
- ☐ CMS accounts use strong credentials and 2FA; no shared logins
- ✅ No secrets in the repository
- n/a Form spam protection — no forms exist

## CMS

- ✅ All content types configured with validation and localised fields — `sanity/schemas/`
- ✅ Roles and permissions documented (Editor vs Admin)
- ☐ Studio deployed and publish→live verified within 5 minutes
- ⚙️ Missing-translation report functioning — `npm run content:report`
- ✅ Bilingual one-page staff SOP written — `sanity/README.md`
- ☐ Training completed and a named staff member has made a live price change unaided

## Legal and domain

- ⛔ Canonical domain live; variants 301-redirecting — *Q10. Deployment is wired; set `SITE_ORIGIN` once the domain exists*
- ⛔ Domain registered to the client with client-held access
- ☐ DNS documented and handed over
- ⛔ Privacy notice — the page was cut in the two-page scope reduction. It must come back before any form or analytics cookie exists (*C-18*)
- ⛔ Trademark position acknowledged in writing — *the Dutch chain collision (R-02)*
- ⚠ No unlicensed imagery, fonts or content — the bundled faces are Gasoek One, Grand Hotel, Archivo and IBM Plex Mono, all SIL Open Font License. **The logo artwork and the three stills in `public/media/` were taken from the client's own Facebook page.** They are the client's own material, but get that confirmed in writing before launch, and confirm the client holds the rights to the photographs themselves if an agency shot them

---

## Deployment

- ✅ Hosting configured — `vercel.json`; see `docs/DEPLOY.md`
- ✅ Absolute URLs resolve from the deployed origin, not a hard-coded domain
- ✅ Preview deployments excluded from search (`robots.txt` returns `Disallow: /` when `VERCEL_ENV=preview`)
- ✅ Performance budgets fail the deploy, not just the local build
- ☐ Project connected on Vercel and first deploy green
- ☐ `SITE_ORIGIN` set — *blocked on Q10*
- ☐ `CONTENT_MODE=live` set — *blocked on the content register*

## The short version

The engineering is done and gated by scripts. What remains is almost entirely
**content the client owns** and **verification that needs a public URL, a real
device, or a client account**.

The fastest unblock, in order:

1. The menu — names, prices, and whether dine-in and Foodpanda prices differ
2. Opening hours and phone numbers per branch
3. The hero film, the photography, and the real logo — see `public/media/README.md`
4. Domain and canonical brand name
5. Google Business Profile access
