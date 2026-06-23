/* ============================================================
   Service-family taxonomy — the IA spine. Filters + the Services section
   derive from this list; nothing hardcodes a family. Turning a future
   family on = set active:true in services.json + add matching projects.
   ============================================================ */
import serviceData from '../data/services.json'
import type { ServiceFamilyId, AccentName } from './cms'

export interface ServiceFamily {
  id: ServiceFamilyId
  label: string
  blurb: string
  disciplines: string[]
  active: boolean
  accent: AccentName
  order: number
}

const FAMILIES: ServiceFamily[] = (serviceData.families as ServiceFamily[])
  .slice()
  .sort((a, b) => a.order - b.order)

export function getServices(): ServiceFamily[] {
  return FAMILIES
}
export function activeServices(): ServiceFamily[] {
  return FAMILIES.filter((f) => f.active)
}
export function getFamily(id: ServiceFamilyId): ServiceFamily | undefined {
  return FAMILIES.find((f) => f.id === id)
}
export function labelOf(id: ServiceFamilyId): string {
  return getFamily(id)?.label ?? id
}
export function accentOf(id: ServiceFamilyId): AccentName {
  return getFamily(id)?.accent ?? 'violet'
}
