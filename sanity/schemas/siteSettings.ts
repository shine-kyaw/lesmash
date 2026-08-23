/**
 * siteSettings — the handful of settings that apply to the WHOLE website
 * rather than to one burger or one branch.
 *
 * THIS IS A SINGLETON
 * There is exactly one of these records, and it always has the document id
 * "siteSettings". The studio structure (see sanity.config.example.ts) opens it
 * directly as a single form — there is deliberately no "create new" button,
 * because a second copy would mean the site had two different brand names and
 * no way to tell which one is real.
 *
 * WHO SHOULD EDIT THIS
 * Admins. Almost everything here changes something on every single page — the
 * brand name, the address of the site itself, the analytics script. A wrong
 * value here is a site-wide problem, not a one-page problem. Day-to-day editors
 * never need to open it.
 *
 * FIELDS WHOSE PURPOSE IS NOT OBVIOUS
 *
 * • origin        The site's own web address, written in full. Everything the
 *                 site tells Google and Facebook about itself is built from
 *                 this, so it must exactly match the live domain — including
 *                 whether it has "www." — and it must have no trailing slash.
 *
 * • numerals      Whether numbers on the Burmese pages are shown in Western
 *                 digits (12,000) or Myanmar digits (၁၂,၀၀၀). One choice,
 *                 applied everywhere, so the site never mixes the two.
 *
 * • priceContextStatement
 *                 The honest paragraph printed at the top of the menu about
 *                 what the prices mean — whether they are dine-in prices,
 *                 whether delivery costs more, when they were last checked.
 *                 It is the site's answer to "is this price actually what I
 *                 will pay?", and it should be updated whenever prices are.
 *
 * MIRRORS: SITE in src/lib/site.config.mjs.
 */
import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',

  groups: [
    {name: 'brand', title: 'Brand', default: true},
    {name: 'social', title: 'Social links'},
    {name: 'menuPage', title: 'Menu page notice'},
    {name: 'technical', title: 'Technical'},
  ],

  fields: [
    // ----------------------------------------------------------------- brand
    defineField({
      name: 'legalName',
      title: 'Full registered business name',
      type: 'string',
      group: 'brand',
      initialValue: 'Le SMASH Burgers & Co.',
      description:
        'The complete, formal name of the business — used in the footer, in the copyright line and in the information Google holds about the company. For example: Le SMASH Burgers & Co.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'displayName',
      title: 'Short name used around the site',
      type: 'string',
      group: 'brand',
      initialValue: 'Le SMASH',
      description:
        'The everyday name shown in the header, in page titles and on buttons — for example: Le SMASH. Keep it short; it appears beside a lot of other text.',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'displayNameMy',
      title: 'Short name on the Burmese pages',
      type: 'string',
      group: 'brand',
      initialValue: 'Le SMASH',
      description:
        'Normally exactly the same as above. The brand name stays in Latin letters on the Burmese pages — it is a name, not a word to be translated. Only change this if the owners specifically ask for a Burmese spelling.',
    }),

    defineField({
      name: 'origin',
      title: 'Website address',
      type: 'url',
      group: 'brand',
      description:
        'The site’s own full address, exactly as it appears in the browser bar once live — for example https://www.eatlesmash.com. No slash on the end. Everything the site tells Google and Facebook about itself is built from this, so an error here affects every page. Change it only at the moment the domain goes live.',
      validation: (Rule) =>
        Rule.required()
          .uri({scheme: ['https']})
          .custom((value?: string) =>
            value && value.endsWith('/')
              ? 'Please remove the slash from the end — https://www.example.com, not https://www.example.com/'
              : true,
          ),
    }),

    // ---------------------------------------------------------------- social
    defineField({
      name: 'facebookUrl',
      title: 'Facebook page',
      type: 'url',
      group: 'social',
      description:
        'The full link to the Facebook page. Leave empty and no Facebook icon is shown anywhere — an icon that leads nowhere is worse than no icon.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),

    defineField({
      name: 'instagramUrl',
      title: 'Instagram profile',
      type: 'url',
      group: 'social',
      description:
        'Optional. Leave empty until the account genuinely exists and is being posted to.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),

    defineField({
      name: 'tiktokUrl',
      title: 'TikTok profile',
      type: 'url',
      group: 'social',
      description: 'Optional. Same rule — empty is fine, a dead link is not.',
      validation: (Rule) => Rule.uri({scheme: ['http', 'https']}),
    }),

    // -------------------------------------------------------- menu page note
    defineField({
      name: 'priceContextStatement',
      title: 'Notice printed at the top of the menu',
      type: 'localeText',
      group: 'menuPage',
      description:
        'The short, honest paragraph customers read before the prices — for example: "Prices shown are dine-in prices, last checked in August. Delivery prices on Foodpanda may be higher." Update this whenever prices change. It is what stops a customer feeling misled when the delivery total is different.',
    }),

    // ------------------------------------------------------------- technical
    defineField({
      name: 'numerals',
      title: 'Which digits to use for numbers',
      type: 'string',
      group: 'technical',
      initialValue: 'western',
      description:
        'How prices and times are written on the Burmese pages: Western digits (12,000) or Myanmar digits (၁၂,၀၀၀). One setting for the whole site, so numbers never appear in two different styles on the same page. Ask the owners which their customers expect.',
      options: {
        list: [
          {title: 'Western digits — 12,000', value: 'western'},
          {title: 'Myanmar digits — ၁၂,၀၀၀', value: 'myanmar'},
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'analyticsProvider',
      title: 'Visitor statistics service',
      type: 'string',
      group: 'technical',
      initialValue: 'none',
      description:
        'Which service counts visitors. Choose "None" and no tracking script is loaded at all — the site stays faster and no cookie banner is needed. Your developer sets this up.',
      options: {
        list: [
          {title: 'None (no tracking at all)', value: 'none'},
          {title: 'Plausible', value: 'plausible'},
          {title: 'Umami', value: 'umami'},
          {title: 'Fathom', value: 'fathom'},
        ],
        layout: 'radio',
      },
    }),

    defineField({
      name: 'analyticsDomain',
      title: 'Statistics: site name',
      type: 'string',
      group: 'technical',
      hidden: ({document}) => !document?.analyticsProvider || document.analyticsProvider === 'none',
      description:
        'Technical — the domain as registered inside the statistics service, for example eatlesmash.com. Your developer fills this in.',
    }),

    defineField({
      name: 'analyticsScriptUrl',
      title: 'Statistics: script address',
      type: 'url',
      group: 'technical',
      hidden: ({document}) => !document?.analyticsProvider || document.analyticsProvider === 'none',
      description:
        'Technical — the script address given by the statistics service. Your developer fills this in. Leave empty and nothing is loaded.',
      validation: (Rule) => Rule.uri({scheme: ['https']}),
    }),
  ],

  preview: {
    select: {title: 'displayName', subtitle: 'origin'},
    prepare({title, subtitle}: {title?: string; subtitle?: string}) {
      return {
        title: title ? `${title} — site settings` : 'Site settings',
        subtitle: subtitle || 'Website address not set yet',
      }
    },
  },
})
