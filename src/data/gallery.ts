/**
 * The gallery sections, exactly as the brief names them.
 *
 * The brief is explicit that these must "remain flexible so that new work can
 * be added over time", so the archive is a list here rather than a page each:
 * adding a section is one entry, and adding work to one is dropping files into
 * `public/media/gallery/<slug>/`.
 *
 * Collaborations is one of these rather than a top-level page. The brief gives
 * it its own section, but what it contains is images with a short note each —
 * the same shape as every other section here, and a whole route for one block
 * would make the navigation longer than the site.
 *
 * `count` is how many picture slots the section reserves until real files
 * arrive. It is a layout decision, not a claim about how much work exists.
 */
export interface GallerySection {
  slug: string;
  name: string;
  blurb: string;
  count: number;
  ratio: '4x3' | '3x2' | '4x5';
}

export const GALLERY_SECTIONS: GallerySection[] = [
  {
    slug: 'campaigns',
    name: 'Campaigns',
    blurb: 'Shot for a season, a launch or a single idea.',
    count: 6,
    ratio: '4x5',
  },
  {
    slug: 'events',
    name: 'Events and Pop-Ups',
    blurb: 'Nights out of the room — markets, takeovers, one-offs.',
    count: 6,
    ratio: '3x2',
  },
  {
    slug: 'food',
    name: 'Food and Product',
    blurb: 'The plate as it leaves the pass.',
    count: 8,
    ratio: '4x3',
  },
  {
    slug: 'spaces',
    name: 'Spaces and Locations',
    blurb: 'Three rooms, five kitchens.',
    count: 6,
    ratio: '3x2',
  },
  {
    slug: 'behind-the-scenes',
    name: 'Behind the Scenes',
    blurb: 'Prep, service, the people who cook it.',
    count: 6,
    ratio: '4x5',
  },
  {
    slug: 'collaborations',
    name: 'Collaborations',
    blurb: 'Work with other brands, restaurants, artists and venues.',
    count: 6,
    ratio: '4x3',
  },
  {
    slug: 'special-projects',
    name: 'Special Projects',
    blurb: 'The things that fit nowhere else, which is usually the point.',
    count: 4,
    ratio: '4x3',
  },
];
