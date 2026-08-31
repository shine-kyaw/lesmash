/**
 * The gallery sections, exactly as the brief names them.
 *
 * The brief is explicit that these must "remain flexible so that new work can
 * be added over time", so the archive is a list here rather than a page each:
 * adding a section is one entry, and adding work to one is one line plus a file
 * in `public/media/gallery/<slug>/`.
 *
 * Collaborations is one of these rather than a top-level page. The brief gives
 * it its own section, but what it contains is images with a short note each —
 * the same shape as every other section here, and a whole route for one block
 * would make the navigation longer than the site.
 *
 * Every `src` below is a real file from the client's Drive. A section with an
 * empty `items` array falls back to reserved `Shot` frames at its ratio, so a
 * new section can be declared before its photography exists.
 */
export interface GalleryItem {
  /** Filename inside `public/media/gallery/<section slug>/`. */
  src: string;
  /** Alt text. Describes what is in frame, not what it is for. */
  alt: string;
}

export interface GallerySection {
  slug: string;
  name: string;
  blurb: string;
  ratio: '4x3' | '3x2' | '4x5';
  items: GalleryItem[];
}

export const GALLERY_SECTIONS: GallerySection[] = [
  {
    slug: 'campaigns',
    name: 'Campaigns',
    blurb: 'Shot for a season, a launch or a single idea.',
    ratio: '4x5',
    items: [
      { src: '01-le-coq-has-landed.jpg', alt: 'Le COQ has landed — a hand holding a piece of buttermilk chicken' },
      { src: '02-pickle-your-taste-buds.jpg', alt: 'Pickle your taste buds — pickle slices scattered on white' },
      { src: '03-le-king-fin.jpg', alt: 'Le King Fin — the fish burger held in two hands' },
      { src: '04-meat-me-here.jpg', alt: 'Meat me here — a single patty hung against black' },
      { src: '05-meet-the-beast.jpg', alt: 'Meet the beast — the spicy bacon BBQ burger in section' },
      { src: '06-smash-smash.jpg', alt: 'A press coming down on a ball of beef, in black and white' },
      { src: '07-frites.jpg', alt: 'Frites — loaded fries in a Le SMASH tray' },
      { src: '08-in-case-of-emergency.jpg', alt: 'In case of emergency, smash the glass — a burger behind glass' },
      { src: '09-not-just-salmon.jpg', alt: 'Not just salmon — cured salmon plated on dark ceramic' },
      { src: '10-hate-onions.jpg', alt: 'Hate onions? You will love the Onion Smash' },
      { src: '11-rain-or-shine.jpg', alt: 'Rain or shine, we deliver — a burger over a Yangon skyline' },
      { src: '12-happy-hour.jpg', alt: 'Happy hour — a glass raised against a dark ground' },
    ],
  },
  {
    slug: 'events',
    name: 'Events and Pop-Ups',
    blurb: 'Nights out of the room — markets, takeovers, one-offs.',
    ratio: '3x2',
    items: [
      { src: '01-opening-arch.jpg', alt: 'A red, black and white balloon arch outside the shopfront on opening day' },
      { src: '02-full-room.jpg', alt: 'The room full, every table taken' },
      { src: '03-the-banquette.jpg', alt: 'Friends on the red banquette with shopping bags and a menu' },
      { src: '04-pop-up-at-trt.jpg', alt: 'Two hands holding the Le SMASH and TRT cards for the pop-up' },
      { src: '05-first-bite.jpg', alt: 'A boy taking the first bite of a burger at the counter' },
      { src: '06-rings.jpg', alt: 'Someone hanging from gymnastic rings in the room' },
    ],
  },
  {
    slug: 'food',
    name: 'Food and Product',
    blurb: 'The plate as it leaves the pass.',
    ratio: '4x3',
    items: [
      { src: '01-cheese.jpg', alt: 'A cheeseburger held close, the cheese draped over the patty' },
      { src: '02-on-newsprint.jpg', alt: 'A burger and fries served on newsprint' },
      { src: '03-in-the-wrap.jpg', alt: 'A burger half unwrapped in its printed paper' },
      { src: '04-frites-basket.jpg', alt: 'Frites in a Le SMASH basket on red' },
      { src: '05-the-bell.jpg', alt: 'The service bell on the pass' },
      { src: '06-on-the-plate.jpg', alt: 'A plated dish with a dipping sauce' },
      { src: '07-over-the-tray.jpg', alt: 'A burger held over a loaded tray' },
      { src: '08-tray-and-chalk.jpg', alt: 'A tray of burger and fries against a chalked wall' },
    ],
  },
  {
    slug: 'spaces',
    name: 'Spaces and Locations',
    blurb: 'Three rooms, five kitchens.',
    ratio: '3x2',
    items: [
      { src: '01-exterior.jpg', alt: 'The shopfront from the street, signage lit' },
      { src: '02-the-counter.jpg', alt: 'The counter and stools, empty before service' },
      { src: '03-evening.jpg', alt: 'The room in the evening, neon on' },
      { src: '04-the-menu-wall.jpg', alt: 'The painted menu wall, beside the framed Napoleon' },
      { src: '05-under-the-sign.jpg', alt: 'The kitchen seen from the floor, under the hanging sign' },
      { src: '06-green-tiles.jpg', alt: 'A table against the green tiled wall' },
    ],
  },
  {
    slug: 'behind-the-scenes',
    name: 'Behind the Scenes',
    blurb: 'Prep, service, the people who cook it.',
    ratio: '4x5',
    items: [
      { src: '01-on-the-press.jpg', alt: 'A cook pressing balls of beef flat on the plancha' },
      { src: '02-a-bowl-of-frites.jpg', alt: 'A cook holding a steel bowl of frites' },
      { src: '03-the-pass.jpg', alt: 'Burgers and fries lined up on trays at the pass' },
      { src: '04-the-professionals.jpg', alt: 'Two cooks working side by side' },
      { src: '05-service.jpg', alt: 'A chef calling across the kitchen during service' },
      { src: '06-on-the-back.jpg', alt: 'The Le SMASH wordmark on the back of a staff shirt' },
    ],
  },
  {
    slug: 'collaborations',
    name: 'Collaborations',
    blurb: 'Work with other brands, restaurants, artists and venues.',
    ratio: '4x5',
    items: [
      { src: '01-blind-tiger.jpg', alt: 'Blind Tiger x Le SMASH, the Sunset Ibiza invitation' },
      { src: '02-ah-so.jpg', alt: 'Le SMASH x Ah-so, the Sip and Smash artwork' },
      { src: '03-brittos.jpg', alt: 'Le SMASH x Brittos, the Red and White Party invitation' },
      { src: '04-brittos-x-tagu.jpg', alt: 'Brittos x Le SMASH x TagU, an exclusive event poster' },
      { src: '05-ar-t.jpg', alt: 'The room as it appears in a music video by AR-T' },
    ],
  },
  {
    slug: 'special-projects',
    name: 'Special Projects',
    blurb: 'The things that fit nowhere else, which is usually the point.',
    ratio: '4x3',
    items: [
      { src: '01-napoleon.jpg', alt: 'Napoleon crossing the Alps, holding a burger' },
      { src: '02-on-the-way-to-smash.jpg', alt: 'Four figures on a zebra crossing, after Abbey Road' },
      { src: '03-tiny-hands.jpg', alt: 'Tiny hands, big appetite: a child eating a burger among stickers' },
      { src: '04-the-shirts.jpg', alt: 'The staff and merchandise shirts, front and back' },
      { src: '05-the-mugs.jpg', alt: 'Two Le SMASH mugs, black and white' },
      { src: '06-the-wrap.jpg', alt: 'The monogrammed burger wrap paper, folded' },
      { src: '07-the-monogram.jpg', alt: 'The Le monogram as a neon sign' },
      { src: '08-out-for-delivery.jpg', alt: 'A car boot full of Le SMASH takeaway bags' },
    ],
  },
];

/** Total pictures in the archive, for the gallery standfirst. */
export const GALLERY_COUNT = GALLERY_SECTIONS.reduce((n, s) => n + s.items.length, 0);
