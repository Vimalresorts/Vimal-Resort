import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, isSmallScreen, lockScroll, prefersReducedMotion } from '../lib/motion'
import { FILM_GROUPS, type FilmGroup } from '../data/films'
import { CONTACT } from '../data/resort'
import { SOURCES } from '../data/sources'

const base = import.meta.env.BASE_URL
const src = (stem: string, size: 'lg' | 'sm') => `${base}media/video/${stem}-${size}.mp4`

interface Props {
  open: { group: FilmGroup['id']; film?: string } | null
  onClose: () => void
}

/**
 * Self-playing space films. No dragging: each room / venue plays as a short
 * film while its style, details and price sit beside it; films advance on
 * their own and loop through the group.
 */
export function SpaceFilms({ open, onClose }: Props) {
  const [groupId, setGroupId] = useState<FilmGroup['id']>('stay')
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const vids = useRef<(HTMLVideoElement | null)[]>([])
  const size = isSmallScreen() ? 'sm' : 'lg'
  const group = FILM_GROUPS[groupId]
  const film = group.films[idx] ?? group.films[0]

  // open / close
  useEffect(() => {
    if (!open) return
    setGroupId(open.group)
    const i = FILM_GROUPS[open.group].films.findIndex((f) => f.id === open.film)
    setIdx(Math.max(0, i))
    setPaused(false)
  }, [open])

  useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const reduced = prefersReducedMotion()
    if (open) {
      lockScroll(true)
      gsap.set(el, { visibility: 'visible' })
      if (!reduced) gsap.fromTo(el, { clipPath: 'inset(50% 0 50% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 1.1, ease: 'expo.inOut' })
      else gsap.set(el, { clipPath: 'none' })
      closeBtn.current?.focus({ preventScroll: true })
    } else {
      lockScroll(false)
      vids.current.forEach((v) => v?.pause())
      gsap.to(el, { clipPath: 'inset(50% 0 50% 0)', duration: reduced ? 0 : 0.8, ease: 'expo.inOut', onComplete: () => { gsap.set(el, { visibility: 'hidden' }) } })
    }
  }, [open])

  // play the current film, pause the rest; animate the copy in
  useEffect(() => {
    if (!open) return
    vids.current.forEach((v, i) => {
      if (!v) return
      if (i === idx) { v.currentTime = 0; if (!paused) v.play().catch(() => {}) }
      else v.pause()
    })
    setProgress(0)
    if (!prefersReducedMotion() && root.current) {
      gsap.fromTo(root.current.querySelectorAll('[data-copy]'), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out', delay: 0.15 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, groupId, open])

  const go = useCallback((i: number) => setIdx((i + group.films.length) % group.films.length), [group.films.length])

  // progress + auto-advance
  useEffect(() => {
    const v = vids.current[idx]
    if (!v || !open) return
    const onTime = () => v.duration && setProgress(v.currentTime / v.duration)
    const onEnd = () => (group.films.length > 1 ? go(idx + 1) : (v.currentTime = 0, v.play().catch(() => {})))
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => { v.removeEventListener('timeupdate', onTime); v.removeEventListener('ended', onEnd) }
  }, [idx, open, go, group.films.length])

  // keyboard
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(idx + 1)
      if (e.key === 'ArrowLeft') go(idx - 1)
      if (e.key === 'Tab' && root.current) {
        const f = root.current.querySelectorAll<HTMLElement>('a[href],button:not([disabled])')
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, idx, go, onClose])

  const togglePause = () => {
    const v = vids.current[idx]
    if (!v) return
    if (v.paused) { v.play().catch(() => {}); setPaused(false) } else { v.pause(); setPaused(true) }
  }

  const msg = encodeURIComponent(`Hello Vimal Resort, I'd like details and rates for ${film.enquiry}.`)

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={`${group.title}: ${film.name}`}
      className="invisible fixed inset-0 z-[55] overflow-hidden bg-charcoal text-ivory"
      style={{ clipPath: 'inset(50% 0 50% 0)' }}
    >
      {/* films */}
      {open && group.films.map((f, i) => (
        <video
          key={`${groupId}-${f.id}`}
          ref={(el) => { vids.current[i] = el }}
          src={src(f.film, size)}
          muted
          playsInline
          preload={i === idx ? 'auto' : 'metadata'}
          aria-hidden
          className={`absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-[1400ms] ease-[var(--ease-cine)] ${i === idx ? 'scale-100 opacity-100' : 'scale-[1.04] opacity-0'}`}
        />
      ))}
      {/* grade */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-charcoal/92 via-charcoal/45 to-transparent max-md:bg-gradient-to-t max-md:from-charcoal/95 max-md:via-charcoal/50" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-charcoal/70 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-3 border border-ivory/15 md:inset-5" />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-4 px-7 py-6 md:px-12 md:py-8">
        <button ref={closeBtn} type="button" onClick={onClose} className="label flex items-center gap-3 text-ivory/90 hover:text-gold">
          <span aria-hidden className="text-base">←</span> Back to the resort
        </button>
        <nav aria-label="Other films" className="hidden items-center gap-6 md:flex">
          {(Object.keys(FILM_GROUPS) as FilmGroup['id'][]).map((g) => (
            <button key={g} type="button" onClick={() => { setGroupId(g); setIdx(0) }}
              className={`label link-line ${g === groupId ? 'text-gold' : 'text-ivory/60 hover:text-ivory'}`}>
              {FILM_GROUPS[g].title}
            </button>
          ))}
        </nav>
      </div>

      {/* copy */}
      {open && (
        <div key={`${groupId}-${film.id}`} className="absolute bottom-28 left-7 right-7 z-10 max-w-xl md:bottom-auto md:left-[6vw] md:top-[52%] md:-translate-y-1/2">
          <p data-copy className="label tracking-[0.45em] text-gold">{group.title} · {film.kicker}</p>
          <h2 data-copy className="serif-display mt-3 text-5xl md:text-[min(5.4vw,11svh)]">{film.name}</h2>
          <span data-copy className="mt-5 block h-px w-20 bg-gold [@media(max-height:760px)]:mt-3" />
          <p data-copy className="mt-5 max-w-md text-[0.92rem] leading-relaxed text-ivory/85 md:text-base [@media(max-height:760px)]:mt-3 [@media(max-height:760px)]:text-sm">{film.style}</p>
          <ul data-copy className="mt-4 hidden max-w-lg flex-wrap gap-2 md:[@media(max-height:820px)]:flex">
            {film.details.map((d) => (
              <li key={d.label} className="border border-ivory/20 bg-charcoal/40 px-3 py-1.5 text-[0.72rem] text-ivory/85 backdrop-blur-sm">
                <span className="mr-1.5 text-gold/90">{d.label}</span>{d.value}
              </li>
            ))}
          </ul>
          <dl data-copy className="mt-6 hidden max-w-md border-t border-ivory/15 md:block [@media(max-height:820px)]:!hidden">
            {film.details.map((d) => (
              <div key={d.label} className="flex items-baseline justify-between gap-6 border-b border-ivory/15 py-3">
                <dt className="label text-[0.6rem] text-ivory/55">{d.label}</dt>
                <dd className="text-right font-serif text-lg">{d.value}</dd>
              </div>
            ))}
          </dl>
          <div data-copy className="mt-6 flex max-w-md items-end justify-between gap-6 border border-gold/40 bg-charcoal/50 px-5 py-4 backdrop-blur-sm [@media(max-height:760px)]:mt-4 [@media(max-height:760px)]:py-3">
            <div>
              <p className="label text-[0.6rem] text-ivory/55">{film.price.label}</p>
              <p className="mt-1 font-serif text-3xl text-gold">{film.price.value}</p>
            </div>
            <a className="btn-gold shrink-0" href={`${CONTACT.whatsapp}?text=${msg}`} target="_blank" rel="noreferrer">Enquire</a>
          </div>
          {film.price.note && (
            <p data-copy className="mt-3 max-w-md text-[0.68rem] leading-relaxed text-ivory/50 [@media(max-height:760px)]:hidden">
              {film.price.note}{film.price.source ? ` Source: ${SOURCES[film.price.source].label}.` : ''}
            </p>
          )}
        </div>
      )}

      {/* bottom: film index + progress */}
      <div className="absolute inset-x-7 bottom-7 z-10 flex items-end gap-5 md:inset-x-12 md:bottom-10">
        <ol className="flex min-w-0 flex-1 gap-3 md:gap-5">
          {group.films.map((f, i) => (
            <li key={f.id} className="min-w-0 flex-1 md:max-w-56">
              <button type="button" onClick={() => go(i)} aria-current={i === idx ? 'true' : undefined} className="group w-full text-left">
                <span className="relative block h-px overflow-hidden bg-ivory/20">
                  <span className="absolute inset-0 origin-left bg-gold" style={{ transform: `scaleX(${i === idx ? progress : i < idx ? 1 : 0})` }} />
                </span>
                <span className={`mt-3 block truncate font-serif text-sm md:text-lg ${i === idx ? 'text-ivory' : 'text-ivory/45 group-hover:text-ivory/80'}`}>
                  <span className="mr-2 font-sans text-[0.6rem] text-gold">{String(i + 1).padStart(2, '0')}</span>{f.name}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <button type="button" onClick={togglePause} className="label flex h-11 shrink-0 items-center gap-2 border border-ivory/25 px-4 text-ivory/80 hover:border-gold hover:text-gold" aria-label={paused ? 'Play film' : 'Pause film'}>
          <span aria-hidden className="text-[0.65rem]">{paused ? '▶' : '❚❚'}</span>
        </button>
      </div>
    </div>
  )
}
