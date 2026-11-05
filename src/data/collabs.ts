/**
 * Collaborations — Le SMASH with other Yangon brands, venues and artists.
 *
 * Every string below is transcribed from a poster or photo in public/media
 * (the source file is named beside each entry). Nothing is inferred: where a
 * poster prints no year, the date carries none; where it prints no place,
 * `place` is null. `blurb` is only ever a near-quote of the artwork.
 *
 * Image sizes are the real pixel sizes (media-manifest.json for /media/...
 * files, read from the files for /media/gallery/...).
 */

export interface CollabImage {
  src: string;
  w: number;
  h: number;
  alt: string;
}

export interface Collab {
  id: string;
  /** Name as printed on the artwork. */
  partner: string;
  /** Short chip for the wall tag (partner names, nothing else). */
  title: string;
  date: string | null;
  place: string | null;
  poster: CollabImage;
  /** Extra artwork + event photos shown in the detail strip. */
  photos: CollabImage[];
  blurb: string | null;
  /** Further printed facts, label/value. */
  details: { label: string; value: string }[];
  /** Placement on the desktop wall, in units of wall width (100 = full width). */
  wall: { x: number; y: number; w: number; r: number; z: number; staple?: boolean };
}

/** The names that spin after the "×" in the opening. Every one is on a poster. */
export const PARTNERS = ['Blind Tiger', 'Ah-so', 'Britto’s', 'TagU', 'RTH', 'Ellie’s', 'Ar-T'];

