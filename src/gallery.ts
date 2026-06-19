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
  // Varied museum-hang spans: first piece reads large, then alternate wide/study.
  article.classList.add(
    index === 0 ? 'piece--hero' : index % 4 === 1 || index % 4 === 2 ? 'piece--wide' : 'piece--study',
  )
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
  mountIndexBar(cats) // fixed sticky filter bar (appears while scrolling the gallery)

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
 * Build a fixed filter bar that sits just below the persistent nav and appears
 * once the in-flow Index header has scrolled out of view — keeping the category
 * filters reachable throughout the gallery. It lives on <body> (OUTSIDE the
 * transformed ScrollSmoother wrapper) so `position: fixed` is reliable — no
 * ScrollTrigger pinning (which mis-positions an in-flow element that has large
 * section padding, and jumps with pinSpacing:false). Reuses the same `.filter`
 * buttons, so the active state stays in sync via applyFilter().
 */
function syncNavHeight(): void {
  const nav = document.querySelector<HTMLElement>('.nav')
  document.documentElement.style.setProperty('--nav-h', `${nav?.offsetHeight ?? 64}px`)
}

export function mountIndexBar(cats: Category[]): void {
  if (document.querySelector('.index-bar')) return
  const bar = document.createElement('div')
  bar.className = 'index-bar'
  bar.setAttribute('aria-hidden', 'true')

  const label = document.createElement('span')
  label.className = 'index-bar__label label label--wide'
  label.textContent = 'Index'

  const filters = document.createElement('div')
  filters.className = 'index-bar__filters'

  bar.append(label, filters)
  document.body.appendChild(bar)
  buildFilters(filters, cats)

  syncNavHeight()
  window.addEventListener('resize', syncNavHeight)
}

/** Show the fixed filter bar while scrolling within the gallery. All branches. */
export function revealIndexBar(): void {
  const bar = document.querySelector<HTMLElement>('.index-bar')
  const head = document.querySelector<HTMLElement>('.gallery__head')
  const gallery = document.querySelector<HTMLElement>('.gallery')
  if (!bar || !head || !gallery) return
  ScrollTrigger.create({
    trigger: head,
    start: 'bottom top+=74', // in-flow Index header has scrolled under the nav
    endTrigger: gallery,
    end: 'bottom top+=120', // gallery is nearly scrolled past
    onToggle: (self) => {
      bar.classList.toggle('is-visible', self.isActive)
      bar.setAttribute('aria-hidden', String(!self.isActive))
    },
  })
}

/** Register the staggered entrance reveal for pieces. Motion branches only. */
export function animateGallery(): void {
  ScrollTrigger.batch('.reveal-piece', {
    start: 'top 88%',
    onEnter: (batch) => {
      batch.forEach((piece, i) => {
        const img = piece.querySelector('.media__img')
        const rule = piece.querySelector('.piece__rule')
        const caption = piece.querySelectorAll('.piece__title, .piece__meta, .piece__index')
        // Capped, slower cadence so the hang reads as one curated set. Fixed 36px
        // rise (not yPercent) keeps distance consistent across varied tile heights.
        // Transform/opacity only — no clip-path (GPU garbage on composited layers).
        const tl = gsap.timeline({ delay: Math.min(i, 4) * 0.14 })
        tl.fromTo(
          piece,
          { autoAlpha: 0, y: 36 },
          { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, clearProps: 'transform' },
        )
          // clearProps so the settled inline transform doesn't shadow the CSS :hover scale.
          .fromTo(img, { scale: 1.07 }, { scale: 1, duration: 1.3, ease: EASE, clearProps: 'transform' }, 0)
          .fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: EASE }, 0.18)
          // Title + meta + index reveal together as the museum plate.
          .fromTo(
            caption,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.06 },
            0.3,
          )
      })
    },
    once: true,
  })
}
