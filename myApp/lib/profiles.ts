export type RoundhouseProfile = {
  id: string;
  name: string;
  initials: string;
  kind: 'business' | 'home';
  heroColor: string;
  accentColor: string;
  tagline: string;
  location: string;
};

export const ROUNDHOUSE_PROFILES: RoundhouseProfile[] = [
  {
    id: 'jd-design-studio',
    name: 'JD Design Studio',
    initials: 'JD',
    kind: 'business',
    heroColor: '#315E78',
    accentColor: '#B85F39',
    tagline: 'Thoughtful spaces, built around real life.',
    location: 'Austin, Texas',
  },
  {
    id: 'dmt-design-build',
    name: 'DMT DESIGN BUILD',
    initials: 'DMT',
    kind: 'business',
    heroColor: '#324B3B',
    accentColor: '#B78A3B',
    tagline: 'Design, craft, and construction in one place.',
    location: 'Central Texas',
  },
  {
    id: 'tierney-home',
    name: 'Tierney Home',
    initials: 'TH',
    kind: 'home',
    heroColor: '#8A5947',
    accentColor: '#315E78',
    tagline: 'The living record of home.',
    location: 'Home profile',
  },
];

export function profileById(id?: string | string[]) {
  const value = Array.isArray(id) ? id[0] : id;
  return ROUNDHOUSE_PROFILES.find((profile) => profile.id === value) ?? ROUNDHOUSE_PROFILES[0];
}
