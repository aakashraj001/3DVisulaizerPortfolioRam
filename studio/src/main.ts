/* ============================================================
   Orchestrator. Build DOM once (motion-independent), then funnel all motion
   through gsap.matchMedia() branches: desktop (full + WebGL + horizontal pin) /
   mobile (reduced, no WebGL, vertical work) / reduced-motion (no-op). Preloader
   runs only when motion is allowed.
   ============================================================ */
import '../styles/tokens.css'
import '../styles/base.css'
import '../styles/app.css'

import { registerMotion, teardownMotion, prefersReducedMotion } from './motion'
import { createSmoother, killSmoother } from './smoothScroll'
import { mountServices, animateReveals, animateStats, animateAbout, animateMarquee, setStatsFinal } from './sections'
import { mountWork, animateWorkPin, animateWorkReveals } from './work'
import { mountHeroStack } from './heroStack'
import { initLightbox } from './lightbox'
import { mountNav, animateNav } from './nav'
import { startClock } from './clock'
import { runPreloader } from './preloader'

async function boot(): Promise<void> {
  const servicesHost = document.querySelector<HTMLElement>('.services__list')
  if (servicesHost) mountServices(servicesHost)

  const workRoot = document.querySelector<HTMLElement>('.work')
  await Promise.all([workRoot ? mountWork(workRoot) : Promise.resolve(), mountHeroStack()])

  initLightbox()
  mountNav()
  startClock()

  registerMotion({
    desktop: () => {
      const dis: Array<() => void> = []
      createSmoother(1.1)
      animateNav()
      animateReveals()
      animateWorkReveals()
      animateStats()
      dis.push(animateAbout())
      dis.push(animateMarquee())
      dis.push(animateWorkPin())

      // Lazy WebGL hero backdrop (desktop only).
      let bgDispose: (() => void) | null = null
      let killed = false
      import('./heroBg3d')
        .then((m) => m.mountHeroBg())
        .then((d) => (killed ? d() : (bgDispose = d)))
        .catch(() => {})

      return () => {
        killed = true
        bgDispose?.()
        dis.forEach((d) => d())
        killSmoother()
      }
    },
    mobile: () => {
      const dis: Array<() => void> = []
      createSmoother(0.8)
      animateNav()
      animateReveals()
      animateWorkReveals()
      animateStats()
      dis.push(animateAbout())
      dis.push(animateMarquee())
      // No horizontal pin (work is a vertical stack) and no Three.js on mobile.
      return () => {
        dis.forEach((d) => d())
        killSmoother()
      }
    },
    reduced: () => {
      // Content is visible (no .js-motion). Nav still works (computed-offset scroll).
      animateNav()
      setStatsFinal() // show final stat values without the count-up animation
      return () => {}
    },
  })

  if (!prefersReducedMotion()) await runPreloader()
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true })
else void boot()

if (import.meta.hot) import.meta.hot.dispose(() => teardownMotion())
