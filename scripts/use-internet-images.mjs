/* ============================================================
   Point the gallery + hero at real internet photos (themed, via loremflickr —
   which loads where picsum is blocked). Keeps the featured depth map local
   (depth maps are smooth gradients, not photos). The {w}/{h} template + a
   stable ?lock seed keep the responsive srcset serving one consistent photo.

   Run:  node scripts/use-internet-images.mjs
   Offline alternative: node scripts/generate-placeholders.mjs (local SVGs).
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = join(ROOT, 'data', 'projects.json')
const data = JSON.parse(readFileSync(dataPath, 'utf8'))

// Per-title themes so each section reads as the right kind of render.
const THEME = {
  'Atelier of Quiet Light': 'architecture,concrete,light',
  'The Cantilever House': 'architecture,modern,house',
  'Reading Room, North Wing': 'library,interior,room',
  'Brass & Travertine Bath': 'bathroom,marble,interior',
  'Vessel No. 7': 'ceramic,vase,pottery',
  'Folded Chair Study': 'chair,furniture,design',
  'Caustic Field': 'light,abstract,water',
  'Dust & Volume': 'smoke,light,dark',
}
const FALLBACK = { architecture: 'architecture,building', interior: 'interior,room', product: 'design,object', experimental: 'abstract,light' }

for (const p of data.projects) {
  const tags = THEME[p.title] || FALLBACK[p.category] || 'architecture'
  // {w}/{h} are filled by src/images.ts; ?lock pins one photo across all srcset widths.
  p.image.src = `https://loremflickr.com/{w}/{h}/${tags}?lock=${p.order}`
  delete p.image.lqip
  // Leave p.depthMap pointing at the local SVG depth gradient (good for the shader).
}
data.$comment =
  'Placeholder content behind the same interface the CMS will satisfy. Images are real themed internet photos via loremflickr (works where picsum is blocked); {w}/{h} are filled by src/images.ts and ?lock pins one photo across srcset widths. Run scripts/generate-placeholders.mjs for offline local SVG renders instead, or set VITE_IMAGE_CDN_BASE + CDN paths for your own renders.'
writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n')
console.log(`Pointed ${data.projects.length} projects at loremflickr themed photos.`)
