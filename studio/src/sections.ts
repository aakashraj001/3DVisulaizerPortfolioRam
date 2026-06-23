/* ============================================================
   Studio sections — Services list (from the taxonomy), oversized stats,
   numbered process, About reveal, and the marquee. Reveals + marquee are
   registered inside motion branches; building DOM is motion-independent.
   ============================================================ */
import { gsap, ScrollTrigger, SplitText, EASE } from './motion'
import { getServices } from './services'

const esc = (s: string) => {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

/** Build the Services list from the taxonomy (in-development families marked). */
export function mountServices(host: HTMLElement): void {
  getServices().forEach((f, i) => {
    const row = document.createElement('article')
    row.className = 'service reveal' + (f.active ? '' : ' service--dev')
    row.dataset.accent = f.accent
    row.innerHTML = `
      <span class="service__num label tnum">${String(i + 1).padStart(2, '0')}</span>
      <div class="service__head">
        <h3 class="service__label display">${esc(f.label)}</h3>
        ${f.active ? '' : '<span class="service__dev-tag label">In development</span>'}
      </div>
      <p class="service__blurb">${esc(f.blurb)}</p>
      <ul class="service__disc">${f.disciplines.map((d) => `<li class="label">${esc(d)}</li>`).join('')}</ul>`
    host.appendChild(row)
  })
}

/** Generic fade/rise reveals (transform/opacity only). */
export function animateReveals(): void {
  ScrollTrigger.batch('.reveal', {
    start: 'top 88%',
    onEnter: (b) =>
      gsap.fromTo(
        b,
        { autoAlpha: 0, y: 44 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.08, overwrite: true },
      ),
    once: true,
  })
}

/** Set stats to their final value with no animation (reduced-motion path). */
export function setStatsFinal(): void {
  document.querySelectorAll<HTMLElement>('.stat__num').forEach((el) => {
    if (el.firstChild) el.firstChild.textContent = el.dataset.count || '0'
  })
}

/** Oversized stat numbers count up on reveal. */
export function animateStats(): void {
  document.querySelectorAll<HTMLElement>('.stat__num').forEach((el) => {
    const target = Number(el.dataset.count || '0')
    const obj = { v: 0 }
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: target,
          duration: 1.4,
          ease: EASE,
          onUpdate: () => (el.firstChild!.textContent = String(Math.round(obj.v))),
        }),
    })
  })
}

/** About statement: words brighten as the section scrolls. */
export function animateAbout(): () => void {
  const quote = document.querySelector<HTMLElement>('.about__lead')
  if (!quote) return () => {}
  const split = new SplitText(quote, { type: 'words' })
  const tween = gsap.fromTo(
    split.words,
    { opacity: 0.2 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.05,
      scrollTrigger: { trigger: quote, start: 'top 80%', end: 'bottom 55%', scrub: true },
    },
  )
  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
    split.revert()
  }
}

/** Infinite marquee strip (paused under reduced motion = not called). */
export function animateMarquee(): () => void {
  const track = document.querySelector<HTMLElement>('.marquee__track')
  if (!track) return () => {}
  const tween = gsap.to(track, { xPercent: -50, duration: 22, ease: 'none', repeat: -1 })
  return () => tween.kill()
}
