import type { SourceKey } from './sources'
import type { MediaId } from './media'

export interface Fact {
  label: string
  value: string
  source: SourceKey
}

/* ------------------------------------------------------------------ */
/* Property-wide facts (NOT booking inventory)                          */
/* ------------------------------------------------------------------ */
export const PROPERTY = {
  name: 'Vimal Resort & Entertainment Park',
  shortName: 'VIMAL',
  kannadaName: 'ವಿಮಲ ರೆಸಾರ್ಟ್',
  tagline: 'Where Every Journey Becomes a Memory',
  region: 'Gadag · North Karnataka',
  facts: [
    { label: 'Property', value: '23 acres', source: 'netlify' },
    { label: 'Luxury rooms', value: '105', source: 'netlify' },
    { label: 'Nature tents', value: '15', source: 'netlify' },
    { label: 'Adventure park', value: '2 acres · 20+ activities', source: 'netlify' },
    { label: 'Trees', value: '1,500+', source: 'netlify' },
    { label: 'Parking', value: '300 cars', source: 'netlify' },
  ] satisfies Fact[],
  trees: [
    { label: 'Sapota', value: '375' },
    { label: 'Guava', value: '320' },
    { label: 'Mango', value: '300' },
    { label: 'Sagwan (teak)', value: '300' },
  ],
}

/* ------------------------------------------------------------------ */
/* Contact                                                              */
/* ------------------------------------------------------------------ */
export const CONTACT = {
  phoneDisplay: '+91 98867 84189',
  phoneHref: 'tel:+919886784189',
  whatsapp: 'https://wa.me/919886784189',
  email: 'vimalresort@gmail.com',
  instagram: '@vimalresort',
  // Netlify address used as primary; MapX gives a different PIN — see inventory.
  address: 'New Bengaluru Highway, Shiratti Road, near Beladadi, Gadag, Karnataka 582101',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Vimal+Resort+Gadag',
  nearby: [
    { place: 'Basaveshwara Statue', km: '12 km' },
    { place: 'Gadag town', km: '11 km' },
    { place: 'Lakkundi Temples', km: '10 km' },
    { place: 'Magadi Bird Sanctuary', km: '30 km' },
    { place: 'Badami', km: '77 km' },
    { place: 'Hampi', km: '120 km' },
  ],
}

/* ------------------------------------------------------------------ */
/* Day packages — published reference prices (MapX tour)               */
/* ------------------------------------------------------------------ */
export const PACKAGES = {
  source: 'mapx' as SourceKey,
  timings: '9:00 am – 5:00 pm',
  taxNote: 'GST as applicable',
  gold: {
    name: 'Gold Package',
    prices: [
      { label: 'Monday – Friday', price: '₹800' },
      { label: 'Sat, Sun & govt. holidays', price: '₹900' },
      { label: 'Children under 12 & seniors over 60', price: '₹600', note: 'Age proof mandatory' },
    ],
    includes: ['Swimming pool', 'Rain dance with music', 'Bamboo tower', 'See-saw & swings', 'Dart & archery', 'Mud games', 'Zorbing balls', 'Indoor games', 'Welcome juice, breakfast, lunch & hi-tea'],
  },
  adventure: {
    name: 'Adventure Package',
    price: '₹400',
    unit: 'per person, add-on',
    includes: ['Zipline', 'Sky cycling', 'Rappelling', 'Net climbing', 'Burma bridge', 'Multi-vines', "Bosun's chair", 'Tyre crossing', 'Tyre wall climbing', 'Ladder walk', 'Zig-zag bridge', 'Bungee trampoline', 'Human gyro', '360° cycling', 'Meltdown ride'],
  },
  extras: [{ label: 'Nylon swimwear', value: 'Mandatory for the pool · rental ₹50 per person' }],
}

/* ------------------------------------------------------------------ */
/* Discover zones                                                       */
/* `pin` is set ONLY where the zone is clearly identifiable in the      */
/* aerial-front photograph. Others are listed, never guessed onto map.  */
/* ------------------------------------------------------------------ */
export interface Zone {
  id: string
  name: string
  kicker: string
  summary: string
  facts: Fact[]
  details?: { text: string; source: SourceKey }[]
  media: MediaId[]
  pin?: { x: number; y: number } // 0–1, relative to aerial-front image
  price?: { text: string; source: SourceKey } | 'enquire'
}

