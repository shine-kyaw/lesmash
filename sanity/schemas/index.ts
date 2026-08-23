/**
 * Every content type in the studio, in one list.
 *
 * ORDER MATTERS ONLY FOR READABILITY — Sanity resolves references by name, so
 * the reusable objects are listed first simply because they are the building
 * blocks the documents below are made of.
 *
 * The four document types map one-to-one onto the folders the website reads:
 *
 *   menuItem      -> src/content/menu-items/*.json
 *   menuCategory  -> src/content/menu-categories/*.json
 *   branch        -> src/content/branches/*.json
 *   modifierGroup -> src/content/modifier-groups/*.json
 *   siteSettings  -> src/lib/site.config.mjs (single record)
 *
 * See sanity/README.md for the full field-by-field mapping.
 */
import type {SchemaTypeDefinition} from 'sanity'

// Reusable building blocks
import localeString from './localeString'
import localeText from './localeText'

// Documents
import menuItem from './menuItem'
import menuCategory from './menuCategory'
import branch from './branch'
import modifierGroup from './modifierGroup'
import siteSettings from './siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  localeString,
  localeText,

  // Documents
  menuItem,
  menuCategory,
  branch,
  modifierGroup,
  siteSettings,
]

export default schemaTypes
