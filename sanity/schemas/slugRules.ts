/**
 * Shared rules for the "web address" (slug) field used by menu items,
 * categories, branches and modifier groups.
 *
 * TWO THINGS THIS FILE GUARANTEES
 *
 * 1. UNIQUENESS — no two records of the same kind may share a web address.
 *    If two burgers were both called `smash-classic`, one of their pages would
 *    overwrite the other at build time. The check ignores the draft/published
 *    copies of the record you are currently editing, so it will not complain
 *    about a document conflicting with itself.
 *
 * 2. LATIN LETTERS ONLY — the website uses the SAME web address in both
 *    languages (english.com/menu/smash-classic and .../my/menu/smash-classic).
 *    Burmese script is never put in a URL, because it gets percent-encoded into
 *    unreadable characters when shared on Facebook or Viber. So the slug is
 *    always generated from the ENGLISH name.
 *
 * A NOTE ON CHANGING A SLUG AFTER LAUNCH
 * The slug is the item's permanent web address. Once a page is live, changing
 * it breaks every existing link to it — shared posts, printed QR codes, Google
 * results. Fixing a typo in the *name* is free and encouraged; changing the
 * *slug* is a developer conversation. The field descriptions say so in plain
 * language.
 */
import type {SlugIsUniqueValidator, SlugSourceContext} from 'sanity'

/** API version pinned so a future Sanity release cannot change query behaviour. */
const API_VERSION = '2024-10-01'

/**
 * Uniqueness check, scoped to the document type doing the asking.
 * A branch and a menu item may share a slug (they live on different URL paths);
 * two menu items may not.
 */
export const isUniqueSlugForType: SlugIsUniqueValidator = async (slug, context) => {
  const {document, getClient} = context
  if (!document?._type) return true

  const client = getClient({apiVersion: API_VERSION})
  const baseId = document._id.replace(/^drafts\./, '')

  const params = {
    draft: `drafts.${baseId}`,
    published: baseId,
    slug,
    type: document._type,
  }

  const query = /* groq */ `!defined(*[
    _type == $type &&
    !(_id in [$draft, $published]) &&
    slug.current == $slug
  ][0]._id)`

  return client.fetch<boolean>(query, params)
}

/**
 * Turns "Le SMASH Double (Beef)" into "le-smash-double-beef".
 * Anything that is not a Latin letter or a number becomes a hyphen, repeated
 * hyphens collapse, and the result is capped so URLs stay readable.
 */
export function slugifyLatin(_input: unknown, _schemaType: unknown, _ctx?: SlugSourceContext) {
  const raw = typeof _input === 'string' ? _input : ''
  return raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // drop accents: "café" -> "cafe"
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

/** The shape every slug field in this studio shares. */
export const slugOptions = {
  slugify: slugifyLatin,
  isUnique: isUniqueSlugForType,
  maxLength: 96,
}
