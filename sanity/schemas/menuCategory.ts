/**
 * menuCategory — a section of the menu: Burgers, Sides, Coffee, Smoothies.
 *
 * FIELDS WHOSE PURPOSE IS NOT OBVIOUS
 *
 * • displayGroup
 *   The menu page has two big navigation anchors, "Food" and "Drinks". This
 *   field says which of the two a section sits under. It lets Non-Coffee,
 *   Smoothies and Milkshakes all appear beneath one "Drinks" heading while
 *   still being separate, separately-orderable sections underneath.
 *
 * • hasLandingPage
 *   Most sections are just a block on the main menu page. Tick this and the
 *   section also gets a page of its own (for example /menu/burgers) that can be
 *   linked from an ad or a Facebook post. Only worth it for sections people
 *   actually search for — a page with four items on it looks thin to both
 *   customers and Google.
 *
 * • serviceHours
 *   For sections only sold at certain times, such as breakfast. Written as
 *   words the customer reads, not as machine-readable hours.
 *
 * MIRRORS: `menuCategories` in src/content.config.ts, field for field.
 */
import {defineType, defineField} from 'sanity'
import {slugOptions} from './slugRules'

export default defineType({
  name: 'menuCategory',
  title: 'Menu section',
  type: 'document',

  fields: [
    defineField({
      name: 'name',
      title: 'Section name',
      type: 'localeString',
      description:
        'The heading customers see above this group of items — "Burgers", "Sides", "Coffee".',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      description:
        'Created from the English name. It becomes part of the link to this section, so once it is live please leave it alone — changing it breaks existing links.',
      options: {
        source: (doc: Record<string, unknown>) =>
          ((doc?.name as {en?: string} | undefined)?.en ?? '') as string,
        ...slugOptions,
      },
      validation: (Rule) =>
        Rule.required().custom((value?: {current?: string}) =>
          value?.current && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.current)
            ? true
            : 'Use lowercase English letters, numbers and hyphens only — for example: cold-drinks',
        ),
    }),

    defineField({
      name: 'description',
      title: 'Section description',
      type: 'localeText',
      description:
        'Optional. One or two sentences shown under the section heading — useful for explaining something a customer might not guess, like what makes the smash technique different. Leave empty if there is nothing worth saying; an empty section reads better than filler.',
    }),

    defineField({
      name: 'displayGroup',
      title: 'Appears under',
      type: 'string',
      description:
        'Whether this section is grouped with the food or with the drinks on the menu page.',
      options: {
        list: [
          {title: 'Food', value: 'food'},
          {title: 'Drinks', value: 'drinks'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required().error('Choose Food or Drinks.'),
    }),

    defineField({
      name: 'sortOrder',
      title: 'Position on the menu',
      type: 'number',
      initialValue: 0,
      description:
        'The order the sections appear in. Lower numbers come first — put Burgers before Sides. Use 10, 20, 30 so you can slide a new section in between later.',
      validation: (Rule) => Rule.required().integer(),
    }),

    defineField({
      name: 'hasLandingPage',
      title: 'Give this section its own page',
      type: 'boolean',
      initialValue: false,
      description:
        'Ticked sections get a separate page you can link to in ads and posts. Only worth ticking for sections with a decent number of items that people search for by name, such as Burgers or Breakfast.',
    }),

    defineField({
      name: 'serviceHours',
      title: 'Only served at these times',
      type: 'localeString',
      description:
        'Optional, written for the customer to read — "Served 7:00–11:00 every day". Use it for breakfast or any section that is not available all day. Leave empty if the section is sold whenever the branch is open.',
    }),

    defineField({
      name: 'isActive',
      title: 'Show this section',
      type: 'boolean',
      initialValue: true,
      description:
        'Untick to hide the whole section from the website without deleting it or its items — handy for a seasonal range that will come back.',
    }),
  ],

  orderings: [
    {
      title: 'Menu order',
      name: 'menuOrder',
      by: [
        {field: 'displayGroup', direction: 'asc'},
        {field: 'sortOrder', direction: 'asc'},
      ],
    },
  ],

  preview: {
    select: {
      title: 'name.en',
      titleMy: 'name.my',
      group: 'displayGroup',
      order: 'sortOrder',
      isActive: 'isActive',
    },
    prepare({
      title,
      titleMy,
      group,
      order,
      isActive,
    }: {
      title?: string
      titleMy?: string
      group?: string
      order?: number
      isActive?: boolean
    }) {
      const flags: string[] = [group === 'drinks' ? 'Drinks' : 'Food', `position ${order ?? 0}`]
      if (isActive === false) flags.push('HIDDEN from the site')
      if (!titleMy) flags.push('No Burmese')
      return {
        title: title || '— untitled section —',
        subtitle: flags.join('  ·  '),
      }
    },
  },
})
