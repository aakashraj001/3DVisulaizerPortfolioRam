/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IMAGE_CDN_BASE?: string
  readonly VITE_CMS_SOURCE?: 'placeholder' | 'sanity' | 'decap'
  readonly VITE_SANITY_PROJECT_ID?: string
  readonly VITE_SANITY_DATASET?: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}
declare module '*.css'
