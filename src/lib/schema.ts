import type { Locale } from './i18n';
import { absoluteUrl, localePath, SITE } from './i18n';
import { L, directionsUrl, formatPrice, type Branch, type MenuCategory, type MenuItem } from './content';
import { toSchemaHours, hasConfirmedHours } from './hours';

/**
 * Structured data (PRD §19.4, SEO-03).
 *
 * Rule applied throughout: a property is emitted only when the underlying value
 * is confirmed. An empty `telephone` or a guessed `priceRange` is worse than an
 * absent one — it is a claim we cannot stand behind, and Google will surface it.
 * `suitableForDiet` and any halal-adjacent property are never emitted without
 * written client confirmation (PRD §19.4, R-20).
 */

function clean<T extends Record<string, unknown>>(obj: T): T {
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v === null || v === undefined || (Array.isArray(v) && v.length === 0)) delete obj[key];
  }
  return obj;
}

export function organizationSchema(locale: Locale) {
  const sameAs = [SITE.social.facebook, SITE.social.instagram, SITE.social.tiktok].filter(Boolean);
  return clean({
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: SITE.brand.legal,
    alternateName: SITE.brand.display,
    url: absoluteUrl(localePath(locale, '/')),
    sameAs,
    areaServed: 'Yangon, Myanmar',
  });
}

export function websiteSchema(locale: Locale) {
  return {
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE.brand.legal,
    url: absoluteUrl(localePath(locale, '/')),
    inLanguage: locale === 'my' ? 'my-MM' : 'en',
    publisher: { '@id': absoluteUrl('/#organization') },
  };
}

export function restaurantSchema(branch: Branch, locale: Locale, opts: { withMenu?: boolean } = {}) {
  const url = absoluteUrl(localePath(locale, `/locations/${branch.slug}`));
  return clean({
    '@type': 'Restaurant',
    '@id': `${absoluteUrl(`/locations/${branch.slug}`)}#restaurant`,
    name: `${SITE.brand.legal} — ${L(branch.name, locale)}`,
    url,
    address: clean({
      '@type': 'PostalAddress',
      streetAddress: L(branch.addressLine, locale),
      addressLocality: L(branch.township, locale),
      addressRegion: L(branch.city, locale),
      postalCode: branch.postalCode,
      addressCountry: 'MM',
    }),
    geo:
      branch.latitude && branch.longitude
        ? { '@type': 'GeoCoordinates', latitude: branch.latitude, longitude: branch.longitude }
        : null,
    telephone: branch.phone[0]?.e164 ?? null,
    servesCuisine: ['Burgers', 'American', 'Western'],
    // priceRange deliberately omitted until prices are confirmed (DS-04).
    openingHoursSpecification: hasConfirmedHours(branch.openingHours)
      ? toSchemaHours(branch.openingHours)
      : [],
    hasMap: directionsUrl(branch, locale),
    hasMenu: opts.withMenu ? absoluteUrl(localePath(locale, '/menu')) : null,
    parentOrganization: { '@id': absoluteUrl('/#organization') },
    sameAs: [SITE.social.facebook, SITE.social.instagram].filter(Boolean),
  });
}

export function menuSchema(
  categories: MenuCategory[],
  items: MenuItem[],
  locale: Locale,
  categorySlug?: string
) {
  const sections = categories
    .filter((c) => !categorySlug || c.slug === categorySlug)
    .map((category) => {
      const sectionItems = items
        .filter((i) => refId(i.category) === category.slug)
        .map((item) =>
          clean({
            '@type': 'MenuItem',
            name: L(item.name, locale),
            description: L(item.description, locale),
            // An offer is emitted only for a confirmed price. No price, no offer.
            offers:
              item.price !== null
                ? { '@type': 'Offer', price: item.price, priceCurrency: SITE.currency }
                : null,
          })
        );
      return clean({
        '@type': 'MenuSection',
        name: L(category.name, locale),
        description: L(category.description, locale),
        hasMenuItem: sectionItems,
      });
    })
    .filter((s) => (s.hasMenuItem as unknown[])?.length);

  return clean({
    '@type': 'Menu',
    '@id': absoluteUrl('/menu#menu'),
    name: `${SITE.brand.legal} Menu`,
    inLanguage: locale === 'my' ? 'my-MM' : 'en',
    hasMenuSection: sections,
  });
}

export function breadcrumbSchema(trail: { name: string; path: string }[], locale: Locale) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(localePath(locale, crumb.path)),
    })),
  };
}

export function branchListSchema(branches: Branch[], locale: Locale) {
  return {
    '@type': 'ItemList',
    itemListElement: branches.map((branch, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: restaurantSchema(branch, locale),
    })),
  };
}

function refId(ref: unknown): string {
  if (typeof ref === 'string') return ref;
  if (ref && typeof ref === 'object' && 'id' in ref) return String((ref as { id: string }).id);
  return '';
}

export { formatPrice };
