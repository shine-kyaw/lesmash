/**
 * localeString — one short piece of text, held in both site languages.
 *
 * WHY THIS EXISTS AS ITS OWN TYPE
 * The website is published twice: once in English and once in Burmese. Rather
 * than keeping two separate documents that can silently drift apart, every
 * piece of text on the site is stored once, with an English box and a Burmese
 * box side by side. An editor always sees both languages at the same moment,
 * so it is obvious when one of them is missing.
 *
 * "NOT TRANSLATED YET" IS A REAL, ALLOWED STATE
 * The Burmese box may be left empty. Empty does NOT mean "broken" — it means
 * "no Burmese written yet", and the website will show the English text to
 * Burmese readers instead of showing a blank space. Nothing is ever
 * machine-translated on the way to the site. Leaving it empty is always safer
 * than guessing.
 *
 * MIRRORS: the `{ en, my }` pair in src/content.config.ts (`localised`).
 * A missing localeString object on the site side reads as `null`.
 */
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'localeString',
  title: 'Text (English + Burmese)',
  type: 'object',

  // Renders the two language boxes next to each other rather than stacked, so
  // an editor can compare them without scrolling. Required by the PRD: both
  // locales must be visible at once.
  options: {columns: 2},

  fieldsets: [
    {
      name: 'languages',
      title: 'Both languages',
      options: {columns: 2},
    },
  ],

  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      fieldset: 'languages',
      description:
        'The English wording customers will read. This one is required — if the English is empty the item cannot go live.',
      validation: (Rule) =>
        Rule.required().error('English text is required. Burmese can be added later.'),
    }),
    defineField({
      name: 'my',
      title: 'မြန်မာ / Burmese',
      type: 'string',
      fieldset: 'languages',
      description:
        'Optional. Leave empty if the Burmese wording is not ready — the site will show the English instead. Please type in Myanmar Unicode (not Zawgyi).',
    }),
  ],

  preview: {
    select: {title: 'en', subtitle: 'my'},
    prepare({title, subtitle}: {title?: string; subtitle?: string}) {
      return {
        title: title || '— no English text yet —',
        subtitle: subtitle || 'Burmese not written yet (English will be shown)',
      }
    },
  },
})
