/* ============================================================
   Work index — service-filtered cards. Desktop: ScrollTrigger horizontal
   pin (the row translates x as you scroll). Mobile/reduced-motion: vertical
   stack (no pin). In-development families show an explained empty state.
   Cards open the case lightbox. Filters derive from the taxonomy.
   ============================================================ */
import { gsap, ScrollTrigger, EASE } from './motion'
import { renderImage } from './images'
import { getServices, labelOf } from './services'
import { getProjects, type Project, type ServiceFamilyId } from './cms'
import { openCase } from './lightbox'

type Filter = ServiceFamilyId | 'all'
const CARD_SIZES = '(max-width: 860px) 86vw, 36vw'

let cards: { el: HTMLElement; project: Project }[] = []
let pinST: ScrollTrigger | null = null

const esc = (s: string) => {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

function card(project: Project, index: number): HTMLElement {
  const art = document.createElement('article')
  art.className = 'workcard reveal'
  art.dataset.family = project.serviceFamily
  art.dataset.accent = project.accent ?? 'violet'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'workcard__open'
  btn.setAttribute('aria-label', `Open case: ${project.title}`)
  const media = renderImage(project.image, { sizes: CARD_SIZES, peel: true, className: 'workcard__media' })
  btn.appendChild(media)
  btn.addEventListener('click', () => openCase(project, media))
  art.appendChild(btn)

  const cap = document.createElement('div')
  cap.className = 'workcard__cap'
  cap.innerHTML = `
    <span class="workcard__index label tnum">${String(index + 1).padStart(2, '0')}</span>
    <h3 class="workcard__title display">${esc(project.title)}</h3>
    <p class="workcard__fam label label--ink">${esc(labelOf(project.serviceFamily))}</p>
    <ul class="workcard__tags">${project.disciplines.map((d) => `<li class="label">${esc(d)}</li>`).join('')}</ul>`
  art.appendChild(cap)
  return art
}

function buildFilters(host: HTMLElement): void {
  host.setAttribute('role', 'group')
  host.setAttribute('aria-label', 'Filter work by service')
  const make = (id: Filter, label: string, dev = false) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'filter label'
    b.dataset.filter = id
    b.setAttribute('aria-pressed', String(id === 'all'))
    if (id === 'all') b.classList.add('is-active')
    if (dev) {
      b.classList.add('is-dev')
      b.innerHTML = `${esc(label)} <span class="filter__dev">In dev</span>`
    } else b.textContent = label
    b.addEventListener('click', () => applyFilter(id))
    host.appendChild(b)
  }
  make('all', 'All')
  getServices().forEach((f) => make(f.id, f.label, !f.active))
}

function applyFilter(filter: Filter): void {
  document.querySelectorAll<HTMLElement>('.filter').forEach((b) => {
    const on = b.dataset.filter === filter
    b.classList.toggle('is-active', on)
    b.setAttribute('aria-pressed', String(on))
  })
  const fam = getServices().find((f) => f.id === filter)
  const isDev = !!fam && !fam.active
  let shown = 0
  cards.forEach(({ el, project }) => {
    const match = filter === 'all' || project.serviceFamily === filter
    el.toggleAttribute('hidden', !match)
    if (match) shown++
  })
  const empty = document.querySelector<HTMLElement>('.work__empty')
  if (empty) {
    if (isDev || shown === 0) {
      empty.hidden = false
      empty.textContent = isDev
        ? `${fam!.label} is in development — no work to show yet. Check back soon.`
        : 'No work in this category yet.'
    } else {
      empty.hidden = true
    }
  }
  ScrollTrigger.refresh()
}

export async function mountWork(root: HTMLElement): Promise<void> {
  const projects = await getProjects()
  const filterHost = root.querySelector<HTMLElement>('.work__filters')
  if (filterHost) buildFilters(filterHost)
  const row = root.querySelector<HTMLElement>('.work__row')
  if (!row) return
  cards = projects.map((p, i) => {
    const el = card(p, i)
    row.appendChild(el)
    return { el, project: p }
  })
  const empty = document.createElement('p')
  empty.className = 'work__empty label'
  empty.hidden = true
  row.after(empty)
}

/** Desktop horizontal pin. Returns a disposer. */
export function animateWorkPin(): () => void {
  const section = document.querySelector<HTMLElement>('.work')
  const row = document.querySelector<HTMLElement>('.work__row')
  if (!section || !row) return () => {}
  const tween = gsap.to(row, {
    x: () => -(row.scrollWidth - window.innerWidth + 32),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => '+=' + Math.max(1, row.scrollWidth - window.innerWidth + 32),
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
    },
  })
  pinST = tween.scrollTrigger ?? null
  return () => {
    pinST?.kill()
    tween.kill()
    gsap.set(row, { x: 0 })
    pinST = null
  }
}

/** Staggered card reveal (transform/opacity only). */
export function animateWorkReveals(): void {
  ScrollTrigger.batch('.workcard', {
    start: 'top 92%',
    onEnter: (batch) =>
      gsap.fromTo(
        batch,
        { autoAlpha: 0, y: 40 },
        { autoAlpha: 1, y: 0, duration: 0.9, ease: EASE, stagger: 0.08, overwrite: true },
      ),
    once: true,
  })
}
