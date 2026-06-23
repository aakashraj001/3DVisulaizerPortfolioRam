# BUNQ Labs — Digital Design & Visualisation Studio (variant two)

A bold, pop, minimal-but-funky studio portfolio: a **dark, fanned card-stack hero** over a generative WebGL field, a light editorial body with **huge grotesk type, monospace spec-labels, pop-colour blocks and peeled-edge image cards**, a **horizontal-scroll Work index**, a **service-family taxonomy**, oversized stat numbers, a numbered process, a marquee, and a Flip case lightbox. Built with the same proven engineering spine as variant one (GSAP ScrollSmoother + lazy Three.js + source-agnostic data layer) and the same accessibility/performance guardrails.

It is a sibling app to the dark cinematic variant in the repo root; the two do not share build output.

## Quick start

```bash
cd studio
npm install
npm run dev        # Vite dev server (HMR)
npm run build      # type-check + production build → dist/
npm run preview    # serve dist/ on :4173   (NB: not 5060 — Chrome blocks 5060 as an unsafe SIP port)
```

## Service-family taxonomy (the IA spine)

Work and the Services section are driven by `data/services.json` — five families in order:

| Family | Status | Disciplines |
|---|---|---|
| **Visualisation** | active | Architectural rendering · Product rendering · Animation · Walkthroughs · Interactive presentations |
| **Visual Identity** | active | Packaging · Publication design · Brand graphics |
| Computational Design | in development | Grasshopper · Parametric modelling · Generative design · Design automation · Analysis workflows |
| Immersive Experiences | in development | AR · VR · Interactive environments · Virtual exhibitions |
| Digital Fabrication | in development | 3D printing · Rapid prototyping · Computational products · Fabrication consulting |

**Filters and the Services list derive from this file — nothing is hardcoded.** To switch on a future family, set its `active: true` and add projects whose `serviceFamily` matches its `id` (in `data/projects.json` or your CMS). No code change.

## Content

Projects live in `data/projects.json` behind a **source-agnostic data layer** (`src/cms.ts`: `getProjects`, `getFeatured`, `projectsByFamily`). Swap `VITE_CMS_SOURCE` to `sanity`/`decap` (documented stubs) without touching any consumer — adding work is a data change.

```ts
Project { title, client?, serviceFamily, disciplines[], year, image, gallery?, summary?, url?, accent?, featured, order }
```

Images are curated **Unsplash** photos (CORS-clean → the WebGL hero can texture them; `auto=format` → WebP/AVIF). `src/images.ts` builds a responsive `srcset`; set `VITE_IMAGE_CDN_BASE` to route through ImageKit/Cloudinary (passthrough otherwise). Each project / family may set a pop `accent` (`violet|red|lime|lilac`).

## Design system

- **Palette**: `--paper #F5F2EC` (body), `--ink #0E0E0C` (type + hero), `--ash #6F6E68`, pop accents `--pop-violet #6E2BFF` (primary), `--pop-red #FF3B23`, `--pop-lime #C8FF1E`, `--pop-lilac #D9A6FF` — used **boldly** as fills/blocks.
- **Type**: Space Grotesk 700 (display), Inter (body), Space Mono (labels/tags/numbers, tabular).
- Tokens live in `styles/tokens.css`; every component reads from them.

## Accessibility & performance

- Full `prefers-reduced-motion` experience (no smoothing/parallax/SplitText/pin; static hero front card; skipped preloader; marquee paused; work cards wrap so all are reachable; stats shown at final value) — governed by `gsap.matchMedia()`.
- Mobile (≤ 860px): Three.js off, no horizontal pin (Work becomes a vertical stack), reduced motion.
- WebGL backdrop: lazy chunk, init in-view only, DPR ≤ 2, dispose + `forceContextLoss()` on exit, pause offscreen, one restore attempt then static fallback.
- Lightbox: `role="dialog"`/`aria-modal`, focus trap, background `inert`, ScrollSmoother paused, focus returned, Esc/backdrop/close.
- In-page nav smooth-scrolls to a computed offset (`rect.top + scrollY − navHeight`) and never `focus()`-es a tall section (avoids the page-jump + ScrollSmoother-cancel bug). Sticky surfaces are `position: fixed` outside the smoother transform; the only ScrollTrigger pin is the deliberate horizontal Work scroll. Reveals/animations are transform/opacity only (no animated `clip-path`).
- Responsive lazy images with reserved dimensions (no CLS); animate transform/opacity only; all GSAP/ScrollTrigger torn down on teardown. Target Lighthouse ≥ 90.

## Deploy

`base: './'` so it works on any subpath. Build `dist/` and host statically. A GitHub Pages workflow is provided at `.github/workflows/deploy-studio.yml` (builds `studio/` and publishes it); enable Pages once and point it at the studio if you want this variant live alongside (or instead of) variant one.

The full spec lives at `openspec/changes/add-studio-bold-variant/` (proposal, design, tasks, and 10 capability specs). Validate with `openspec validate add-studio-bold-variant --strict`.
