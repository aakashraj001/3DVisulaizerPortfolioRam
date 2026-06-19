/* ============================================================
   Lightbox — GSAP Flip morph from thumbnail to full view.
   The real thumbnail <img> is reparented into the dialog and Flip animates
   the transform delta (the signature morph). Dismiss via Esc / backdrop /
   close button; focus is trapped while open and returned to the originating
   piece on close. Under reduced motion it cross-fades instead of morphing.

   The dialog lives on <body> (NOT inside the ScrollSmoother transform) so
   position:fixed behaves correctly.
   ============================================================ */

import { gsap, Flip, EASE, prefersReducedMotion } from './motion'
import { categoryLabel, type Project } from './cms'
import { getSmoother } from './smoothScroll'

let root: HTMLElement
let backdropEl: HTMLElement
let dialogEl: HTMLElement
let mediaSlot: HTMLElement
let titleEl: HTMLElement
let metaEl: HTMLElement
let closeBtn: HTMLButtonElement

let isOpen = false
let triggerEl: HTMLElement | null = null
let movedImg: HTMLImageElement | null = null
let originParent: HTMLElement | null = null
let originSizes = ''
let bgEls: HTMLElement[] = []

/** Confine AT + focus to the dialog: aria-modal alone doesn't stop browse-mode. */
function setBackgroundInert(on: boolean): void {
  bgEls.forEach((el) => {
    el.toggleAttribute('inert', on)
    if (on) el.setAttribute('aria-hidden', 'true')
    else el.removeAttribute('aria-hidden')
  })
}

export function initLightbox(): void {
  root = document.createElement('div')
  root.id = 'lightbox'
  root.className = 'lightbox'
  root.hidden = true
  root.innerHTML = `
    <div class="lightbox__backdrop" data-close></div>
    <div class="lightbox__dialog" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
      <button class="lightbox__close" type="button" aria-label="Close (Esc)">
        <span aria-hidden="true">&times;</span>
      </button>
      <div class="lightbox__media"></div>
      <figcaption class="lightbox__cap">
        <h2 class="lightbox__title display" id="lightbox-title"></h2>
        <p class="lightbox__meta label label--wide"></p>
      </figcaption>
    </div>`
  document.body.appendChild(root)

  backdropEl = root.querySelector('.lightbox__backdrop')!
  dialogEl = root.querySelector('.lightbox__dialog')!
  mediaSlot = root.querySelector('.lightbox__media')!
  titleEl = root.querySelector('.lightbox__title')!
  metaEl = root.querySelector('.lightbox__meta')!
  closeBtn = root.querySelector('.lightbox__close')!

  closeBtn.addEventListener('click', closeLightbox)
  backdropEl.addEventListener('click', closeLightbox)
  document.addEventListener('keydown', onKeydown)

  bgEls = [
    document.querySelector<HTMLElement>('.nav'),
    document.querySelector<HTMLElement>('#smooth-wrapper'),
    document.querySelector<HTMLElement>('.skip-link'),
  ].filter((el): el is HTMLElement => el !== null)
}

function onKeydown(e: KeyboardEvent): void {
  if (!isOpen) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeLightbox()
  } else if (e.key === 'Tab') {
    // Focus trap: only the close button is focusable inside the dialog.
    e.preventDefault()
    closeBtn.focus()
  }
}

export function openLightbox(project: Project, mediaEl: HTMLElement): void {
  if (isOpen) return
  const img = mediaEl.querySelector<HTMLImageElement>('.media__img')
  if (!img) return

  isOpen = true
  triggerEl = (document.activeElement as HTMLElement) ?? null
  originParent = mediaEl
  movedImg = img
  originSizes = img.sizes

  titleEl.textContent = project.title
  metaEl.textContent = `${categoryLabel(project.category)} · ${project.year} · ${project.engine}`

  root.hidden = false
  getSmoother()?.paused(true) // lock background scroll (ScrollSmoother transforms content)
  setBackgroundInert(true)
  // Request a larger candidate from the existing srcset for the full view.
  img.sizes = '92vw'

  const reduced = prefersReducedMotion()

  if (reduced) {
    mediaSlot.appendChild(img)
    img.classList.add('lightbox__img')
    root.classList.add('is-open')
  } else {
    const state = Flip.getState(img)
    mediaSlot.appendChild(img)
    img.classList.add('lightbox__img')
    root.classList.add('is-open')
    gsap.set(backdropEl, { opacity: 0 })
    gsap.to(backdropEl, { opacity: 1, duration: 0.4, ease: EASE })
    gsap.fromTo(
      dialogEl.querySelector('.lightbox__cap'),
      { autoAlpha: 0, y: 16 },
      { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.25, ease: EASE },
    )
    Flip.from(state, { duration: 0.85, ease: EASE, absolute: true })
  }

  closeBtn.focus()
}

export function closeLightbox(): void {
  if (!isOpen || !movedImg || !originParent) return
  isOpen = false
  const img = movedImg
  const parent = originParent
  const reduced = prefersReducedMotion()

  const finish = () => {
    img.classList.remove('lightbox__img')
    img.sizes = originSizes
    // Re-insert as the first child so it sits under the frame overlay.
    parent.insertBefore(img, parent.firstChild)
    root.classList.remove('is-open')
    root.hidden = true
    getSmoother()?.paused(false)
    setBackgroundInert(false)
    triggerEl?.focus()
    movedImg = null
    originParent = null
  }

  if (reduced) {
    finish()
    return
  }

  const state = Flip.getState(img)
  parent.insertBefore(img, parent.firstChild)
  img.classList.remove('lightbox__img')
  Flip.from(state, {
    duration: 0.5,
    ease: 'power3.in',
    absolute: true,
    onComplete: () => {
      img.sizes = originSizes
      root.classList.remove('is-open')
      root.hidden = true
      getSmoother()?.paused(false)
      setBackgroundInert(false)
      triggerEl?.focus()
      movedImg = null
      originParent = null
    },
  })
  gsap.to(backdropEl, { opacity: 0, duration: 0.45, ease: 'power3.in' })
  gsap.to(dialogEl.querySelector('.lightbox__cap'), { autoAlpha: 0, duration: 0.3 })
}
