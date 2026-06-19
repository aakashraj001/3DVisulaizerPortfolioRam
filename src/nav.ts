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

  // Solidify (blur + hairline) after 40px. The nav PERSISTS — it never hides —
  // so the section links stay reachable for quick jumping.
  let lastSolid = false
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const solid = self.scroll() > 40
      if (solid !== lastSolid) {
        nav.classList.toggle('is-solid', solid)
        lastSolid = solid
      }
    },
  })

  // Scroll-spy: highlight the nav link for the section currently in view.
  const links = nav.querySelectorAll<HTMLAnchorElement>('.nav__links a')
  const setCurrent = (id: string | null) => {
    links.forEach((a) => {
      const on = a.getAttribute('href') === `#${id}`
      a.classList.toggle('is-current', on)
      if (on) a.setAttribute('aria-current', 'true')
      else a.removeAttribute('aria-current')
    })
  }

  ;['index', 'studio', 'contact'].forEach((id) => {
    const sec = document.getElementById(id)
    if (!sec) return
    ScrollTrigger.create({
      trigger: sec,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => setCurrent(id),
      onEnterBack: () => setCurrent(id),
    })
  })
  // Back in the hero (above the first section) → clear the active link.
  const hero = document.querySelector('.hero')
  if (hero) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom center',
      onEnterBack: () => setCurrent(null),
      onLeaveBack: () => setCurrent(null),
    })
  }
}
