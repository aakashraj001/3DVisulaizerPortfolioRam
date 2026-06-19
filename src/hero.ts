/* ============================================================
   Hero text + intro reveal (owned by site-shell, independent of WebGL).
   The eyebrow / Fraunces headline / statement / featured-work label / scroll
   cue render over whichever backdrop is active (WebGL canvas or static image).
   mountHero() inserts the static featured image (first-paint + fallback) and
   fills the featured-work label. playHeroIntro() runs the SplitText char
   mask-reveal + fades after the preloader curtain.
   ============================================================ */

import { gsap, ScrollTrigger, SplitText, EASE } from './motion'
import { renderImage } from './images'
import { getFeatured, categoryLabel } from './cms'

export async function mountHero(): Promise<void> {
  const featured = await getFeatured()
  if (!featured) return

  const bg = document.querySelector<HTMLElement>('.hero__bg')
  if (bg) {
    const media = renderImage(featured.image, {
      sizes: '100vw',
      eager: true,
      className: 'hero__img',
      widths: [768, 1280, 1920, 2560],
    })
    bg.prepend(media)
  }

  const label = document.querySelector<HTMLElement>('.hero__featured')
  if (label) {
    label.innerHTML = `<span class="hero__featured-k label label--wide">Featured</span>
      <span class="hero__featured-v">${escapeText(featured.title)} — ${categoryLabel(featured.category)} · ${featured.year} · ${escapeText(featured.engine)}</span>`
  }
}

function escapeText(s: string): string {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

/**
 * SplitText char mask-reveal of the headline + fades; plays after the preloader.
 * Returns a disposer (kill timeline + revert the SplitText DOM) so a matchMedia
 * branch switch tears the split down before the next branch re-splits — matching
 * the SplitText lifecycle used by the preloader and studio statement.
 */
export function playHeroIntro(after: Promise<void>): () => void {
  const title = document.querySelector<HTMLElement>('.hero__title')
  const fades = gsap.utils.toArray<HTMLElement>(
    '.hero__eyebrow, .hero__statement, .hero__featured, .hero__cue',
  )
  if (!title) return () => {}

  const split = new SplitText(title, { type: 'lines,chars', linesClass: 'line-mask' })
  const tl = gsap.timeline({ paused: true })
  tl.from(split.chars, {
    yPercent: 115,
    duration: 1.0,
    ease: EASE,
    stagger: 0.018,
  }).from(
    fades,
    { autoAlpha: 0, y: 24, duration: 0.9, ease: EASE, stagger: 0.12 },
    0.35,
  )

  let cancelled = false
  after.then(() => {
    if (!cancelled) tl.play()
  })

  return () => {
    cancelled = true
    tl.kill()
    split.revert()
  }
}

/** Gentle scroll drift of hero content as the user scrolls past. */
export function animateHeroScroll(): void {
  const content = document.querySelector<HTMLElement>('.hero__content')
  if (!content) return
  gsap.to(content, {
    yPercent: -14,
    autoAlpha: 0.0,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  })
  // Keep ScrollTrigger honest about the hero's pinned height.
  ScrollTrigger.refresh()
}
