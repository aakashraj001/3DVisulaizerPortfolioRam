/* ============================================================
   CMS data layer — source-agnostic.

   Consumers (hero, gallery, filters) call this interface ONLY; they never
   touch a CMS SDK or a hardcoded array. Swap VITE_CMS_SOURCE to move from
   placeholder JSON to Sanity or Decap without changing any consumer.
   Adding a render later = one CMS entry → it appears automatically.
   ============================================================ */

import placeholderData from '../data/projects.json'

export type Category = 'architecture' | 'interior' | 'product' | 'experimental'

/** A CDN-backed image. `src` may contain {w}/{h} tokens (filled by images.ts)
 *  or be a CDN-relative path when VITE_IMAGE_CDN_BASE is set. */
export interface ImageAsset {
  src: string
  width: number
  height: number
  alt: string
  lqip?: string
}

export interface Project {
  title: string
  category: Category
  year: number
  engine: string
  image: ImageAsset
  depthMap?: ImageAsset
  featured: boolean
  order: number
}

interface CmsAdapter {
  getProjects(): Promise<Project[]>
}

/* ---- Placeholder adapter (default): local JSON ---- */
const placeholderAdapter: CmsAdapter = {
  async getProjects() {
    return (placeholderData.projects as Project[]).slice()
  },
}

/* ---- Sanity adapter (stub) ----
   Wire by setting VITE_CMS_SOURCE=sanity + VITE_SANITY_PROJECT_ID/DATASET.
   Query: *[_type=="project"]{title,category,year,engine,featured,order,
     "image":{"src":image.asset->url,"width":...,"height":...,"alt":image.alt},
     "depthMap":depthMap.asset->{...}} | order(order asc)
   Map asset->url through images.ts for responsive transforms. */
const sanityAdapter: CmsAdapter = {
  async getProjects() {
    const id = import.meta.env.VITE_SANITY_PROJECT_ID
    const ds = import.meta.env.VITE_SANITY_DATASET ?? 'production'
    if (!id) {
      console.warn('[cms] VITE_CMS_SOURCE=sanity but VITE_SANITY_PROJECT_ID unset — using placeholder.')
      return placeholderAdapter.getProjects()
    }
    const query = encodeURIComponent(
      `*[_type=="project"]|order(order asc){title,category,year,engine,featured,order,"image":{"src":image.asset->url,"width":image.asset->metadata.dimensions.width,"height":image.asset->metadata.dimensions.height,"alt":coalesce(image.alt,title)},"depthMap":{"src":depthMap.asset->url,"width":depthMap.asset->metadata.dimensions.width,"height":depthMap.asset->metadata.dimensions.height,"alt":""}}`,
    )
    const url = `https://${id}.api.sanity.io/v2023-05-01/data/query/${ds}?query=${query}`
    const res = await fetch(url)
    const { result } = await res.json()
    return (result as Project[]) ?? []
  },
}

/* ---- Decap CMS adapter (stub) ----
   Decap is git-based: it writes entries that we expose as JSON (e.g. a build
   step concatenates content/projects/*.md into the same shape as
   data/projects.json). With that in place, this reuses the placeholder loader.
   See public/admin/config.yml for the matching collection schema. */
const decapAdapter: CmsAdapter = placeholderAdapter

function pickAdapter(): CmsAdapter {
  switch (import.meta.env.VITE_CMS_SOURCE) {
    case 'sanity':
      return sanityAdapter
    case 'decap':
      return decapAdapter
    default:
      return placeholderAdapter
  }
}

const adapter = pickAdapter()

let cache: Project[] | null = null

/** All projects, sorted by `order` ascending. */
export async function getProjects(): Promise<Project[]> {
  if (cache) return cache
  const list = await adapter.getProjects()
  cache = list.slice().sort((a, b) => a.order - b.order)
  return cache
}

/** The hero piece: the `featured` project, falling back to the first by order. */
export async function getFeatured(): Promise<Project | undefined> {
  const list = await getProjects()
  return list.find((p) => p.featured) ?? list[0]
}

const CATEGORY_ORDER: Category[] = ['architecture', 'interior', 'product', 'experimental']

/** Distinct categories present in the data, in canonical order. Drives filters. */
export function categoriesOf(projects: Project[]): Category[] {
  const present = new Set(projects.map((p) => p.category))
  return CATEGORY_ORDER.filter((c) => present.has(c))
}

export function categoryLabel(c: Category | 'all'): string {
  return c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)
}
