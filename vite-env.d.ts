/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Image CDN base, e.g. https://ik.imagekit.io/your_id . Unset = passthrough. */
  readonly VITE_IMAGE_CDN_BASE?: string
  /** Which CMS adapter to use: 'placeholder' (default) | 'sanity' | 'decap'. */
  readonly VITE_CMS_SOURCE?: 'placeholder' | 'sanity' | 'decap'
  /** Sanity project id / dataset (only when VITE_CMS_SOURCE=sanity). */
  readonly VITE_SANITY_PROJECT_ID?: string
  readonly VITE_SANITY_DATASET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// GLSL imported as raw strings (Vite ?raw).
declare module '*.glsl?raw' {
  const value: string
  export default value
}

// Side-effect CSS imports.
declare module '*.css'
