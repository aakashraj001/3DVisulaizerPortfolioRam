/* ============================================================
   Image delivery — CDN URL builder + responsive blur-up peeled card.
   ImageKit-style transforms by default (f-auto → WebP/AVIF). Passthrough
   (fills {w}/{h}) when no CDN configured. The peel is a STATIC CSS treatment
   (see base.css .media) — never an animated clip-path on a composited layer.
   ============================================================ */
import type { ImageAsset } from './cms'

const CDN_BASE = (import.meta.env.VITE_IMAGE_CDN_BASE ?? '').replace(/\/$/, '')
const DEFAULT_WIDTHS = [420, 640, 900, 1280, 1600]

const fill = (src: string, w: number, h: number) =>
  src.replace(/\{w\}/g, String(w)).replace(/\{h\}/g, String(h))
const heightFor = (a: ImageAsset, w: number) => Math.round(w * (a.height / a.width))

export function imageUrl(a: ImageAsset, width: number, quality = 72): string {
  const h = heightFor(a, width)
  const origin = fill(a.src, width, h)
  if (!CDN_BASE) return origin
  const tr = `tr=w-${width},q-${quality},f-auto`
  if (!/^https?:/i.test(a.src)) return `${CDN_BASE}/${fill(a.src, width, h).replace(/^\//, '')}?${tr}`
  return `${CDN_BASE}/${encodeURIComponent(origin)}?${tr}`
}

export function srcSet(a: ImageAsset, widths: number[] = DEFAULT_WIDTHS): string {
  return widths.map((w) => `${imageUrl(a, w)} ${w}w`).join(', ')
}

export interface RenderImageOptions {
  sizes: string
  widths?: number[]
  eager?: boolean
  peel?: boolean
  className?: string
}

/** Layout-stable, lazy, blur-up peeled image card (no CLS). */
export function renderImage(a: ImageAsset, opts: RenderImageOptions): HTMLElement {
  const fig = document.createElement('div')
  fig.className = 'media' + (opts.peel ? ' media--peel' : '') + (opts.className ? ` ${opts.className}` : '')
  fig.style.aspectRatio = `${a.width} / ${a.height}`

  if (a.lqip) {
    const lq = document.createElement('div')
    lq.className = 'media__lqip'
    lq.style.backgroundImage = `url("${a.lqip}")`
    fig.appendChild(lq)
  }

  const img = document.createElement('img')
  img.className = 'media__img'
  img.decoding = 'async'
  if (!opts.eager) img.loading = 'lazy'
  img.width = a.width
  img.height = a.height
  img.alt = a.alt
  img.sizes = opts.sizes
  img.srcset = srcSet(a, opts.widths)
  img.src = imageUrl(a, opts.widths ? Math.max(...opts.widths) : 1280)

  const reveal = () => {
    img.classList.add('is-loaded')
    fig.classList.add('is-loaded')
  }
  if (img.complete) reveal()
  else img.addEventListener('load', reveal, { once: true })

  fig.appendChild(img)
  return fig
}
