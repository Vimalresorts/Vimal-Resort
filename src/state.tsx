import { createContext, useContext } from 'react'

export interface Explorer {
  openZone: (id: string, opener?: HTMLElement | null) => void
  closeZone: () => void
  activeZone: string | null
  openFilms: (group: 'stay' | 'play' | 'events' | 'dining', film?: string, opener?: HTMLElement | null) => void
}

export const ExplorerContext = createContext<Explorer>({
  openZone: () => {},
  closeZone: () => {},
  activeZone: null,
  openFilms: () => {},
})

export const useExplorer = () => useContext(ExplorerContext)

/** Scene registry: drives the nav, progress rail and jump links. */
export const SCENES = [
  { id: 'arrival', index: '01', title: 'The Arrival' },
  { id: 'discover', index: '02', title: 'Discover' },
  { id: 'stay', index: '03', title: 'Stay' },
  { id: 'events', index: '04', title: 'Celebrations' },
  { id: 'packages', index: '05', title: 'Packages' },
  { id: 'contact', index: '06', title: 'Contact' },
] as const
