/**
 * modifierGroup — a set of choices that can be attached to menu items:
 * "Choose your sauce", "Add extra cheese", "Pick a side".
 *
 * WHY THIS IS A SEPARATE RECORD RATHER THAN FIELDS ON EACH ITEM
 * The same set of choices usually applies to many items. Building it once here
 * and attaching it to items means that when the price of extra cheese changes,
 * you change it in ONE place and every burger updates. Typing the options into
 * each item separately guarantees they will eventually disagree with each other.
 *
 * FIELDS WHOSE PURPOSE IS NOT OBVIOUS
 *
 * • type
 *   "Pick one" means the customer chooses exactly one option (a sauce).
 *   "Pick any" means they can choose several (extra cheese AND bacon).
 *
 * • priceDelta
 *   The EXTRA cost of that option, not the total price of the item. 0 or empty
 *   means the option costs nothing extra. A negative number is allowed for a
 *   discount, for example a smaller portion.
 *
 * MIRRORS: `modifierGroups` in src/content.config.ts, field for field.
 */
import {defineType, defineField, defineArrayMember} from 'sanity'
import {slugOptions} from './slugRules'

export default defineType({
  name: 'modifierGroup',
  title: 'Options group',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      title: 'Question shown to the customer',
      type: 'localeString',
      description:
        'Word it as the question the counter would ask — "Choose your sauce", "Add extras". This is the heading above the list of choices.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Reference name',
      type: 'slug',
      description:
        'A short internal name generated from the English above, used to keep these groups apart. Customers never see it.',
      options: {
        source: (doc: Record<string, unknown>) =>
          ((doc?.name as {en?: string} | undefined)?.en ?? '') as string,
        ...slugOptions,
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'type',
      title: 'How many can be chosen',
      type: 'string',
      description:
        'Pick one = the customer chooses a single option, such as one sauce. Pick any = they can choose several, such as extra toppings.',
      options: {
        list: [
          {title: 'Pick one', value: 'single-select'},
          {title: 'Pick any number', value: 'multi-select'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Choose whether it is one option or several.'),
    }),

    defineField({
      name: 'isRequired',
      title: 'The customer must choose',
      type: 'boolean',
      initialValue: false,
      description:
        'Tick when an order cannot be completed without a choice here — for example, a burger that must have a bun type selected. Leave unticked for genuine extras.',
    }),

    defineField({
      name: 'options',
      title: 'The choices',
      type: 'array',
      description:
        'Every option a customer can pick, with what it adds to the price. Drag to reorder — they appear in this order on the site.',
      validation: (Rule) => Rule.min(1).error('An options group needs at least one choice in it.'),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'modifierOption',
          title: 'Choice',
          fields: [
            defineField({
              name: 'label',
              title: 'Choice name',
              type: 'localeString',
              description: 'What this choice is called — "Extra cheese", "No pickles", "Spicy mayo".',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'priceDelta',
              title: 'Adds to the price (MMK)',
              type: 'number',
              description:
                'How much EXTRA this choice costs, in whole kyat. Leave empty or type 0 when it is free. A negative number reduces the price, for example -500 for a smaller portion.',
              validation: (Rule) => Rule.integer(),
            }),
          ],
          preview: {
            select: {title: 'label.en', delta: 'priceDelta'},
            prepare({title, delta}: {title?: string; delta?: number}) {
              const money =
                typeof delta === 'number' && delta !== 0
                  ? `${delta > 0 ? '+' : '−'}${new Intl.NumberFormat('en-US').format(Math.abs(delta))} MMK`
                  : 'no extra charge'
              return {title: title || '— unnamed choice —', subtitle: money}
            },
          },
        }),
      ],
    }),
  ],

  preview: {
    select: {title: 'name.en', type: 'type', required: 'isRequired', options: 'options'},
    prepare({
      title,
      type,
      required,
      options,
    }: {
      title?: string
      type?: string
      required?: boolean
      options?: unknown[]
    }) {
      const parts = [
        type === 'multi-select' ? 'Pick any' : 'Pick one',
        `${options?.length ?? 0} choices`,
      ]
      if (required) parts.push('Must choose')
      return {title: title || '— unnamed options group —', subtitle: parts.join('  ·  ')}
    },
  },
})
