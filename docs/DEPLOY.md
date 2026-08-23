# Deploying to Vercel

The site is static output. Vercel needs no adapter and no serverless functions —
it serves `dist/` from the CDN.

## Connect it (one time, ~2 minutes)

1. **vercel.com → Add New → Project**, and import `shine-kyaw/lesmash`.
2. Vercel reads `vercel.json` and configures itself: framework Astro, build
   `npm run build`, output `dist`. Nothing to fill in.
3. Set the production branch. Until this work is merged, that is
   `claude/le-smash-burgers-prd-k1p4cx`; afterwards, your default branch.
4. Deploy.

You get a working site on `*.vercel.app` immediately.

## Environment variables

Set these in **Project → Settings → Environment Variables**.

| Variable | Value | Scope | Why |
|---|---|---|---|
| `SITE_ORIGIN` | `https://your-real-domain.com` | Production | Canonical tags, hreflang, the sitemap and OG URLs are absolute. Without this the build falls back to the Vercel domain, which works but is not the address you want declared canonical. Set it the moment the domain is decided (Q10). |
| `CONTENT_MODE` | `live` | Production | **Do not set this yet.** It stops unconfirmed records rendering and makes the build fail while launch-blocking content gaps remain. Set it when `npm run content:report` is clean — see `docs/CONTENT-REGISTER.md`. |

Leave both unset on Preview deployments. Previews should keep showing the
unconfirmed content, since reviewing it is the point.

## What the config does

**Preview deployments are excluded from search.** `robots.txt` is generated, and
when `VERCEL_ENV=preview` it returns `Disallow: /`. A preview URL serving a full
copy of the site is a duplicate-content liability, and it would compete for the
exact brand terms this project is trying to win back from an unrelated chain
with the same name.

**Security headers** close the outstanding launch-checklist item: HSTS with
preload, `nosniff`, `strict-origin-when-cross-origin`, frame denial, and a
Content-Security-Policy restricted to `'self'`.

That CSP is strict because the site genuinely has no third-party dependencies.
**Adding an analytics provider will require amending it** — the provider's
domain needs adding to `script-src` and `connect-src`, or the script will be
blocked and you will see nothing in the dashboard with no obvious cause.

**Caching.** Hashed assets under `/_astro/` and the font are immutable for a
year; `app.js` is not content-hashed, so it gets an hour with
stale-while-revalidate. HTML uses Vercel's defaults.

> If you regenerate the Myanmar font with `npm run fonts:subset`, the filename
> stays the same while the bytes change, and it is cached immutably for a year.
> Rename the file and update `global.css` when that happens, or returning
> visitors keep the old one.

## The build gate

`npm run build` runs `check-budgets.mjs` after Astro, and **fails the deploy** if
the JavaScript, CSS or font budgets are exceeded. That is deliberate: on a
connection averaging around 5 Mbps, a regression in page weight is a regression
in the product, and it should stop a deploy the same way a failing test would.

If a deploy fails on budgets, the log names the page and the overrun.

## Custom domain

Add it under **Project → Settings → Domains**, then set `SITE_ORIGIN` to match
and redeploy so the absolute URLs update. Pick one hostname — apex or `www` —
and let Vercel 301 the other to it. Two hostnames serving the same content split
search authority.

`.com.mm` remains a separate question: it needs the registrar's DNS
capabilities confirmed before it can be pointed anywhere (DS-08).

## After the first deploy

- Submit the sitemap in Google Search Console for both locales
- Check the OG preview in Facebook, Viber and Telegram
- Run Lighthouse against the PRD's throttled profile — 5 Mbps, 4× CPU
- Test on a real Myanmar mobile network, which nothing here can substitute for
