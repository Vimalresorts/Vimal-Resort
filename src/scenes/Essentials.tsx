import { useEffect, useRef } from 'react'
import { gsap, useReducedMotion } from '../lib/motion'
import { CONTACT, PACKAGES, PROPERTY, ZONES } from '../data/resort'
import { SOURCES, AUDIT_DATE } from '../data/sources'
import { Picture } from '../components/Picture'
import { useExplorer } from '../state'
import { FILM_GROUPS } from '../data/films'

/**
 * Practical layer: Stay, Celebrations, Packages, Contact.
 * Built so nobody has to sit through the journey to find a price or a phone
 * number. Each will later be replaced by its full cinematic scene.
 */
function useReveal(ref: React.RefObject<HTMLElement | null>) {
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) =>
        gsap.from(el, { opacity: 0, y: 40, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } }),
      )
      gsap.utils.toArray<HTMLElement>('[data-wipe]').forEach((el) =>
        gsap.fromTo(el, { clipPath: 'inset(12% 12% 12% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: el, start: 'top 90%', end: 'top 30%', scrub: 0.8 } }),
      )
      gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) =>
        gsap.fromTo(el, { yPercent: -8, scale: 1.15 }, { yPercent: 8, scale: 1.15, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }),
      )
    }, ref)
    return () => ctx.revert()
  }, [reduced, ref])
}

const zone = (id: string) => ZONES.find((z) => z.id === id)!

