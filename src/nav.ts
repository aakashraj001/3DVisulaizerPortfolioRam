/* ============================================================
   Fixed nav — transparent over hero; solidifies (blur + hairline) after 40px;
   hides on scroll-down, returns on scroll-up. mountNav() wires anchor links to
   smooth-scroll; animateNav() registers the scroll-driven class toggles.
   ============================================================ */

import { ScrollTrigger, prefersReducedMotion } from './motion'
import { getSmoother } from './smoothScroll'

export function mountNav(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-scroll]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector<HTMLElement>(a.getAttribute('href') || '')
      if (!target) return
      e.preventDefault()

      const navH = document.querySelector<HTMLElement>('.nav')?.offsetHeight ?? 64
      const gap = navH + 14 // land just below the fixed nav
      const smoother = getSmoother()

      // Absolute document position of the target = its rendered top (rect already
      // accounts for the ScrollSmoother transform) + the native scroll position.
      // Using window.scrollY (not smoother.scrollTop) avoids a NaN that made
      // scrollTo jump to the end. Works whether or not the smoother exists.
      const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - gap)
      if (smoother) {
        smoother.scrollTo(y, true)
      } else {
        window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      }
      // NB: we deliberately do NOT call target.focus() here. Focusing a
      // viewport-taller section makes browsers ignore preventScroll and jump the
      // page (the "Index goes off" bug), and even focusing a sentinel cancels
      // ScrollSmoother's in-flight tween. The smooth scroll is the affordance.
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
