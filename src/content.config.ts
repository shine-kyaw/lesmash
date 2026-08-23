import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Content collections mirror the CMS data model in PRD §13 and §14 one-for-one.
 *
 * Localised strings are stored as a `{ en, my }` pair. That is the storage form
 * of the PRD's `nameEn` / `nameMy` field pairs — keeping them in one object is
 * what makes the missing-translation report (LANG-08) possible, and stops a
 * value from being duplicated per locale and silently diverging (PRD §16.4).
 *
 * `my: null` is a legitimate, expected state: it means "not translated yet",
 * renders the English fallback, and is picked up by `npm run content:report`.
 */
const localised = z.object({ en: z.string(), my: z.string().nullable().default(null) });
const localisedOptional = z
  .object({ en: z.string().nullable().default(null), my: z.string().nullable().default(null) })
  .nullable()
  .default(null);

const hoursEntry = z.object({
  day: z.number().int().min(0).max(6),
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
  isClosed: z.boolean().default(false),
});

const branches = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/branches' }),
  schema: z.object({
    slug: z.string(),
    name: localised,
    addressLine: localised,
    township: localised,
    city: localised,
    postalCode: z.string().nullable().default(null),

    // DS-02 — E.164 for tel:, plus the display form. Empty array = no call CTA.
    phone: z
      .array(z.object({ e164: z.string(), display: z.string() }))
      .default([]),
    viber: z.string().nullable().default(null),
    telegram: z.string().nullable().default(null),

    // DS-09 — drives the canonical Directions URL and Restaurant schema geo.
    latitude: z.number().nullable().default(null),
    longitude: z.number().nullable().default(null),
    googlePlaceId: z.string().nullable().default(null),
    googleMapsUrl: z.string().url().nullable().default(null),

    // DS-07 — empty means this branch renders no Order CTA at all (PRD §14.1).
    foodpandaUrl: z.string().url().nullable().default(null),

    // DS-01 — empty array means hours are unconfirmed; the UI says so.
    openingHours: z.array(hoursEntry).default([]),
    specialHours: z
      .array(
        z.object({
          date: z.string(),
          isClosed: z.boolean().default(false),
          open: z.string().nullable().default(null),
          close: z.string().nullable().default(null),
          note: localisedOptional,
        })
      )
      .default([]),
    breakfastHoursNote: localisedOptional,

    // Q4 — Yankin dine-in status unconfirmed. `null` = unknown, and the page
    // says "unconfirmed" rather than claiming either way (PRD R-08).
    hasDineIn: z.boolean().nullable().default(null),
    hasDelivery: z.boolean().nullable().default(null),
    hasTakeaway: z.boolean().nullable().default(null),
    servesBreakfast: z.boolean().nullable().default(null),

    seatingNote: localisedOptional,
    branchNote: localisedOptional,

    soldOutItems: z.array(z.string()).default([]),

    images: z
      .array(
        z.object({
          src: z.string().nullable().default(null),
          kind: z.enum(['exterior', 'interior', 'detail']),
          alt: localisedOptional,
        })
      )
      .default([]),

    seoTitle: localisedOptional,
    seoDescription: localisedOptional,

    sortOrder: z.number().int().default(0),
    isPublished: z.boolean().default(false),
  }),
});

const menuCategories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/menu-categories' }),
  schema: z.object({
    slug: z.string(),
    name: localised,
    description: localisedOptional,
    // Groups Non Coffee + Smoothies + Milkshake under one "Drinks" anchor
    // without merging the underlying categories (PRD §13.3).
    displayGroup: z.enum(['food', 'drinks']),
    sortOrder: z.number().int(),
    hasLandingPage: z.boolean().default(false),
    serviceHours: localisedOptional,
    isActive: z.boolean().default(true),
  }),
});

const menuItems = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/menu-items' }),
  schema: z.object({
    slug: z.string(),
    name: localised,
    description: localisedOptional,

    // DS-04 — integer MMK. `null` renders an explicit "ask in store" state,
    // never a fabricated number (MENU-02).
    price: z.number().int().min(0).nullable().default(null),
    priceDisplay: localisedOptional,
    // Which channel the published price applies to. 'unconfirmed' until Q5 is
    // answered — the menu page states this plainly (MENU-13).
    priceContext: z.enum(['dine-in', 'delivery', 'same', 'unconfirmed']).default('unconfirmed'),

    category: reference('menuCategories'),

    image: z
      .object({ src: z.string(), alt: localised })
      .nullable()
      .default(null),
    imageGallery: z
      .array(z.object({ src: z.string(), alt: localised }))
      .max(3)
      .default([]),

    // Core to the expectation-management principle (PRD F1, MENU-03/04).
    pattyCount: z.number().int().min(1).max(4).nullable().default(null),
    weightG: z.number().int().nullable().default(null),
    portionNote: localisedOptional,
    comboContents: localisedOptional,

    spiceLevel: z.enum(['none', 'mild', 'medium', 'hot']).nullable().default(null),
    // Only ever populated from written client confirmation (PRD §17.1, R-20).
    allergens: z.array(z.string()).default([]),
    dietary: z
      .array(
        z.enum(['vegetarian', 'vegan', 'contains-pork', 'contains-beef', 'contains-alcohol'])
      )
      .default([]),
    tags: z.array(z.enum(['popular', 'new', 'chef-pick', 'spicy', 'value'])).default([]),

    modifiers: z.array(reference('modifierGroups')).default([]),
    addons: z.array(reference('menuItems')).default([]),

    isFeatured: z.boolean().default(false),
    isAvailable: z.boolean().default(true),
    // Empty = available at all branches (PRD §13.5).
    branchAvailability: z.array(z.string()).default([]),

    sortOrder: z.number().int().default(0),
    status: z.enum(['draft', 'published', 'archived']).default('draft'),
    updatedAt: z.string().nullable().default(null),

    /**
     * Provenance. `false` means the record exists so the template can be built
     * and reviewed, but its values are NOT client-confirmed and it must never
     * be published. The build refuses to publish unverified items unless
     * PUBLISH_UNVERIFIED=1 is set (see src/lib/menu.ts).
     */
    verified: z.boolean().default(false),
    sourceNote: z.string().nullable().default(null),
  }),
});

const modifierGroups = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/modifier-groups' }),
  schema: z.object({
    slug: z.string(),
    name: localised,
    type: z.enum(['single-select', 'multi-select']),
    isRequired: z.boolean().default(false),
    options: z.array(
      z.object({ label: localised, priceDelta: z.number().int().nullable().default(null) })
    ),
  }),
});

export const collections = { branches, menuCategories, menuItems, modifierGroups };
