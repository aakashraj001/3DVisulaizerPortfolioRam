/* ============================================================
   Preloader — full-screen --void; gilt counter 00→100; SplitText studio-name
   reveal; curtain wipe upward to reveal the hero. Shown only under .js-motion
   (CSS); skipped entirely under reduced motion (main never calls runPreloader).
   ============================================================ */

import { gsap, SplitText, EASE } from './motion'

export function runPreloader(): Promise<void> {
  return new Promise((resolve) => {
    const pre = document.querySelector<HTMLElement>('.preloader')
    const counter = pre?.querySelector<HTMLElement>('.preloader__count')
    const name = pre?.querySelector<HTMLElement>('.preloader__name')
    if (!pre || !counter || !name) {
      pre?.remove()
      resolve()
      return
    }

    const split = new SplitText(name, { type: 'chars' })
    const num = { v: 0 }
    const tl = gsap.timeline({
      onComplete: () => {
        split.revert()
        pre.remove()
        resolve()
      },
    })

    tl.from(split.chars, {
      yPercent: 120,
      autoAlpha: 0,
      stagger: 0.03,
      duration: 0.7,
      ease: EASE,
    })
      .to(
        num,
        {
          v: 100,
          duration: 1.5,
          ease: 'power2.inOut',
          onUpdate: () => {
            counter.textContent = String(Math.round(num.v)).padStart(2, '0')
          },
        },
        0,
      )
      .to(name, { autoAlpha: 0, duration: 0.4, ease: EASE }, '+=0.2')
      .to(counter, { autoAlpha: 0, duration: 0.4, ease: EASE }, '<')
      .to(pre, { yPercent: -100, duration: 1.0, ease: 'power4.inOut' }, '-=0.1')
  })
}
