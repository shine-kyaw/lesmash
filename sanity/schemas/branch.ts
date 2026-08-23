/**
 * branch — one physical Le SMASH shop: its address, its hours, how to reach it,
 * and what it is serving today.
 *
 * ============================================================================
 * WHY "UNCONFIRMED" IS A REAL ANSWER ON THIS FORM
 * ============================================================================
 * hasDineIn, hasDelivery, hasTakeaway and servesBreakfast are NOT simple
 * yes/no tick boxes. Each of them offers a third answer: "Not confirmed yet",
 * and that is what they start as.
 *
 * A tick box only has two states, and an empty tick box quietly means "no".
 * That is the trap. If nobody has yet told us whether the Yankin branch has
 * seating, an unticked box would publish "No dine-in" to the whole internet —
 * a customer reads it, goes somewhere else, and we have turned a gap in our
 * notes into a false statement about a real business. Equally, defaulting to
 * "yes" sends someone across Yangon to a branch that turns out to be takeaway
 * only.
 *
 * With three states the website can say the honest thing: it shows "Dine-in"
 * when we know, "Takeaway only" when we know, and simply says nothing (or
 * "please call to check") while it is unconfirmed. Nobody is misinformed by a
 * blank in our records. When someone at the branch confirms it, change the
 * answer — that is a thirty-second job, and it is the right moment to do it.
 *
 * The same principle runs through the rest of this file: an empty opening-hours
 * list means "hours not published yet" and the page says so, rather than
 * inventing 9–5. An empty Foodpanda link means the branch shows no order
 * button at all, rather than a button that goes nowhere.
 *
 * ============================================================================
 * FIELDS WHOSE PURPOSE IS NOT OBVIOUS
 * ============================================================================
 * • phone.e164   The number in international form (+959...). It is what the
 *                "Call" button dials, so it must have no spaces or dashes.
 *   phone.display The same number written the way people in Yangon read it.
 *                 That is what is printed on the page.
 *
 * • openingHours Machine-readable hours, one row per day. This drives the
 *                "Open now / Closed now" badge and the hours Google shows in
 *                search results, so the times must be exact.
 *
 * • specialHours Overrides for a specific date — Thingyan, a public holiday, a
 *                late closing. A date listed here beats the normal weekly hours.
 *
 * • soldOutItems Today's 86 list. The fast path for shift staff: tick an item
 *                here and it shows as "Sold out today" on this branch only,
 *                everywhere it appears. Clear it when stock is back.
 *
 * MIRRORS: `branches` in src/content.config.ts, field for field.
 */
import {defineType, defineField, defineArrayMember} from 'sanity'
import {slugOptions} from './slugRules'

/**
 * The three-state answer used by the service fields. Shared so all four
 * questions behave identically and nobody has to remember which is which.
 */
const CONFIRMATION_LIST = [
  {title: 'Yes', value: 'yes'},
  {title: 'No', value: 'no'},
  {title: 'Not confirmed yet', value: 'unconfirmed'},
]

const CONFIRMATION_HELP =
  'Choose "Not confirmed yet" if nobody has actually checked. That is not a failure — the website simply stays quiet about it instead of telling customers something that may be wrong.'

const DAYS = [
  {title: 'Sunday', value: 0},
  {title: 'Monday', value: 1},
  {title: 'Tuesday', value: 2},
  {title: 'Wednesday', value: 3},
  {title: 'Thursday', value: 4},
  {title: 'Friday', value: 5},
  {title: 'Saturday', value: 6},
]

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

