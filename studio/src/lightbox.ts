/* ============================================================
   Case lightbox — GSAP Flip morph from a work card's cover into a case panel.
   Focus-trapped, background inert, ScrollSmoother paused, dismiss via
   Esc/backdrop/close, reduced-motion crossfade. Lives on <body> (outside the
   ScrollSmoother transform) so position:fixed behaves.
   ============================================================ */
import { gsap, Flip, EASE, prefersReducedMotion } from './motion'
import { labelOf } from './services'
import { getSmoother } from './smoothScroll'
import type { Project } from './cms'

let root: HTMLElement
let backdrop: HTMLElement
let dialog: HTMLElement
let mediaSlot: HTMLElement
let metaEl: HTMLElement
let closeBtn: HTMLButtonElement

let isOpen = false
let triggerEl: HTMLElement | null = null
let movedImg: HTMLImageElement | null = null
let originParent: HTMLElement | null = null
let originSizes = ''
let bgEls: HTMLElement[] = []

const esc = (s: string) => {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

export function initLightbox(): void {
  root = document.createElement('div')
  root.className = 'lightbox'
  root.hidden = true
  root.innerHTML = `
    <div class="lightbox__backdrop" data-close></div>
    <div class="lightbox__panel" role="dialog" aria-modal="true" aria-labelledby="case-title">
      <button class="lightbox__close btn" type="button" aria-label="Close (Esc)">Close ✕</button>
      <div class="lightbox__media"></div>
      <div class="lightbox__meta"></div>
    </div>`
  document.body.appendChild(root)
  backdrop = root.querySelector('.lightbox__backdrop')!
  dialog = root.querySelector('.lightbox__panel')!
  mediaSlot = root.querySelector('.lightbox__media')!
  metaEl = root.querySelector('.lightbox__meta')!
  closeBtn = root.querySelector('.lightbox__close')!

  closeBtn.addEventListener('click', closeCase)
  backdrop.addEventListener('click', closeCase)
  document.addEventListener('keydown', (e) => {
    if (!isOpen) return
    if (e.key === 'Escape') {
      e.preventDefault()
      closeCase()
      return
    }
    if (e.key !== 'Tab') return
    // Real wrapping focus trap: let Tab move naturally among the panel's
    // focusable controls (close button + the "View project" link), wrapping at
    // the ends. The inert background already prevents focus from leaving.
    const f = Array.from(
      dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ).filter((el) => el.offsetParent !== null)
    if (f.length === 0) return
    const first = f[0]
    const last = f[f.length - 1]
    const activeEl = document.activeElement
    if (e.shiftKey && activeEl === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && activeEl === last) {
      e.preventDefault()
      first.focus()
    }
  })

  // NB: not '.marquee' — it lives inside #smooth-wrapper (already inerted) and
  // carries a permanent aria-hidden; toggling it here would strip that on close.
  bgEls = ['.nav', '#smooth-wrapper', '.skip-link']
    .map((s) => document.querySelector<HTMLElement>(s))
    .filter((el): el is HTMLElement => el !== null)
}

function setBgInert(on: boolean): void {
  bgEls.forEach((el) => {
    el.toggleAttribute('inert', on)
    if (on) el.setAttribute('aria-hidden', 'true')
    else el.removeAttribute('aria-hidden')
  })
}

export function openCase(project: Project, mediaEl: HTMLElement): void {
  if (isOpen) return
  const img = mediaEl.querySelector<HTMLImageElement>('.media__img')
  if (!img) return
  isOpen = true
  triggerEl = (document.activeElement as HTMLElement) ?? null
  originParent = mediaEl
  movedImg = img
  originSizes = img.sizes

  const tags = project.disciplines.map((d) => `<li class="label">${esc(d)}</li>`).join('')
  metaEl.innerHTML = `
    <p class="label">${esc(labelOf(project.serviceFamily))}${project.client ? ' · ' + esc(project.client) : ''} · <span class="tnum">${project.year}</span></p>
    <h2 class="lightbox__title display" id="case-title">${esc(project.title)}</h2>
    ${project.summary ? `<p class="lightbox__summary">${esc(project.summary)}</p>` : ''}
    <ul class="lightbox__tags">${tags}</ul>
    ${project.url ? `<a class="btn btn--pop" href="${esc(project.url)}" target="_blank" rel="noopener">View project ↗</a>` : ''}`
  root.dataset.accent = project.accent ?? 'violet'

  root.hidden = false
  getSmoother()?.paused(true)
  setBgInert(true)
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
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: EASE })
    gsap.fromTo(metaEl, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.2, ease: EASE })
    Flip.from(state, { duration: 0.7, ease: EASE, absolute: true })
  }
  closeBtn.focus()
}

export function closeCase(): void {
  if (!isOpen || !movedImg || !originParent) return
  isOpen = false
  const img = movedImg
  const parent = originParent
  const finish = () => {
    img.classList.remove('lightbox__img')
    img.sizes = originSizes
    parent.insertBefore(img, parent.firstChild)
    root.classList.remove('is-open')
    root.hidden = true
    getSmoother()?.paused(false)
    setBgInert(false)
    triggerEl?.focus()
    movedImg = null
    originParent = null
  }
  if (prefersReducedMotion()) {
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
      setBgInert(false)
      triggerEl?.focus()
      movedImg = null
      originParent = null
    },
  })
  gsap.to(backdrop, { opacity: 0, duration: 0.4, ease: 'power3.in' })
}
