/* ============================================================
   Point the gallery + hero at real, curated Unsplash photos (no watermarks,
   CORS-clean so the WebGL hero can texture them, auto=format → WebP/AVIF).
   The {w}/{h} tokens are filled by src/images.ts so the responsive srcset
   requests correctly-cropped sizes. Featured depth map stays local (gradient).

   Run:  node scripts/use-internet-images.mjs
   Offline alternative: node scripts/generate-placeholders.mjs (local SVGs).
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = join(ROOT, 'data', 'projects.json')
const data = JSON.parse(readFileSync(dataPath, 'utf8'))

// Curated, verified Unsplash photo IDs, matched to each piece's mood/category.
const PHOTO = {
  'Atelier of Quiet Light': '1431576901776-e539bd916ba2', // dramatic light shaft
  'The Cantilever House': '1486325212027-8081e485255e', // dusk architecture
  'Reading Room, North Wing': '1513584684374-8bab748fbf90', // dark moody interior
  'Brass & Travertine Bath': '1567016376408-0226e4d0c1ea', // low-lit interior
  'Vessel No. 7': '1567538096630-e0c55bd6374c', // sculptural object
  'Folded Chair Study': '1581539250439-c96689b516dd', // chair, studio light
  'Caustic Field': '1541701494587-cb58502866ab', // dark light streak
  'Dust & Volume': '1557672172-298e090bd0f1', // volumetric smoke
}
const FALLBACK = '1487958449943-2429e8be8625'

for (const p of data.projects) {
  const id = PHOTO[p.title] || FALLBACK
  // {w}/{h} filled by src/images.ts; fit/crop keep our aspect; auto=format → WebP/AVIF.
  p.image.src = `https://images.unsplash.com/photo-${id}?w={w}&h={h}&fit=crop&crop=entropy&q=72&auto=format`
  delete p.image.lqip
  // Leave p.depthMap on the local SVG depth gradient (good for the shader).
}
data.$comment =
  'Placeholder content behind the same interface the CMS will satisfy. Images are curated real photos from Unsplash (no watermarks, CORS-clean, WebP/AVIF via auto=format); {w}/{h} are filled by src/images.ts for the responsive srcset. Run scripts/generate-placeholders.mjs for offline local SVG renders instead, or set VITE_IMAGE_CDN_BASE + CDN paths for your own renders.'
writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n')
console.log(`Pointed ${data.projects.length} projects at curated Unsplash photos.`)
