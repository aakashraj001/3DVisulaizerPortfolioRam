/* ============================================================
   Gallery — the Index filters + asymmetric grid of render "pieces".
   mountGallery() builds the DOM + filter behavior (works with or without
   motion). animateGallery() registers the scroll reveals inside a motion
   branch. Parallax is declarative (data-speed/data-lag), tuned per branch by
   setGalleryParallax(). Hover is pure CSS (see gallery.css). Click → lightbox.
   ============================================================ */

import { gsap, ScrollTrigger, Flip, EASE, prefersReducedMotion } from './motion'
import { renderImage } from './images'
import {
  getProjects,
  categoriesOf,
  categoryLabel,
  type Project,
  type Category,
} from './cms'
import { openLightbox } from './lightbox'

type Filter = Category | 'all'

const GRID_SIZES = '(max-width: 767px) 92vw, (max-width: 1200px) 46vw, 44vw'

let pieces: { el: HTMLElement; project: Project }[] = []
let activeFilter: Filter = 'all'

function pieceMarkup(project: Project, index: number): HTMLElement {
  const article = document.createElement('article')
  article.className = 'piece reveal-piece'
  article.dataset.category = project.category

  const button = document.createElement('button')
  button.className = 'piece__open'
  button.type = 'button'
  button.setAttribute(
    'aria-label',
    `View ${project.title} — ${categoryLabel(project.category)}, ${project.year}`,
  )

  // Image media gets the slower parallax speed (declarative); the image block
  // drifts while the frame (a sibling, below) stays fixed.
  const media = renderImage(project.image, { sizes: GRID_SIZES, className: 'piece__media' })
  media.dataset.speed = '0.9'
  button.appendChild(media)

  // Gilt hover frame — sibling of the parallaxed media so it does NOT move.
  const frame = document.createElement('span')
  frame.className = 'piece__frame'
  frame.setAttribute('aria-hidden', 'true')
  button.appendChild(frame)

  article.appendChild(button)

  // Museum caption — lags behind the image to separate the depth layers.
  const cap = document.createElement('figcaption')
  cap.className = 'piece__cap'
  cap.dataset.lag = '0.1'
  cap.innerHTML = `
    <hr class="piece__rule" aria-hidden="true" />
    <h3 class="piece__title">${escapeHtml(project.title)}</h3>
    <p class="piece__meta label">${escapeHtml(categoryLabel(project.category))} &middot; ${project.year} &middot; ${escapeHtml(project.engine)}</p>
    <span class="piece__index label">${String(index + 1).padStart(2, '0')}</span>`
  article.appendChild(cap)

  button.addEventListener('click', () => openLightbox(project, media))

  return article
}

function escapeHtml(s: string): string {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

function buildFilters(host: HTMLElement, cats: Category[]): void {
  const filters: Filter[] = ['all', ...cats]
  host.setAttribute('role', 'group')
  host.setAttribute('aria-label', 'Filter works by category')
  filters.forEach((f) => {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'filter label label--wide'
    btn.dataset.filter = f
    btn.textContent = categoryLabel(f)
    btn.setAttribute('aria-pressed', String(f === 'all'))
    if (f === 'all') btn.classList.add('is-active')
    btn.addEventListener('click', () => applyFilter(f))
    host.appendChild(btn)
  })
}

function applyFilter(filter: Filter): void {
  if (filter === activeFilter) return
  activeFilter = filter

  document.querySelectorAll<HTMLElement>('.filter').forEach((b) => {
    const on = b.dataset.filter === filter
    b.classList.toggle('is-active', on)
    b.setAttribute('aria-pressed', String(on))
  })

  const animate = !prefersReducedMotion()
  const grid = document.querySelector<HTMLElement>('.gallery__grid')!
  const state = animate ? Flip.getState(pieces.map((p) => p.el)) : null

  pieces.forEach(({ el, project }) => {
    const show = filter === 'all' || project.category === filter
    el.toggleAttribute('hidden', !show)
  })

  if (state) {
    Flip.from(state, {
      duration: 0.6,
      ease: EASE,
      scale: true,
      absolute: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.4 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.3 }),
    })
  }
  ScrollTrigger.refresh()
  grid.setAttribute('aria-busy', 'false')
}

/** Build the Index section + gallery grid. Runs once, motion-independent. */
export async function mountGallery(root: HTMLElement): Promise<void> {
  const projects = await getProjects()
  const cats = categoriesOf(projects)

  const filterHost = root.querySelector<HTMLElement>('.gallery__filters')
  if (filterHost) buildFilters(filterHost, cats)

  const grid = root.querySelector<HTMLElement>('.gallery__grid')
  if (!grid) return

  pieces = projects.map((project, i) => {
    const el = pieceMarkup(project, i)
    grid.appendChild(el)
    return { el, project }
  })
}

/** Tune parallax intensity for the active branch BEFORE the smoother is created. */
export function setGalleryParallax(speed: number, lag: number): void {
  document.querySelectorAll<HTMLElement>('.piece__media').forEach((el) => {
    el.dataset.speed = String(speed)
  })
  document.querySelectorAll<HTMLElement>('.piece__cap').forEach((el) => {
    el.dataset.lag = String(lag)
  })
}

/**
 * Pin the Index header (title + category filters) so it stays under the top
 * nav while the gallery scrolls — keeping the filters reachable the whole time.
 * Uses ScrollTrigger pinning because CSS `position: sticky` breaks inside the
 * transformed ScrollSmoother wrapper. Safe in all branches (works with or
 * without the smoother) and auto-reverted by gsap.matchMedia.
 */
export function pinIndexHeader(): void {
  const head = document.querySelector<HTMLElement>('.gallery__head')
  const gallery = document.querySelector<HTMLElement>('.gallery')
  if (!head || !gallery) return
  // Don't pin when there's barely anything to scroll past (e.g. a filtered
  // single row) — only worth it when the gallery is taller than the viewport.
  ScrollTrigger.create({
    trigger: gallery,
    start: 'top top+=72', // sit just below the persistent top nav
    end: 'bottom top+=72',
    pin: head,
    pinSpacing: false,
    onToggle: (self) => head.classList.toggle('is-pinned', self.isActive),
  })
}

/** Register the staggered clip-path reveal for pieces. Motion branches only. */
export function animateGallery(): void {
  ScrollTrigger.batch('.reveal-piece', {
    start: 'top 88%',
    onEnter: (batch) => {
      batch.forEach((piece, i) => {
        const media = piece.querySelector('.piece__media')
        const img = piece.querySelector('.media__img')
        const rule = piece.querySelector('.piece__rule')
        const index = piece.querySelector('.piece__index')
        const tl = gsap.timeline({ delay: i * 0.09 })
        tl.fromTo(
          media,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: EASE },
        )
          // clearProps so the settled inline transform doesn't shadow the CSS :hover scale.
          .fromTo(img, { scale: 1.06 }, { scale: 1, duration: 1.2, ease: EASE, clearProps: 'transform' }, 0)
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE }, 0.25)
          .fromTo(
            index,
            { autoAlpha: 0, y: 12 },
            { autoAlpha: 1, y: 0, duration: 0.6, ease: EASE },
            0.35,
          )
      })
    },
    once: true,
  })
}
