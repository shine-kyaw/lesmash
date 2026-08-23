/**
 * menuItem — one thing a customer can order: a burger, a side, a drink, a combo.
 *
 * THE ONE RULE THAT SHAPES THIS WHOLE SCHEMA
 * The website never invents information. If a price has not been confirmed, the
 * page says "Ask in store" — it does not print a plausible-looking number. If a
 * photo is missing, the page says "Photograph coming soon" — it does not borrow
 * a stock image of someone else's burger. Several fields below exist purely to
 * make "we don't know yet" a first-class, publishable answer.
 *
 * FIELDS WHOSE PURPOSE IS NOT OBVIOUS
 *
 * • price vs priceDisplay
 *   `price` is a plain number used for sorting, filtering and the structured
 *   data Google reads. `priceDisplay` is an optional override for the words
 *   printed on the page — "From 12,000", "Market price". If both are filled in,
 *   the customer sees priceDisplay and Google still gets the number.
 *
 * • priceContext
 *   Delivery prices are often higher than dine-in prices. Until we know which
 *   one a given price refers to, this stays "unconfirmed" and the menu page
 *   prints an honest note about it, rather than letting a customer arrive
 *   expecting the delivery price.
 *
 * • verified
 *   Provenance flag. `false` means the record was created so the page could be
 *   built and reviewed, but its contents are NOT confirmed by the restaurant.
 *   The site build refuses to publish unverified items. Ticking this box is a
 *   statement that a human checked these details against the real menu.
 *
 * • branchAvailability
 *   EMPTY means "available at every branch". Only add branches here when the
 *   item is genuinely limited to some of them. This is a permanent limitation,
 *   not today's sold-out list — for sold out, see `soldOutItems` on the branch.
 *
 * • addons
 *   Other menu items that can be added to this one at the counter (an extra
 *   patty, a drink upgrade). They are references so a price change happens in
 *   one place only.
 *
 * MIRRORS: `menuItems` in src/content.config.ts, field for field.
 */
import {defineType, defineField, defineArrayMember} from 'sanity'
import {slugOptions} from './slugRules'

/**
 * Fixed allergen list. Kept short and specific to what this kitchen actually
 * uses. IMPORTANT: only tick a box here when the restaurant has confirmed it in
 * writing. An allergen list is a safety claim, and a wrong one is worse than no
 * list at all — the site shows no allergen row when this is empty.
 */
const ALLERGENS = [
  {title: 'Gluten / wheat', value: 'gluten'},
  {title: 'Dairy / milk', value: 'dairy'},
  {title: 'Egg', value: 'egg'},
  {title: 'Soy', value: 'soy'},
  {title: 'Peanut', value: 'peanut'},
  {title: 'Tree nuts', value: 'tree-nut'},
  {title: 'Sesame', value: 'sesame'},
  {title: 'Fish', value: 'fish'},
  {title: 'Shellfish', value: 'shellfish'},
  {title: 'Mustard', value: 'mustard'},
]

