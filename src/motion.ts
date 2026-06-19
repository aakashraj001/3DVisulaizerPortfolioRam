/* ============================================================
   Motion system — GSAP plugin registration + the easing language +
   environment predicates. All four formerly-premium plugins are free
   in GSAP 3.13+. matchMedia governance lives in main.ts, which funnels
   every animation through gsap.matchMedia() (see registerMotion()).
   ============================================================ */

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, Flip)

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, Flip }

/** Refined, slow easing — GSAP side. CSS side is --ease in tokens.css. */
export const EASE = 'power3.out'
export const EASE_INOUT = 'power3.inOut'

export const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isCoarsePointer = (): boolean =>
  window.matchMedia('(pointer: coarse)').matches

export const MOBILE_MAX = 767

/** A single matchMedia instance shared by all modules' motion registration. */
export const mm = gsap.matchMedia()

export const MEDIA = {
  desktop: `(prefers-reduced-motion: no-preference) and (min-width: ${MOBILE_MAX + 1}px)`,
  mobile: `(prefers-reduced-motion: no-preference) and (max-width: ${MOBILE_MAX}px)`,
  reduced: `(prefers-reduced-motion: reduce)`,
  motionOk: `(prefers-reduced-motion: no-preference)`,
}

/**
 * Branched motion registration. Each feature module passes callbacks; the
 * matching one runs and is auto-reverted by gsap.matchMedia when the media
 * condition changes (giving correct cleanup for free). The reduced-motion
 * branch is intentionally a no-op for animation — content is already visible.
 */
export interface MotionBranches {
  desktop?: (ctx: gsap.Context) => void
  mobile?: (ctx: gsap.Context) => void
  /** Optional hook for the reduced-motion branch (e.g. ensure visible). */
  reduced?: (ctx: gsap.Context) => void
}

export function registerMotion(branches: MotionBranches): void {
  if (branches.desktop) mm.add(MEDIA.desktop, branches.desktop)
  if (branches.mobile) mm.add(MEDIA.mobile, branches.mobile)
  if (branches.reduced) mm.add(MEDIA.reduced, branches.reduced)
}

/** Kill every ScrollTrigger + revert all matchMedia contexts (HMR / teardown). */
export function teardownMotion(): void {
  ScrollTrigger.getAll().forEach((st) => st.kill())
  mm.revert()
}
