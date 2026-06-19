/* ============================================================
   ScrollSmoother — the single scroll authority. effects:true unlocks
   declarative data-speed / data-lag parallax, perfectly synced with every
   ScrollTrigger. Created only inside motion-OK matchMedia branches (never
   under reduced motion). Mobile uses a smaller smooth value.
   ============================================================ */

import { ScrollSmoother } from './motion'

let smoother: ScrollSmoother | null = null

export function createSmoother(smooth: number): ScrollSmoother {
  smoother = ScrollSmoother.create({
    wrapper: '#smooth-wrapper',
    content: '#smooth-content',
    smooth,
    effects: true,
    normalizeScroll: true,
    smoothTouch: 0.1,
  })
  return smoother
}

export function getSmoother(): ScrollSmoother | null {
  return smoother
}

export function killSmoother(): void {
  smoother?.kill()
  smoother = null
}
