import { getCollection, type CollectionEntry } from 'astro:content';
import type { Locale } from './i18n';
import { SITE } from './site.config.mjs';

export type MenuItem = CollectionEntry<'menuItems'>['data'];
export type MenuCategory = CollectionEntry<'menuCategories'>['data'];
export type Branch = CollectionEntry<'branches'>['data'];

/**
 * Build mode.
 *
 *  preview (default) — records that are not yet client-confirmed still render,
 *    marked as unconfirmed, and the site shows a standing pre-launch notice.
 *    This is what the client reviews before content sign-off.
 *
 *  live — only confirmed records render. Set CONTENT_MODE=live for production.
 *    `npm run content:report` fails in this mode while gaps remain, which is
 *    what stops unverified content reaching customers (PRD §32).
 */
export const CONTENT_MODE: 'preview' | 'live' =
  process.env.CONTENT_MODE === 'live' ? 'live' : 'preview';

export const IS_PREVIEW = CONTENT_MODE === 'preview';

/** Read a localised pair, falling back to English and never rendering empty (LANG-08). */
export function L(
  field: { en: string | null; my: string | null } | null | undefined,
  locale: Locale
): string | null {
  if (!field) return null;
  const value = locale === 'my' ? field.my : field.en;
  return value ?? field.en ?? null;
}

/** True when the Burmese value is missing and English is standing in for it. */
export function isFallback(
  field: { en: string | null; my: string | null } | null | undefined,
  locale: Locale
): boolean {
  return locale === 'my' && !!field && !field.my && !!field.en;
}

const numberFormat = new Intl.NumberFormat('en-US');
const MYANMAR_DIGITS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];

/**
 * Format a price. One numeral policy sitewide (LANG-09 / Q25).
 * Returns null for an unset price — the caller renders "ask in store" rather
 * than a fabricated figure (MENU-02).
 */
export function formatPrice(price: number | null | undefined): string | null {
  if (price === null || price === undefined) return null;
  const digits = numberFormat.format(price);
  const localised =
    SITE.numerals === 'myanmar'
      ? digits.replace(/\d/g, (d) => MYANMAR_DIGITS[Number(d)])
      : digits;
  return `${localised} ${SITE.currency}`;
}

export async function getBranches(): Promise<Branch[]> {
  const entries = await getCollection('branches');
  return entries
    .map((e) => e.data)
    .filter((b) => b.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getBranch(slug: string): Promise<Branch | undefined> {
  return (await getBranches()).find((b) => b.slug === slug);
}

export async function getCategories(): Promise<MenuCategory[]> {
  const entries = await getCollection('menuCategories');
  return entries
    .map((e) => e.data)
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Published items, ordered, with unconfirmed records excluded in live builds. */
export async function getMenuItems(): Promise<MenuItem[]> {
  const entries = await getCollection('menuItems');
  return entries
    .map((e) => e.data)
    .filter((i) => i.status === 'published')
    .filter((i) => (CONTENT_MODE === 'live' ? i.verified : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function itemsInCategory(items: MenuItem[], categorySlug: string): MenuItem[] {
  return items.filter((i) => refSlug(i.category) === categorySlug);
}

/** Content references resolve to `{ collection, id }`; we only ever need the id. */
export function refSlug(ref: unknown): string {
  if (typeof ref === 'string') return ref;
  if (ref && typeof ref === 'object' && 'id' in ref) return String((ref as { id: string }).id);
  return '';
}

export function isAvailableAt(item: MenuItem, branch: Branch): boolean {
  if (!item.isAvailable) return false;
  if (branch.soldOutItems.includes(item.slug)) return false;
  if (item.branchAvailability.length === 0) return true;
  return item.branchAvailability.includes(branch.slug);
}

/** Branch-limited items carry a visible badge rather than being hidden (MENU-10). */
export function limitedToBranches(item: MenuItem, branches: Branch[]): Branch[] {
  if (item.branchAvailability.length === 0) return [];
  if (item.branchAvailability.length >= branches.length) return [];
  return branches.filter((b) => item.branchAvailability.includes(b.slug));
}

export function featuredItems(items: MenuItem[], limit = 6): MenuItem[] {
  const featured = items.filter((i) => i.isFeatured);
  const popular = items.filter((i) => !i.isFeatured && i.tags.includes('popular'));
  return [...featured, ...popular].slice(0, limit);
}

/** Drives the "prices as of {date}" honesty note on the menu page (PRD §11.3). */
export function pricesAsOf(items: MenuItem[]): string | null {
  const dates = items.map((i) => i.updatedAt).filter((d): d is string => !!d);
  if (dates.length === 0) return null;
  return dates.sort().at(-1) ?? null;
}

/**
 * A Google Maps link that opens the native app where installed.
 * Prefers the place ID (exact pin); falls back to coordinates, then to a name
 * search, so a branch without DS-09 still gets a usable link (PRD §24).
 */
export function directionsUrl(branch: Branch, locale: Locale): string | null {
  if (branch.googleMapsUrl) return branch.googleMapsUrl;
  const base = 'https://www.google.com/maps/search/?api=1';
  if (branch.googlePlaceId) {
    const q = branch.latitude && branch.longitude
      ? `${branch.latitude},${branch.longitude}`
      : encodeURIComponent(queryFor(branch, locale));
    return `${base}&query=${q}&query_place_id=${branch.googlePlaceId}`;
  }
  if (branch.latitude && branch.longitude) {
    return `${base}&query=${branch.latitude},${branch.longitude}`;
  }
  return `${base}&query=${encodeURIComponent(queryFor(branch, locale))}`;
}

function queryFor(branch: Branch, locale: Locale): string {
  return [SITE.brand.legal, L(branch.name, locale), L(branch.addressLine, locale), 'Yangon']
    .filter(Boolean)
    .join(', ');
}

export function primaryPhone(branch: Branch): { e164: string; display: string } | null {
  return branch.phone[0] ?? null;
}