export const COLLABS: Collab[] = [
  {
    // campaigns/blind-tiger-x-le-smash-pop-up-stand-and-announcement.jpg + gallery/collaborations/01-blind-tiger.jpg
    id: 'blind-tiger',
    partner: 'Blind Tiger',
    title: 'Sunset Ibiza',
    date: 'August 9th',
    place: 'Crystal Tower, Ground Floor (Junction Square)',
    poster: {
      src: '/media/campaigns/blind-tiger-x-le-smash-pop-up-stand-and-announcement.jpg', w: 1080, h: 1350,
      alt: 'Poster: Welcome to Sunset Ibiza, August 9th, with a white Blind Tiger cat holding a burger.',
    },
    photos: [
      {
        src: '/media/gallery/collaborations/01-blind-tiger.jpg', w: 960, h: 1200,
        alt: 'The invitation version of the Sunset Ibiza poster: You’re invited to Sunset Ibiza, August 9th, Le SMASH and Blind Tiger.',
      },
    ],
    blurb: 'Sunsets, sips, & beats.',
    details: [
      { label: 'Time', value: '3 PM – 8 PM' },
      { label: 'Special guests', value: 'DJ YUU & KJ' },
      { label: 'Beer', value: 'Buy 1 get 1 free, 3 PM – 5 PM (with Tuborg)' },
    ],
    wall: { x: 3, y: 5, w: 24, r: -4, z: 3 },
  },
  {
    // gallery/collaborations/02-ah-so.jpg
    id: 'ah-so',
    partner: 'Bar Ah-so',
    title: 'Sip & Smash',
    date: '02.08.2025',
    place: 'Le SMASH, Junction Square',
    poster: {
      src: '/media/gallery/collaborations/02-ah-so.jpg', w: 960, h: 1200,
      alt: 'Poster: Sip & Smash, Le SMASH × Bar Ah-so, 02.08.2025, 11 AM onwards, Junction Square.',
    },
    photos: [],
    blurb: null,
    details: [{ label: 'Time', value: '11 AM onwards' }],
    wall: { x: 8, y: 31, w: 23, r: 3, z: 4, staple: true },
  },
  {
    // campaigns/le-smash-x-britto-s-invitation.jpg (gallery/collaborations/03-brittos.jpg is the same artwork, smaller)
    id: 'brittos-red-white',
    partner: 'Britto’s',
    title: 'Red & White Party',
    date: 'Dec 5, 2025 (Friday)',
    place: 'Junction Square',
    poster: {
      src: '/media/campaigns/le-smash-x-britto-s-invitation.jpg', w: 933, h: 1400,
      alt: 'Poster: Le SMASH × Britto’s, Red & White Party at Junction Square, Dec 5 2025, with a hand holding a red Le SMASH bag on a train ring.',
    },
    photos: [],
    blurb: null,
    details: [
      { label: 'Time', value: '6:00 PM onwards' },
      { label: 'DJ', value: 'DJ Noizzy Beat' },
    ],
    wall: { x: 27, y: 1, w: 22, r: 2.5, z: 5 },
  },
  {
    // campaigns/dj-final-1jpg.jpg, campaigns/ticket.jpg, gallery/collaborations/04-brittos-x-tagu.jpg,
    // events/copy-of-10-1.jpg, copy-of-33.jpg, copy-of-38.jpg (all three photos carry the Britto's × Le SMASH × TagU mark)
    id: 'brittos-tagu',
    partner: 'Britto’s × TagU',
    title: 'Lights down, volume up!',
    date: 'Saturday, 20 December 2025',
    place: null,
    poster: {
      src: '/media/campaigns/dj-final-1jpg.jpg', w: 1080, h: 1350,
      alt: 'Poster: Britto’s, Le SMASH and TagU present Lights down, volume up! Meet the DJs, Saturday December 20, with DJs Triple T and Noizzy Beat.',
    },
    photos: [
      {
        src: '/media/campaigns/ticket.jpg', w: 600, h: 1050,
        alt: 'Complimentary ticket: the door opens at 4 PM, Britto’s × Le SMASH × TagU, Saturday 20 December 2025, not for sale.',
      },
      {
        src: '/media/gallery/collaborations/04-brittos-x-tagu.jpg', w: 800, h: 1200,
        alt: 'Exclusive Event poster: Britto’s × Le SMASH × TagU, 4:00 PM to 6:00 PM, 20th December 2025, one free beer for every guest.',
      },
      {
        src: '/media/events/copy-of-10-1.jpg', w: 1600, h: 1067,
        alt: 'Guests reaching for shots at a table in the Le SMASH carriage, Britto’s × Le SMASH × TagU mark along the bottom.',
      },
      {
        src: '/media/events/copy-of-33.jpg', w: 1600, h: 1067,
        alt: 'Three guests raising shots in front of the red wall mural, Britto’s × Le SMASH × TagU mark along the bottom.',
      },
      {
        src: '/media/events/copy-of-38.jpg', w: 1600, h: 1067,
        alt: 'A crowd toasting with shots at the bar, Britto’s × Le SMASH × TagU mark along the bottom.',
      },
    ],
    blurb: 'Lights down, volume up!',
    details: [
      { label: 'Meet the DJs', value: '4:00 PM to 9:00 PM' },
      { label: 'DJs', value: 'Triple T and Noizzy Beat' },
      { label: 'Exclusive event poster', value: '4:00 PM to 6:00 PM, one free beer for every guest' },
      { label: 'Ticket', value: 'The door opens @ 4 PM. Complimentary ticket, not for sale.' },
    ],
    wall: { x: 63, y: 33, w: 25, r: -3, z: 6, staple: true },
  },
  {
    // campaigns/lesmash-pop-up.jpg (gallery/events/04-pop-up-at-trt.jpg is a crop of the same artwork)
    id: 'rth',
    partner: 'RTH',
    title: 'Le SMASH Pop-up',
    date: 'April 3–12, 2025',
    place: 'RTH Junction Square',
    poster: {
      src: '/media/campaigns/lesmash-pop-up.jpg', w: 1025, h: 1400,
      alt: 'Poster: Le SMASH Pop-up @ RTH Junction Square, April 3–12, two hands holding the Le SMASH and RTH cards.',
    },
    photos: [],
    blurb: null,
    details: [],
    wall: { x: 75, y: 2, w: 21, r: 4, z: 3 },
  },
  {
    // campaigns/announcement.jpg
    id: 'ellies',
    partner: 'Ellie’s',
    title: 'Chit Thu Bazaar',
    date: '1st, 2nd March 2026',
    place: 'The Secretariat, Yangon',
    poster: {
      src: '/media/campaigns/announcement.jpg', w: 1080, h: 1350,
      alt: 'Save the date poster: Le SMASH × Ellie’s at Chit Thu Bazaar, 1st and 2nd March 2026, The Secretariat, Yangon, Booth FB-24.',
    },
    photos: [],
    blurb: null,
    details: [
      { label: 'Time', value: '3:00 PM to 10:00 PM' },
      { label: 'Booth', value: 'No: FB-24' },
    ],
    wall: { x: 50, y: 5, w: 23, r: -2.5, z: 2, staple: true },
  },
  {
    // campaigns/ar-t-s-scenes.jpg (gallery/collaborations/05-ar-t.jpg is the same artwork, smaller)
    id: 'ar-t',
    partner: 'AR-T',
    title: 'Chit Pay Par (official music video)',
    date: null,
    place: 'Filmed at Le SMASH',
    poster: {
      src: '/media/campaigns/ar-t-s-scenes.jpg', w: 1400, h: 933,
      alt: 'Poster: Have you caught the beautiful scenes in AR-T’s latest Official Music Video, “Chit Pay Par”? A man smiles at his phone in the Le SMASH dining room, with three stills from the video below.',
    },
    photos: [],
    blurb: 'Some of the most memorable moments from this hit track were filmed right here at Le SMASH.',
    details: [
      { label: 'The invitation', value: 'Come and hang out at Le SMASH. Feel the atmosphere, soak in the music, and enjoy the SMASH experience in person.' },
    ],
    wall: { x: 33, y: 32, w: 28, r: -2, z: 4 },
  },
];