export default defineType({
  name: 'branch',
  title: 'Branch',
  type: 'document',

  groups: [
    {name: 'basics', title: 'Name & address', default: true},
    {name: 'contact', title: 'Phone & links'},
    {name: 'hours', title: 'Opening hours'},
    {name: 'services', title: 'What this branch offers'},
    {name: 'today', title: 'Today at this branch'},
    {name: 'photos', title: 'Photos'},
    {name: 'seo', title: 'Search listing'},
  ],

  fields: [
    // ---------------------------------------------------------------- basics
    defineField({
      name: 'name',
      title: 'Branch name',
      type: 'localeString',
      group: 'basics',
      description:
        'How people refer to this shop — usually the township or the street, such as "Yankin" or "Bahan". Do not repeat "Le SMASH" here; the site adds the brand name around it.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      group: 'basics',
      description:
        'The branch page address, generated from the English name. Once the branch page is live, leave this alone — printed material and Google results point at it.',
      options: {
        source: (doc: Record<string, unknown>) =>
          ((doc?.name as {en?: string} | undefined)?.en ?? '') as string,
        ...slugOptions,
      },
      validation: (Rule) =>
        Rule.required().custom((value?: {current?: string}) =>
          value?.current && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
            ? true
            : 'Use lowercase English letters, numbers and hyphens only — for example: yankin',
        ),
    }),

    defineField({
      name: 'addressLine',
      title: 'Street address',
      type: 'localeString',
      group: 'basics',
      description:
        'Building number and street, exactly as a taxi driver would need it. Do not include the township or city — they have their own boxes below.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'township',
      title: 'Township',
      type: 'localeString',
      group: 'basics',
      description: 'For example "Yankin" / "ရန်ကင်း".',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'city',
      title: 'City',
      type: 'localeString',
      group: 'basics',
      description: 'Normally "Yangon" / "ရန်ကုန်".',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'postalCode',
      title: 'Postal code',
      type: 'string',
      group: 'basics',
      description: 'Optional. Leave empty if the branch does not use one.',
    }),

    // --------------------------------------------------------------- contact
    defineField({
      name: 'phone',
      title: 'Phone numbers',
      type: 'array',
      group: 'contact',
      description:
        'Numbers for THIS branch. If you leave this empty, the branch page shows no "Call" button at all — which is better than a button that rings the wrong shop.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'phoneNumber',
          fields: [
            defineField({
              name: 'e164',
              title: 'Number for the Call button',
              type: 'string',
              description:
                'International form, no spaces or dashes: +9591234567. This is what a phone dials when someone taps Call, so it must be exact.',
              validation: (Rule) =>
                Rule.required().custom((value?: string) =>
                  value && /^\+[1-9]\d{6,14}$/.test(value)
                    ? true
                    : 'Start with + and the country code, then digits only — for example +9591234567',
                ),
            }),
            defineField({
              name: 'display',
              title: 'Number as printed on the page',
              type: 'string',
              description:
                'The same number written the way people here read it — 09 123 4567. This is what customers see.',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {title: 'display', subtitle: 'e164'},
          },
        }),
      ],
    }),

    defineField({
      name: 'viber',
      title: 'Viber number or link',
      type: 'string',
      group: 'contact',
      description: 'Optional. Leave empty if this branch does not take Viber messages.',
    }),

    defineField({
      name: 'telegram',
      title: 'Telegram username or link',
      type: 'string',
      group: 'contact',
      description: 'Optional. Leave empty if this branch does not use Telegram.',
    }),

    defineField({
      name: 'googleMapsUrl',
      title: 'Google Maps link',
      type: 'url',
      group: 'contact',
      description:
        'Open the branch in Google Maps, press Share, and paste the link here. This is what the "Directions" button uses.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),

    defineField({
      name: 'googlePlaceId',
      title: 'Google Place ID',
      type: 'string',
      group: 'contact',
      description:
        'Technical. Your developer fills this in — it ties the branch to its Google Business listing so reviews and hours line up. Leave empty if you do not have it.',
    }),

    defineField({
      name: 'latitude',
      title: 'Latitude',
      type: 'number',
      group: 'contact',
      description:
        'Technical, from Google Maps — around 16.8 for Yangon. Used for the map pin and for the "near me" information Google reads. Leave empty rather than guessing.',
      validation: (Rule) => Rule.min(-90).max(90),
    }),

    defineField({
      name: 'longitude',
      title: 'Longitude',
      type: 'number',
      group: 'contact',
      description: 'Technical, from Google Maps — around 96.1 for Yangon. Leave empty if unsure.',
      validation: (Rule) => Rule.min(-180).max(180),
    }),

    defineField({
      name: 'foodpandaUrl',
      title: 'Foodpanda page for this branch',
      type: 'url',
      group: 'contact',
      description:
        'The link to THIS branch on Foodpanda. If it is empty, the branch page shows no ordering button at all — that is deliberate and correct for a branch that is not on Foodpanda. Never paste another branch’s link as a stand-in.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),

    // ----------------------------------------------------------------- hours
    defineField({
      name: 'openingHours',
      title: 'Normal weekly hours',
      type: 'array',
      group: 'hours',
      description:
        'One row per day the branch opens. These times drive the "Open now" badge and the hours Google shows, so they must be right. If you leave this empty, the site honestly says hours are not published yet and asks customers to call — much better than publishing a guess.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'hoursEntry',
          fields: [
            defineField({
              name: 'day',
              title: 'Day',
              type: 'number',
              options: {list: DAYS, layout: 'dropdown'},
              validation: (Rule) => Rule.required().integer().min(0).max(6),
            }),
            defineField({
              name: 'isClosed',
              title: 'Closed all day',
              type: 'boolean',
              initialValue: false,
              description: 'Tick this for a day the branch does not open at all.',
            }),
            defineField({
              name: 'open',
              title: 'Opens',
              type: 'string',
              description:
                '24-hour clock, always four digits with a colon: 07:00 for 7am, 17:30 for half past five in the afternoon.',
              validation: (Rule) =>
                Rule.custom((value: string | undefined, context) => {
                  const parent = context.parent as {isClosed?: boolean} | undefined
                  if (parent?.isClosed) return true
                  if (!value) return 'Enter an opening time, or tick "Closed all day".'
                  return TIME_PATTERN.test(value)
                    ? true
                    : 'Use the 24-hour clock like 07:00 or 17:30.'
                }),
            }),
            defineField({
              name: 'close',
              title: 'Closes',
              type: 'string',
              description: '24-hour clock, same format: 22:00 for 10pm.',
              validation: (Rule) =>
                Rule.custom((value: string | undefined, context) => {
                  const parent = context.parent as {isClosed?: boolean} | undefined
                  if (parent?.isClosed) return true
                  if (!value) return 'Enter a closing time, or tick "Closed all day".'
                  return TIME_PATTERN.test(value)
                    ? true
                    : 'Use the 24-hour clock like 22:00.'
                }),
            }),
          ],
          preview: {
            select: {day: 'day', open: 'open', close: 'close', isClosed: 'isClosed'},
            prepare({
              day,
              open,
              close,
              isClosed,
            }: {
              day?: number
              open?: string
              close?: string
              isClosed?: boolean
            }) {
              const label = DAYS.find((d) => d.value === day)?.title ?? 'Day not set'
              return {title: label, subtitle: isClosed ? 'Closed all day' : `${open ?? '??'} – ${close ?? '??'}`}
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'specialHours',
      title: 'Holidays and one-off changes',
      type: 'array',
      group: 'hours',
      description:
        'Dates where the branch does something different from its usual week — Thingyan, a public holiday, an early close for a private event. A date listed here overrides the normal hours above. Please delete rows once the date has passed so the list stays readable.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'specialHoursEntry',
          fields: [
            defineField({
              name: 'date',
              title: 'Date',
              type: 'date',
              options: {dateFormat: 'YYYY-MM-DD'},
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'isClosed',
              title: 'Closed all day',
              type: 'boolean',
              initialValue: false,
              description: 'Tick for a full-day closure. Then you can leave the times empty.',
            }),
            defineField({
              name: 'open',
              title: 'Opens (if open)',
              type: 'string',
              description: '24-hour clock, for example 10:00. Leave empty if closed all day.',
              validation: (Rule) =>
                Rule.custom((value?: string) =>
                  !value || TIME_PATTERN.test(value)
                    ? true
                    : 'Use the 24-hour clock like 10:00.',
                ),
            }),
            defineField({
              name: 'close',
              title: 'Closes (if open)',
              type: 'string',
              description: '24-hour clock, for example 16:00. Leave empty if closed all day.',
              validation: (Rule) =>
                Rule.custom((value?: string) =>
                  !value || TIME_PATTERN.test(value)
                    ? true
                    : 'Use the 24-hour clock like 16:00.',
                ),
            }),
            defineField({
              name: 'note',
              title: 'Note for customers',
              type: 'localeString',
              description:
                'Optional short reason shown next to the date — "Thingyan holiday", "Closing early for a private event".',
            }),
          ],
          preview: {
            select: {date: 'date', isClosed: 'isClosed', open: 'open', close: 'close', note: 'note.en'},
            prepare({
              date,
              isClosed,
              open,
              close,
              note,
            }: {
              date?: string
              isClosed?: boolean
              open?: string
              close?: string
              note?: string
            }) {
              const when = isClosed ? 'Closed' : `${open ?? '??'} – ${close ?? '??'}`
              return {title: date || 'No date set', subtitle: note ? `${when} · ${note}` : when}
            },
          },
        }),
      ],
    }),

    defineField({
      name: 'breakfastHoursNote',
      title: 'Breakfast times note',
      type: 'localeString',
      group: 'hours',
      description:
        'Optional line about when breakfast is served here — "Breakfast until 11:00". Leave empty if this branch does not do breakfast, or if the times are not settled.',
    }),

    // -------------------------------------------------------------- services
    // Each of these four is a three-way answer, not a tick box. See the long
    // note at the top of this file for why that matters.
    defineField({
      name: 'hasDineIn',
      title: 'Can customers eat in?',
      type: 'string',
      group: 'services',
      initialValue: 'unconfirmed',
      description: `Is there seating where customers can sit and eat? ${CONFIRMATION_HELP}`,
      options: {list: CONFIRMATION_LIST, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'hasDelivery',
      title: 'Does this branch deliver?',
      type: 'string',
      group: 'services',
      initialValue: 'unconfirmed',
      description: `Delivery through Foodpanda or the branch’s own riders. ${CONFIRMATION_HELP}`,
      options: {list: CONFIRMATION_LIST, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'hasTakeaway',
      title: 'Can customers order to take away?',
      type: 'string',
      group: 'services',
      initialValue: 'unconfirmed',
      description: `Walk in, order, and carry it out. ${CONFIRMATION_HELP}`,
      options: {list: CONFIRMATION_LIST, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'servesBreakfast',
      title: 'Does this branch serve breakfast?',
      type: 'string',
      group: 'services',
      initialValue: 'unconfirmed',
      description: `Is the breakfast menu actually available at this branch? ${CONFIRMATION_HELP}`,
      options: {list: CONFIRMATION_LIST, layout: 'radio'},
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'seatingNote',
      title: 'Note about the seating',
      type: 'localeString',
      group: 'services',
      description:
        'Optional detail that helps someone decide before travelling — "About 20 seats, air-conditioned", "Counter and a few outdoor tables".',
    }),

    defineField({
      name: 'branchNote',
      title: 'Anything else customers should know',
      type: 'localeString',
      group: 'services',
      description:
        'Optional. Parking, which floor it is on, how to find the entrance. Keep it to one useful sentence — this is not the place for marketing copy.',
    }),

    // ----------------------------------------------------------------- today
    defineField({
      name: 'soldOutItems',
      title: 'Sold out today at this branch',
      type: 'array',
      group: 'today',
      description:
        'THE FAST ONE. Add an item here and it immediately shows as "Sold out today" on this branch — everywhere it appears on the site. It does not affect any other branch and it does not change the price or delete anything. Remove it from this list when stock is back. If an item is off the menu for good, that is a different job: open the item and untick "Currently available".',
      of: [defineArrayMember({type: 'reference', to: [{type: 'menuItem'}]})],
    }),

    // ---------------------------------------------------------------- photos
    defineField({
      name: 'images',
      title: 'Branch photos',
      type: 'array',
      group: 'photos',
      description:
        'Photos of this actual shop. At least one clear outside shot is worth more than any of the others — it is what a customer matches against the street when they arrive.',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'kind',
              title: 'What the photo shows',
              type: 'string',
              description:
                'Outside = the shopfront from the street, used to help customers find the door. Inside = the seating area. Detail = a close-up of the counter, signage or food.',
              options: {
                list: [
                  {title: 'Outside (shopfront)', value: 'exterior'},
                  {title: 'Inside (seating)', value: 'interior'},
                  {title: 'Detail / close-up', value: 'detail'},
                ],
                layout: 'radio',
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'alt',
              title: 'Photo description (required)',
              type: 'localeString',
              description:
                'A few words describing what is in the picture — "Le SMASH shopfront on Yankin Road at night". Read aloud to blind customers and shown if the photo cannot load.',
              validation: (Rule) =>
                Rule.custom((alt: {en?: string} | undefined, context) => {
                  const parent = context.parent as {asset?: unknown} | undefined
                  if (!parent?.asset) return true
                  return alt?.en ? true : 'Please describe this photo in English before publishing.'
                }),
            }),
          ],
          preview: {
            select: {title: 'alt.en', subtitle: 'kind', media: 'asset'},
          },
        }),
      ],
    }),

    // ------------------------------------------------------------------- seo
    defineField({
      name: 'seoTitle',
      title: 'Title in Google results',
      type: 'localeString',
      group: 'seo',
      description:
        'Optional. The blue headline on Google for this branch page — around 60 characters, and it should contain the township. Leave empty and the site builds a sensible one automatically.',
    }),

    defineField({
      name: 'seoDescription',
      title: 'Summary in Google results',
      type: 'localeText',
      group: 'seo',
      description:
        'Optional. The two grey lines under the headline on Google — around 150 characters. Say where the branch is and what it offers. Leave empty and the site writes one from the branch details.',
    }),

    defineField({
      name: 'sortOrder',
      title: 'Position in the branch list',
      type: 'number',
      group: 'seo',
      initialValue: 0,
      description:
        'The order branches appear in on the Locations page. Lower numbers first — usually the flagship branch is 10.',
      validation: (Rule) => Rule.integer(),
    }),

    defineField({
      name: 'isPublished',
      title: 'Show this branch on the website',
      type: 'boolean',
      group: 'seo',
      initialValue: false,
      description:
        'Leave unticked while you are still filling in the address and hours. Tick it only when the details above are correct — the moment it is ticked, customers can be sent here by Google.',
    }),
  ],

  orderings: [
    {title: 'Display order', name: 'displayOrder', by: [{field: 'sortOrder', direction: 'asc'}]},
    {title: 'Name (A–Z)', name: 'nameAsc', by: [{field: 'name.en', direction: 'asc'}]},
  ],

  preview: {
    select: {
      title: 'name.en',
      township: 'township.en',
      isPublished: 'isPublished',
      hours: 'openingHours',
      soldOut: 'soldOutItems',
      dineIn: 'hasDineIn',
      media: 'images.0',
    },
    prepare({
      title,
      township,
      isPublished,
      hours,
      soldOut,
      dineIn,
      media,
    }: {
      title?: string
      township?: string
      isPublished?: boolean
      hours?: unknown[]
      soldOut?: unknown[]
      dineIn?: string
      media?: unknown
    }) {
      const flags: string[] = []
      if (!isPublished) flags.push('NOT ON THE SITE')
      if (!hours?.length) flags.push('NO HOURS PUBLISHED')
      if (dineIn === 'unconfirmed') flags.push('Dine-in unconfirmed')
      if (soldOut?.length) flags.push(`${soldOut.length} sold out today`)

      return {
        title: title || '— unnamed branch —',
        subtitle: [township, ...flags].filter(Boolean).join('  ·  '),
        media,
      }
    },
  },
})
