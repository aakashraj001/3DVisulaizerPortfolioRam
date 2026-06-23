/* ============================================================
   Content data layer — source-agnostic. Consumers read only through
   these functions (never the raw JSON or a CMS SDK), so the source can
   swap (placeholder → Sanity/Decap) with no consumer change.
   ============================================================ */
import projectData from '../data/projects.json'

export type ServiceFamilyId =
  | 'visualisation'
  | 'visual-identity'
  | 'computational-design'
  | 'immersive-experiences'
  | 'digital-fabrication'

export type AccentName = 'violet' | 'red' | 'lime' | 'lilac'

export interface ImageAsset {
  src: string
  width: number
  height: number
  alt: string
  lqip?: string
}

export interface Project {
  title: string
  client?: string
  serviceFamily: ServiceFamilyId
  disciplines: string[]
  year: number
  summary?: string
  url?: string
  accent?: AccentName
  featured: boolean
  order: number
  image: ImageAsset
  gallery?: ImageAsset[]
}

interface Adapter {
  getProjects(): Promise<Project[]>
}

const placeholderAdapter: Adapter = {
  async getProjects() {
    return (projectData.projects as Project[]).slice()
  },
}

/* Sanity/Decap adapters are documented swaps; both fall back to placeholder
   until configured, so consumers never change. */
const sanityAdapter: Adapter = placeholderAdapter
const decapAdapter: Adapter = placeholderAdapter

function pick(): Adapter {
  switch (import.meta.env.VITE_CMS_SOURCE) {
    case 'sanity':
      return sanityAdapter
    case 'decap':
      return decapAdapter
    default:
      return placeholderAdapter
  }
}

const adapter = pick()
let cache: Promise<Project[]> | null = null

export function getProjects(): Promise<Project[]> {
  if (!cache) {
    cache = adapter.getProjects().then((list) => list.slice().sort((a, b) => a.order - b.order))
  }
  return cache
}

/** Featured projects (for the hero), ordered. */
export async function getFeatured(): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.featured)
}

/** Projects in a given service family, ordered. Empty for in-development families. */
export async function projectsByFamily(id: ServiceFamilyId): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.serviceFamily === id)
}
