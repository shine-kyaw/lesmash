/**
 * Music videos with scenes filmed at Le SMASH. Client revision 01 (21 Nov 2026)
 * asks for these on their own tab, apart from Collaborations.
 *
 * Only official uploads, and only ones confirmed to feature Le SMASH. The client
 * also named a Wine Su video; it goes in once they confirm which one it is.
 * Posters are YouTube's own frames, saved locally so the page loads nothing from
 * YouTube until someone presses play.
 */

export interface MusicVideo {
  id: string;
  /** YouTube video id of the official upload. */
  youtube: string;
  artist: string;
  title: string;
  /** Title as written in Burmese, when the release carries one. */
  titleMy?: string;
  /** Date the official video went up. */
  date: string;
  poster: { src: string; w: number; h: number };
  /** The artist's or Le SMASH's own artwork for the release, if any. */
  artwork?: { src: string; w: number; h: number; alt: string };
  note: string;
}

export const VIDEOS: MusicVideo[] = [
  {
    id: 'chit-pay-par',
    youtube: 'CcG4Nragmiw',
    artist: 'AR-T',
    title: 'Chit Pay Par',
    titleMy: 'ချစ်ပေးပါ',
    date: '22 Mar 2026',
    poster: { src: '/media/music/chit-pay-par.jpg', w: 1280, h: 720 },
    artwork: {
      src: '/media/campaigns/ar-t-s-scenes.jpg', w: 1400, h: 933,
      alt: 'Le SMASH poster for the video: a man smiles at his phone in the Le SMASH dining room, with three stills from the video below.',
    },
    note: 'Some of the most memorable moments from this track were filmed right here at Le SMASH.',
  },
];
