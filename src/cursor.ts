/* ============================================================
   NICE: custom cursor dot that grows and reads "View" over gallery pieces.
   Fine-pointer + motion only (registered in motion branches). Returns a
   disposer that removes listeners and the element.
   ============================================================ */

import { gsap, isCoarsePointer } from './motion'

type Disposer = () => void

export function initCursor(): Disposer {
  if (isCoarsePointer()) return () => {}

  const dot = document.createElement('div')
  dot.className = 'cursor'
  dot.setAttribute('aria-hidden', 'true')
  dot.innerHTML = '<span class="cursor__label">View</span>'
  document.body.appendChild(dot)

  const xTo = gsap.quickTo(dot, 'x', { duration: 0.35, ease: 'power3' })
  const yTo = gsap.quickTo(dot, 'y', { duration: 0.35, ease: 'power3' })

  const onMove = (e: PointerEvent) => {
    xTo(e.clientX)
    yTo(e.clientY)
    if (dot.style.opacity !== '1') gsap.to(dot, { opacity: 1, duration: 0.3 })
  }
  const enter = () => dot.classList.add('is-view')
  const leave = () => dot.classList.remove('is-view')

  window.addEventListener('pointermove', onMove)
  const pieces = Array.from(document.querySelectorAll<HTMLElement>('.piece__open'))
  pieces.forEach((p) => {
    p.addEventListener('pointerenter', enter)
    p.addEventListener('pointerleave', leave)
  })

  return () => {
    window.removeEventListener('pointermove', onMove)
    pieces.forEach((p) => {
      p.removeEventListener('pointerenter', enter)
      p.removeEventListener('pointerleave', leave)
    })
    dot.remove()
  }
}
