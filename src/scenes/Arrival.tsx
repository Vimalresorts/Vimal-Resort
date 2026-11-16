import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, isSmallScreen, lockScroll, scrollToTarget, useReducedMotion } from '../lib/motion'
import { HERO_CAPTIONS, pano, video } from '../data/journeys'
import { PROPERTY } from '../data/resort'
import { PlanetIntro, type PlanetHandle } from '../components/PlanetIntro'

/**
 * SCENE 01 — THE ARRIVAL. Plays the moment the page is ready; never waits for scroll.
 *   ① Little planet over Gadag, unfolding into the horizon (live, from the real 8K drone 360°)
 *   ② Dive → buggy POV through the entrance plaza (Flow, labelled)
 *   ③ Lift → real 1080p drone film, facts drifting in
 *   … and back to ① — a continuous loop.
 */
type Shot = 'planet' | 'gate' | 'through' | 'arrival' | 'drone'
const ORDER: Shot[] = ['planet', 'gate', 'through', 'arrival', 'drone']
const NEXT: Record<Shot, Shot> = { planet: 'gate', gate: 'through', through: 'arrival', arrival: 'drone', drone: 'planet' }
const CHAPTERS: Record<Shot, { n: string; title: string; note: string }> = {
  planet: { n: '01', title: 'Above Gadag', note: 'Real 360° drone panorama' },
  gate: { n: '02', title: 'The approach', note: 'Drone footage · New Bengaluru Highway' },
  through: { n: '03', title: 'Over the arch', note: 'AI-assisted continuation of the resort’s drone footage' },
  arrival: { n: '04', title: 'Through the gates', note: 'AI-assisted visualisation from the resort’s 360° photos' },
  drone: { n: '05', title: 'Twenty-three acres', note: 'Drone footage over the grounds' },
}
const CAPTION_EVERY = 4.6

