import { useEffect, useRef } from 'react'
import { gsap, prefersReducedMotion } from '../lib/motion'

/** Quiet luxury cursor: gold dot + trailing ring; grows on interactive things, says "Drag" on 360°s. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (!fine || prefersReducedMotion()) return
    document.documentElement.classList.add('has-cursor')
    const d = dot.current!, r = ring.current!
    const xd = gsap.quickTo(d, 'x', { duration: 0.08 }), yd = gsap.quickTo(d, 'y', { duration: 0.08 })
    const xr = gsap.quickTo(r, 'x', { duration: 0.5, ease: 'power3' }), yr = gsap.quickTo(r, 'y', { duration: 0.5, ease: 'power3' })
    const move = (e: PointerEvent) => {
      xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY)
      const t = e.target as Element | null
      const canvas = t?.closest('canvas')
      const drag = !!canvas && !!t?.closest('[role="dialog"]')
      r.classList.toggle('is-drag', drag)
      r.classList.toggle('is-hover', !drag && !!t?.closest('a,button,[role="button"]'))
    }
    const leave = () => gsap.to([d, r], { opacity: 0, duration: 0.3 })
    const enter = () => gsap.to([d, r], { opacity: 1, duration: 0.3 })
    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    document.addEventListener('pointerenter', enter)
    return () => {
      document.documentElement.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('pointerenter', enter)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor-dot hidden [@media(hover:hover)_and_(pointer:fine)]:block" aria-hidden />
      <div ref={ring} className="cursor-ring hidden [@media(hover:hover)_and_(pointer:fine)]:grid" aria-hidden><span>Drag</span></div>
    </>
  )
}
