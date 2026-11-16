import { useEffect, useRef } from 'react'
import { gsap, isSmallScreen, useReducedMotion } from '../lib/motion'
import { ZONES } from '../data/resort'
import { Picture } from '../components/Picture'
import { useExplorer } from '../state'

/**
 * SCENE 02 — DISCOVER THE RESORT
 * The real highway-side aerial, revealed through an opening frame.
 * Hotspots are pinned ONLY where a zone is unmistakable in the photograph
 * (pool, adventure tower). Every other zone is reachable from the index,
 * never guessed onto the image.
 */
const ASPECT = 16 / 9 // aerial-front.webp is 2000×1125

export function Discover() {
  const reduced = useReducedMotion()
  const root = useRef<HTMLElement>(null)
  const { openZone, activeZone } = useExplorer()
  const pinned = ZONES.filter((z) => z.pin)

  useEffect(() => {
    if (reduced) return
    const small = isSmallScreen()
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
      })
      tl.fromTo('[data-frame]', { clipPath: 'inset(9% 13% 9% 13% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', duration: 0.3, ease: 'power2.inOut' }, 0)
        .fromTo('[data-plate]', { scale: 1.35 }, { scale: 1, duration: 0.45, ease: 'power1.out' }, 0)
        .fromTo('[data-head] [data-line]', { yPercent: 110 }, { yPercent: 0, duration: 0.12, stagger: 0.04, ease: 'power3.out' }, 0.06)
        .fromTo('[data-sub]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.08 }, 0.2)
        .fromTo('[data-hotspot]', { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.06, stagger: 0.04, ease: 'back.out(2)' }, 0.3)
        .fromTo('[data-index] li', { opacity: 0, x: 24 }, { opacity: 1, x: 0, duration: 0.05, stagger: 0.015 }, 0.34)
      // Portrait phones: pan across the wide aerial so both pinned zones pass through view.
      if (small) tl.fromTo('[data-pan]', { xPercent: 22 }, { xPercent: -22, duration: 0.6 }, 0.35)
      else tl.fromTo('[data-plate]', { xPercent: 0 }, { xPercent: -2, duration: 0.55 }, 0.45)
    }, root)
    return () => ctx.revert()
  }, [reduced])

  return (
    <section id="discover" ref={root} aria-labelledby="discover-title" className={reduced ? 'relative' : 'relative h-[300vh]'}>
      <div className={reduced ? 'relative min-h-svh overflow-hidden' : 'sticky top-0 h-svh overflow-hidden'}>
        <div data-frame className="absolute inset-0 overflow-hidden bg-forest">
          {/* Cover-sized plate keeps hotspot % coordinates locked to the photograph */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: `max(100vw, ${100 * ASPECT}svh)`, aspectRatio: `${ASPECT}` }}>
           <div data-pan className="h-full w-full">
            <div data-plate className="relative h-full w-full will-change-transform">
              <Picture id="aerialFront" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-charcoal/40" />
              {pinned.map((z) => (
                <button
                  key={z.id}
                  data-hotspot
                  type="button"
                  onClick={(e) => openZone(z.id, e.currentTarget)}
                  aria-label={`${z.name}: open details`}
                  aria-expanded={activeZone === z.id}
                  className="group absolute z-10 -ml-6 -mt-6 grid h-12 w-12 place-items-center"
                  style={{ left: `${z.pin!.x * 100}%`, top: `${z.pin!.y * 100}%` }}
                >
                  <span className="hotspot-ring" aria-hidden />
                  <span className="relative block h-3 w-3 rounded-full bg-gold shadow-[0_0_0_4px_rgba(195,165,109,0.25)] transition-transform duration-500 group-hover:scale-125 group-focus-visible:scale-125" aria-hidden />
                  <span
                    aria-hidden
                    className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${z.pin!.x > 0.7 ? 'right-full mr-1 border-r [@media(hover:hover)]:translate-x-2' : 'left-full ml-1 border-l [@media(hover:hover)]:-translate-x-2'} whitespace-nowrap border-gold bg-charcoal/75 px-3 py-1.5 text-[0.7rem] uppercase tracking-[0.22em] text-ivory backdrop-blur-sm transition-all duration-500 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:translate-x-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-visible:translate-x-0 [@media(hover:hover)]:group-focus-visible:opacity-100`}
                  >
                    {z.name}
                  </span>
                </button>
              ))}
            </div>
           </div>
          </div>
        </div>

        {/* Headline */}
        <div data-head className="pointer-events-none absolute bottom-[17vh] left-6 right-6 md:bottom-[15vh] md:left-[6vw] md:right-auto md:max-w-[52vw]">
          <p data-sub className="label mb-5 text-gold">02 · Discover the resort</p>
          <h2 id="discover-title" className="serif-display text-[13vw] text-ivory md:text-[6.6vw]">
            <span className="mask-line"><span data-line>23 Acres.</span></span>
            <span className="mask-line"><span data-line className="italic text-ivory/90">Endless Possibilities.</span></span>
          </h2>
          <p data-sub className="mt-6 max-w-md text-sm leading-relaxed text-ivory/80 md:text-base">
            Gardens, orchards, a water oasis and a two-acre adventure park, all on one property outside Gadag. Tap a light to step closer.
          </p>
        </div>

        {/* Zone index */}
        <nav
          data-index
          aria-label="Resort zones"
          className="absolute inset-x-0 bottom-0 border-t border-ivory/10 bg-charcoal/65 backdrop-blur-md"
        >
          <div className="flex items-center">
            <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]">
            <ul className="mx-auto flex w-max gap-0.5 px-3 py-3 md:px-4">
              {ZONES.map((z, i) => (
                <li key={z.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={(e) => openZone(z.id, e.currentTarget)}
                    aria-expanded={activeZone === z.id}
                    className={`group flex items-center gap-2 px-2.5 py-2.5 transition-colors duration-300 hover:bg-ivory/5 ${activeZone === z.id ? 'text-gold' : 'text-ivory/85'}`}
                  >
                    <span className="font-serif text-xs tabular-nums text-gold/80">{String(i + 1).padStart(2, '0')}</span>
                    <span className="whitespace-nowrap text-[0.8rem] tracking-wide group-hover:text-ivory">{z.name}</span>
                    {z.pin && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-label="(marked on the view)" />}
                  </button>
                </li>
              ))}
            </ul>
            </div>
            <p className="hidden shrink-0 border-l border-ivory/10 px-6 py-5 text-[0.68rem] text-ivory/45 2xl:block">
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-gold align-middle" />
              Visible in this photo
            </p>
          </div>
        </nav>
      </div>
    </section>
  )
}
