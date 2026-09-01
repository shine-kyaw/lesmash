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
 *
 * FIT. A photograph can be cropped to the section's ratio; a poster cannot.
 * Cropping a landscape poster into a 4:5 tile turns "SMASH NOW" into "MASH OW"
 * and cuts the lockup off the bottom. So artwork is `contain`, mounted on a
 * warm mat like a framed print, and photography is `cover`. Sections that are
 * entirely one or the other set it once; Special Projects is mixed and sets it
 * per item.
 */
export type Fit = 'cover' | 'contain';

export interface GalleryItem {
  /** Filename inside `public/media/gallery/<section slug>/`. */
  src: string;
  /** Alt text. Describes what is in frame, not what it is for. */
  alt: string;
  /** Overrides the section default. */
  fit?: Fit;
}

export interface GallerySection {
  slug: string;
  name: string;
  blurb: string;
  ratio: '4x3' | '3x2' | '4x5';
  /** Default for every item in the section. Defaults to 'cover'. */
  fit?: Fit;
  items: GalleryItem[];
}

export const GALLERY_SECTIONS: GallerySection[] = [
  {
    slug: 'campaigns',
    name: 'Campaigns',
    blurb: 'Shot for a season, a launch or a single idea.',
    ratio: '4x5',
    fit: 'contain',
    items: [
      { src: '01-le-coq-has-landed.jpg', alt: 'Le COQ has landed — a hand holding a piece of buttermilk chicken' },
      { src: '02-pickle-your-taste-buds.jpg', alt: 'Pickle your taste buds. Sour? We prefer personality' },
      { src: '03-le-king-fin.jpg', alt: 'Le King Fin — the fish burger held in two hands' },
      { src: '04-meat-me-here.jpg', alt: 'Sear you soon. Meat me here — a single patty hung against black' },
      { src: '05-meet-the-beast.jpg', alt: 'Meet the beast — the spicy bacon BBQ burger in section' },
      { src: '06-smash-smash.jpg', alt: 'A press coming down on a ball of beef, in black and white' },
      { src: '07-frites.jpg', alt: 'Frites that belong with every burger' },
      { src: '08-in-case-of-emergency.jpg', alt: 'In case of emergency, smash the glass — a burger behind glass' },
      { src: '09-not-just-salmon.jpg', alt: 'Not just salmon — cured salmon plated on dark ceramic' },
      { src: '10-hate-onions.jpg', alt: 'Hate onions? You will love the Onion Smash' },
      { src: '11-rain-or-shine.jpg', alt: 'Rain or shine, we deliver — a burger over a Yangon skyline' },
      { src: '12-happy-hour.jpg', alt: 'Happy hour, Monday to Friday — a glass raised against black' },
      { src: '13-smash-now.jpg', alt: 'Smash now, thank us later' },
      { src: '14-brunch-menu.jpg', alt: 'The brunch menu cover — Western soul, Myanmar heart' },
      { src: '15-smash.jpg', alt: 'Smash — a black and white portrait with the wordmark down the side' },
      { src: '16-every-smash-a-masterpiece.jpg', alt: 'Where every smash is a masterpiece — four wrapped burgers held in tattooed arms' },
      { src: '17-busy-day.jpg', alt: 'A busy day, with each brunch dish on the table labelled' },
      { src: '18-homemade-cured-salmon.jpg', alt: 'A new smash arrives: homemade cured salmon with cream' },
      { src: '19-beef-tartare-on-toast.jpg', alt: 'A new smash arrives: beef tartare on toast' },
      { src: '20-burgers.jpg', alt: 'Burgers — three stacked in one hand' },
      { src: '21-at-home.jpg', alt: 'Enjoy Le SMASH at home' },
      { src: '22-magazine-cover.jpg', alt: 'Best burger — the magazine cover layout' },
      { src: '23-spread-le-smash.jpg', alt: 'An editorial spread for the Le SMASH Burger' },
      { src: '24-spread-onion-smash.jpg', alt: 'An editorial spread for the Onion Smash Burger' },
      { src: '25-spread-miso-bacon.jpg', alt: 'An editorial spread for the Miso Bacon Burger' },
      { src: '26-spread-spicy-bacon.jpg', alt: 'An editorial spread for the Spicy Bacon BBQ Burger' },
      { src: '27-spread-pulled-pork.jpg', alt: 'An editorial spread for the Pulled Pork Burger' },
      { src: '28-spread-le-coq.jpg', alt: 'An editorial spread for the Le COQ Buffalo Chicken Burger' },
      { src: '29-spread-smash-o-filet.jpg', alt: 'An editorial spread for the SMASH O Filet, the fish burger' },
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
      { src: '07-two-trays.jpg', alt: 'A guest carrying two trays of burgers across the room' },
      { src: '08-in-profile.jpg', alt: 'A guest holding a wrapped burger, seen in profile' },
      { src: '09-share-a-table.jpg', alt: 'Two guests eating wrapped burgers side by side' },
      { src: '10-mid-bite.jpg', alt: 'A guest mid-bite against the papered wall' },
      { src: '11-at-the-booth.jpg', alt: 'A guest eating at the booth, tray in front of them' },
      { src: '12-after-hours.jpg', alt: 'Two guests in the room after dark' },
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
      { src: '09-the-brunch-table.jpg', alt: 'A brunch table spread across several plates' },
      { src: '10-unwrapped.jpg', alt: 'A burger opened out of its wrapper' },
      { src: '11-waffles-and-eggs.jpg', alt: 'Waffles, eggs and salsa verde on one plate' },
      { src: '12-with-the-bags.jpg', alt: 'A burger held over a table of red Le SMASH bags' },
      { src: '13-from-above.jpg', alt: 'The brunch table photographed from above, hands reaching in' },
      { src: '14-a-busy-table.jpg', alt: 'A full table mid-meal' },
      { src: '15-tenders-on-the-tray.jpg', alt: 'Chicken tenders and dips on a steel tray at the counter' },
      { src: '16-the-cheese.jpg', alt: 'A cheeseburger close enough to count the layers' },
      { src: '17-four-wrapped.jpg', alt: 'Four wrapped burgers held in two arms' },
      { src: '18-at-the-counter.jpg', alt: 'A hand lifting a tender off the tray at the counter' },
      { src: '19-chicken-and-frites.jpg', alt: 'The chicken burger with frites in the foreground' },
      { src: '20-steak-frites.jpg', alt: 'Steak frites, sauce being poured over' },
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
      { src: '07-through-the-window.jpg', alt: 'The kitchen seen through the pass window mid-service' },
      { src: '08-the-bowl.jpg', alt: 'A cook holding out a bowl heaped with frites' },
      { src: '09-smash-smash-smash.jpg', alt: 'A staff shirt reading Smash, Smash, Smash from behind' },
      { src: '10-the-shirt.jpg', alt: 'The hand-lettered Le SMASH shirt from behind' },
      { src: '11-the-sauce.jpg', alt: 'A cook stirring a tray of sauce in the kitchen' },
      { src: '12-at-the-plancha.jpg', alt: 'A cook in whites at the plancha, mid-service' },
    ],
  },
  {
    slug: 'collaborations',
    name: 'Collaborations',
    blurb: 'Work with other brands, restaurants, artists and venues.',
    ratio: '4x5',
    fit: 'contain',
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
      { src: '01-napoleon.jpg', alt: 'Napoleon crossing the Alps, holding a burger', fit: 'contain' },
      { src: '02-on-the-way-to-smash.jpg', alt: 'Four figures on a zebra crossing, after Abbey Road', fit: 'contain' },
      { src: '03-tiny-hands.jpg', alt: 'Tiny hands, big appetite: a child eating a burger among stickers', fit: 'contain' },
      { src: '04-the-shirts.jpg', alt: 'The staff and merchandise shirts, front and back', fit: 'contain' },
      { src: '05-the-mugs.jpg', alt: 'Two Le SMASH mugs, black and white', fit: 'contain' },
      { src: '06-the-wrap.jpg', alt: 'The monogrammed burger wrap paper, folded' },
      { src: '07-the-monogram.jpg', alt: 'The Le monogram set as a repeating tile', fit: 'contain' },
      { src: '08-out-for-delivery.jpg', alt: 'A car boot full of Le SMASH takeaway bags' },
      { src: '09-smash-now-tee.jpg', alt: 'The Smash Now, Thank Us Later shirt, worn', fit: 'contain' },
      { src: '10-the-monogram-red.jpg', alt: 'The Le monogram in cream on red', fit: 'contain' },
      { src: '11-the-monogram-outline.jpg', alt: 'The Le monogram in red and cream outline on black', fit: 'contain' },
      { src: '12-fries-before-guys.jpg', alt: 'The Fries Before Guys shirt, worn, holding loaded frites' },
      { src: '13-the-bag.jpg', alt: 'A Le SMASH takeaway bag on the counter' },
      { src: '14-the-menu-board-one.jpg', alt: 'The brunch menu board, every dish photographed', fit: 'contain' },
      { src: '15-the-menu-board-two.jpg', alt: 'The main menu board, every dish photographed', fit: 'contain' },
    ],
  },
];

/** Total pictures in the archive, for the gallery standfirst. */
export const GALLERY_COUNT = GALLERY_SECTIONS.reduce((n, s) => n + s.items.length, 0);