export function Arrival() {
  const reduced = useReducedMotion()
  const small = useRef(isSmallScreen()).current
  const lite = useRef(small || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) < 4).current
  const root = useRef<HTMLElement>(null)
  const planet = useRef<PlanetHandle>(null)
  const arrivalV = useRef<HTMLVideoElement>(null)
  const droneV = useRef<HTMLVideoElement>(null)
  const gateV = useRef<HTMLVideoElement>(null)
  const throughV = useRef<HTMLVideoElement>(null)
  const vidOf = (s: Shot) => (s === 'gate' ? gateV : s === 'through' ? throughV : s === 'arrival' ? arrivalV : s === 'drone' ? droneV : null)
  const [shot, setShot] = useState<Shot>('planet')
  const [loaded, setLoaded] = useState(0)
  const [ready, setReady] = useState(false)
  const [titleOn, setTitleOn] = useState(false)
  const [caption, setCaption] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [gateCap, setGateCap] = useState(-1)
  const shotRef = useRef<Shot>('planet')
  const titleTimer = useRef(0)
  const t0 = useRef(performance.now())

  const layer = (s: Shot) => root.current?.querySelector<HTMLElement>(`[data-shot="${s}"]`)

  /* ---------- transitions between shots ---------- */
  const cut = useCallback((to: Shot) => {
    const from = shotRef.current
    if (from === to) return
    const a = layer(from), b = layer(to)
    if (!a || !b) return
    shotRef.current = to
    setShot(to)
    setCaption(-1)
    const dive = from === 'planet'
    const lift = from === 'arrival'
    const match = from === 'gate' && to === 'through'
    const v = vidOf(to)?.current
    if (v) { v.currentTime = 0; v.play().catch(() => {}) }
    if (to === 'planet') {
      planet.current?.play()
      window.clearTimeout(titleTimer.current)
      titleTimer.current = window.setTimeout(() => setTitleOn(true), 3600)
    } else setTitleOn(false)
    gsap.set(b, { zIndex: 2 }); gsap.set(a, { zIndex: 1 })
    gsap.fromTo(b, { opacity: 0, scale: match ? 1 : dive ? 1.25 : lift ? 1.2 : 1.08, filter: dive ? 'blur(10px)' : 'blur(0px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: match ? 0.5 : dive ? 1.6 : lift ? 2.2 : 1.6, ease: 'power3.out' })
    gsap.to(a, { opacity: 0, duration: dive ? 1.2 : 1.5, delay: 0.2, ease: 'power2.in',
      onComplete: () => { vidOf(from)?.current?.pause() } })
    if (dive || lift) gsap.fromTo('[data-flash]', { opacity: 0 }, { opacity: dive ? 0.55 : 0.28, duration: 0.45, yoyo: true, repeat: 1, ease: 'sine.inOut' })
  }, [])

  /* ---------- preloader → start ---------- */
  const start = useCallback(() => {
    const minWait = Math.max(0, 1700 - (performance.now() - t0.current))
    window.setTimeout(() => {
      setReady(true)
      if (reduced) { setTitleOn(true); lockScroll(false); return }
      const tl = gsap.timeline({ onComplete: () => lockScroll(false) })
      tl.to('[data-pre-word]', { yPercent: -110, duration: 0.9, ease: 'expo.in' }, 0)
        .to('[data-pre-meta]', { opacity: 0, duration: 0.4 }, 0)
        .to('[data-pre-top]', { yPercent: -100, duration: 1.3, ease: 'expo.inOut' }, 0.55)
        .to('[data-pre-bottom]', { yPercent: 100, duration: 1.3, ease: 'expo.inOut' }, 0.55)
        .set('[data-preloader]', { display: 'none' })
        .fromTo('[data-frame-line]', { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, duration: 1.6, stagger: 0.08, ease: 'expo.out' }, 1.2)
      gsap.delayedCall(0.6, () => planet.current?.play())
      titleTimer.current = window.setTimeout(() => setTitleOn(true), 4000)
    }, minWait)
  }, [reduced])

  useEffect(() => { lockScroll(true); return () => lockScroll(false) }, [])

  /* safety net: never hold the visitor on the preloader */
  const started = useRef(false)
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (started.current) return
      started.current = true
      start()
      window.setTimeout(() => cut('gate'), 1800)
    }, 7000)
    return () => window.clearTimeout(t)
  }, [start, cut])

  /* ---------- title letters animate whenever the title returns ---------- */
  useEffect(() => {
    if (!titleOn || reduced) return
    const ctx = gsap.context(() => {
      gsap.fromTo('[data-letter]', { yPercent: 115 }, { yPercent: 0, duration: 1.6, stagger: 0.08, ease: 'expo.out' })
      gsap.fromTo('[data-title-fade]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.15, delay: 0.5, ease: 'power2.out' })
      gsap.fromTo('[data-title-rule]', { scaleX: 0 }, { scaleX: 1, duration: 1.4, delay: 0.4, ease: 'expo.out' })
    }, root)
    return () => ctx.revert()
  }, [titleOn, reduced])

  /* ---------- clocks for video shots ---------- */
  useEffect(() => {
    const v = vidOf(shot)?.current
    if (!v) { setProgress(0); return }
    let leaving = false
    const onTime = () => {
      if (!v.duration) return
      setProgress(v.currentTime / v.duration)
      if (shot === 'drone') {
        const c = Math.floor((v.currentTime - 1) / CAPTION_EVERY)
        setCaption(c >= 0 && c < HERO_CAPTIONS.length ? c : -1)
      }
      if (shot === 'gate') setGateCap(v.currentTime < 5 ? 0 : v.duration - v.currentTime < 5.5 ? 1 : -1)
      const lead = shot === 'arrival' ? 1.0 : shot === 'gate' ? 0.35 : shot === 'through' ? 0.8 : 1.6
      if (!leaving && v.duration - v.currentTime < lead) { leaving = true; setGateCap(-1); cut(NEXT[shot]) }
    }
    v.addEventListener('timeupdate', onTime)
    return () => v.removeEventListener('timeupdate', onTime)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shot, cut])

  /* planet shot progress (time-based) */
  useEffect(() => {
    if (shot !== 'planet' || !ready) return
    const s = performance.now()
    let raf = 0
    const f = () => { setProgress(Math.min(1, (performance.now() - s) / 10600)); raf = requestAnimationFrame(f) }
    raf = requestAnimationFrame(f)
    return () => cancelAnimationFrame(raf)
  }, [shot, ready])

  /* scroll: overlay recedes, footage keeps rolling */
  useEffect(() => {
    if (reduced) return
    const ctx = gsap.context(() => {
      gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.6 } })
        .to('[data-overlay]', { opacity: 0, yPercent: -10 }, 0)
        .to('[data-stage]', { scale: 1.1 }, 0)
        .to('[data-dim]', { opacity: 0.85 }, 0)
    }, root)
    return () => ctx.revert()
  }, [reduced])

  /* pause everything when the visitor asks (WCAG 2.2.2) */
  const togglePause = () => {
    const next = !paused
    setPaused(next)
    gsap.globalTimeline.timeScale(next ? 0.0001 : 1)
    const v = vidOf(shot)?.current
    if (v) { if (next) v.pause(); else v.play().catch(() => {}) }
  }

  const ch = CHAPTERS[shot]
  const pct = Math.round(loaded * 100)

  return (
    <section id="arrival" ref={root} aria-label="The Arrival" className="relative h-[150svh]">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-charcoal">
        {/* ---------------- shots ---------------- */}
        <div data-stage className="absolute inset-0 will-change-transform">
          <div data-shot="planet" className="absolute inset-0" style={{ zIndex: 2 }}>
            <PlanetIntro
              ref={planet}
              src={pano(lite ? 'aerial-4k' : 'aerial-8k', 'lg')}
              reduced={reduced}
              onProgress={(p) => setLoaded(p)}
              onLoad={() => { if (!started.current) { started.current = true; start() } }}
              onDive={() => cut('gate')}
              className="absolute inset-0"
            />
          </div>
          <div data-shot="gate" className="absolute inset-0 opacity-0">
            <video ref={gateV} className="absolute inset-0 h-full w-full object-cover" poster={video('gate', 'lg').replace('-lg.mp4', '-poster.webp')} muted playsInline preload="auto" aria-hidden>
              {!small && <source src={video('gate', 'lg').replace('.mp4', '.av1.mp4')} type='video/mp4; codecs="av01.0.08M.08"' />}
              <source src={video('gate', small ? 'sm' : 'lg')} type="video/mp4" />
            </video>
          </div>
          <div data-shot="through" className="absolute inset-0 opacity-0">
            <video ref={throughV} className="absolute inset-0 h-full w-full object-cover" src={video('through', small ? 'sm' : 'lg')} poster={video('through', 'lg').replace('-lg.mp4', '-poster.webp')} muted playsInline preload="auto" aria-hidden
              onError={() => { if (shotRef.current === 'through') cut('arrival') }} />
          </div>
          <div data-shot="arrival" className="absolute inset-0 opacity-0">
            <video ref={arrivalV} className="absolute inset-0 h-full w-full object-cover [filter:contrast(1.05)_saturate(1.06)]" src={video('arrival', small ? 'sm' : 'lg')} poster={video('arrival', 'lg').replace('-lg.mp4', '-poster.webp')} muted playsInline preload="auto" aria-hidden />
          </div>
          <div data-shot="drone" className="absolute inset-0 opacity-0">
            <video ref={droneV} className="absolute inset-0 h-full w-full object-cover" poster={video('orbit', 'lg').replace('-lg.mp4', '-poster.webp')} muted playsInline preload="metadata" aria-hidden>
              {!small && <source src={video('orbit', 'lg').replace('.mp4', '.av1.mp4')} type='video/mp4; codecs="av01.0.08M.08"' />}
              <source src={video('orbit', small ? 'sm' : 'lg')} type="video/mp4" />
            </video>
          </div>
          <div data-flash aria-hidden className="pointer-events-none absolute inset-0 z-10 bg-ivory opacity-0" />
        </div>

        {/* grade + framing */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_50%_45%,transparent_40%,rgba(21,27,23,0.62)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-44 bg-gradient-to-b from-charcoal/70 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[50%] bg-gradient-to-t from-charcoal/85 via-charcoal/25 to-transparent" />
        <div data-dim className="pointer-events-none absolute inset-0 z-10 bg-charcoal opacity-0" />
        {/* hairline frame — the "mount" of a printed photograph */}
        <div aria-hidden className="pointer-events-none absolute inset-3 z-20 md:inset-5">
          <span data-frame-line className="absolute inset-x-0 top-0 h-px origin-center bg-ivory/25" />
          <span data-frame-line className="absolute inset-x-0 bottom-0 h-px origin-center bg-ivory/25" />
          <span data-frame-line className="absolute inset-y-0 left-0 w-px origin-center bg-ivory/25" />
          <span data-frame-line className="absolute inset-y-0 right-0 w-px origin-center bg-ivory/25" />
        </div>

        <div data-overlay className="absolute inset-0 z-30">
          {/* ---------------- title ---------------- */}
          <div className={`absolute inset-0 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-[1400ms] ${titleOn ? 'opacity-100' : 'opacity-0'}`} aria-hidden={!titleOn}>
            <p data-title-fade className="label mb-6 tracking-[0.5em] text-ivory/85 md:mb-8">{PROPERTY.region}</p>
            <h1 className="serif-display flex text-[min(25vw,32svh)] leading-[0.8] text-ivory drop-shadow-[0_6px_50px_rgba(0,0,0,0.35)] md:text-[min(16vw,34svh)]" aria-label={PROPERTY.name}>
              {PROPERTY.shortName.split('').map((l, i) => (
                <span key={i} className="mask-line" aria-hidden><span data-letter className="inline-block">{l}</span></span>
              ))}
            </h1>
            <span data-title-rule className="mt-7 block h-px w-24 origin-center bg-gold md:mt-9" />
            <p data-title-fade className="mt-6 font-serif text-xl italic text-ivory/90 md:mt-7 md:text-3xl">{PROPERTY.tagline}</p>
          </div>

          {/* ---------------- captions over the drone film ---------------- */}
          {HERO_CAPTIONS.map((c, i) => (
            <div key={i} aria-hidden={caption !== i}
              className={`pointer-events-none absolute bottom-[20svh] left-8 right-8 transition-all duration-[1300ms] ease-[var(--ease-cine)] md:left-[7vw] md:right-auto md:max-w-2xl ${caption === i ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-6 opacity-0 blur-sm'}`}>
              <p className="label mb-4 tracking-[0.4em] text-gold">{c.kicker}</p>
              <p className="serif-display text-[2.6rem] leading-[1] text-ivory drop-shadow-[0_2px_30px_rgba(0,0,0,0.55)] md:text-7xl">{c.text}</p>
            </div>
          ))}
          {[
            { k: 'Gadag · North Karnataka', t: 'On the New Bengaluru Highway' },
            { k: 'You have arrived', t: 'Welcome to Vimal' },
          ].map((c, i) => (
            <div key={c.t} aria-hidden={gateCap !== i}
              className={`pointer-events-none absolute inset-x-8 text-center transition-all duration-[1300ms] ease-[var(--ease-cine)] top-[19svh] ${gateCap === i ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-5 opacity-0 blur-sm'}`}>
              <p className="label mb-4 tracking-[0.45em] text-gold">{c.k}</p>
              <p className="serif-display text-[2.6rem] leading-[1] text-ivory drop-shadow-[0_2px_30px_rgba(0,0,0,0.55)] md:text-7xl">{c.t}</p>
            </div>
          ))}
          <p className="sr-only" aria-live="polite">{caption >= 0 ? HERO_CAPTIONS[caption].text : ''}</p>

          {/* ---------------- HUD ---------------- */}
          <div className="absolute inset-x-8 bottom-8 flex items-end justify-between gap-6 md:inset-x-[3.2vw] md:bottom-10">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                {ORDER.map((s) => (
                  <span key={s} className="relative block h-px w-8 overflow-hidden bg-ivory/20 md:w-12">
                    <span className="absolute inset-0 origin-left bg-gold" style={{ transform: `scaleX(${s === shot ? progress : ORDER.indexOf(s) < ORDER.indexOf(shot) ? 1 : 0})` }} />
                  </span>
                ))}
              </div>
              <p className="label mt-3 text-[0.6rem] text-ivory/70"><span className="text-gold">{ch.n}</span> — {ch.title}</p>
              <p className="mt-1.5 text-[0.62rem] text-ivory/45">{ch.note}</p>
            </div>
            <button type="button" onClick={() => scrollToTarget('discover')} className="group hidden flex-col items-center gap-3 md:flex" aria-label="Scroll to enter the resort">
              <span className="label text-ivory/80 group-hover:text-gold">Enter the resort</span>
              <span className="relative block h-10 w-px overflow-hidden bg-ivory/15"><span className="scroll-cue-line absolute inset-0 bg-gold" /></span>
            </button>
            <button type="button" onClick={togglePause} className="label flex h-11 items-center gap-2.5 border border-ivory/25 px-4 text-ivory/80 backdrop-blur-sm transition-colors hover:border-gold hover:text-gold" aria-label={paused ? 'Play the film' : 'Pause the film'}>
              <span aria-hidden className="text-[0.65rem]">{paused ? '▶' : '❚❚'}</span>
              <span className="hidden sm:inline">{paused ? 'Play' : 'Pause'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- preloader ---------------- */}
      <div data-preloader className={`fixed inset-0 z-[90] ${ready && reduced ? 'hidden' : ''}`} role="status" aria-label={`Loading ${pct}%`}>
        <div data-pre-top className="absolute inset-x-0 top-0 h-1/2 bg-charcoal" />
        <div data-pre-bottom className="absolute inset-x-0 bottom-0 h-1/2 bg-charcoal" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p data-pre-meta className="font-serif text-sm text-gold/80">{PROPERTY.kannadaName}</p>
          <div className="mask-line mt-4">
            <span data-pre-word className="serif-display relative block text-6xl tracking-[0.22em] text-ivory/15 md:text-8xl">
              VIMAL
              <span className="absolute inset-0 overflow-hidden text-ivory" style={{ clipPath: `inset(${100 - pct}% 0 0 0)` }}>VIMAL</span>
            </span>
          </div>
          <p data-pre-meta className="label mt-6 tracking-[0.5em] text-ivory/45">Resort & Entertainment Park</p>
        </div>
        <div data-pre-meta className="absolute inset-x-8 bottom-8 flex items-end justify-between md:inset-x-12 md:bottom-10">
          <span className="label text-[0.6rem] text-ivory/40">Gadag · Karnataka</span>
          <span className="font-serif text-4xl tabular-nums text-ivory/80 md:text-5xl">{String(pct).padStart(3, '0')}</span>
        </div>
        <span data-pre-meta className="absolute bottom-0 left-0 h-px bg-gold transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>
    </section>
  )
}
