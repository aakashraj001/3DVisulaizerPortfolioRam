/* ============================================================
   Fanned card-stack hero carousel. Featured projects as a fanned stack;
   cycle via prev/next, keyboard (← →), and drag/swipe. Front card opens its
   case. Works without WebGL. Reduced-motion = static front card, no fan.
   ============================================================ */
import { gsap, EASE, prefersReducedMotion } from './motion'
import { renderImage } from './images'
import { labelOf } from './services'
import { getFeatured, type Project } from './cms'
import { openCase } from './lightbox'

interface Slotted {
  el: HTMLElement
  media: HTMLElement
  project: Project
}

const esc = (s: string) => {
  const d = document.createElement('div')
  d.textContent = s
  return d.innerHTML
}

export async function mountHeroStack(): Promise<void> {
  const stage = document.querySelector<HTMLElement>('.hero__stack')
  const featured = await getFeatured()
  const titleEl = document.querySelector<HTMLElement>('.hero__active-title')
  const prevBtn = document.querySelector<HTMLButtonElement>('.hero__prev')
  const nextBtn = document.querySelector<HTMLButtonElement>('.hero__next')
  if (!stage) return

  // Degenerate: no featured work → hide the stack + controls (hero keeps statement).
  if (featured.length === 0) {
    stage.hidden = true
    prevBtn?.setAttribute('hidden', '')
    nextBtn?.setAttribute('hidden', '')
    document.querySelector('.hero')?.classList.add('hero--nostack')
    return
  }

  const cards: Slotted[] = featured.map((project) => {
    const el = document.createElement('div')
    el.className = 'herocard'
    el.dataset.accent = project.accent ?? 'violet'
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'herocard__open'
    btn.setAttribute('aria-label', `Open case: ${project.title}`)
    const media = renderImage(project.image, {
      sizes: '(max-width: 860px) 80vw, 34vw',
      eager: true,
      peel: true,
      className: 'herocard__media',
    })
    btn.appendChild(media)
    el.appendChild(btn)
    stage.appendChild(el)
    btn.addEventListener('click', () => {
      if (project === order[0].project) openCase(project, media)
    })
    return { el, media, project }
  })

  let order = cards.slice()
  const single = cards.length === 1
  if (single) {
    prevBtn?.setAttribute('hidden', '')
    nextBtn?.setAttribute('hidden', '')
  }

  const reduced = prefersReducedMotion()

  function fan(animate: boolean): void {
    order.forEach((c, i) => {
      const visible = i < 4
      // Cards are CSS-anchored at left/top 50%; -50 centres them, then fan out.
      const vars = {
        xPercent: -50 + i * 15,
        yPercent: -50 + i * 7,
        rotation: i * 4,
        scale: 1 - i * 0.05,
        zIndex: order.length - i,
        autoAlpha: reduced ? (i === 0 ? 1 : 0) : visible ? 1 : 0,
      }
      c.el.style.zIndex = String(vars.zIndex)
      c.el.setAttribute('aria-hidden', String(i !== 0))
      c.el.querySelector('button')?.toggleAttribute('disabled', i !== 0)
      if (animate && !reduced) gsap.to(c.el, { ...vars, duration: 0.6, ease: EASE })
      else gsap.set(c.el, vars)
    })
    const front = order[0].project
    if (titleEl) titleEl.innerHTML = `${esc(front.title)} <span class="label">${esc(labelOf(front.serviceFamily))}</span>`
  }

  function cycle(dir: 1 | -1): void {
    if (single) return
    if (dir === 1) order.push(order.shift()!)
    else order.unshift(order.pop()!)
    fan(true)
  }

  prevBtn?.addEventListener('click', () => cycle(-1))
  nextBtn?.addEventListener('click', () => cycle(1))

  // Keyboard when the stage holds focus.
  stage.tabIndex = 0
  stage.setAttribute('role', 'group')
  stage.setAttribute('aria-label', 'Featured work carousel')
  stage.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      cycle(1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      cycle(-1)
    }
  })

  // Drag / swipe.
  if (!single && !reduced) {
    let startX = 0
    let dragging = false
    stage.addEventListener('pointerdown', (e) => {
      dragging = true
      startX = e.clientX
      stage.setPointerCapture(e.pointerId)
    })
    stage.addEventListener('pointerup', (e) => {
      if (!dragging) return
      dragging = false
      const dx = e.clientX - startX
      if (Math.abs(dx) > 60) cycle(dx < 0 ? 1 : -1)
    })
  }

  fan(false)
}