export default defineType({
  name: 'menuItem',
  title: 'Menu item',
  type: 'document',

  groups: [
    {name: 'basics', title: 'Name & price', default: true},
    {name: 'photos', title: 'Photos'},
    {name: 'detail', title: 'Portion & ingredients'},
    {name: 'options', title: 'Options & add-ons'},
    {name: 'publishing', title: 'Where it shows'},
  ],

  fields: [
    // ---------------------------------------------------------------- basics
    defineField({
      name: 'name',
      title: 'Item name',
      type: 'localeString',
      group: 'basics',
      description:
        'What this item is called on the menu board. Keep the English under 60 characters so it fits on a phone screen without wrapping onto three lines.',
      validation: (Rule) => [
        Rule.required(),
        Rule.custom((value?: {en?: string}) =>
          value?.en && value.en.length > 60
            ? 'The English name is too long for a phone screen — please keep it to 60 characters or fewer.'
            : true,
        ),
      ],
    }),

    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'basics',
      description:
        'The item’s permanent address on the website. Press "Generate" and it is created from the English name. Once the item is live, do NOT change this — every shared link, Facebook post and QR code pointing at the old address would stop working. Ask your developer first.',
      options: {
        source: (doc: Record<string, unknown>) =>
          ((doc?.name as {en?: string} | undefined)?.en ?? '') as string,
        ...slugOptions,
      },
      validation: (Rule) =>
        Rule.required().custom((value?: {current?: string}) => {
          const v = value?.current
          if (!v) return 'Press "Generate" to create the web address.'
          return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v)
            ? true
            : 'Use lowercase English letters, numbers and hyphens only — for example: smash-classic-double'
        }),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'localeText',
      group: 'basics',
      description:
        'Tell the customer what is actually IN it — "Two beef patties, melted cheddar, pickles, house sauce, toasted brioche bun." List the ingredients rather than praising the food: skip words like "delicious", "amazing", "mouth-watering". Customers decide from ingredients, and ingredient wording is also what people search for. English between 20 and 200 characters.',
      validation: (Rule) =>
        Rule.custom((value?: {en?: string}) => {
          const en = value?.en
          if (!en) return true // the description itself is optional; if written, it must be usable
          if (en.length < 20) return 'Too short to be useful — please name at least the main ingredients.'
          if (en.length > 200)
            return 'Too long for a menu card — please trim to 200 characters or fewer.'
          return true
        }),
    }),

    defineField({
      name: 'price',
      title: 'Price (MMK)',
      type: 'number',
      group: 'basics',
      description:
        'Whole kyat only, no commas and no "MMK" — type 12000, not 12,000 MMK. LEAVE THIS EMPTY if the price is not confirmed. An empty price is fine: the website prints "Ask in store" instead. Never type an approximate price to fill the gap — a wrong price on a website is a promise the counter has to break.',
      validation: (Rule) =>
        Rule.integer()
          .min(0)
          .warning(
            'Prices are whole kyat. If you are unsure of the exact figure, leave the field empty rather than rounding.',
          ),
    }),

    defineField({
      name: 'priceDisplay',
      title: 'Price wording (override)',
      type: 'localeString',
      group: 'basics',
      description:
        'Only fill this in when a single number is misleading — "From 12,000", "Market price", "2 for 20,000". Whatever you type here is printed on the page exactly as written, in place of the number above. Leave empty in the normal case.',
    }),

    defineField({
      name: 'priceContext',
      title: 'This price applies to',
      type: 'string',
      group: 'basics',
      initialValue: 'unconfirmed',
      description:
        'Delivery prices are often higher than dine-in prices. Tell customers which one the price above refers to. If nobody has confirmed it, leave it as "Not confirmed yet" — the menu page then shows an honest note instead of implying the price covers both.',
      options: {
        list: [
          {title: 'Dine-in price', value: 'dine-in'},
          {title: 'Delivery price', value: 'delivery'},
          {title: 'Same for dine-in and delivery', value: 'same'},
          {title: 'Not confirmed yet', value: 'unconfirmed'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'category',
      title: 'Menu section',
      type: 'reference',
      group: 'basics',
      to: [{type: 'menuCategory'}],
      description:
        'Which part of the menu this belongs under — Burgers, Sides, Coffee, and so on. Every item needs one; it decides where the item appears on the menu page.',
      validation: (Rule) => Rule.required().error('Pick the menu section this item belongs to.'),
    }),

    // ---------------------------------------------------------------- photos
    defineField({
      name: 'image',
      title: 'Main photo',
      type: 'image',
      group: 'photos',
      options: {hotspot: true},
      description:
        'One clear photo of the real item as it is served. No photo is better than a stock photo of someone else’s burger — if there is no photo yet, the page politely says "Photograph coming soon". After uploading, drag the circle to the part that must stay visible when the picture is cropped on a phone.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Photo description (required)',
          type: 'localeString',
          description:
            'Describe the photo in a few words — "Double smash burger with melted cheese and pickles". This is read aloud to blind customers and shown if the image fails to load on a slow connection. It is required whenever there is a photo.',
          validation: (Rule) =>
            Rule.custom((alt: {en?: string} | undefined, context) => {
              const parent = context.parent as {asset?: unknown} | undefined
              if (!parent?.asset) return true // no photo uploaded yet, nothing to describe
              return alt?.en ? true : 'Please describe this photo in English before publishing.'
            }),
        }),
      ],
    }),

    defineField({
      name: 'imageGallery',
      title: 'Extra photos',
      type: 'array',
      group: 'photos',
      description:
        'Up to three more photos of the same item — a different angle, the combo laid out, a close-up. Optional. Keep the best one as the main photo above.',
      validation: (Rule) => Rule.max(3).error('Three extra photos is the maximum.'),
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Photo description (required)',
              type: 'localeString',
              description:
                'A few words describing this photo, read aloud to blind customers and shown if the image cannot load.',
              validation: (Rule) =>
                Rule.custom((alt: {en?: string} | undefined, context) => {
                  const parent = context.parent as {asset?: unknown} | undefined
                  if (!parent?.asset) return true
                  return alt?.en ? true : 'Please describe this photo in English before publishing.'
                }),
            }),
          ],
        }),
      ],
    }),

    // ---------------------------------------------------------------- detail
    defineField({
      name: 'pattyCount',
      title: 'Number of patties',
      type: 'number',
      group: 'detail',
      description:
        'Burgers only. How many patties are in it — 1, 2, 3 or 4. This is the single most common question customers ask before ordering, so fill it in whenever you know it. Leave empty for anything that is not a burger.',
      validation: (Rule) =>
        Rule.integer().min(1).max(4).warning('Patty count should be a whole number from 1 to 4.'),
    }),

    defineField({
      name: 'weightG',
      title: 'Weight (grams)',
      type: 'number',
      group: 'detail',
      description:
        'Cooked or raw patty weight in grams, if the kitchen measures it. Optional — leave empty rather than estimating. Type just the number: 90, not 90g.',
      validation: (Rule) => Rule.integer().min(0),
    }),

    defineField({
      name: 'portionNote',
      title: 'Portion note',
      type: 'localeString',
      group: 'detail',
      description:
        'A short line that sets expectations about size — "Small, one-handed", "Sharing size", "Comes with fries". Maximum 60 characters in English so it fits on one line.',
      validation: (Rule) =>
        Rule.custom((value?: {en?: string}) =>
          value?.en && value.en.length > 60
            ? 'Please keep the portion note to 60 characters or fewer so it fits on one line.'
            : true,
        ),
    }),

    defineField({
      name: 'comboContents',
      title: 'What the combo includes',
      type: 'localeText',
      group: 'detail',
      description:
        'Combos and sets only. Spell out everything in the box — "Burger, regular fries, and one soft drink of your choice." Customers complain when a combo turns out to contain less than they pictured, and this line prevents that.',
    }),

    defineField({
      name: 'spiceLevel',
      title: 'Spice level',
      type: 'string',
      group: 'detail',
      description:
        'How hot it is. Leave empty if nobody has decided — the site simply shows no spice row rather than claiming it is mild.',
      options: {
        list: [
          {title: 'Not spicy', value: 'none'},
          {title: 'Mild', value: 'mild'},
          {title: 'Medium', value: 'medium'},
          {title: 'Hot', value: 'hot'},
        ],
        layout: 'radio',
      },
    }),

    defineField({
      name: 'allergens',
      title: 'Allergens',
      type: 'array',
      group: 'detail',
      description:
        'Only tick a box here if the kitchen has CONFIRMED it. An allergen list is a safety promise — a half-remembered one is more dangerous than none, and the website shows no allergen row at all when this is empty. If in doubt, leave everything unticked and let the customer ask at the counter.',
      of: [defineArrayMember({type: 'string'})],
      options: {list: ALLERGENS},
    }),

    defineField({
      name: 'dietary',
      title: 'Dietary information',
      type: 'array',
      group: 'detail',
      description:
        'Helps customers who avoid pork, beef or alcohol, and customers eating vegetarian or vegan. Tick everything that applies. Same rule as allergens: only tick what you know for certain.',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: 'Vegetarian', value: 'vegetarian'},
          {title: 'Vegan', value: 'vegan'},
          {title: 'Contains pork', value: 'contains-pork'},
          {title: 'Contains beef', value: 'contains-beef'},
          {title: 'Contains alcohol', value: 'contains-alcohol'},
        ],
      },
    }),

    defineField({
      name: 'tags',
      title: 'Badges',
      type: 'array',
      group: 'detail',
      description:
        'Small labels shown next to the item. Use them sparingly — if half the menu is marked "Popular", the badge stops meaning anything. Two per item is plenty.',
      of: [defineArrayMember({type: 'string'})],
      options: {
        list: [
          {title: 'Popular', value: 'popular'},
          {title: 'New', value: 'new'},
          {title: "Chef's pick", value: 'chef-pick'},
          {title: 'Spicy', value: 'spicy'},
          {title: 'Good value', value: 'value'},
        ],
      },
    }),

    // --------------------------------------------------------------- options
    defineField({
      name: 'modifiers',
      title: 'Choices the customer makes',
      type: 'array',
      group: 'options',
      description:
        'Sets of choices attached to this item — "Choose your sauce", "Add cheese". These are built once under Modifier groups and reused across items, so changing a price there updates every item at once.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'modifierGroup'}]})],
    }),

    defineField({
      name: 'addons',
      title: 'Suggested add-ons',
      type: 'array',
      group: 'options',
      description:
        'Other items from the menu that go well with this one, or can be added to it — an extra patty, fries, a drink. Pick existing menu items rather than typing them again, so their prices stay correct automatically.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'menuItem'}]})],
    }),

    // ------------------------------------------------------------ publishing
    defineField({
      name: 'isFeatured',
      title: 'Show on the homepage',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
      description:
        'Ticked items appear in the highlights on the front page. Keep this to a small handful — six or so — or the homepage turns into a second menu.',
    }),

    defineField({
      name: 'isAvailable',
      title: 'Currently available',
      type: 'boolean',
      group: 'publishing',
      initialValue: true,
      description:
        'Untick when the item is off the menu everywhere for a while — an ingredient is unavailable, or it is a seasonal special that has ended. The item stays on the site marked "Currently unavailable". For "sold out just at one branch today", do not use this: open that branch and use its Sold out today list instead.',
    }),

    defineField({
      name: 'branchAvailability',
      title: 'Only at these branches',
      type: 'array',
      group: 'publishing',
      description:
        'LEAVE THIS EMPTY if the item is sold at every branch — that is the normal case. Only add branches when the item is permanently limited to some of them. This is not today’s sold-out list.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'branch'}]})],
    }),

    defineField({
      name: 'sortOrder',
      title: 'Position in its section',
      type: 'number',
      group: 'publishing',
      initialValue: 0,
      description:
        'Controls the order items appear within their menu section. Lower numbers come first: 10, 20, 30. Leaving gaps between the numbers means you can slot a new item in later without renumbering everything.',
      validation: (Rule) => Rule.integer(),
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'publishing',
      initialValue: 'draft',
      description:
        'Draft = still being written, invisible to customers. Published = live on the website. Archived = taken off the menu but kept on file in case it returns.',
      options: {
        list: [
          {title: 'Draft (not on the website)', value: 'draft'},
          {title: 'Published (live)', value: 'published'},
          {title: 'Archived (retired)', value: 'archived'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'verified',
      title: 'Details checked against the real menu',
      type: 'boolean',
      group: 'publishing',
      initialValue: false,
      description:
        'Tick this only after a person has compared the name, price and ingredients above against the actual menu. Until it is ticked, the website build treats this item as unconfirmed and will not publish it. It is the safety catch that keeps a placeholder from reaching customers.',
    }),

    defineField({
      name: 'sourceNote',
      title: 'Where these details came from (internal)',
      type: 'string',
      group: 'publishing',
      description:
        'Internal note, never shown to customers — "from the printed menu photo, 12 Aug", "confirmed by Ko Aung on the phone". It is how the next person knows whether to trust this record.',
    }),
  ],

  orderings: [
    {
      title: 'Menu order',
      name: 'menuOrder',
      by: [
        {field: 'sortOrder', direction: 'asc'},
        {field: 'name.en', direction: 'asc'},
      ],
    },
    {title: 'Name (A–Z)', name: 'nameAsc', by: [{field: 'name.en', direction: 'asc'}]},
    {
      title: 'Needs attention first',
      name: 'needsAttention',
      by: [
        {field: 'verified', direction: 'asc'},
        {field: 'price', direction: 'asc'},
      ],
    },
  ],

  /**
   * The list preview is where problems are meant to become obvious without
   * opening anything. The subtitle deliberately SHOUTS about a missing price
   * and an unchecked record, because those are the two states that must never
   * quietly reach a customer.
   */
  preview: {
    select: {
      title: 'name.en',
      titleMy: 'name.my',
      price: 'price',
      priceDisplay: 'priceDisplay.en',
      verified: 'verified',
      status: 'status',
      isAvailable: 'isAvailable',
      media: 'image',
    },
    prepare({
      title,
      titleMy,
      price,
      priceDisplay,
      verified,
      status,
      isAvailable,
      media,
    }: {
      title?: string
      titleMy?: string
      price?: number
      priceDisplay?: string
      verified?: boolean
      status?: string
      isAvailable?: boolean
      media?: unknown
    }) {
      const money =
        typeof price === 'number'
          ? `${new Intl.NumberFormat('en-US').format(price)} MMK`
          : priceDisplay
            ? `${priceDisplay} (wording only, no number)`
            : 'NO PRICE — page shows "Ask in store"'

      const flags: string[] = []
      if (!verified) flags.push('NOT CHECKED')
      if (status === 'draft') flags.push('Draft')
      if (status === 'archived') flags.push('Archived')
      if (isAvailable === false) flags.push('Unavailable')
      if (!titleMy) flags.push('No Burmese')

      return {
        title: title || '— untitled item —',
        subtitle: [money, ...flags].join('  ·  '),
        media,
      }
    },
  },
})
