/*
 * The crew. Photos are the ten crew/kitchen frames the client supplied.
 *
 * name / role / quote are null on purpose: the client has not sent them yet and
 * nothing here is guessed. Fill a field in and it appears on the profile panel;
 * leave it null and the panel simply shows the photo and a "Crew" tag.
 * (Some jackets in the photos carry printed names — that is not a substitute
 * for the client confirming who is who and how they want to be credited.)
 */
export interface TeamMember {
  photo: string;
  alt: string;
  name: string | null;
  role: string | null;
  quote: string | null;
}

export const TEAM: TeamMember[] = [
  { photo: '/media/team/1.jpg', alt: 'A smiling cook in a Le SMASH chef jacket and backwards blue cap, slicing a bun', name: null, role: null, quote: null },
  { photo: '/media/team/chef.jpg', alt: 'A chef in a white jacket reaching up to the pass in a busy kitchen', name: null, role: null, quote: null },
  { photo: '/media/team/post-1-3.jpg', alt: 'Two cooks laughing together as they season a bowl of fries', name: null, role: null, quote: null },
  { photo: '/media/team/onion-smash-copy.jpg', alt: 'A cook seen from behind pressing smash patties on the flat-top grill', name: null, role: null, quote: null },
  { photo: '/media/team/11.jpg', alt: 'A cook in a blue cap and Le SMASH jacket holding a bun, looking down', name: null, role: null, quote: null },
  { photo: '/media/team/post-1-4.jpg', alt: 'A cook in a black Le SMASH tee stirring a bowl of red chilli sauce in the kitchen', name: null, role: null, quote: null },
  { photo: '/media/team/2.jpg', alt: 'A team member in a white tee tossing a cloud of fries above a steel bowl', name: null, role: null, quote: null },
  { photo: '/media/team/4.jpg', alt: 'A Le SMASH chef jacket with the embroidered logo, a stack of branded paper in front', name: null, role: null, quote: null },
  { photo: '/media/team/1-copy.jpg', alt: 'Hands in black gloves passing two burgers and fries on steel trays', name: null, role: null, quote: null },
  { photo: '/media/team/5.jpg', alt: 'A crew member in a Le SMASH tee watching the open kitchen flame up through the pass', name: null, role: null, quote: null },
];
