import { defineConfig } from 'vite'

// Variant-two studio app. Three.js (hero backdrop) and gsap are isolated into
// their own chunks; the hero backdrop is lazy-imported so three never blocks
// first paint.
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
