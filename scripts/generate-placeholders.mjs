/* ============================================================
   Generate local placeholder "renders" (SVG) so the gallery + hero always
   display without any network/CDN. Dark, warm, cinematic plates on-brand with
   the design tokens, plus a grayscale depth map for the WebGL hero.

   Run:  node scripts/generate-placeholders.mjs
   Reads data/projects.json, writes public/renders/*.svg, and rewrites the
   image/depthMap `src` (+ lqip) to local paths. Re-run any time.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public', 'renders')
mkdirSync(OUT, { recursive: true })

const C = {
  void: '#14110e', char: '#1c1813',
  shadow: '#1a1610', mid: '#332a1d', lit: '#6b5639', lit2: '#8c7048',
  gilt: '#b89b6e', bone: '#ece5d8',
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) } return h >>> 0 }
function rng(seed) { let s = seed || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909)) >>> 0) / 4294967296 }

const grain = `<filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
  <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0"/></filter>`

function frame(w, h, defs, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.mid}"/><stop offset="0.55" stop-color="${C.char}"/><stop offset="1" stop-color="${C.void}"/>
    </linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.42" r="0.8">
      <stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="${C.void}" stop-opacity="0.6"/>
    </radialGradient>
    <linearGradient id="surf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.lit2}"/><stop offset="0.6" stop-color="${C.lit}"/><stop offset="1" stop-color="${C.mid}"/>
    </linearGradient>
    <linearGradient id="surfH" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.lit2}"/><stop offset="0.7" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.shadow}"/>
    </linearGradient>
    ${defs}
    ${grain}
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  ${body}
  <rect width="${w}" height="${h}" fill="url(#vig)"/>
  <rect width="${w}" height="${h}" filter="url(#gr)" opacity="0.05"/>
</svg>`
}

function glowDef(gx, gy, r, op = 0.7) {
  return `<radialGradient id="glow" cx="${gx}" cy="${gy}" r="${r}">
    <stop offset="0" stop-color="${C.gilt}" stop-opacity="${op}"/>
    <stop offset="0.45" stop-color="${C.gilt}" stop-opacity="${op * 0.25}"/>
    <stop offset="1" stop-color="${C.gilt}" stop-opacity="0"/></radialGradient>`
}

function architecture(w, h, rand) {
  const gx = 0.22 + rand() * 0.35, gy = 0.18 + rand() * 0.22
  let slabs = ''
  for (let i = 0; i < 3; i++) {
    const x = w * (0.1 + i * 0.27 + rand() * 0.04)
    const sw = w * (0.2 + rand() * 0.12)
    const top = h * (0.12 + rand() * 0.22)
    const skew = h * (0.04 + rand() * 0.1)
    slabs += `<polygon points="${x},${top + skew} ${x + sw},${top} ${x + sw},${h} ${x},${h}" fill="url(#surf)" opacity="${0.85 - i * 0.18}"/>
      <line x1="${x + sw}" y1="${top}" x2="${x + sw}" y2="${h}" stroke="${C.gilt}" stroke-opacity="0.65" stroke-width="2"/>`
  }
  return frame(w, h, glowDef(gx, gy, 0.75),
    `<rect width="${w}" height="${h}" fill="url(#glow)"/>${slabs}
     <rect x="0" y="${h * 0.88}" width="${w}" height="${h * 0.12}" fill="${C.void}" opacity="0.45"/>`)
}

function interior(w, h, rand) {
  const ow = w * (0.34 + rand() * 0.12), oh = h * (0.6 + rand() * 0.14)
  const ox = (w - ow) / 2 + (rand() - 0.5) * w * 0.18, oy = (h - oh) * (0.3 + rand() * 0.2)
  return frame(w, h,
    `<radialGradient id="open" cx="0.5" cy="0.5" r="0.6">
      <stop offset="0" stop-color="${C.lit2}" stop-opacity="0.9"/><stop offset="0.6" stop-color="${C.lit}" stop-opacity="0.5"/><stop offset="1" stop-color="${C.gilt}" stop-opacity="0.08"/></radialGradient>` +
    glowDef(0.5, 0.42, 0.5, 0.4),
    `<rect width="${w}" height="${h}" fill="url(#glow)"/>
     <rect x="0" y="0" width="${ox}" height="${h}" fill="${C.shadow}"/>
     <rect x="${ox + ow}" y="0" width="${w - ox - ow}" height="${h}" fill="${C.shadow}"/>
     <rect x="${ox}" y="${oy}" width="${ow}" height="${oh}" fill="url(#open)"/>
     <rect x="${ox}" y="${oy}" width="${ow}" height="${oh}" fill="none" stroke="${C.gilt}" stroke-opacity="0.5" stroke-width="2"/>
     <ellipse cx="${ox + ow / 2}" cy="${h * 0.93}" rx="${ow * 0.8}" ry="${h * 0.05}" fill="${C.gilt}" opacity="0.18"/>`)
}

function product(w, h, rand) {
  const cx = w / 2, cy = h * 0.55
  const ow = w * (0.24 + rand() * 0.08), oh = h * (0.42 + rand() * 0.12)
  return frame(w, h, glowDef(0.5, 0.4, 0.55, 0.65),
    `<rect width="${w}" height="${h}" fill="url(#glow)"/>
     <ellipse cx="${cx}" cy="${h * 0.82}" rx="${ow}" ry="${h * 0.05}" fill="#000" opacity="0.55"/>
     <rect x="${cx - ow / 2}" y="${cy - oh / 2}" width="${ow}" height="${oh}" rx="${ow * 0.42}" fill="url(#surfH)"/>
     <rect x="${cx - ow / 2}" y="${cy - oh / 2}" width="${ow}" height="${oh}" rx="${ow * 0.42}" fill="none" stroke="${C.gilt}" stroke-opacity="0.3" stroke-width="1.5"/>
     <line x1="${cx - ow / 2 + 2}" y1="${cy - oh / 2 + 6}" x2="${cx - ow / 2 + 2}" y2="${cy + oh / 2 - 6}" stroke="${C.bone}" stroke-opacity="0.45" stroke-width="2"/>`)
}

function experimental(w, h, rand) {
  let curves = ''
  for (let i = 0; i < 6; i++) {
    const y = h * rand()
    curves += `<path d="M0,${y} C${w * 0.3},${y - h * 0.22 * rand()} ${w * 0.7},${y + h * 0.22 * rand()} ${w},${h * rand()}" fill="none" stroke="${C.gilt}" stroke-opacity="${0.12 + rand() * 0.22}" stroke-width="${1 + rand() * 2.5}"/>`
  }
  let dots = ''
  for (let i = 0; i < 80; i++) dots += `<circle cx="${w * rand()}" cy="${h * rand()}" r="${rand() * 1.8 + 0.4}" fill="${C.gilt}" opacity="${rand() * 0.55}"/>`
  return frame(w, h, glowDef(0.3 + rand() * 0.4, 0.35 + rand() * 0.3, 0.8, 0.6),
    `<rect width="${w}" height="${h}" fill="url(#glow)"/>${curves}${dots}`)
}

const MOTIF = { architecture, interior, product, experimental }

function depthMap(w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="d" cx="0.5" cy="0.55" r="0.75">
      <stop offset="0" stop-color="#dcdcdc"/><stop offset="0.6" stop-color="#7a7a7a"/><stop offset="1" stop-color="#1c1c1c"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#d)"/>
  <rect width="${w}" height="${h}" fill="url(#floor)"/>
</svg>`
}

// ---- Run ----
const dataPath = join(ROOT, 'data', 'projects.json')
const data = JSON.parse(readFileSync(dataPath, 'utf8'))
let count = 0
for (const p of data.projects) {
  const s = slug(p.title)
  const rand = rng(hash(p.title))
  const w = p.image.width, h = p.image.height
  const svg = (MOTIF[p.category] || architecture)(w, h, rand)
  writeFileSync(join(OUT, `${s}.svg`), svg)
  p.image.src = `renders/${s}.svg`
  delete p.image.lqip // local SVGs load instantly; no blur-up needed
  count++
  if (p.depthMap) {
    writeFileSync(join(OUT, `${s}-depth.svg`), depthMap(w, h))
    p.depthMap.src = `renders/${s}-depth.svg`
    count++
  }
}
if (typeof data.$comment === 'string' && data.$comment.includes('picsum')) {
  data.$comment = 'Placeholder content behind the same interface the CMS will satisfy. Image `src` points to local generated SVG renders (public/renders, via scripts/generate-placeholders.mjs) so the gallery + hero render with no network. Swap to a real CDN by setting VITE_IMAGE_CDN_BASE and pointing src at CDN paths.'
}
writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n')
console.log(`Generated ${count} SVG(s) in public/renders and rewrote data/projects.json`)