export const ZONES: Zone[] = [
  {
    id: 'pool',
    name: 'Swimming Pool',
    kicker: 'The Water Oasis',
    summary: 'A 5,000 sq. ft. swimming pool with a dedicated rain dance arena alongside.',
    facts: [
      { label: 'Pool', value: '5,000 sq. ft.', source: 'netlify' },
      { label: 'Rain dance', value: 'Dedicated arena', source: 'netlify' },
      { label: 'Swimwear', value: 'Nylon, mandatory · rental ₹50', source: 'mapx' },
    ],
    details: [{ text: 'Pool and rain dance are included in the Gold day package.', source: 'mapx' }],
    media: ['poolFun', 'poolKids', 'mxPool'],
    pin: { x: 0.381, y: 0.383 },
  },
  {
    id: 'adventure',
    name: 'Adventure Park',
    kicker: 'Thrill Meets Serenity',
    summary: 'A dedicated 2-acre park with more than 20 activities, built around a multi-level rope and climbing tower.',
    facts: [
      { label: 'Area', value: '2 acres', source: 'netlify' },
      { label: 'Activities', value: '20+', source: 'netlify' },
      { label: 'Adventure package', value: '₹400 per person (add-on)', source: 'mapx' },
    ],
    details: [
      { text: 'Sky cycling, zip climbing, zipline, giant swing, bungee trampoline, mud race and suspension bridges.', source: 'netlify' },
      { text: 'Age, height and weight limits are not published. Ask the resort before you book.', source: 'netlify' },
    ],
    media: ['adventureAerial', 'zipline', 'ropeBridge', 'zorb'],
    pin: { x: 0.828, y: 0.41 },
    price: { text: '₹400 per person, add-on to a day package', source: 'mapx' },
  },
  {
    id: 'rooms',
    name: 'Luxury Rooms',
    kicker: 'Sanctuary of Comfort',
    summary: 'Rustic architecture with AC, family suites and modern cottage amenities.',
    facts: [
      { label: 'Rooms', value: '105', source: 'netlify' },
      { label: 'Amenities', value: 'AC · family suites', source: 'netlify' },
    ],
    details: [{ text: 'Room categories, occupancy and tariffs are not published.', source: 'mapx' }],
    media: ['roomTwin', 'roomKing2', 'roomKing', 'roomSeating'],
    price: 'enquire',
  },
  {
    id: 'tents',
    name: 'Nature Tents',
    kicker: 'Close to Nature',
    summary: 'Glamping tents for groups and families, set in the green part of the grounds.',
    facts: [{ label: 'Tents', value: '15', source: 'netlify' }],
    media: ['tentExterior', 'tentInterior'],
    price: 'enquire',
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    kicker: 'Vimal Resort Kitchen',
    summary: 'A 2,500 sq. ft. multi-cuisine restaurant serving North Indian, South Indian and Jain dishes.',
    facts: [
      { label: 'Area', value: '2,500 sq. ft.', source: 'netlify' },
      { label: 'Cuisine', value: 'North Indian · South Indian · Jain', source: 'netlify' },
      { label: 'Kitchen', value: 'Pure vegetarian · Jain on request', source: 'mapx' },
    ],
    media: ['mxDiningHall', 'mxRestaurant'],
  },
  {
    id: 'lawn',
    name: 'Marriage Lawn',
    kicker: 'Grand Celebrations',
    summary: 'A 40,000 sq. ft. lawn with pre-built mandap spaces for large Indian weddings.',
    facts: [
      { label: 'Area', value: '40,000 sq. ft.', source: 'netlify' },
      { label: 'Guests', value: '1,000+', source: 'netlify' },
    ],
    media: ['weddingLawn'],
  },
  {
    id: 'halls',
    name: 'Marriage Hall & Banquets',
    kicker: 'Indoor Ceremonies',
    summary: 'A 7,500 sq. ft. marriage hall for main ceremonies, plus 2,500 sq. ft. banquet halls for receptions and corporate events.',
    facts: [
      { label: 'Marriage hall', value: '7,500 sq. ft.', source: 'netlify' },
      { label: 'Banquet halls', value: '2,500 sq. ft.', source: 'netlify' },
    ],
    details: [{ text: 'Seating capacities for the halls are not published.', source: 'netlify' }],
    media: ['marriageHall', 'hallDecorated'],
  },
  {
    id: 'watchtower',
    name: '360° Watchtower',
    kicker: 'Eagle Views',
    summary: 'An observation tower with views across the resort and the surrounding farmland.',
    facts: [{ label: 'View', value: '360°', source: 'netlify' }],
    details: [{ text: 'Photo: a drone view from above the resort, not the view from the tower itself.', source: 'mapx' }],
    media: ['panoAerial'],
  },
]
