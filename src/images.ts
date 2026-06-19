/* ============================================================
   Image delivery — CDN URL builder + responsive blur-up <img>.

   The single isolation point for image transforms. Default builds
   ImageKit-style params (f-auto → WebP/AVIF, w-/q- resize). Switch to
   Cloudinary by editing only `cdnUrl()` below. With no VITE_IMAGE_CDN_BASE
   set it passes the source through (filling {w}/{h} templates) so the site
   still renders without a CDN account. Full-res originals are never used
   directly — every <img> gets a width-tuned srcset.
   ============================================================ */

import type { ImageAsset } from './cms'

const CDN_BASE = (import.meta.env.VITE_IMAGE_CDN_BASE ?? '').replace(/\/$/, '')

const DEFAULT_WIDTHS = [480, 768, 1024, 1440, 1920]

function fillTemplate(src: string, w: number, h: number): string {
  return src.replace(/\{w\}/g, String(w)).replace(/\{h\}/g, String(h))
}

function heightFor(asset: ImageAsset, width: number): number {
  return Math.round(width * (asset.height / asset.width))
}

/** Build a single transformed URL at the requested rendered width. */
export function imageUrl(asset: ImageAsset, width: number, quality = 70): string {
  const h = heightFor(asset, width)
  const origin = fillTemplate(asset.src, width, h)

  if (!CDN_BASE) return origin // passthrough — no CDN configured

  // ImageKit transform string: auto modern format + width + quality.
  const tr = `tr=w-${width},q-${quality},f-auto`
  if (!/^https?:/i.test(asset.src)) {
    // CDN-relative path → join to the endpoint.
    const path = fillTemplate(asset.src, width, h).replace(/^\//, '')
    return `${CDN_BASE}/${path}?${tr}`
  }
  // Absolute origin → proxy/fetch through the CDN endpoint.
  return `${CDN_BASE}/${encodeURIComponent(origin)}?${tr}`
}

/** A `srcset` string across responsive widths. */
export function srcSet(asset: ImageAsset, widths: number[] = DEFAULT_WIDTHS): string {
  return widths.map((w) => `${imageUrl(asset, w)} ${w}w`).join(', ')
}

export interface RenderImageOptions {
  /** The `sizes` hint (how wide the image renders at each breakpoint). */
  sizes: string
  widths?: number[]
  /** Skip lazy-loading (e.g. the hero static fallback, above the fold). */
  eager?: boolean
  className?: string
  /** Largest width to request for the default src. */
  maxWidth?: number
}

/**
 * Build a layout-stable, lazy, blur-up image.
 * Returns a `.media` container (aspect-ratio reserved → no CLS) holding the
 * `<img class="media__img">` and a blurred LQIP layer that fades out on load.
 */
export function renderImage(asset: ImageAsset, opts: RenderImageOptions): HTMLElement {
  const fig = document.createElement('div')
  fig.className = 'media' + (opts.className ? ` ${opts.className}` : '')
  fig.style.aspectRatio = `${asset.width} / ${asset.height}`

  if (asset.lqip) {
    const lqip = document.createElement('div')
    lqip.className = 'media__lqip'
    lqip.style.backgroundImage = `url("${asset.lqip}")`
    fig.appendChild(lqip)
  }

  const img = document.createElement('img')
  img.className = 'media__img'
  img.decoding = 'async'
  if (!opts.eager) img.loading = 'lazy'
  img.width = asset.width
  img.height = asset.height
  img.alt = asset.alt
  img.sizes = opts.sizes
  img.srcset = srcSet(asset, opts.widths)
  img.src = imageUrl(asset, opts.maxWidth ?? (opts.widths ? Math.max(...opts.widths) : 1440))

  const reveal = () => {
    img.classList.add('is-loaded')
    fig.classList.add('is-loaded')
  }
  if (img.complete) reveal()
  else img.addEventListener('load', reveal, { once: true })

  fig.appendChild(img)
  return fig
}
