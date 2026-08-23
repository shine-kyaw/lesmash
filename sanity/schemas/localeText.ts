/**
 * localeText — the same idea as `localeString`, but for longer writing:
 * item descriptions, the combo contents line, SEO descriptions, notes.
 *
 * Use `localeString` for anything that is a name, a label, or a single line.
 * Use `localeText` when the editor will realistically write a sentence or two.
 *
 * Same rule as localeString: English is required, Burmese may be left empty
 * and the site falls back to English rather than showing a blank.
 *
 * MIRRORS: the `{ en, my }` pair in src/content.config.ts. Plain text only —
 * there is deliberately no rich text here. The site renders these as single
 * paragraphs, so bold/italic/links would either be stripped or break the
 * layout.
 */
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'localeText',
  title: 'Long text (English + Burmese)',
  type: 'object',

  // Side-by-side, so a translator can read the English while writing Burmese.
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
      type: 'text',
      rows: 4,
      fieldset: 'languages',
      description:
        'The English wording customers will read. Required — if this is empty the content cannot go live.',
      validation: (Rule) =>
        Rule.required().error('English text is required. Burmese can be added later.'),
    }),
    defineField({
      name: 'my',
      title: 'မြန်မာ / Burmese',
      type: 'text',
      rows: 4,
      fieldset: 'languages',
      description:
        'Optional. Leave empty if the Burmese is not ready — the site will show the English instead. Please type in Myanmar Unicode (not Zawgyi).',
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
