/* ScrollSmoother — single scroll authority; created only in motion-OK branches. */
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
