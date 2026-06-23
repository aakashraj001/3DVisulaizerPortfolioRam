/* ============================================================
   Persistent mono nav (fixed, outside the smoother). Section links
   smooth-scroll to a computed offset (rect.top + scrollY − navHeight) and do
   NOT focus() the target (focusing a viewport-taller section jumps the page +
   cancels ScrollSmoother). "Sound on" is an accessible aria-pressed stub.
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
      const y = Math.max(0, target.getBoundingClientRect().top + window.scrollY - (navH + 8))
      const smoother = getSmoother()
      if (smoother) smoother.scrollTo(y, true)
      else window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
      // Intentionally NO target.focus() — see header comment.
    })
  })

  // "Sound on" accessible stub.
  const sound = document.querySelector<HTMLButtonElement>('.nav__sound')
  sound?.addEventListener('click', () => {
    const on = sound.getAttribute('aria-pressed') === 'true'
    sound.setAttribute('aria-pressed', String(!on))
    sound.querySelector('.nav__sound-state')!.textContent = on ? 'OFF' : 'ON'
  })
}

/** Solidify the nav after the hero; scroll-spy the current section. */
export function animateNav(): void {
  const nav = document.querySelector<HTMLElement>('.nav')
  if (!nav) return
  let solid = false
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      const s = self.scroll() > window.innerHeight * 0.6
      if (s !== solid) {
        nav.classList.toggle('is-solid', s)
        solid = s
      }
    },
  })
  const links = nav.querySelectorAll<HTMLAnchorElement>('.nav__links a')
  const setCurrent = (id: string | null) =>
    links.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `#${id}`))
  ;['work', 'about', 'contact'].forEach((id) => {
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
}
