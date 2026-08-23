/**
 * Sanity Studio v3 configuration — EXAMPLE.
 *
 * HOW TO USE THIS FILE
 * Copy it to `sanity.config.ts` in this folder, fill in `projectId` and
 * `dataset` from sanity.io/manage, and keep the copy out of version control if
 * you would rather not publish the project id. Everything else can stay as it is.
 *
 *     cp sanity.config.example.ts sanity.config.ts
 *
 * WHAT THE STRUCTURE BELOW DOES
 * Left to itself, Sanity lists content types alphabetically, which puts
 * "Modifier groups" above "Menu items" and buries the two things staff open
 * every day. The custom structure below fixes the running order to match how
 * the restaurant actually works:
 *
 *     Menu items  ->  Branches  ->  Menu sections  ->  Options groups
 *     ------------------------------------------------------------
 *     Site settings (one record, opened directly, no list)
 *
 * Menu items are also split into working views — items with no price, items
 * nobody has checked yet — because those are the two states that must never
 * quietly reach a customer, and a filtered list is the only reliable way to
 * notice them.
 */
import {defineConfig} from 'sanity'
import {structureTool, type StructureBuilder} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'

// ---------------------------------------------------------------------------
// Fill these in from https://www.sanity.io/manage
// ---------------------------------------------------------------------------
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? 'REPLACE_WITH_PROJECT_ID'
const dataset = process.env.SANITY_STUDIO_DATASET ?? 'production'

/**
 * The singleton settings record always lives at this exact document id, so the
 * studio can open it directly instead of showing a list with one row in it and
 * a "create another" button that must never be pressed.
 */
const SITE_SETTINGS_ID = 'siteSettings'

const structure = (S: StructureBuilder) =>
  S.list()
    .title('Le SMASH')
    .items([
      // ---------------------------------------------------------- Menu items
      S.listItem()
        .title('Menu items')
        .child(
          S.list()
            .title('Menu items')
            .items([
              S.listItem()
                .title('All items')
                .child(S.documentTypeList('menuItem').title('All items')),

              S.divider(),

              // The two "something is wrong" views. Staff should be able to
              // answer "is anything unfinished?" without opening records.
              S.listItem()
                .title('No price yet (shows "Ask in store")')
                .child(
                  S.documentTypeList('menuItem')
                    .title('No price yet')
                    .filter('_type == "menuItem" && !defined(price)'),
                ),
              S.listItem()
                .title('Not checked against the real menu')
                .child(
                  S.documentTypeList('menuItem')
                    .title('Not checked yet')
                    .filter('_type == "menuItem" && verified != true'),
                ),
              S.listItem()
                .title('Missing Burmese')
                .child(
                  S.documentTypeList('menuItem')
                    .title('Missing Burmese')
                    .filter('_type == "menuItem" && !defined(name.my)'),
                ),

              S.divider(),

              S.listItem()
                .title('Drafts')
                .child(
                  S.documentTypeList('menuItem')
                    .title('Drafts')
                    .filter('_type == "menuItem" && status == "draft"'),
                ),
              S.listItem()
                .title('Live on the website')
                .child(
                  S.documentTypeList('menuItem')
                    .title('Live')
                    .filter('_type == "menuItem" && status == "published"'),
                ),
              S.listItem()
                .title('Archived')
                .child(
                  S.documentTypeList('menuItem')
                    .title('Archived')
                    .filter('_type == "menuItem" && status == "archived"'),
                ),
            ]),
        ),

      // ------------------------------------------------------------ Branches
      S.listItem().title('Branches').child(S.documentTypeList('branch').title('Branches')),

      // ------------------------------------------------------- Menu sections
      S.listItem()
        .title('Menu sections')
        .child(S.documentTypeList('menuCategory').title('Menu sections')),

      // ------------------------------------------------------ Options groups
      S.listItem()
        .title('Options groups')
        .child(S.documentTypeList('modifierGroup').title('Options groups')),

      S.divider(),

      // ------------------------------------------------------- Site settings
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId(SITE_SETTINGS_ID)
            .title('Site settings'),
        ),
    ])

export default defineConfig({
  name: 'lesmash',
  title: 'Le SMASH Burgers & Co.',

  projectId,
  dataset,

  plugins: [
    structureTool({structure}),
    // The Vision tool runs raw queries against the data. Useful for a
    // developer, meaningless to an editor — so it is loaded only outside
    // production builds of the studio.
    ...(process.env.NODE_ENV !== 'production' ? [visionTool()] : []),
  ],

  schema: {
    types: schemaTypes,

    // Site settings exists exactly once and is reached through the menu item
    // above, so it is removed from the global "create new document" menu.
    templates: (prev) => prev.filter((template) => template.schemaType !== 'siteSettings'),
  },

  document: {
    // Belt and braces: hide the duplicate/delete actions on the singleton so a
    // second settings record cannot be created by accident.
    actions: (prev, context) =>
      context.schemaType === 'siteSettings'
        ? prev.filter(({action}) => action !== 'duplicate' && action !== 'delete')
        : prev,
  },

  /**
   * =========================================================================
   * PUBLISHING TO THE LIVE SITE — the deploy webhook
   * =========================================================================
   * The website is a set of static files rebuilt from this content. Pressing
   * Publish here changes the data instantly, but the public pages do not
   * change until the site is rebuilt. A webhook does that automatically.
   *
   * Set it up once, in sanity.io/manage:
   *
   *   1. In the host that builds the site (Netlify, Vercel, Cloudflare Pages),
   *      create a "build hook" / "deploy hook". You get a URL back that looks
   *      like https://api.netlify.com/build_hooks/XXXXXXXX. Treat that URL as
   *      a password — anyone holding it can trigger a rebuild.
   *
   *   2. In sanity.io/manage, open this project -> API -> Webhooks -> Create.
   *        Name        Rebuild the website
   *        URL         (the build hook URL from step 1)
   *        Dataset     production
   *        Trigger on  Create, Update, Delete
   *        Filter      _type in ["menuItem","menuCategory","branch",
   *                              "modifierGroup","siteSettings"]
   *        HTTP method POST
   *        API version v2021-03-25
   *
   *   3. Leave "Drafts" OFF. Only published documents should cause a rebuild —
   *      otherwise every keystroke in a draft would queue another build.
   *
   * TIMING: a build for this site takes roughly one to two minutes, plus the
   * host's own queue. A publish is normally live within five minutes. If it is
   * not, check the deploy log in the host's dashboard first — the webhook
   * delivery log in sanity.io/manage will tell you whether Sanity actually
   * fired the request.
   *
   * TIP: several rapid publishes will queue several builds. When updating a
   * lot of prices, publish them all, then wait — do not keep refreshing the
   * live site between each one.
   */
})
