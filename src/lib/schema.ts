import { SITE, absoluteUrl } from './site.config.mjs';
import { directionsUrl, type Branch, type MenuCategory, type MenuItem, refSlug } from './content';
import { toSchemaHours, hasConfirmedHours } from './hours';

/**
 * Structured data (PRD §19.4).
 *
 * A property is emitted only when the underlying value is confirmed. An empty
 * `telephone` or a guessed `priceRange` is worse than an absent one — Google
 * will surface it, and it becomes a claim we cannot stand behind. No
 * `suitableForDiet` or halal-adjacent property is emitted at all pending a
 * written policy from the client (PRD Q15).
 */
function clean<T extends Record<string, unknown>>(obj: T): T {
  for (const key of Object.keys(obj)) {
    const v = obj[key];
    if (v === null || v === undefined || (Array.isArray(v) && v.length === 0)) delete obj[key];
  }
  return obj;
}

const sameAs = () =>
  [SITE.social.facebook, SITE.social.instagram, SITE.social.tiktok].filter(Boolean) as string[];

export function organizationSchema() {
  return clean({
    '@type': 'Organization',
    '@id': absoluteUrl('/#organization'),
    name: SITE.brand.legal,
    alternateName: SITE.brand.display,
    url: absoluteUrl('/'),
    logo: absoluteUrl('/brand/logo-badge.png'),
    image: absoluteUrl('/og.jpg'),
    sameAs: sameAs(),
    areaServed: 'Yangon, Myanmar',
  });
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE.brand.legal,
    url: absoluteUrl('/'),
    inLanguage: 'en',
    publisher: { '@id': absoluteUrl('/#organization') },
  };
}

export function restaurantSchema(branch: Branch, opts: { withMenu?: boolean } = {}) {
  return clean({
    '@type': 'Restaurant',
    image: absoluteUrl('/og.jpg'),
    '@id': absoluteUrl(`/#${branch.slug}`),
    name: `${SITE.brand.legal} — ${branch.name}`,
    url: absoluteUrl('/'),
    address: clean({
      '@type': 'PostalAddress',
      streetAddress: branch.addressLine,
      addressLocality: branch.township,
      addressRegion: branch.city,
      postalCode: branch.postalCode,
      addressCountry: 'MM',
    }),
    geo:
      branch.latitude && branch.longitude
        ? { '@type': 'GeoCoordinates', latitude: branch.latitude, longitude: branch.longitude }
        : null,
    telephone: branch.phone[0]?.e164 ?? null,
    servesCuisine: ['Burgers', 'American', 'Western'],
    openingHoursSpecification: hasConfirmedHours(branch.openingHours)
      ? toSchemaHours(branch.openingHours)
      : [],
    hasMap: directionsUrl(branch),
    hasMenu: opts.withMenu ? absoluteUrl('/menu') : null,
    parentOrganization: { '@id': absoluteUrl('/#organization') },
    sameAs: sameAs(),
  });
}

export function menuSchema(categories: MenuCategory[], items: MenuItem[]) {
  const sections = categories
    .map((category) => {
      // A card category's items come from the collection; a list category IS
      // its list, so its names come off the category record. Either way the
      // section is only emitted if it actually names something.
      const fromCollection = items
        .filter((i) => refSlug(i.category) === category.slug)
        .map((item) =>
          clean({
            '@type': 'MenuItem',
            name: item.name,
            description: item.description,
            // An offer is emitted only for a confirmed price. No price, no offer.
            offers:
              item.price !== null
                ? { '@type': 'Offer', price: item.price, priceCurrency: SITE.currency }
                : null,
          })
        );
      const fromList = [
        ...category.listItems,
        ...category.listGroups.flatMap((g) => g.items),
      ].map((name) => ({ '@type': 'MenuItem', name }));
      const hasMenuItem = fromCollection.length ? fromCollection : fromList;
      return clean({
        '@type': 'MenuSection',
        name: category.name,
        description: category.description,
        hasMenuItem,
      });
    })
    .filter((s) => (s.hasMenuItem as unknown[])?.length);

  return clean({
    '@type': 'Menu',
    '@id': absoluteUrl('/menu#menu'),
    name: `${SITE.brand.legal} Menu`,
    inLanguage: 'en',
    hasMenuSection: sections,
  });
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}
