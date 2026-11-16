/**
 * Motion content: the always-playing hero reel and the walk-through journeys.
 * `ai: true` = generated with Google Flow from the resort's own 360° photos
 * (labelled on screen). Everything else is real footage / real 360° photos.
 */
const base = import.meta.env.BASE_URL

export const video = (name: string, size: 'lg' | 'sm') => `${base}media/video/${name}-${size}.mp4`
export const pano = (name: string, size: 'lg' | 'sm') => `${base}media/pano/${name}${size === 'sm' ? '-sm' : ''}.webp`

export interface ReelClip {
  id: string
  name: string // file stem in /media/video
  poster: string
  chapter: string
  caption: string
  ai?: boolean
  loop?: boolean
}

/** Hero reel: buggy through the entrance → lift into the real drone shot. */
export const HERO_REEL: ReelClip[] = [
  { id: 'arrival', name: 'arrival', poster: `${base}media/video/arrival-poster.webp`, chapter: 'Through the gates', caption: 'Entrance plaza', ai: true },
  { id: 'drone', name: 'drone', poster: `${base}media/video/drone-poster.webp`, chapter: 'From above', caption: 'Drone footage over the grounds' },
]

/** Facts that drift in over the drone shot (timed by playback, not scroll). */
export const HERO_CAPTIONS = [
  { kicker: 'Gadag · North Karnataka', text: '23 acres of gardens, orchards and play' },
  { kicker: 'Rooted in nature', text: '1,500+ trees: sapota, guava, mango and teak' },
  { kicker: 'Stay', text: '105 luxury rooms · 15 nature tents' },
  { kicker: 'Play', text: 'A two-acre adventure park, 20+ activities' },
  { kicker: 'Celebrate', text: 'A 40,000 sq. ft. lawn for grand weddings' },
]

export type JourneyStep =
  | { kind: 'video'; name: string; label: string; note: string; ai?: boolean }
  | { kind: 'pano'; name: string; label: string; note: string; yaw: number; cta?: string }

export interface Journey {
  id: 'rooms' | 'tents'
  title: string
  kicker: string
  facts: string[]
  steps: JourneyStep[]
}

/** yaw = degrees from the centre of the equirectangular photo (+ = right). */
export const JOURNEYS: Record<Journey['id'], Journey> = {
  rooms: {
    id: 'rooms',
    title: 'Luxury Rooms',
    kicker: 'Sanctuary of Comfort',
    facts: ['105 rooms on the property', 'AC · family suites', 'Rustic architecture'],
    steps: [
      { kind: 'video', name: 'rooms-path', label: 'The cottage path', note: 'Ride past the room blocks', ai: true },
      { kind: 'pano', name: 'room-303-veranda', label: 'Veranda', note: 'Room 303 · garden-facing veranda', yaw: 0, cta: 'Step inside' },
      { kind: 'pano', name: 'room-303', label: 'Room 303', note: 'Double room with garden window', yaw: -45, cta: 'See the bath' },
      { kind: 'pano', name: 'room-303-bath', label: 'Bathroom', note: 'Room 303 · en-suite', yaw: -140, cta: 'Next room' },
      { kind: 'pano', name: 'room-306', label: 'Room 306', note: 'Twin beds · seating area', yaw: 15, cta: 'Next room' },
      { kind: 'pano', name: 'deluxe-room', label: 'Deluxe 407', note: 'Deluxe room 407', yaw: -60, cta: 'Next room' },
      { kind: 'pano', name: 'family-room', label: 'Family 203', note: 'Family room 203', yaw: -60 },
    ],
  },
  tents: {
    id: 'tents',
    title: 'Nature Tents',
    kicker: 'Close to Nature',
    facts: ['15 tents on the property', 'Group & family glamping'],
    steps: [
      { kind: 'video', name: 'tent-walk', label: 'Up to the tent', note: 'Walk across the lawn', ai: true },
      { kind: 'pano', name: 'tent-cottages', label: 'Tent lawn', note: 'The tent cottages', yaw: -20, cta: 'Go to the door' },
      { kind: 'pano', name: 'tent-710-entrance', label: 'Doorway', note: 'Tent 710 · entrance', yaw: 70, cta: 'Step inside' },
      { kind: 'pano', name: 'tent-710', label: 'Tent 710', note: 'Inside tent 710', yaw: 20, cta: 'See the bath' },
      { kind: 'pano', name: 'tent-710-bath', label: 'Bathroom', note: 'Tent 710 · bathroom', yaw: -90, cta: 'Next tent' },
      { kind: 'pano', name: 'luxury-tent', label: 'Luxury 804', note: 'Luxury tent 804', yaw: 160 },
    ],
  },
}
