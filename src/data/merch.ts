/**
 * Merch showcase data. Showcase only: no prices, sizes or buy buttons (client
 * decision). Names are only ones the client used or that are printed on the
 * item. Notes describe what is visible in the artwork, nothing more.
 */
export interface MerchView {
  label: string;
  src: string;
  /** object-position of the crop (the tee mockup holds four garments in one file). */
  pos: string;
  /** aspect ratio of the shown view, width / height */
  ar: number;
  alt: string;
}

export interface Garment {
  id: string;
  name: string;
  /** colour / side tag shown under the name */
  tag: string;
  note: string;
  views: MerchView[];
  /** index into `views` shown on the rack card and opened first */
  start: number;
}

const TEES = '/media/merch/le-smash-t-shirt-mockup.jpg';
const TEE_AR = 400 / 542;

const whiteViews: MerchView[] = [
  { label: 'Back', src: TEES, pos: '0% 50%', ar: TEE_AR, alt: 'Model in a white Le SMASH tee seen from behind, the Le SMASH monogram with red SMASH across the back.' },
  { label: 'Front', src: TEES, pos: '33.333% 50%', ar: TEE_AR, alt: 'Model in a white tee seen from the front with a small Le Burgers & Co. mark on the chest.' },
];
const blackViews: MerchView[] = [
  { label: 'Back', src: TEES, pos: '66.667% 50%', ar: TEE_AR, alt: 'Model in a black Le SMASH tee seen from behind, the monogram in white with red SMASH across the back.' },
  { label: 'Front', src: TEES, pos: '100% 50%', ar: TEE_AR, alt: 'Model in a black tee seen from the front with a small Le Burgers & Co. mark on the chest.' },
];
const pixelViews: MerchView[] = [
  { label: 'Back', src: '/media/merch/1.jpg', pos: '0% 50%', ar: 800 / 1083, alt: 'Model in a black tee seen from behind, a red pixel flame of handwritten squares across the back.' },
  { label: 'Front', src: '/media/merch/1.jpg', pos: '100% 50%', ar: 800 / 1083, alt: 'Model in a black tee seen from the front with a small red flame mark on the chest.' },
  { label: 'Flat', src: '/media/merch/2.jpg', pos: '50% 50%', ar: 1, alt: 'The black tee laid flat, showing the red pixel flame artwork on the back.' },
];
const jerseyViews: MerchView[] = [
  { label: 'Front', src: '/media/merch/le-smash-jersey-final-1.jpg', pos: '10% 50%', ar: 0.74, alt: 'Black basketball jersey on a hanger with YGN 01 in white and red and white diagonal stripes.' },
  { label: 'Back', src: '/media/merch/le-smash-jersey-final-1.jpg', pos: '92% 50%', ar: 0.74, alt: 'Black basketball jersey on a hanger, back printed with a red 01 and LAWRENCE.' },
];

export const GARMENTS: Garment[] = [
  { id: 'tee-white-back', name: 'Graphic Tee', tag: 'White · Back', note: 'The Le SMASH monogram, mirrored, with SMASH in red across the back.', views: whiteViews, start: 0 },
  { id: 'tee-white-front', name: 'Graphic Tee', tag: 'White · Front', note: 'A small Le Burgers & Co. mark on the chest.', views: whiteViews, start: 1 },
  { id: 'tee-black-back', name: 'Graphic Tee', tag: 'Black · Back', note: 'The same monogram in white, SMASH in red.', views: blackViews, start: 0 },
  { id: 'tee-black-front', name: 'Graphic Tee', tag: 'Black · Front', note: 'Black tee, small Le mark on the chest.', views: blackViews, start: 1 },
  { id: 'tee-pixel', name: 'Graphic Tee', tag: 'Black · Pixel flame', note: 'A red flame built from handwritten squares on the back, a small flame mark on the chest.', views: pixelViews, start: 0 },
  { id: 'jersey', name: 'YGN Jersey', tag: 'Basketball', note: 'YGN 01 on the front, LAWRENCE 01 on the back.', views: jerseyViews, start: 0 },
];

export interface LineItem {
  id: string;
  name: string;
  note: string;
  src: string;
  /** focal point of the crop, also used as the zoom origin */
  pos: string;
  zoom: number;
  alt: string;
}

export const LINEUP: LineItem[] = [
  { id: 'mug-white', name: 'Mugs', note: 'White mug, red SMASH NOW artwork.', src: '/media/merch/black-mockup-copy-2.jpg', pos: '30% 52%', zoom: 1.9, alt: 'A white Le SMASH mug tipped on its side with red and black SMASH NOW lettering.' },
  { id: 'cup-monogram', name: 'Cups', note: 'Clear takeaway cup with the monogram.', src: '/media/merch/cup-design-1.jpg', pos: '48% 55%', zoom: 1.9, alt: 'A clear takeaway cup on red with the cream Le SMASH monogram printed on it.' },
  { id: 'tote', name: 'Tote Bag', note: 'Red, with the Le SMASH lockup.', src: '/media/merch/le-smash-totebag-3.jpg', pos: '50% 60%', zoom: 1.8, alt: 'A red tote bag with the Le Burgers & Co. SMASH lockup, hanging on a chrome chair.' },
  { id: 'cup-smash', name: 'Cups', note: 'Clear takeaway cup with SMASH.', src: '/media/merch/cup-design-2.jpg', pos: '48% 55%', zoom: 1.9, alt: 'A clear takeaway cup on red with SMASH printed in cream down the side.' },
  { id: 'mug-black', name: 'Mugs', note: 'Black mug, pixel artwork.', src: '/media/merch/black-mockup-copy-2.jpg', pos: '70% 55%', zoom: 1.9, alt: 'A black Le SMASH mug with white and red pixel artwork.' },
];
