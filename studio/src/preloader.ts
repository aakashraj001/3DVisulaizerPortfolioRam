/* Preloader — mono 00→100 counter on --ink, then a curtain wipe. Skipped under
   reduced motion (main never calls it). Transform/opacity only. */
import { gsap, EASE_INOUT } from './motion'

export function runPreloader(): Promise<void> {
  return new Promise((resolve) => {
    const pre = document.querySelector<HTMLElement>('.preloader')
    const count = pre?.querySelector<HTMLElement>('.preloader__count')
    if (!pre || !count) {
      pre?.remove()
      resolve()
      return
    }
    const n = { v: 0 }
    gsap
      .timeline({
        onComplete: () => {
          pre.remove()
          resolve()
        },
      })
      .to(n, {
        v: 100,
        duration: 1.3,
        ease: 'power2.inOut',
        onUpdate: () => (count.textContent = String(Math.round(n.v)).padStart(3, '0')),
      })
      .to(pre, { yPercent: -100, duration: 0.9, ease: EASE_INOUT }, '+=0.1')
  })
}
