/* ============================================================
   Orchestrator. Build DOM once (motion-independent), then funnel ALL motion
   through gsap.matchMedia() branches: full desktop / reduced mobile /
   reduced-motion (no-op). The preloader runs only when motion is allowed and
   gates the hero intro. See design.md for the architecture.
   ============================================================ */

import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/shell.css'
import '../styles/gallery.css'

import { registerMotion, teardownMotion, prefersReducedMotion } from './motion'
import { createSmoother, killSmoother } from './smoothScroll'
import { mountGallery, animateGallery, setGalleryParallax, revealIndexBar } from './gallery'
import { initLightbox } from './lightbox'
import { mountNav, animateNav } from './nav'
import { mountHero, playHeroIntro, animateHeroScroll } from './hero'
import { animateStatement, animateContact, animateReveals } from './sections'
import { initCursor } from './cursor'
import { runPreloader } from './preloader'

async function boot(): Promise<void> {
  const galleryRoot = document.querySelector<HTMLElement>('.gallery')
  await Promise.all([galleryRoot ? mountGallery(galleryRoot) : Promise.resolve(), mountHero()])
  initLightbox()
  mountNav()

  // The hero intro waits for this; it resolves when the preloader curtain lifts
  // (or immediately if there is no preloader).
  let resolvePreloader!: () => void
  const preloaderDone = new Promise<void>((r) => (resolvePreloader = r))

  registerMotion({
    desktop: () => {
      const disposers: Array<() => void> = []
      setGalleryParallax(0.9, 0.12)
      createSmoother(1.2)
      animateNav()
      animateReveals()
      animateGallery()
      revealIndexBar()
      disposers.push(animateStatement())
      disposers.push(animateContact())
      disposers.push(initCursor())
      animateHeroScroll()
      disposers.push(playHeroIntro(preloaderDone))

      // Lazy WebGL hero — Three.js loads in its own chunk, desktop only.
      let disposeHero3D: (() => void) | null = null
      let killed = false
      import('./hero3d')
        .then(({ mountHero3D }) => mountHero3D())
        .then((d) => {
          if (killed) d()
          else disposeHero3D = d
        })
        .catch(() => {/* WebGL failed to load → static image stays */})

      return () => {
        killed = true
        disposers.forEach((d) => d())
        disposeHero3D?.()
        killSmoother()
      }
    },

    mobile: () => {
      // Battery-safe: no Three.js, reduced parallax, smaller smoothing.
      const disposers: Array<() => void> = []
      setGalleryParallax(0.97, 0.04)
      createSmoother(0.7)
      animateNav()
      animateReveals()
      animateGallery()
      revealIndexBar()
      disposers.push(animateStatement())
      disposers.push(animateContact())
      animateHeroScroll()
      disposers.push(playHeroIntro(preloaderDone))
      return () => {
        disposers.forEach((d) => d())
        killSmoother()
      }
    },

    reduced: () => {
      // No smoothing, parallax, SplitText, or stagger. Content is already
      // visible (no .js-motion class). The static hero image stands in for WebGL.
      // Nav still persists + scroll-spies (ScrollTrigger on native scroll).
      animateNav()
      revealIndexBar()
      return () => {}
    },
  })

  if (prefersReducedMotion()) {
    resolvePreloader()
  } else {
    await runPreloader()
    resolvePreloader()
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true })
} else {
  void boot()
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => teardownMotion())
}
