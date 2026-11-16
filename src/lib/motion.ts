import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect, useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isSmallScreen = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches

export function useReducedMotion() {
  const [reduced, set] = useState(prefersReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => set(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

let lenis: Lenis | null = null

/** Lenis smooth scroll wired into GSAP's ticker. Disabled for reduced motion. */
export function startSmoothScroll() {
  if (prefersReducedMotion() || lenis) return
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.2 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis?.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function lockScroll(locked: boolean) {
  if (lenis) (locked ? lenis.stop() : lenis.start())
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/** Scroll to an element id or a pixel offset; respects reduced motion. */
export function scrollToTarget(target: string | number, immediate = false) {
  const el = typeof target === 'string' ? document.getElementById(target) : null
  const y = el ? el.getBoundingClientRect().top + window.scrollY : (target as number)
  if (lenis && !immediate) lenis.scrollTo(y, { duration: 1.6 })
  else window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
}
