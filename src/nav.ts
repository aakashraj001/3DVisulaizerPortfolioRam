/* ============================================================
   Fixed nav — transparent over hero; solidifies (blur + hairline) after 40px;
   hides on scroll-down, returns on scroll-up. mountNav() wires anchor links to
   smooth-scroll; animateNav() registers the scroll-driven class toggles.
   ============================================================ */

import { ScrollTrigger } from './motion'
import { getSmoother } from './smoothScroll'

export function mountNav(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector<HTMLElement>(a.getAttribute('href') || '')
      if (!target) return
      e.preventDefault()
      const smoother = getSmoother()
      if (smoother) smoother.scrollTo(target, true, 'top top')
      else target.scrollIntoView({ behavior: 'auto', block: 'start' })
      // Move focus to the destination so keyboard users (esp. the skip link)
      // actually land there. Make it programmatically focusable if needed.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus({ preventScroll: true })
    })
  })
}

export function animateNav(): void {
  const nav = document.querySelector<HTMLElement>('.nav')
  if (!nav) return
  let lastSolid = false
  let lastHidden = false

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const y = self.scroll()
      const solid = y > 40
      if (solid !== lastSolid) {
        nav.classList.toggle('is-solid', solid)
        lastSolid = solid
      }
      // Hide when scrolling down past the hero; show on scroll up.
      const hidden = y > 240 && self.direction === 1
      if (hidden !== lastHidden) {
        nav.classList.toggle('is-hidden', hidden)
        lastHidden = hidden
      }
    },
  })
}
