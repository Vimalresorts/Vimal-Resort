import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ScrollTrigger, startSmoothScroll } from './lib/motion'
import { ExplorerContext } from './state'
import { Nav } from './components/Nav'
import { InfoPanel } from './components/InfoPanel'
import { Arrival } from './scenes/Arrival'
import { Discover } from './scenes/Discover'
import { Essentials } from './scenes/Essentials'
import { SpaceFilms } from './components/SpaceFilms'
import { Cursor } from './components/Cursor'

export default function App() {
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [films, setFilms] = useState<{ group: 'stay' | 'play' | 'events' | 'dining'; film?: string } | null>(null)
  const opener = useRef<HTMLElement | null>(null)

  useEffect(() => {
    startSmoothScroll()
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    // Deep link: #discover, #stay, #packages … (artifact-safe plain hashes)
    window.scrollTo(0, 0)
    const h = location.hash.slice(1)
    if (h && h !== 'arrival') window.setTimeout(() => document.getElementById(h)?.scrollIntoView(), 2600)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  const openZone = useCallback((id: string, el?: HTMLElement | null) => {
    if (el) opener.current = el
    else if (!opener.current) opener.current = document.activeElement as HTMLElement
    setActiveZone(id)
  }, [])

  const closeZone = useCallback(() => {
    setActiveZone(null)
    const el = opener.current
    opener.current = null
    // return focus to whatever opened the panel
    window.setTimeout(() => el?.focus({ preventScroll: true }), 50)
  }, [])

  const openFilms = useCallback((group: 'stay' | 'play' | 'events' | 'dining', film?: string, el?: HTMLElement | null) => {
    opener.current = el ?? (document.activeElement as HTMLElement)
    setActiveZone(null)
    setFilms({ group, film })
  }, [])
  const closeFilms = useCallback(() => {
    setFilms(null)
    const el = opener.current
    opener.current = null
    window.setTimeout(() => el?.focus({ preventScroll: true }), 50)
  }, [])

  const ctx = useMemo(() => ({ openZone, closeZone, activeZone, openFilms }), [openZone, closeZone, activeZone, openFilms])

  return (
    <ExplorerContext.Provider value={ctx}>
      <a href="#discover" className="label fixed left-4 top-4 z-[70] -translate-y-24 bg-gold px-4 py-3 text-charcoal focus:translate-y-0">
        Skip to resort overview
      </a>
      <Nav />
      <main>
        <Arrival />
        <Discover />
        <Essentials />
      </main>
      <InfoPanel zoneId={activeZone} onClose={closeZone} onNavigate={(id) => setActiveZone(id)} onFilm={(g, f) => openFilms(g, f)} />
      <SpaceFilms open={films} onClose={closeFilms} />
      <div className="grain" aria-hidden />
      <Cursor />
    </ExplorerContext.Provider>
  )
}
