/**
 * Merch showcase data. Showcase only: no prices, sizes or buy buttons (client
 * decision). Names are only ones the client used. Notes describe what is
 * visible in the artwork, nothing more.
 *
 * Garment faces are product shots composed by scripts/merch-cutouts.mjs
 * (public/media/merch/cut/). "Worn" views are the client's own model photos.
 */
export interface WornView {
  label: string;
  src: string;
  /** object-position of the crop (the tee mockup holds four garments in one file). */
  pos: string;
  /** aspect ratio of the shown crop, width / height */
  ar: number;
  alt: string;
}

export interface Garment {
  id: string;
  name: string;
  tag: string;
  note: string;
  front: string;
  back: string;
  /** face image size, so the rack keeps real proportions */
  w: number;
  h: number;
  /** which side faces the viewer on the rail */
  rest: 'front' | 'back';
  frontAlt: string;
  backAlt: string;
  worn: WornView[];
}

const TEES = '/media/merch/le-smash-t-shirt-mockup.jpg';
const TEE_AR = 400 / 542;
const CUT = '/media/merch/cut/';

export const GARMENTS: Garment[] = [
  {
    id: 'tee-white', name: 'Graphic Tee', tag: 'White',
    note: 'The Le SMASH monogram, mirrored, with SMASH in red across the back. A small Le Burgers & Co. mark on the chest.',
    front: CUT + 'tee-white-front.webp', back: CUT + 'tee-white-back.webp', w: 648, h: 700, rest: 'back',
    frontAlt: 'White Graphic Tee, front, with a small Le Burgers & Co. mark on the chest.',
    backAlt: 'White Graphic Tee, back, the Le SMASH monogram in black with SMASH in red.',
    worn: [
      { label: 'Back', src: TEES, pos: '0% 50%', ar: TEE_AR, alt: 'Model in the white Graphic Tee seen from behind, the monogram across the back.' },
      { label: 'Front', src: TEES, pos: '33.333% 50%', ar: TEE_AR, alt: 'Model in the white Graphic Tee seen from the front.' },
    ],
  },
  {
    id: 'tee-black', name: 'Graphic Tee', tag: 'Black',
    note: 'The same monogram in white with SMASH in red on the back, and the small mark on the chest.',
    front: CUT + 'tee-black-front.webp', back: CUT + 'tee-black-back.webp', w: 648, h: 700, rest: 'back',
    frontAlt: 'Black Graphic Tee, front, with a small Le Burgers & Co. mark on the chest.',
    backAlt: 'Black Graphic Tee, back, the Le SMASH monogram in white with SMASH in red.',
    worn: [
      { label: 'Back', src: TEES, pos: '66.667% 50%', ar: TEE_AR, alt: 'Model in the black Graphic Tee seen from behind.' },
      { label: 'Front', src: TEES, pos: '100% 50%', ar: TEE_AR, alt: 'Model in the black Graphic Tee seen from the front.' },
    ],
  },
  {
    id: 'tee-pixel', name: 'Graphic Tee', tag: 'Black · Pixel flame',
    note: 'A red flame built from handwritten squares across the back, and a small flame mark on the chest.',
    front: CUT + 'tee-pixel-front.webp', back: CUT + 'tee-pixel-back.webp', w: 647, h: 700, rest: 'back',
    frontAlt: 'Black Graphic Tee, front, with a small red flame mark on the chest.',
    backAlt: 'Black Graphic Tee, back, a red pixel flame made of handwritten squares.',
    worn: [
      { label: 'Back', src: '/media/merch/1.jpg', pos: '0% 50%', ar: 708 / 1083, alt: 'Model in the black tee seen from behind, the red pixel flame across the back.' },
      { label: 'Front', src: '/media/merch/1.jpg', pos: '100% 50%', ar: 888 / 1083, alt: 'Model in the black tee seen from the front with the small flame on the chest.' },
    ],
  },
  {
    id: 'jersey', name: 'YGN Jersey', tag: 'Basketball',
    note: 'YGN 01 on the front with red and white diagonal stripes, LAWRENCE 01 on the back.',
    front: CUT + 'jersey-front.webp', back: CUT + 'jersey-back.webp', w: 423, h: 820, rest: 'front',
    frontAlt: 'Black basketball jersey, front, YGN 01 in white with red and white diagonal stripes.',
    backAlt: 'Black basketball jersey, back, a red 01 above LAWRENCE.',
    worn: [],
  },
];

export interface LineItem {
  id: string;
  name: string;
  note: string;
  src: string;
  w: number;
  h: number;
  /** glow colour (r g b) when this piece is in front */
  glow: string;
  alt: string;
}

const P = '/media/merch/cut/';
export const LINEUP: LineItem[] = [
  { id: 'mug-white', name: 'Mugs', note: 'White mug, red SMASH NOW artwork.', src: P + 'mug-white.webp', w: 630, h: 582, glow: '255 236 214', alt: 'A white Le SMASH mug tipped on its side with red and black SMASH NOW lettering.' },
  { id: 'cup-monogram', name: 'Cups', note: 'Clear takeaway cup with the monogram.', src: P + 'cup-1.webp', w: 565, h: 686, glow: '255 150 160', alt: 'A clear takeaway cup with the cream Le SMASH monogram printed on it.' },
  { id: 'tote', name: 'Tote Bag', note: 'Red, with the Le SMASH lockup.', src: P + 'tote-bag.webp', w: 442, h: 753, glow: '255 70 64', alt: 'A red tote bag with black straps and the Le Burgers & Co. SMASH lockup.' },
  { id: 'cup-smash', name: 'Cups', note: 'Clear takeaway cup with SMASH.', src: P + 'cup-2.webp', w: 565, h: 686, glow: '255 150 160', alt: 'A clear takeaway cup with SMASH printed in cream down the side.' },
  { id: 'mug-black', name: 'Mugs', note: 'Black mug, pixel artwork.', src: P + 'mug-black.webp', w: 631, h: 597, glow: '255 80 70', alt: 'A black Le SMASH mug with white and red pixel artwork.' },
];
