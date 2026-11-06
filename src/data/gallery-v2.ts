/**
 * Gallery v2 content. Every file here is a real Le SMASH image in
 * public/media/. Dimensions come from src/data/media-manifest.json. Alt text
 * and captions describe only what is in frame or printed on the poster.
 */
export interface Pic {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** CSS object-position for cropped frames. */
  pos?: string;
}

export interface Poster extends Pic {
  /** Short label for the ring caption, taken from the poster itself. */
  title: string;
}

/* ---- 1. Showcase: eight pairs, in the order the deck shows them -------- */
const P = (src: string, w: number, h: number, alt: string, pos?: string): Pic => ({ src, w, h, alt, pos });

export const SHOWCASE: [Pic, Pic][] = [
  [
    P('/media/campaigns/post-1-6.jpg', 1080, 1080, 'A guest from behind doing a pull-up on a red-strapped ring handle inside the subway-carriage dining room.'),
    P('/media/highlights/5-1-copy.jpg', 1500, 1500, 'The carriage room at a busy moment: red bench seats, ring handles overhead, and a guest hanging from one.'),
  ],
  [
    P('/media/highlights/1-f.jpg', 1080, 1350, 'A guest in a blue cap about to bite into a smash burger with melted cheese and slaw, eyes wide.', '50% 40%'),
    P('/media/highlights/6.jpg', 1080, 1080, 'Three friends laughing on a red sofa at Le SMASH, one holding a book and a Le SMASH paper bag beside her.'),
  ],
  [
    P('/media/home/post-1-2.jpg', 1080, 1080, 'A team member seen from behind in a cream Le SMASH tee, tying his apron in the kitchen.'),
    P('/media/team/post-1-3.jpg', 1080, 1080, 'A chef in whites reaching up to the pass while the kitchen works behind him.'),
  ],
  [
    P('/media/team/post-1-4.jpg', 1080, 1080, 'A cook in a black Le SMASH tee sieving a bowl of chilli paste in the kitchen.'),
    P('/media/highlights/2.jpg', 1600, 1600, 'A hand dipping a fry into a small steel dish of red sauce.', '40% 40%'),
  ],
  [
    P('/media/team/1-copy.jpg', 1080, 1080, 'Two steel trays held out across the pass, each with a smash burger and a pile of fries.'),
    P('/media/dishes/potato-rosti-cured-salmon.jpg', 835, 587, 'A crisp potato rosti topped with cured salmon, cream and micro herbs on a grey plate.', '50% 55%'),
  ],
  [
    P('/media/highlights/l3.jpg', 1080, 1080, 'An armful of burgers wrapped in Le SMASH monogram paper, held against a black tee.'),
    P('/media/highlights/7.jpg', 1600, 1067, 'A table of brunch dishes: eggs, steak, waffle and fried chicken, a salad, and hands reaching in.', '45% 50%'),
  ],
  [
    P('/media/highlights/8.jpg', 1600, 1067, 'The glowing SMASH sign curving over the bar, with staff behind it and guests queueing at the counter.', '45% 40%'),
    P('/media/highlights/9.jpg', 1600, 1067, 'A table of shared plates in warm light: guacamole and chips, shakshuka, burrata and a salad.', '50% 50%'),
  ],
  [
    P('/media/highlights/le-smash-restaurant-ring-ride-copy.jpg', 1024, 1536, 'A guest from behind holding a Le SMASH paper bag up on a ring handle in the carriage room.', '50% 25%'),
    P('/media/highlights/mhk2539-copy.jpg', 1600, 1067, 'The carriage room mirrored in a window: red benches, ring handles and guests at the bar.', '40% 50%'),
  ],
];

/* ---- 2. Campaign posters (the ring) ----------------------------------- */
const Q = (file: string, w: number, h: number, title: string, alt: string): Poster => ({
  src: `/media/campaigns/${file}`, w, h, title, alt,
});

