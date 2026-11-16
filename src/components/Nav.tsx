import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, lockScroll, prefersReducedMotion, scrollToTarget } from '../lib/motion'
import { SCENES, useExplorer } from '../state'
import { CONTACT } from '../data/resort'

type Item = { label: string; to: string; zone?: string }
const ITEMS: Item[] = [
  { label: 'Explore', to: 'discover' },
  { label: 'Adventure', to: 'discover', zone: 'adventure' },
  { label: 'Stay', to: 'stay' },
  { label: 'Events', to: 'events' },
  { label: 'Packages', to: 'packages' },
  { label: 'Contact', to: 'contact' },
]

export function Nav() {
  const { openFilms } = useExplorer()
  const [active, setActive] = useState<string>('arrival')
  const [progress, setProgress] = useState(0)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuBtn = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const triggers = SCENES.map((s) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setActive(s.id),
      }),
    )
    const total = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => setProgress(self.progress) })
    return () => { triggers.forEach((t) => t.kill()); total.kill() }
  }, [])

  useEffect(() => {
    const el = menuRef.current
    if (!el) return
    lockScroll(menu)
    if (menu) {
      gsap.set(el, { visibility: 'visible' })
      if (!prefersReducedMotion()) {
        gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' })
        gsap.fromTo(el.querySelectorAll('li'), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, delay: 0.35, duration: 0.8, ease: 'expo.out' })
      } else gsap.set(el, { clipPath: 'none' })
      el.querySelector<HTMLElement>('a,button')?.focus()
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    } else {
      gsap.to(el, { clipPath: 'inset(0 0 100% 0)', duration: prefersReducedMotion() ? 0 : 0.6, ease: 'expo.inOut', onComplete: () => { gsap.set(el, { visibility: 'hidden' }) } })
    }
  }, [menu])

  const go = (item: Item) => {
    setMenu(false)
    if (item.zone) openFilms('play', 'zipline')
    else scrollToTarget(item.to)
  }


  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 px-5 py-4 md:px-10 md:py-7">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal/55 to-transparent" aria-hidden />
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center">
          {/* left links */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {ITEMS.slice(0, 3).map((it) => (
                <li key={it.label}>
                  <button type="button" onClick={() => go(it)} className={`label link-line py-2 transition-colors duration-300 hover:text-gold ${!it.zone && active === it.to ? 'text-gold' : 'text-ivory/80'}`}>{it.label}</button>
                </li>
              ))}
            </ul>
          </nav>
          <span className="lg:hidden" />
          {/* wordmark */}
          <button type="button" onClick={() => scrollToTarget('discover')} className="group relative flex flex-col items-center text-ivory" aria-label="Vimal Resort: return to the resort overview">
            <span className="font-serif text-[1.65rem] leading-none tracking-[0.32em] md:text-3xl">VIMAL</span>
            <span className="label mt-1.5 hidden text-[0.5rem] tracking-[0.55em] text-gold/80 md:block">Resort · Gadag</span>
          </button>
          {/* right links */}
          <div className="flex items-center justify-end gap-9">
            <nav aria-label="Secondary" className="hidden lg:block">
              <ul className="flex items-center gap-9">
                {ITEMS.slice(3).map((it) => (
                  <li key={it.label}>
                    <button type="button" onClick={() => go(it)} className={`label link-line py-2 transition-colors duration-300 hover:text-gold ${active === it.to ? 'text-gold' : 'text-ivory/80'}`}>{it.label}</button>
                  </li>
                ))}
              </ul>
            </nav>
            <a href={CONTACT.whatsapp} target="_blank" rel="noreferrer" className="label hidden border border-gold/60 px-5 py-3 text-gold transition-colors duration-500 hover:bg-gold hover:text-charcoal xl:inline-block">Enquire</a>
            <button
              ref={menuBtn}
              type="button"
              onClick={() => setMenu((m) => !m)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              className="label flex items-center gap-3 text-ivory lg:hidden"
            >
              <span>{menu ? 'Close' : 'Menu'}</span>
              <span aria-hidden className="flex w-6 flex-col gap-1.5">
                <span className={`h-px w-full bg-ivory transition-transform duration-500 ${menu ? 'translate-y-[3.5px] rotate-45' : ''}`} />
                <span className={`h-px w-full bg-ivory transition-transform duration-500 ${menu ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
              </span>
            </button>
          </div>
        </div>
        <span aria-hidden className="absolute bottom-0 left-0 h-px w-full origin-left bg-gold/50" style={{ transform: `scaleX(${progress})` }} />
      </header>

      {/* mobile menu */}
      <div id="mobile-menu" ref={menuRef} className="invisible fixed inset-0 z-[25] flex flex-col justify-between bg-forest px-6 pb-10 pt-28 lg:hidden" style={{ clipPath: 'inset(0 0 100% 0)' }}>
        <ul className="space-y-1">
          {ITEMS.map((it, i) => (
            <li key={it.label} className="overflow-hidden">
              <button type="button" onClick={() => go(it)} className="flex w-full items-baseline gap-4 py-2 text-left">
                <span className="font-serif text-sm text-gold">{String(i + 1).padStart(2, '0')}</span>
                <span className="serif-display text-5xl text-ivory">{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="space-y-2 text-sm text-ivory/70">
          <a className="block" href={CONTACT.phoneHref}>{CONTACT.phoneDisplay}</a>
          <a className="block" href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
        </div>
      </div>

      {/* scene rail */}
      <nav aria-label="Scenes" className="fixed right-5 top-1/2 z-20 hidden -translate-y-1/2 xl:block">
        <ol className="flex flex-col items-end gap-3">
          {SCENES.map((s) => (
            <li key={s.id}>
              <button type="button" onClick={() => scrollToTarget(s.id)} className="group flex items-center gap-3" aria-current={active === s.id ? 'step' : undefined}>
                <span className={`label text-[0.6rem] transition-all duration-500 ${active === s.id ? 'translate-x-2 text-gold opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100' : 'translate-x-2 text-ivory/70 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100'}`}>
                  {s.index} {s.title}
                </span>
                <span className={`block h-px transition-all duration-500 ${active === s.id ? 'w-10 bg-gold' : 'w-4 bg-ivory/40 group-hover:w-6'}`} />
              </button>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
