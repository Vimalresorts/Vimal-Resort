/**
 * Space films: short self-playing films for each room type, venue and the
 * restaurant, with the facts and price shown beside them. Cut from real
 * photographs and 360° photos (no AI). Prices only where published.
 */
import type { SourceKey } from './sources'

export interface SpaceFilm {
  id: string
  film: string // file stem in /media/video (…-lg.mp4 / …-sm.mp4)
  kicker: string
  name: string
  style: string
  details: { label: string; value: string; source?: SourceKey }[]
  price: { label: string; value: string; note?: string; source?: SourceKey }
  enquiry: string
}

export interface FilmGroup {
  id: 'stay' | 'play' | 'events' | 'dining'
  title: string
  films: SpaceFilm[]
}

const ENQUIRE = { label: 'Rates', value: 'Enquire for Rates', note: 'Tariffs are not published. The resort confirms rates and availability.' }

export const FILM_GROUPS: Record<FilmGroup['id'], FilmGroup> = {
  stay: {
    id: 'stay',
    title: 'Stay at Vimal',
    films: [
      {
        id: 'twin', film: 'film-room-twin', kicker: 'Luxury Rooms', name: 'Twin Room',
        style: 'Two carved wooden beds with tufted sage headboards, Hampi temple artwork, warm wooden floors and a garden-facing sitting corner.',
        details: [
          { label: 'Beds', value: 'Two double beds (as photographed)' },
          { label: 'Comfort', value: 'Air-conditioned', source: 'netlify' },
          { label: 'Setting', value: 'Rustic architecture, garden windows', source: 'netlify' },
          { label: 'On property', value: '105 luxury rooms', source: 'netlify' },
        ],
        price: ENQUIRE, enquiry: 'a Twin Room',
      },
      {
        id: 'king', film: 'film-room-king', kicker: 'Luxury Rooms', name: 'King Room',
        style: 'A single king bed under a carved, tufted headboard, framed by heritage artwork of Hampi and the fort, with a quiet reading corner by the window.',
        details: [
          { label: 'Beds', value: 'One king bed (as photographed)' },
          { label: 'Comfort', value: 'Air-conditioned', source: 'netlify' },
          { label: 'Family suites', value: 'Available', source: 'netlify' },
          { label: 'On property', value: '105 luxury rooms', source: 'netlify' },
        ],
        price: ENQUIRE, enquiry: 'a King Room',
      },
      {
        id: 'tent', film: 'film-tent', kicker: 'Close to Nature', name: 'Nature Tent',
        style: 'Scalloped white canvas cottages on the lawn: hand-printed interiors, raised floors and private steps, made for families and groups.',
        details: [
          { label: 'Style', value: 'Glamping for groups & families', source: 'netlify' },
          { label: 'On property', value: '15 nature tents', source: 'netlify' },
        ],
        price: ENQUIRE, enquiry: 'a Nature Tent',
      },
    ],
  },
  play: {
    id: 'play',
    title: 'Play',
    films: [
      {
        id: 'zipline', film: 'film-zipline', kicker: 'Adventure Park', name: 'Zipline & Sky Trails',
        style: 'A two-acre adventure park built around a multi-level rope tower: zip over the orchard canopy, cross the bridges and climb the walls.',
        details: [
          { label: 'Park', value: '2 acres · 20+ activities', source: 'netlify' },
          { label: 'Includes', value: 'Zipline, sky cycling, rappelling, Burma bridge, net climbing…', source: 'mapx' },
          { label: 'Limits', value: 'Age / height limits not published, ask the resort' },
        ],
        price: { label: 'Adventure package', value: '₹400', note: 'Per person, add-on to a day package. Published reference price.', source: 'mapx' },
        enquiry: 'the Adventure Package',
      },
      {
        id: 'pool', film: 'film-pool', kicker: 'The Water Oasis', name: 'Pool & Rain Dance',
        style: 'A 5,000 sq. ft. pool framed by palms and lattice screens, with a dedicated rain-dance arena for music-filled afternoons.',
        details: [
          { label: 'Pool', value: '5,000 sq. ft.', source: 'netlify' },
          { label: 'Rain dance', value: 'Dedicated arena with music', source: 'mapx' },
          { label: 'Swimwear', value: 'Nylon, mandatory · rental ₹50', source: 'mapx' },
        ],
        price: { label: 'Included in Gold day package', value: '₹800 / ₹900', note: 'Mon–Fri / weekends & holidays, per person, GST extra. Published reference price.', source: 'mapx' },
        enquiry: 'the pool and day packages',
      },
    ],
  },
  events: {
    id: 'events',
    title: 'Celebrations',
    films: [
      {
        id: 'hall', film: 'film-hall', kicker: 'Indoor ceremonies', name: 'Marriage Hall',
        style: 'A grand hall under warm timber beams, with lights down the aisle and space for staging, décor and catering.',
        details: [
          { label: 'Area', value: '7,500 sq. ft.', source: 'netlify' },
          { label: 'Also', value: 'Banquet halls · 2,500 sq. ft.', source: 'netlify' },
          { label: 'Services', value: 'Staging & custom catering', source: 'netlify' },
        ],
        price: { label: 'Event pricing', value: 'On request', note: 'Hall rates and seating capacities are not published.' },
        enquiry: 'the Marriage Hall',
      },
      {
        id: 'lawn', film: 'film-lawn', kicker: 'Open-air celebrations', name: 'Marriage Lawn',
        style: 'An expansive manicured lawn with pre-built mandap spaces, ringed by gardens and orchards, for grand Indian weddings under the open sky.',
        details: [
          { label: 'Area', value: '40,000 sq. ft.', source: 'netlify' },
          { label: 'Guests', value: '1,000+', source: 'netlify' },
          { label: 'Mandap', value: 'Pre-built spaces', source: 'netlify' },
        ],
        price: { label: 'Event pricing', value: 'On request', note: 'Lawn and package rates are not published.' },
        enquiry: 'the Marriage Lawn',
      },
    ],
  },
  dining: {
    id: 'dining',
    title: 'Dining',
    films: [
      {
        id: 'restaurant', film: 'film-restaurant', kicker: 'Vimal Resort Kitchen', name: 'The Restaurant',
        style: 'A bright 2,500 sq. ft. dining hall of terracotta screens and timber ceilings, serving freshly cooked vegetarian meals through the day.',
        details: [
          { label: 'Cuisine', value: 'North Indian · South Indian · Jain', source: 'netlify' },
          { label: 'Kitchen', value: 'Pure vegetarian · Jain on request', source: 'mapx' },
          { label: 'Day out', value: 'Welcome juice, breakfast, lunch & hi-tea', source: 'mapx' },
        ],
        price: { label: 'Meals with Gold day package', value: '₹800 / ₹900', note: 'Mon–Fri / weekends & holidays, per person, GST extra. Published reference price.', source: 'mapx' },
        enquiry: 'dining and day packages',
      },
    ],
  },
}
