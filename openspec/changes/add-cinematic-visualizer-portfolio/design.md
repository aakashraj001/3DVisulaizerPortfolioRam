# Design: Cinematic 3D-Visualizer Portfolio

## Context

Greenfield single-page portfolio. The brand is "a private viewing room where photoreal renders glow like hung artworks": dark, premium, editorial, quiet. The product risk is not features — it is **motion that breaks** (jank, scroll desync, WebGL crashes, motion-sickness for reduced-motion users) and **a gallery that can't grow without a developer**. Every decision below optimizes for: one orchestrated, 60fps motion moment over ten scattered effects; a hard, complete fallback for every effect; and a data layer that makes "add a render" a CMS action.

The stack is fixed by the brief: Vite + vanilla TS, GSAP 3.13+ (ScrollTrigger / ScrollSmoother / SplitText / Flip — all now free for commercial use), Three.js r170+ for the hero only, image CDN for all renders.

## Goals / Non-Goals

- **Goals**: cinematic feel via orchestrated motion; in-depth 3D sensation via the WebGL depth hero + layered parallax; CMS-driven content; Lighthouse ≥ 90 perf & a11y; complete reduced-motion / no-WebGL / mobile fallbacks; clean, swappable module + data architecture.
- **Non-Goals**: SSR, routing, a backend, a live CMS/CDN account, the WebGL→lightbox dissolve, multi-page transitions (all deferred or config-only).

## Decisions

### D1 — Vite + vanilla TS as primary; CDN no-build `index.html` as a guaranteed-runnable fallback
The brief names Vite + vanilla TS as the default (fast, animation-friendly, no reconciler overhead for hand-tuned timelines). We ship that as the real deliverable with deps in `package.json`. Because the runtime environment may lack network for `npm install`, we **also** ship `index.cdn.html` loading GSAP + Three from jsDelivr via the brief's exact CDN snippet + importmap, so the site is demonstrable with zero install. The two share the same `styles/` and the same `data/projects.json`; only the module-loading boundary differs.
- *Alternative*: Astro / React+Next. Rejected for v1 — adds build complexity and (for React) a second animation-ownership story. The proposal documents the `@gsap/react useGSAP()` + `gsap.context()` path if React is adopted later.

### D2 — ScrollSmoother is the single scroll authority; parallax is declarative
One `ScrollSmoother.create({ smooth: 1.2, effects: true, normalizeScroll: true })` wraps `#smooth-wrapper > #smooth-content`. `effects: true` unlocks `data-speed` / `data-lag` so parallax is authored in markup, perfectly synced to the smoothed scroll. All `ScrollTrigger` animations therefore read the same (transformed) scroll position — no desync.
- **Reveals** use `ScrollTrigger.batch()` (groups elements entering together, staggers them) rather than one trigger per element — fewer instances, natural stagger, better perf.
- **AOS** is optional and load-order-fragile: it reads *native* scroll position and desyncs under a transformed wrapper. We default to GSAP for all reveals; if AOS is included it is `AOS.init({ once: true })` after smoother creation with a `ScrollSmoother` `onUpdate → AOS.refresh()` hook, and dropped entirely on the first sign of conflict.

### D3 — `gsap.matchMedia()` is the accessibility & responsiveness control plane
All motion is registered inside `gsap.matchMedia()` with three branches:
- `(prefers-reduced-motion: no-preference) and (min-width: 768px)` — full experience.
- `(prefers-reduced-motion: no-preference) and (max-width: 767px)` — mobile: ScrollSmoother off or `smooth: 0.6`, parallax intensity reduced, Three.js disabled, single-column.
- `(prefers-reduced-motion: reduce)` — **no** ScrollSmoother, **no** parallax/SplitText/batch stagger (elements start visible), static hero image, preloader skipped.
matchMedia auto-reverts the correct branch on media-query change, which also gives us correct cleanup for free.

### D4 — Hero depth via a displacement shader, gated behind a capability ladder
A single `PlaneGeometry` with a `ShaderMaterial`: the vertex/fragment shader samples a grayscale depth map and offsets the color-texture UVs (and/or vertex z) by `depth * strength`, where `strength` is driven by a lerped pointer uniform and a ScrollTrigger-scrubbed scroll uniform. Foreground (high depth) parallaxes more than background → 2.5D "breathing." Dust = a small additive `Points` cloud with slow drift; camera does a slow sinusoidal ambient drift. Movement is small and slow by design.
- **Init only when**: not reduced-motion, not low-power/mobile, WebGL context creates successfully, AND the hero is in view (IntersectionObserver). **Dispose** geometries/materials/textures + `renderer.dispose()` + `forceContextLoss()` when the hero leaves view or on teardown. `min(devicePixelRatio, 2)`; textures capped ≤ 2048px (downscaled on load if larger).
- *Alternative*: full 3D scene / glTF. Rejected — overkill, heavy, and the depth-map plane gives the in-depth feel for a fraction of the cost. If no depth map is provided for the featured project, the shader runs with a flat depth (still gets subtle pointer parallax) or falls back to the static image.

