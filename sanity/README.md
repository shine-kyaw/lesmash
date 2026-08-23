# Le SMASH — Sanity Studio

This folder holds the schema definitions for the content system behind
**eatlesmash.com**. It is the layer that lets restaurant staff change prices,
add burgers and mark items sold out without a developer.

Right now the website reads its content from JSON files inside
`src/content/`. These schemas describe **the same data, field for field**, so
the CMS can be dropped in without changing a single template. Nothing about the
site's behaviour changes — only where the data comes from.

---

## Contents

1. [How this maps onto the site's content files](#1-how-this-maps-onto-the-sites-content-files)
2. [Installing and running the studio](#2-installing-and-running-the-studio)
3. [Making a publish go live (the build webhook)](#3-making-a-publish-go-live-the-build-webhook)
4. [Who can edit what](#4-who-can-edit-what)
5. [**For restaurant staff — the two jobs you will actually do**](#5-for-restaurant-staff)

---

## 1. How this maps onto the site's content files

The site's content model is defined in `src/content.config.ts` and
`src/lib/site.config.mjs`. Each schema in `sanity/schemas/` mirrors one of those
collections.

| Sanity document type | Site folder / file |
| --- | --- |
| `menuItem` | `src/content/menu-items/*.json` |
| `menuCategory` | `src/content/menu-categories/*.json` |
| `branch` | `src/content/branches/*.json` |
| `modifierGroup` | `src/content/modifier-groups/*.json` |
| `siteSettings` (singleton) | `src/lib/site.config.mjs` (`SITE`) |

### The three conversions that apply everywhere

These are the only shape differences between Sanity and the JSON files. An
export script applies them; nothing else is transformed.

| Sanity | JSON on the site | Note |
| --- | --- | --- |
| `slug: {current: "smash-classic"}` | `"slug": "smash-classic"` | Take `.current`. |
| a `reference` (`{_ref: "..."}`) | the referenced document's **slug** string | The site's collections reference each other by slug. |
| an **absent** optional field | `null` | This is the important one: an empty field is never exported as `""`. `null` is what makes the site print "Ask in store" / "unconfirmed" instead of a blank. |
| an `image` asset | `"src": "/images/..."` plus `alt: {en, my}` | Images are pulled to `public/` at build time; `alt` passes straight through. |
| `hasDineIn: "yes" \| "no" \| "unconfirmed"` | `true \| false \| null` | See the note under `branch` below. |

Localised text (`localeString`, `localeText`) passes straight through as
`{ en, my }`. An empty Burmese box exports as `my: null`, which is exactly what
`src/content.config.ts` expects and what `npm run content:report` counts as an
outstanding translation.

### `menuItem` → `src/content/menu-items/*.json`

| Sanity field | JSON field | Notes |
| --- | --- | --- |
| `slug` | `slug` | Unique, generated from `name.en`, Latin characters only. |
| `name` | `name` | `{en, my}`. English capped at 60 characters. |
| `description` | `description` | `{en, my}`. English 20–200 characters. |
| `price` | `price` | Integer MMK, or `null`. `null` renders **"Ask in store"** — the site never invents a number. |
| `priceDisplay` | `priceDisplay` | Optional wording override ("From 12,000"). |
| `priceContext` | `priceContext` | `dine-in` / `delivery` / `same` / `unconfirmed`. |
| `category` (reference) | `category` | Exported as the category's slug. |
| `image` | `image` | `{src, alt:{en,my}}` or `null`. Alt text is required when a photo exists. |
| `imageGallery` | `imageGallery` | Max 3. |
| `pattyCount` | `pattyCount` | 1–4 or `null`. |
| `weightG` | `weightG` | Integer grams or `null`. |
| `portionNote` | `portionNote` | Max 60 characters (English). |
| `comboContents` | `comboContents` | |
| `spiceLevel` | `spiceLevel` | `none` / `mild` / `medium` / `hot` or `null`. |
| `allergens` | `allergens` | Array of strings from a fixed list. |
| `dietary` | `dietary` | `vegetarian` / `vegan` / `contains-pork` / `contains-beef` / `contains-alcohol`. |
| `tags` | `tags` | `popular` / `new` / `chef-pick` / `spicy` / `value`. |
| `modifiers` | `modifiers` | Array of modifier-group slugs. |
| `addons` | `addons` | Array of menu-item slugs. |
| `isFeatured` | `isFeatured` | |
| `isAvailable` | `isAvailable` | Default `true`. |
| `branchAvailability` | `branchAvailability` | Array of branch slugs. **Empty = every branch.** |
| `sortOrder` | `sortOrder` | |
| `status` | `status` | `draft` / `published` / `archived`. |
| `verified` | `verified` | Default `false`. The build refuses to publish unverified items. |
| `sourceNote` | `sourceNote` | Internal provenance note. |
| _(Sanity's `_updatedAt`)_ | `updatedAt` | Filled automatically on export; there is no field to type into. |

### `menuCategory` → `src/content/menu-categories/*.json`

`slug`, `name`, `description`, `displayGroup` (`food` / `drinks`), `sortOrder`,
`hasLandingPage`, `serviceHours`, `isActive` — one for one.

### `branch` → `src/content/branches/*.json`

One-for-one, with the single conversion noted above:

`hasDineIn`, `hasDelivery`, `hasTakeaway` and `servesBreakfast` are stored in
Sanity as `yes` / `no` / `unconfirmed`, and export as `true` / `false` / `null`.

They are **not** tick boxes on purpose. A tick box has two states, and an
unticked box silently means "no". If nobody has confirmed whether a branch has
seating, an unticked box would publish *"No dine-in"* to the whole internet — a
customer reads it, goes elsewhere, and a gap in our notes has become a false
statement about a real business. Defaulting to "yes" is just as bad in the other
direction. With a third state the page can stay honest and say nothing, or ask
the customer to call, until someone actually checks. All four start as
**Not confirmed yet**.

The same logic runs through the rest of the branch record: empty
`openingHours` means "hours not published yet" and the page says so; an empty
`foodpandaUrl` means that branch shows **no order button at all**, rather than a
button that leads nowhere.

`soldOutItems` exports as an array of menu-item slugs — the branch's 86 list for
today.

### `modifierGroup` → `src/content/modifier-groups/*.json`

`slug`, `name`, `type` (`single-select` / `multi-select`), `isRequired`,
`options[]` (`{label:{en,my}, priceDelta}`) — one for one.

### `siteSettings` → `src/lib/site.config.mjs`

| Sanity field | `SITE` key |
| --- | --- |
| `legalName` | `brand.legal` |
| `displayName` | `brand.display` |
| `displayNameMy` | `brand.displayMy` |
| `origin` | `origin` |
| `facebookUrl` / `instagramUrl` / `tiktokUrl` | `social.facebook` / `.instagram` / `.tiktok` |
| `numerals` | `numerals` (`western` / `myanmar`) |
| `analyticsProvider` / `analyticsDomain` / `analyticsScriptUrl` | `analytics.provider` / `.domain` / `.src` |
| `priceContextStatement` | the notice printed above the menu |

`timeZone`, `currency`, `locales` and `defaultLocale` stay in code. They are not
editable content — changing them would require template work anyway.

---

## 2. Installing and running the studio

You need Node 20 or newer.

```bash
cd sanity

# One-off: log in and create the Sanity project.
# `init` writes a package.json and its own starter sanity.config.ts.
npx sanity@latest login
npx sanity@latest init --env

# Replace the starter config with this repo's one, then fill in
# projectId / dataset (or set SANITY_STUDIO_PROJECT_ID in .env).
cp sanity.config.example.ts sanity.config.ts

# The example config also loads the Vision query tool in development
npm install @sanity/vision

npm run dev          # studio at http://localhost:3333
```

`sanity init` leaves an empty `schemaTypes/` folder behind — delete it. The real
schemas are the ones in `sanity/schemas/`, which `sanity.config.ts` imports.

To put the studio online so staff can reach it from a phone:

```bash
npx sanity@latest deploy
# -> https://lesmash.sanity.studio
```

Send staff that address, not the local one.

**Note:** running the studio never touches the website. The site is only rebuilt
by the webhook in the next section.

---

## 3. Making a publish go live (the build webhook)

The website is a set of pre-built static files — that is why it loads fast on a
patchy mobile connection. The consequence is that pressing **Publish** changes
the data immediately but does **not** change the public pages until the site is
rebuilt. A webhook does that automatically.

Set it up once:

1. **In the host** (Netlify, Vercel or Cloudflare Pages), create a *build hook*
   / *deploy hook*. You get back a URL like
   `https://api.netlify.com/build_hooks/XXXXXXXX`.
   Treat that URL as a password — anyone who has it can trigger builds.

2. **In sanity.io/manage** → this project → **API → Webhooks → Create webhook**:

   | Setting | Value |
   | --- | --- |
   | Name | `Rebuild the website` |
   | URL | the build hook URL from step 1 |
   | Dataset | `production` |
   | Trigger on | Create, Update, Delete |
   | Filter | `_type in ["menuItem","menuCategory","branch","modifierGroup","siteSettings"]` |
   | Drafts | **off** |
   | HTTP method | `POST` |
   | API version | `v2021-03-25` |

3. Leave **Drafts off**. Otherwise every keystroke inside a draft queues another
   build.

**Timing.** The build takes about one to two minutes, plus the host's queue. A
publish should be live **within five minutes**. If it is not:

- check the host's deploy log first — a failed build is the usual cause;
- then check **API → Webhooks → the webhook → Delivery log** in sanity.io/manage,
  which shows whether Sanity actually sent the request and what came back.

Publishing ten price changes queues ten builds. Publish them all, then wait once.

---

## 4. Who can edit what

Roles are set in sanity.io/manage → **Members**.

**Editor — content only.** Managers and shift supervisors. Can do everything
that is part of running the restaurant:

- add, edit and publish menu items, prices and photos
- edit branch addresses, phone numbers, opening hours and holiday hours
- mark items sold out at a branch
- write and correct Burmese translations

**Administrator — structure, SEO and settings.** The developer and the owner.
Everything an Editor can do, plus:

- Site settings (brand names, website address, social links, analytics, numerals)
- the search-listing fields on branches (`seoTitle`, `seoDescription`)
- slugs / web addresses on anything already live
- adding or removing menu sections, and changing sort orders across the site
- the studio's structure, the schemas in this folder, and the build webhook

The dividing line is blast radius: an Editor's mistake affects one item or one
branch and is visible on that page. An Admin's mistake affects every page on the
site at once.

---

## 5. For restaurant staff

*Everything below fits on one page. Print it and keep it by the till.*

You can do both of these from a phone. Open the studio address your manager gave
you (something like **lesmash.sanity.studio**) and sign in.

### A. Change a price

1. Tap **Menu items** → **All items**.
2. Tap the item. Use the search box at the top of the list if it is a long menu.
3. Find the **Price (MMK)** box. Type the new price as plain numbers —
   `13000`. No commas, no "MMK", no "Ks".
4. Tap the green **Publish** button at the bottom right.
5. Done. The new price is on the website within about five minutes.

> **If you don't know the exact price, clear the box and leave it empty.**
> The website will say *"Ask in store"*. That is correct and safe. A guessed
> price is a promise the counter has to break.

> While you are there: if the price you just typed is a delivery price rather
> than a dine-in price, set **This price applies to** to match.

### B. Mark an item sold out at your branch (today)

Do this at your own branch. It does not affect any other branch, and it does not
delete anything or change the price.

1. Tap **Branches** → your branch.
2. Tap the **Today at this branch** tab.
3. Under **Sold out today at this branch**, tap **Add item** and choose the item.
   Add as many as you need.
4. Tap **Publish**.
5. The item now shows **"Sold out today"** on the website for your branch only.

**When stock is back:** go to the same place, tap the item in that list, choose
**Remove**, and tap **Publish** again.

### Two things worth knowing

- **Sold out today** is for today. If an item is gone for good, tell your
  manager — that is a different setting (*Currently available* on the item).
- The **Burmese** box next to every English box may be left empty. Burmese
  customers will see the English text. Empty is fine; a wrong translation is not.

### If something looks wrong on the website

1. Did you tap **Publish**? An orange or grey button means it is still a draft
   and nobody can see it.
2. Has it been five minutes? The website updates on a short delay.
3. Still wrong after ten minutes — take a screenshot and send it to your manager.
   Do not edit the same thing repeatedly; that only queues more updates.
