import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, lockScroll, prefersReducedMotion } from '../lib/motion'
import { ZONES, CONTACT } from '../data/resort'
import { MEDIA, img } from '../data/media'
import { SOURCES } from '../data/sources'
import { Picture } from './Picture'

interface Props {
  onFilm?: (group: 'stay' | 'play' | 'events' | 'dining', film: string) => void
  zoneId: string | null
  onClose: () => void
  onNavigate: (id: string) => void
}

/**
 * Side drawer (desktop) / bottom sheet (mobile). Not a full-screen modal:
 * the scene stays visible behind it. Focus is trapped while open and
 * returned to the opener on close (handled by the parent).
 */
const FILM_FOR: Record<string, ['stay' | 'play' | 'events' | 'dining', string]> = {
  rooms: ['stay', 'twin'], tents: ['stay', 'tent'], adventure: ['play', 'zipline'], pool: ['play', 'pool'], halls: ['events', 'hall'], lawn: ['events', 'lawn'], restaurant: ['dining', 'restaurant'],
}

export function InfoPanel({ zoneId, onClose, onNavigate, onFilm }: Props) {
  const zone = ZONES.find((z) => z.id === zoneId) ?? null
  const [shown, setShown] = useState(zone)
  const [imgIdx, setImgIdx] = useState(0)
  const panel = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)

  // keep content while animating out
  useEffect(() => {
    if (zone) { setShown(zone); setImgIdx(0) }
  }, [zone])

  useLayoutEffect(() => {
    const p = panel.current, b = backdrop.current
    if (!p || !b) return
    const reduced = prefersReducedMotion()
    const mobile = window.matchMedia('(max-width: 767px)').matches
    const from = mobile ? { yPercent: 100, xPercent: 0 } : { xPercent: 100, yPercent: 0 }
    if (zone) {
      lockScroll(true)
      gsap.set([p, b], { visibility: 'visible' })
      if (reduced) gsap.set(p, { xPercent: 0, yPercent: 0 })
      else {
        gsap.fromTo(p, from, { xPercent: 0, yPercent: 0, duration: 0.9, ease: 'expo.out' })
        gsap.fromTo(p.querySelectorAll('[data-stagger]'), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.05, delay: 0.25, ease: 'power3.out' })
      }
      gsap.to(b, { opacity: 1, duration: reduced ? 0 : 0.6 })
      closeBtn.current?.focus({ preventScroll: true })
    } else if (shown) {
      lockScroll(false)
      gsap.to(b, { opacity: 0, duration: reduced ? 0 : 0.4 })
      gsap.to(p, { ...from, duration: reduced ? 0 : 0.55, ease: 'power3.in', onComplete: () => { gsap.set([p, b], { visibility: 'hidden' }); setShown(null) } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone?.id])

  // Esc + focus trap
  useEffect(() => {
    if (!zone) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
      if (e.key === 'ArrowRight' && shown && shown.media.length > 1 && document.activeElement?.closest('[data-gallery]')) setImgIdx((i) => (i + 1) % shown.media.length)
      if (e.key === 'ArrowLeft' && shown && shown.media.length > 1 && document.activeElement?.closest('[data-gallery]')) setImgIdx((i) => (i - 1 + shown.media.length) % shown.media.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zone, shown, onClose])

  const z = zone ?? shown
  const idx = z ? ZONES.findIndex((x) => x.id === z.id) : -1
  const next = idx >= 0 ? ZONES[(idx + 1) % ZONES.length] : null
  const media = z ? MEDIA[z.media[imgIdx] ?? z.media[0]] : null
  const msg = z ? encodeURIComponent(`Hello Vimal Resort, I'd like to know more about the ${z.name}.`) : ''

  return (
    <>
      <div
        ref={backdrop}
        onClick={onClose}
        aria-hidden
        className="invisible fixed inset-0 z-40 bg-charcoal/45 opacity-0 backdrop-blur-[2px]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        className="invisible fixed inset-x-0 bottom-0 z-50 flex max-h-[88svh] flex-col overflow-hidden bg-charcoal text-ivory shadow-[0_-30px_80px_rgba(0,0,0,0.5)] md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-[min(560px,92vw)] md:border-l md:border-ivory/10"
      >
        {z && media && (
          <>
            {/* gallery */}
            <div data-gallery className="relative h-[34svh] shrink-0 overflow-hidden bg-forest md:h-[46vh]">
              {z.media.map((id, i) => (
                <Picture
                  key={id}
                  id={id}
                  sizes="(max-width: 767px) 100vw, 560px"
                  className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-[var(--ease-cine)] ${i === imgIdx ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-charcoal/50" />
              <button
                ref={closeBtn}
                type="button"
                onClick={onClose}
                className="label absolute left-5 top-5 flex items-center gap-3 text-ivory/90 hover:text-gold"
              >
                <span aria-hidden className="text-base">←</span> Back to the resort
              </button>
              {z.media.length > 1 && (
                <div className="absolute bottom-4 right-5 flex gap-2" role="group" aria-label="Photos">
                  {z.media.map((id, i) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setImgIdx(i)}
                      aria-label={`Photo ${i + 1} of ${z.media.length}: ${MEDIA[id].alt}`}
                      aria-current={i === imgIdx}
                      className={`h-11 w-14 overflow-hidden border transition-all duration-500 ${i === imgIdx ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img(MEDIA[id], 'sm')} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
              <p className="absolute bottom-4 left-5 max-w-[45%] text-[0.65rem] leading-snug text-ivory/55">{media.alt}</p>
            </div>

            {/* content */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-7 md:px-10 md:pt-9" data-lenis-prevent>
              <p data-stagger className="label text-gold">{z.kicker}</p>
              <h2 id="panel-title" data-stagger className="serif-display mt-3 text-5xl md:text-6xl">{z.name}</h2>
              <p data-stagger className="mt-5 text-[0.95rem] leading-relaxed text-ivory/80">{z.summary}</p>

              <dl data-stagger className="mt-8 border-t border-ivory/10">
                {z.facts.map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-6 border-b border-ivory/10 py-3.5">
                    <dt className="label text-ivory/50">{f.label}</dt>
                    <dd className="text-right font-serif text-lg">
                      {f.value}
                      <sup className="ml-1.5 font-sans text-[0.55rem] uppercase tracking-wider text-sage" title={`Source: ${SOURCES[f.source].label}`}>
                        {f.source === 'netlify' ? 'site' : 'tour'}
                      </sup>
                    </dd>
                  </div>
                ))}
              </dl>

              {z.details?.map((d) => (
                <p key={d.text} data-stagger className="mt-5 text-sm leading-relaxed text-ivory/65">{d.text}</p>
              ))}

              {z.price && (
                <div data-stagger className="mt-8 flex items-baseline justify-between border border-gold/30 px-5 py-4">
                  <span className="label text-ivory/60">{z.price === 'enquire' ? 'Rates' : 'Published price'}</span>
                  <span className="font-serif text-xl text-gold">{z.price === 'enquire' ? 'Enquire for Rates' : z.price.text}</span>
                </div>
              )}

              {FILM_FOR[z.id] && onFilm && (
                <button type="button" data-stagger onClick={() => onFilm(...FILM_FOR[z.id])} className="group mt-8 flex w-full items-center justify-between border border-gold/60 bg-gold/10 px-5 py-4 text-left transition-colors hover:bg-gold hover:text-charcoal">
                  <span><span className="label block text-[0.6rem] opacity-70">Short film · style & rates</span><span className="mt-1 block font-serif text-2xl">Watch the film</span></span>
                  <span aria-hidden className="text-2xl transition-transform duration-500 group-hover:translate-x-2">→</span>
                </button>
              )}

              <div data-stagger className="mt-8 flex flex-wrap gap-3">
                <a className="btn-gold" href={`${CONTACT.whatsapp}?text=${msg}`} target="_blank" rel="noreferrer">Enquire on WhatsApp</a>
                <a className="btn-ghost" href={CONTACT.phoneHref}>Call {CONTACT.phoneDisplay}</a>
              </div>

              {next && (
                <button
                  type="button"
                  data-stagger
                  onClick={() => onNavigate(next.id)}
                  className="group mt-10 flex w-full items-center justify-between border-t border-ivory/10 pt-6 text-left"
                >
                  <span>
                    <span className="label block text-ivory/45">Next place</span>
                    <span className="mt-1 block font-serif text-2xl transition-colors group-hover:text-gold">{next.name}</span>
                  </span>
                  <span aria-hidden className="text-2xl text-gold transition-transform duration-500 group-hover:translate-x-2">→</span>
                </button>
              )}
              <p className="mt-8 text-[0.65rem] leading-relaxed text-ivory/35">
                <span className="text-sage">site</span> = {SOURCES.netlify.label} · <span className="text-sage">tour</span> = {SOURCES.mapx.label}. Published details only; please confirm with the resort before you visit.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}
