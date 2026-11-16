/**
 * Asset manifest. All files are real resort media pulled from the two sources,
 * converted to WebP (full + "-sm" mobile size) with FFmpeg.
 * `verified` = false marks images whose authenticity could not be confirmed.
 */
import type { SourceKey } from './sources'

export interface MediaAsset {
  id: string
  file: string // base name in /media/img, without extension
  alt: string
  source: SourceKey
  original: string
  verified: boolean
  note?: string
}

const m = (
  id: string,
  file: string,
  alt: string,
  source: SourceKey,
  original: string,
  verified = true,
  note?: string,
): MediaAsset => ({ id, file, alt, source, original, verified, note })

export const MEDIA = {
  aerialFront: m('aerialFront', 'aerial-front', 'Aerial view of Vimal Resort from the highway side, with the swimming pool and adventure tower', 'netlify', 'DJI_0972.jpg'),
  adventureAerial: m('adventureAerial', 'adventure-aerial', 'Aerial view of the adventure park rope course and climbing tower', 'netlify', 'DJI_0032.jpg'),
  roomTwin: m('roomTwin', 'room-twin', 'Twin room with carved wooden beds and Hampi artwork', 'netlify', 'Client upload (16 Nov)'),
  roomSeating: m('roomSeating', 'room-seating', 'Window seating corner looking onto the garden', 'netlify', 'Client upload (16 Nov)'),
  roomKing: m('roomKing', 'room-king', 'King room with tufted headboard and fort artwork', 'netlify', 'Client upload (16 Nov)'),
  roomKing2: m('roomKing2', 'room-king-2', 'King room with Hampi stone-chariot artwork', 'netlify', 'Client upload (16 Nov)'),
  roomLuxury: m('roomLuxury', 'room-luxury', 'Luxury room with twin beds and wooden floors', 'netlify', '_DSC1286.jpg'),
  tentInterior: m('tentInterior', 'tent-interior', 'Interior of a nature tent', 'netlify', '366A7534.jpg'),
  tentExterior: m('tentExterior', 'tent-exterior', 'Exterior of the nature tents', 'netlify', '366A7480.jpg'),
  zipline: m('zipline', 'zipline-real', 'Zipline running over the trees', 'netlify', '_DSC1429_2.jpg'),
  marriageHall: m('marriageHall', 'marriage-hall', 'The 7,500 sq. ft. marriage hall', 'netlify', '366A7561.jpg'),
  weddingLawn: m('weddingLawn', 'wedding-lawn', 'The open marriage lawn', 'netlify', '366A7565.jpg'),
  hallDecorated: m('hallDecorated', 'hall-decorated', 'Marriage hall set up for a ceremony', 'netlify', 'WhatsApp Image 2026-06-13 at 09.03.59.jpeg', true, 'Low resolution (1600px) — replace with a camera original.'),
  ropeBridge: m('ropeBridge', 'rope-bridge', 'Tyre-and-rope bridge in the adventure park', 'netlify', '_DSC1395.jpg'),
  poolFun: m('poolFun', 'pool-fun', 'Guests in the swimming pool', 'netlify', '366A7402.jpg'),
  poolKids: m('poolKids', 'pool-kids', 'Children playing in the pool', 'netlify', '366A7388.jpg'),
  buggyPath: m('buggyPath', 'buggy-path', 'Tree-lined buggy path through the grounds', 'netlify', '366A7430.jpg'),
  zorb: m('zorb', 'zorb', 'Zorb balls on the lawn', 'netlify', '_DSC1432_2.jpg'),
  horse: m('horse', 'horse-riding', 'Horse ride on the resort path', 'netlify', '366A7419.jpg', true, 'Horse riding is pictured on the website but not listed as an activity.'),
  familyGames: m('familyGames', 'family-games', 'Families playing games in the activity hall', 'netlify', '366A7296.jpg'),
  mxDeluxeKing: m('mxDeluxeKing', 'mx-room-deluxe-king', 'Room with king bed and garden window', 'mapx', 'room-deluxe-king.jpg', true, 'MapX labels these "room photos are from the resort". Category names not published.'),
  mxFamilyTwin: m('mxFamilyTwin', 'mx-room-family-twin', 'Family room with two double beds', 'mapx', 'room-family-twin.jpg'),
  mxGardenView: m('mxGardenView', 'mx-room-garden-view', 'Room with seating area and garden door', 'mapx', 'room-garden-view.jpg'),
  mxDiningHall: m('mxDiningHall', 'mx-amen-restaurant-dining-hall', 'Restaurant dining hall', 'mapx', 'amen-restaurant-dining-hall-t.jpg', true, 'Thumbnail of a 360° scene (480px). Needs a full-res photo.'),
  mxRestaurant: m('mxRestaurant', 'mx-amen-restaurant', 'Restaurant entrance', 'mapx', 'amen-restaurant-t.jpg', true, 'Thumbnail (480px). Needs a full-res photo.'),
  mxPool: m('mxPool', 'mx-amen-swimming-pool', 'Swimming pool deck', 'mapx', 'amen-swimming-pool-t.jpg', true, 'Thumbnail (480px).'),
  panoAerial: m('panoAerial', 'pano-aerial', '360° drone panorama above the resort', 'mapx', 'pano-aerial.jpg (8000×4000 equirectangular)'),
} satisfies Record<string, MediaAsset>

export type MediaId = keyof typeof MEDIA

const base = import.meta.env.BASE_URL
export const img = (a: MediaAsset, size: 'lg' | 'sm' = 'lg') =>
  `${base}media/img/${a.file}${size === 'sm' ? '-sm' : ''}.webp`
export const srcSet = (a: MediaAsset) => `${img(a, 'sm')} 900w, ${img(a)} 2000w`