### D5 — Lightbox via GSAP Flip (FLIP technique), not a width/height animation
On click we record the thumbnail's state (`Flip.getState`), reparent/restyle the image to the full lightbox layout, then `Flip.from(state, { duration, ease, absolute })`. Flip animates the transform delta (GPU-friendly) so the thumbnail appears to morph into the full render — the signature premium touch — instead of a janky box-resize. Backdrop fades in parallel. Focus is trapped while open and returned to the triggering thumbnail on close; Esc / backdrop / close-button all dismiss.

### D6 — Data layer is an interface, not a fetch call
`cms.ts` exposes `getProjects(): Promise<Project[]>` and `getFeatured()` behind a typed `Project` interface (the exact schema in the brief). The default adapter reads `data/projects.json` (placeholder). Sanity and Decap adapters are documented stubs selected by an env flag (`VITE_CMS_SOURCE`). Consumers (hero, gallery, filters) never touch the source — they call the interface, sort by `order`, group by `category`. This is what makes "add a render = one CMS entry."

### D7 — Image URLs are built, never hardcoded
`images.ts` exposes `imageUrl(asset, { width, quality, format })` and `srcSet(asset, widths)` that compose the CDN base URL + transform params (ImageKit-style by default). `VITE_IMAGE_CDN_BASE` configures the base; it defaults to a passthrough so placeholder/remote images render without a real account. Every `<img>` gets `srcset` + `sizes`, `loading="lazy"`, explicit `width`/`height`, and a tiny blurred LQIP as background revealed on load. This satisfies both the performance budget and the "never load full-res directly" rule.

## Capability Map

| Capability | Owns | Brief sections |
|---|---|---|
| `site-shell` | tokens, type, preloader, nav, **hero text + intro reveal**, studio statement, contact/footer | 3, 4.1/4.2/4.3-text/4.6/4.7, 7.2 |
| `motion-system` | ScrollSmoother, GSAP plugins, easing, compositor-only rule, batch reveals, matchMedia governance | 7, 2 |
| `hero-webgl` | Three.js depth **canvas scene + scrim + fallback ladder only** (text overlay belongs to `site-shell`) | 5, 4.3 |
| `gallery` | Index filters, grid, piece reveal/parallax/hover/caption | 4.4/4.5, 6 |
| `lightbox` | Flip morph, focus trap, dismiss | 6 (click) |
| `cms-data-layer` | Project schema, data source interface, filters/featured | 8 |
| `image-delivery` | responsive CDN images, srcset, lazy, blur-up, CLS | 2, 9 (images) |
| `accessibility-performance` | reduced-motion, mobile, keyboard, perf budgets | 9 |

## Risks / Trade-offs

- **AOS desync under transformed wrapper** → default to GSAP `ScrollTrigger.batch`; AOS optional and removed on conflict (D2).
- **WebGL crash / context loss / no GPU in headless** → capability ladder + static-image fallback + IntersectionObserver init + disposal (D4). Live WebGL render may only be verifiable in a real-GPU browser, not headless CI — verification notes will record this.
- **Scroll jank from too many ScrollTriggers** → `batch()` for reveals, declarative `data-speed` for parallax, animate transform/opacity only, `will-change` sparingly and removed after.
- **Motion sickness / a11y regressions** → reduced-motion branch is a *first-class* experience, tested, not an afterthought (D3).
- **CLS from images** → explicit `width`/`height` + reserved aspect-ratio boxes (D7).
- **CMS swap friction** → interface boundary (D6) keeps consumers source-agnostic.
- **Bundle weight from Three.js** → lazy-load `hero3d` chunk after first paint / on hero in-view; never ship it to routes that don't use it.

## Migration Plan

Greenfield — no migration. Rollout order follows the milestones in `proposal.md`: Core (smooth scroll + gallery + lightbox + fallbacks) is built and verified first; the Three.js hero and NICE items are added only once Core is solid. The data layer ships with placeholder data; connecting a live CMS/CDN is a post-merge config step (env vars + adapter selection), not a code change.

## Open Questions

- Which CMS will actually back production — Sanity (richer image pipeline) or Decap (free, git-based)? The interface supports either; default ships placeholder + Decap config. *(Does not block v1.)*
- Real image-CDN vendor (ImageKit vs Cloudinary)? URL builder defaults to ImageKit-style params; switching is isolated to `images.ts`. *(Does not block v1.)*
