/* ============================================================
   Motion system — GSAP plugin registration, snappy easing, and the
   matchMedia control plane. Same proven spine as variant one; easing
   tuned snappier (expo). All motion is registered through gsap.matchMedia().
   ============================================================ */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Flip)

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, Flip }

/** Snappy, confident easing (expo-out) — the studio's motion personality. */
export const EASE = 'expo.out'
export const EASE_INOUT = 'power4.inOut'

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
export const isCoarsePointer = (): boolean => window.matchMedia('(pointer: coarse)').matches

export const MOBILE_MAX = 860

export const mm = gsap.matchMedia()
export const MEDIA = {
  desktop: `(prefers-reduced-motion: no-preference) and (min-width: ${MOBILE_MAX + 1}px)`,
  mobile: `(prefers-reduced-motion: no-preference) and (max-width: ${MOBILE_MAX}px)`,
  reduced: `(prefers-reduced-motion: reduce)`,
}

export interface MotionBranches {
  desktop?: (ctx: gsap.Context) => void
  mobile?: (ctx: gsap.Context) => void
  reduced?: (ctx: gsap.Context) => void
}

export function registerMotion(b: MotionBranches): void {
  if (b.desktop) mm.add(MEDIA.desktop, b.desktop)
  if (b.mobile) mm.add(MEDIA.mobile, b.mobile)
  if (b.reduced) mm.add(MEDIA.reduced, b.reduced)
}

export function teardownMotion(): void {
  ScrollTrigger.getAll().forEach((st) => st.kill())
  mm.revert()
}
