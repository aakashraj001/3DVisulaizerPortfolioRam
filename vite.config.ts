import { defineConfig } from 'vite'

// Single-page portfolio. Three.js is heavy and only used by the hero, so it is
// split into its own chunk and lazy-imported (see src/hero3d.ts) — it never
// ships in the initial graph that blocks first paint.
export default defineConfig({
  base: './',
  build: {
    target: 'es2021',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three'
          if (id.includes('node_modules/gsap')) return 'gsap'
        },
      },
    },
  },
})
