import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE } from './site.config.mjs';

export type MenuItem = CollectionEntry<'menuItems'>['data'];
export type MenuCategory = CollectionEntry<'menuCategories'>['data'];
export type Branch = CollectionEntry<'branches'>['data'];

/**
 * Build mode.
 *
 *  preview (default) — records the client has not confirmed still render,
 *    marked as unconfirmed, under a standing pre-launch notice.
 *  live (CONTENT_MODE=live) — only confirmed records render, and the content
 *    report fails the build while launch-blocking gaps remain.
 */
export const CONTENT_MODE: 'preview' | 'live' =
  process.env.CONTENT_MODE === 'live' ? 'live' : 'preview';
export const IS_PREVIEW = CONTENT_MODE === 'preview';

const numberFormat = new Intl.NumberFormat('en-US');

/**
 * Returns null for an unset price. The caller renders "Ask in store" rather
 * than a fabricated figure (PRD MENU-02) — no price on this site has been
 * confirmed by the restaurant.
 */
export function formatPrice(price: number | null | undefined): string | null {
  if (price === null || price === undefined) return null;
  return `${numberFormat.format(price)} ${SITE.currency}`;
}

export async function getBranches(): Promise<Branch[]> {
  const entries = await getCollection('branches');
  return entries
    .map((e) => e.data)
    .filter((b) => b.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategories(): Promise<MenuCategory[]> {
  const entries = await getCollection('menuCategories');
  return entries
    .map((e) => e.data)
    .filter((c) => c.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getMenuItems(): Promise<MenuItem[]> {
  const entries = await getCollection('menuItems');
  return entries
    .map((e) => e.data)
    .filter((i) => i.status === 'published')
    .filter((i) => (CONTENT_MODE === 'live' ? i.verified : true))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function refSlug(ref: unknown): string {
  if (typeof ref === 'string') return ref;
  if (ref && typeof ref === 'object' && 'id' in ref) return String((ref as { id: string }).id);
  return '';
}

export function itemsInCategory(items: MenuItem[], categorySlug: string): MenuItem[] {
  return items.filter((i) => refSlug(i.category) === categorySlug);
}

/** Branch-limited items carry a visible badge rather than being hidden. */
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

/**
 * A Maps link that opens the native app where installed. Falls back through
 * place ID, then coordinates, then a name-and-address search, so a branch
 * without a confirmed place ID (DS-09) still gets a usable link.
 */
export function directionsUrl(branch: Branch): string {
  if (branch.googleMapsUrl) return branch.googleMapsUrl;
  const base = 'https://www.google.com/maps/search/?api=1';
  if (branch.googlePlaceId) {
    const q =
      branch.latitude && branch.longitude
        ? `${branch.latitude},${branch.longitude}`
        : encodeURIComponent(query(branch));
    return `${base}&query=${q}&query_place_id=${branch.googlePlaceId}`;
  }
  if (branch.latitude && branch.longitude) {
    return `${base}&query=${branch.latitude},${branch.longitude}`;
  }
  return `${base}&query=${encodeURIComponent(query(branch))}`;
}

function query(branch: Branch): string {
  return [SITE.brand.legal, branch.name, branch.addressLine, 'Yangon'].filter(Boolean).join(', ');
}

export function primaryPhone(branch: Branch): { e164: string; display: string } | null {
  return branch.phone[0] ?? null;
}

/** The first branch with a Foodpanda listing, used when no branch is in context. */
export function orderableBranches(branches: Branch[]): Branch[] {
  return branches.filter((b) => b.foodpandaUrl);
}