export function Essentials() {
  const root = useRef<HTMLDivElement>(null)
  const { openFilms } = useExplorer()
  useReveal(root)

  return (
    <div ref={root} className="relative bg-charcoal">
      {/* ------------------------------ STAY ------------------------------ */}
      <section id="stay" aria-labelledby="stay-title" className="relative grid gap-12 px-6 py-28 md:grid-cols-12 md:gap-8 md:px-[6vw] md:py-40">
        <div data-wipe className="relative aspect-[4/5] overflow-hidden md:col-span-6 md:aspect-auto md:min-h-[78vh]">
          <div data-drift className="absolute inset-0">
            <Picture id="roomTwin" sizes="(max-width: 767px) 100vw, 50vw" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="flex flex-col justify-center md:col-span-5 md:col-start-8">
          <p data-reveal className="label text-gold">03 · Stay at Vimal</p>
          <h2 id="stay-title" data-reveal className="serif-display mt-5 text-6xl md:text-[5.2vw]">Find Your Place <em className="text-ivory/85">to Unwind.</em></h2>
          <p data-reveal className="mt-8 max-w-md leading-relaxed text-ivory/75">
            Each room plays as a short film, with its style and details alongside. Tariffs aren't published, so ask the resort for current rates.
          </p>
          <div data-reveal className="mt-10 border-t border-ivory/10">
            {FILM_GROUPS.stay.films.map((f) => (
              <button key={f.id} type="button" onClick={(e) => openFilms('stay', f.id, e.currentTarget)} className="group flex w-full items-center justify-between gap-6 border-b border-ivory/10 py-6 text-left">
                <span>
                  <span className="serif-display block text-3xl transition-colors group-hover:text-gold md:text-4xl">{f.name}</span>
                  <span className="mt-1 block text-sm text-ivory/55">{f.kicker} · {f.price.value}</span>
                  <span className="label mt-3 inline-flex items-center gap-2 text-[0.62rem] text-gold"><span aria-hidden>▶</span> Watch the film</span>
                </span>
                <span aria-hidden className="text-2xl text-gold transition-transform duration-500 group-hover:translate-x-2">→</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ EVENTS ------------------------------ */}
      <section id="events" aria-labelledby="events-title" className="relative overflow-hidden bg-forest">
        <div className="relative h-[70svh] overflow-hidden md:h-[88svh]">
          <div data-drift className="absolute inset-0">
            <Picture id="marriageHall" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/30 to-charcoal/40" />
          <div className="absolute bottom-10 left-6 right-6 md:bottom-16 md:left-[6vw]">
            <p data-reveal className="label text-gold">04 · Dining & Celebrations</p>
            <h2 id="events-title" data-reveal className="serif-display mt-5 max-w-5xl text-6xl md:text-[6vw]">Beautiful Places. <em className="text-ivory/85">Unforgettable Moments.</em></h2>
          </div>
        </div>
        <ul className="px-6 pb-28 md:px-[6vw] md:pb-36">
          {(['lawn', 'halls', 'restaurant'] as const).map((id, i) => {
            const z = zone(id)
            return (
              <li key={id} data-reveal className="border-b border-ivory/15">
                <button type="button" onClick={(e) => openFilms(id === 'restaurant' ? 'dining' : 'events', id === 'halls' ? 'hall' : id, e.currentTarget)} className="group grid w-full grid-cols-12 items-baseline gap-4 py-8 text-left md:py-10">
                  <span className="col-span-2 font-serif text-sm text-gold md:col-span-1">{String(i + 1).padStart(2, '0')}</span>
                  <span className="serif-display col-span-10 text-4xl transition-transform duration-700 group-hover:translate-x-3 md:col-span-5 md:text-6xl">{z.name}</span>
                  <span className="col-span-10 col-start-3 text-sm text-ivory/65 md:col-span-4 md:col-start-auto">{z.facts.map((f) => f.value).join(' · ')}<span className="label mt-2 flex items-center gap-2 text-[0.6rem] text-gold"><span aria-hidden>▶</span> Watch the film</span></span>
                  <span aria-hidden className="hidden text-right text-2xl text-gold md:col-span-2 md:block">→</span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      {/* ------------------------------ PACKAGES ------------------------------ */}
      <section id="packages" aria-labelledby="packages-title" className="relative px-6 py-28 md:px-[6vw] md:py-40">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p data-reveal className="label text-gold">05 · Day packages</p>
            <h2 id="packages-title" data-reveal className="serif-display mt-5 text-6xl md:text-[4.6vw]">Make Every Moment <em>Count.</em></h2>
            <p data-reveal className="mt-8 max-w-sm text-sm leading-relaxed text-ivory/65">
              Day visits run {PACKAGES.timings}. Groups welcome: schools, colleges, corporate outings and family functions.
            </p>
            <p data-reveal className="mt-6 max-w-sm border-l border-gold/40 pl-4 text-xs leading-relaxed text-ivory/50">
              These are published reference prices ({SOURCES[PACKAGES.source].label}, checked {AUDIT_DATE}), {PACKAGES.taxNote.toLowerCase()}. They don't show live availability. Confirm with the resort before you visit.
            </p>
          </div>

          <div className="md:col-span-7 md:col-start-6">
            {/* Gold */}
            <article data-reveal className="border-t border-gold/50 pt-8">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="serif-display text-4xl md:text-5xl">{PACKAGES.gold.name}</h3>
                <span className="label text-ivory/50">Per person</span>
              </div>
              <dl className="mt-8">
                {PACKAGES.gold.prices.map((p) => (
                  <div key={p.label} className="flex items-baseline justify-between gap-4 border-b border-ivory/10 py-4">
                    <dt className="text-sm text-ivory/75">{p.label}{p.note && <span className="ml-2 text-xs text-ivory/45">({p.note})</span>}</dt>
                    <dd className="font-serif text-3xl text-gold">{p.price}</dd>
                  </div>
                ))}
              </dl>
              <p className="label mt-8 text-ivory/50">Included</p>
              <p className="mt-3 text-[0.95rem] leading-loose text-ivory/80">{PACKAGES.gold.includes.join('  ·  ')}</p>
            </article>
            {/* Adventure */}
            <article data-reveal className="mt-16 border-t border-gold/50 pt-8">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <h3 className="serif-display text-4xl md:text-5xl">{PACKAGES.adventure.name}</h3>
                <p><span className="font-serif text-3xl text-gold">{PACKAGES.adventure.price}</span> <span className="text-sm text-ivory/55">{PACKAGES.adventure.unit}</span></p>
              </div>
              <p className="mt-6 text-[0.95rem] leading-loose text-ivory/80">{PACKAGES.adventure.includes.join('  ·  ')}</p>
            </article>
            <p data-reveal className="mt-10 text-sm text-ivory/55">{PACKAGES.extras.map((e) => `${e.label}: ${e.value}`).join(' · ')}</p>
            <div data-reveal className="mt-10 flex flex-wrap gap-3">
              <a className="btn-gold" href={`${CONTACT.whatsapp}?text=${encodeURIComponent('Hello Vimal Resort, I would like to book a day package.')}`} target="_blank" rel="noreferrer">Book on WhatsApp</a>
              <a className="btn-ghost" href={CONTACT.phoneHref}>Call {CONTACT.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------ FINALE / CONTACT ------------------------------ */}
      <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden">
        <div className="relative min-h-svh">
          <div data-drift className="absolute inset-0">
            <Picture id="buggyPath" className="h-full w-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-charcoal/60" />
          <div className="relative flex min-h-svh flex-col justify-center px-6 py-32 md:px-[6vw]">
            <p data-reveal className="label text-gold">06 · Visit</p>
            <h2 id="contact-title" data-reveal className="serif-display mt-5 max-w-5xl text-6xl md:text-[7vw]">Your Story Begins <em>at Vimal.</em></h2>
            <div data-reveal className="mt-14 grid gap-10 text-sm md:grid-cols-3">
              <div>
                <p className="label mb-3 text-ivory/50">Find us</p>
                <p className="leading-relaxed text-ivory/85">{CONTACT.address}</p>
                <a className="mt-4 inline-block border-b border-gold pb-1 text-gold" href={CONTACT.mapsUrl} target="_blank" rel="noreferrer">Get Directions →</a>
              </div>
              <div>
                <p className="label mb-3 text-ivory/50">Talk to us</p>
                <a className="block font-serif text-2xl" href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
                <a className="mt-1 block text-ivory/80" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                <a className="mt-4 inline-block border-b border-gold pb-1 text-gold" href={CONTACT.whatsapp} target="_blank" rel="noreferrer">WhatsApp →</a>
              </div>
              <div>
                <p className="label mb-3 text-ivory/50">Nearby</p>
                <ul className="space-y-1.5 text-ivory/80">
                  {CONTACT.nearby.map((n) => (
                    <li key={n.place} className="flex justify-between gap-4 border-b border-ivory/10 pb-1.5"><span>{n.place}</span><span className="tabular-nums text-ivory/55">{n.km}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <footer className="relative flex flex-col gap-3 border-t border-ivory/10 bg-charcoal px-6 py-8 text-[0.7rem] text-ivory/45 md:flex-row md:items-center md:justify-between md:px-[6vw]">
          <span className="font-serif text-base tracking-[0.18em] text-ivory/80">VIMAL <span className="ml-2 font-sans text-[0.7rem] tracking-normal text-ivory/40">{PROPERTY.kannadaName}</span></span>
          <span>{PROPERTY.name} · Gadag, Karnataka · {CONTACT.instagram}</span>
          <span>Prototype: scenes 01–02 are cinematic; the rest are practical placeholders.</span>
        </footer>
      </section>
    </div>
  )
}
