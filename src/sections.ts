/* ============================================================
   Studio statement (word-by-word scrubbed reveal) + contact (line reveal +
   magnetic email button). Both registered inside motion branches; each
   returns a disposer so listeners are cleaned up on branch revert / teardown.
   ============================================================ */

import { gsap, ScrollTrigger, SplitText, EASE, isCoarsePointer } from './motion'

type Disposer = () => void

/** Pull-quote words brighten from --ash toward --bone as the section scrolls. */
export function animateStatement(): Disposer {
  const quote = document.querySelector<HTMLElement>('.statement__quote')
  if (!quote) return () => {}

  const split = new SplitText(quote, { type: 'words' })
  const tween = gsap.fromTo(
    split.words,
    { opacity: 0.16 },
    {
      opacity: 1,
      ease: 'none',
      stagger: 0.08,
      scrollTrigger: {
        trigger: '.statement',
        start: 'top 75%',
        end: 'bottom 60%',
        scrub: true,
      },
    },
  )

  return () => {
    tween.scrollTrigger?.kill()
    tween.kill()
    split.revert()
  }
}

/** Magnetic email button — eases toward the cursor on hover (fine pointer only). */
export function animateContact(): Disposer {
  const btn = document.querySelector<HTMLElement>('.magnetic')
  if (!btn || isCoarsePointer()) return () => {}

  const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: EASE })
  const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: EASE })

  const onEnter = () => {
    btn.style.willChange = 'transform'
  }
  const onMove = (e: PointerEvent) => {
    const r = btn.getBoundingClientRect()
    const relX = e.clientX - (r.left + r.width / 2)
    const relY = e.clientY - (r.top + r.height / 2)
    xTo(relX * 0.4)
    yTo(relY * 0.5)
  }
  const onLeave = () => {
    xTo(0)
    yTo(0)
    btn.style.willChange = ''
  }

  btn.addEventListener('pointerenter', onEnter)
  btn.addEventListener('pointermove', onMove)
  btn.addEventListener('pointerleave', onLeave)

  return () => {
    btn.removeEventListener('pointerenter', onEnter)
    btn.removeEventListener('pointermove', onMove)
    btn.removeEventListener('pointerleave', onLeave)
    gsap.set(btn, { x: 0, y: 0 })
    btn.style.willChange = ''
  }
}

/** Generic fade-up reveals for simple sections via ScrollTrigger.batch(). */
export function animateReveals(): void {
  ScrollTrigger.batch('.reveal-up', {
    start: 'top 85%',
    onEnter: (batch) => {
      batch.forEach((el) => ((el as HTMLElement).style.willChange = 'transform, opacity'))
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 0.9,
        ease: EASE,
        stagger: 0.1,
        overwrite: true,
        onComplete: () =>
          batch.forEach((el) => ((el as HTMLElement).style.willChange = '')),
      })
    },
    once: true,
  })
}