export const POSTERS: Poster[] = [
  Q('grand-opening-fi.jpg', 1000, 1400, 'Grand opening', 'Poster: Join us for the Official Grand Opening, 3rd Dec 2025, with a halftone photo of a hand holding a cheeseburger.'),
  Q('invitation.jpg', 918, 1400, 'Soft opening invitation', 'Invitation to the Le SMASH Soft Opening, November 16th to December 3rd, “Please feel free to stop by anytime”, on a red card in an envelope.'),
  Q('pull-up-ig-size.jpg', 1080, 1350, 'The Pull-up Challenge', 'Pull-up Challenge poster: 4+ pull-ups for free fries, 8+ pull-ups for free Animal Frites, until end of December.'),
  Q('a5.jpg', 987, 1400, 'Get a free tee', 'Poster with a close-up of a bite into a saucy fried-chicken burger and the line "Get a free tee".'),
  Q('father-s-day-jpg-1.jpg', 1080, 1350, 'Father’s Day', 'Father’s Day poster: a child’s hands holding a wrapped Le SMASH burger in a polaroid frame.'),
  Q('post-1-6.jpg', 1080, 1080, 'Ring-handle pull-up', 'A guest doing a pull-up on a ring handle in the carriage room.'),
  Q('le-smash-x-britto-s-invitation.jpg', 933, 1400, 'Red & White Party', 'Le SMASH x Britto’s invitation: Red & White Party at Junction Square, Dec 5, 6:00 PM onwards, DJ Noizzy Beat.'),
  Q('dj-final-1jpg.jpg', 1080, 1350, 'Meet the DJs', 'Poster for “Meet the DJs” with Britto’s and Tagu Somaek, 4:00 PM to 9:00 PM, Saturday, December 20.'),
  Q('ticket.jpg', 600, 1050, 'The door opens at 4 PM', 'Complimentary ticket, Britto’s x Le SMASH x Tagu Somaek, Saturday 20 December 2025, doors open at 4 PM.'),
  Q('blind-tiger-x-le-smash-pop-up-stand-and-announcement.jpg', 1080, 1350, 'Sunset Ibiza', 'Blind Tiger x Le SMASH poster: Sunset Ibiza, August 9th, 3 PM to 8 PM, with DJ Yuu and KJ.'),
  Q('lesmash-pop-up.jpg', 1025, 1400, 'Pop-up at RTH · April 2025', 'Le SMASH Pop-up at RTH Junction Square poster, April 3–12, 2025, two hands holding the Le SMASH and RTH cards.'),
  Q('announcement.jpg', 1080, 1350, 'Le SMASH x Ellie’s', 'Le SMASH x Ellie’s save the date for Chit Thu Bazaar, 1st and 2nd March 2026, The Secretariat, Yangon, Booth FB-24.'),
  Q('ar-t-s-scenes.jpg', 1400, 933, 'AR-T’s “Chit Pay Par”', 'Landscape poster about AR-T’s official music video “Chit Pay Par”, with scenes filmed at Le SMASH.'),
];

/* ---- 3. Events & nights ------------------------------------------------ */
const E = (file: string, w: number, h: number, alt: string): Pic => ({ src: `/media/events/${file}`, w, h, alt });

export const EVENTS: Pic[] = [
  E('copy-of-10-1.jpg', 1600, 1067, 'Guests at a table in the carriage room reaching for shots from a tray held by a Britto’s host.'),
  E('copy-of-33.jpg', 1600, 1067, 'Three guests toasting with shot glasses in front of the flame mural, a Britto’s tray in hand.'),
  E('copy-of-38.jpg', 1600, 1067, 'A crowd lifting shot glasses together at the bar, motion-blurred in red light.'),
  E('copy-of-mhk2516-copy.jpg', 1600, 1067, 'A DJ in a cap working the decks under neon, a guest looking on behind him.'),
  E('copy-of-mhk2802-copy.jpg', 1600, 1067, 'Five friends in whites and reds giving the camera thumbs-up under the SMASH sign.'),
  E('mhk2601-copy.jpg', 1600, 1067, 'Guests mingling in a long-exposure blur of red and gold light, one holding a can of Coke.'),
  E('mhk2725-copy.jpg', 1067, 1600, 'The Le SMASH shopfront at night, its neon sign lit and guests drinking at tables outside.'),
];

/* ---- 4. From the feed -------------------------------------------------- */
const F = (file: string, w: number, h: number, alt: string): Pic => ({ src: `/media/social/${file}`, w, h, alt });

export const FEED: Pic[] = [
  F('preview.jpg', 1200, 1200, 'Social post collage: potato rösti with cured salmon, a crate of potatoes and fresh salmon, captioned “My kind of therapy”.'),
  F('preview-1.jpg', 1080, 1080, 'Social post collage: chicken and waffle, “No Breakfast, No Problem”, with the kitchen crew at work.'),
  F('pickle-copy.jpg', 600, 1200, 'Le SMASH social post, “Pickle your taste buds”.'),
  F('preview-2.jpg', 1080, 1080, 'Social post collage: a bacon cheeseburger captioned “happiness”, a cook smashing patties, a guest with two burgers on trays, and a Le SMASH paper bag.'),
  F('preview-4.jpg', 1400, 1400, 'Social post collage: “Why Le SMASH?” with beef, onion, pickles and cheese, guest reviews, the carriage room and a bag handover.'),
  F('preview-1-b.jpg', 1200, 1200, 'Social post collage: “Want it, order it, enjoy it”, a guest about to bite a burger beside close-ups of cheeseburgers and fries.'),
  F('preview-5.jpg', 1400, 1081, 'Social post collage: Peri peri chicken with fries, “Bring on the heat”, and African bird’s eye chili.'),
  F('preview-6.jpg', 1080, 1080, 'Social post collage: Burmese lettering, a bite into a saucy chicken burger, a pile of chillies, and a free tee offer.'),
];

/* The nine campaigns on the client's slide, in grid order (5 on top, 4 below). */
const CAMPAIGN_FILES = [
  'blind-tiger-x-le-smash-pop-up-stand-and-announcement.jpg',
  'lesmash-pop-up.jpg',
  'dj-final-1jpg.jpg',
  'pull-up-ig-size.jpg',
  'invitation.jpg',
  'grand-opening-fi.jpg',
  'le-smash-x-britto-s-invitation.jpg',
  'a5.jpg',
  'father-s-day-jpg-1.jpg',
];
export const CAMPAIGNS: Poster[] = CAMPAIGN_FILES.map(
  (f) => POSTERS.find((p) => p.src.endsWith('/' + f))!,
);
