# Tasks: add-cinematic-visualizer-portfolio

> Build order follows the motion inventory (brief §7) and the milestones in
> `proposal.md`. Sections 1–6 are the **Core** milestone (verify before polish):
> smooth scroll + parallax gallery + reveals + working lightbox on placeholder
> data, with reduced-motion + mobile fallbacks. Sections 7–9 add the Three.js
> hero, the shell (preloader/nav/sections), and tier-2 NICE items. Section 10 is
> verification, a11y/perf, and docs.
>
> NOTE on WebGL verification: headless Chromium typically refuses to
> software-render WebGL, so the live hero render may only be confirmable in a
> real-GPU browser. Gates, lazy-load, disposal, and the static fallback ARE
> verifiable headlessly — record which is which.

## 1. Scaffold & tooling

- [ ] 1.1 `package.json` with `vite`, `typescript`, `gsap@^3.13`, `three@^0.170`, `@types/three`. Scripts: `dev`, `build`, `preview`.
- [ ] 1.2 `vite.config.ts` (base path, `build.target`, manual chunk so `three`/`hero3d` is a separate lazy chunk), `tsconfig.json` (strict).
- [ ] 1.3 `.env.example` with `VITE_IMAGE_CDN_BASE`, `VITE_CMS_SOURCE` (default `placeholder`). Document defaults.
- [ ] 1.4 `index.html` Vite entry with `#smooth-wrapper > #smooth-content`, font preconnects, and a `<noscript>` static fallback.
- [ ] 1.5 `index.cdn.html` no-build fallback using the brief's exact GSAP + Three CDN snippet + importmap (shares `styles/` + `data/projects.json`).

## 2. Design system (tokens) — brief §3

- [ ] 2.1 `styles/tokens.css`: palette vars (`--void #14110E`, `--char #1C1813`, `--bone #ECE5D8`, `--ash #8A8073`, `--line rgba(236,229,216,.13)`, `--gilt #B89B6E`); type scale; spacing; easing var `--ease: cubic-bezier(.2,.7,.25,1)`; radius `1px`.
- [ ] 2.2 Load Fraunces (300–500 + italic) and Inter (400/500) with `font-display: swap` + preconnect.
- [ ] 2.3 `styles/base.css`: reset, `--void` page bg, `--bone` type, museum-label utility (uppercase, `letter-spacing .14–.32em`, 11–12px), hairline divider utility, visible gilt focus-ring utility.
- [ ] 2.4 Lint guard / convention note: `--gilt` is used only on hairlines, micro-caps, hover frames — never as a fill or button background.

## 3. CMS data layer — brief §8 (`cms-data-layer`)

- [ ] 3.1 `src/cms.ts`: `Project` interface (title, category enum, year, engine, image, depthMap?, featured, order); `getProjects()` sorts by `order`; `getFeatured()` returns the `featured` project (fallback: first by order).
- [ ] 3.2 Placeholder adapter reads `data/projects.json` (≥ 6 entries across all categories, one `featured: true`, at least one with a `depthMap`).
- [ ] 3.3 Documented Sanity + Decap adapter stubs selected by `VITE_CMS_SOURCE`; `public/admin/index.html` + `static/admin/config.yml` Decap config matching the schema.
- [ ] 3.4 Derive the category filter list from data (`category` values), not a hardcoded array.

## 4. Image delivery — brief §2 & §9 (`image-delivery`)

- [ ] 4.1 `src/images.ts`: `imageUrl(asset, opts)` + `srcSet(asset, widths)` composing `VITE_IMAGE_CDN_BASE` + ImageKit-style transform params (WebP/AVIF auto, quality, width). Passthrough when base unset.
- [ ] 4.2 `renderImage()` helper emitting `<img>` with `srcset` + `sizes`, `loading="lazy"`, explicit `width`/`height`, `alt`, and an LQIP blur-up background revealed on `load`.
- [ ] 4.3 Aspect-ratio box wrapper so images reserve space (no CLS).

## 5. Motion system — brief §7.1 & §2 (`motion-system`)

- [ ] 5.1 `src/motion.ts`: register GSAP plugins (ScrollTrigger, ScrollSmoother, SplitText, Flip); export the easing/`power3` language.
- [ ] 5.2 `src/smoothScroll.ts`: `ScrollSmoother.create({ smooth: 1.2, effects: true, normalizeScroll: true })` on `#smooth-wrapper`/`#smooth-content`.
- [ ] 5.3 `gsap.matchMedia()` governance with three branches (desktop full / mobile reduced / reduced-motion off) per design D3; expose a `registerMotion(ctx)` entry each module hooks into.
- [ ] 5.4 Generic section reveal via `ScrollTrigger.batch()` (fade/translate up, stagger) for simple sections.
- [ ] 5.5 Teardown helper killing all ScrollTriggers + reverting contexts (for HMR / future route change).

## 6. Gallery + lightbox (Core) — brief §4.4/4.5 & §6 (`gallery`, `lightbox`)

- [ ] 6.1 `src/gallery.ts`: render the 2-col asymmetric grid (1-col mobile) from `getProjects()`; each piece = frame + image + museum caption (serif title / tracked-caps `Category · Year · Engine` / index number).
- [ ] 6.2 Entrance reveal: clip-path inset wipe (uncover from bottom) + scale 1.06→1.0 via `ScrollTrigger.batch()` with stagger; caption hairline `scaleX 0→1`; index number fades up.
- [ ] 6.3 Parallax: `<img data-speed="0.9">`, caption block different speed / `data-lag`; frame stays fixed.
- [ ] 6.4 Hover: slow 1.3s zoom (scale 1.045) + brightness lift + gilt 1px frame fade-in (transform/opacity/filter only).
- [ ] 6.5 Index filters (All / Architecture / Interior / Product / Experimental) as tracked-caps links; gilt underline on active; filtering shows/hides pieces (optionally Flip-animated) and re-runs reveals.
- [ ] 6.6 `src/lightbox.ts`: click opens lightbox via `Flip.getState` → reparent/restyle → `Flip.from(...)` morph; dark backdrop, full render (CDN large size), museum caption.
- [ ] 6.7 Lightbox dismiss: Esc / backdrop / close-button; focus trapped while open; focus returned to the originating thumbnail on close; `aria-modal` + labelled.

## 7. Hero WebGL depth scene — brief §5 & §4.3 (`hero-webgl`)

- [ ] 7.1 `index.html` hero markup: WebGL canvas mount + dark scrim + eyebrow + Fraunces headline + one-line statement + featured-work label + scroll cue. Static `<img>` of the featured render sits underneath as first-paint + fallback.
- [ ] 7.2 `src/hero3d.ts` (lazy chunk): Three.js renderer (`min(dpr,2)`, low-power), `PlaneGeometry` + `ShaderMaterial`, color + depth textures (downscaled ≤ 2048px).
- [ ] 7.3 `src/shaders/`: depth-displacement GLSL — offset UVs/vertex by `depth * strength`; `uPointer`, `uScroll`, `uTime` uniforms. Flat-depth path when no depth map.
- [ ] 7.4 Drivers: lerped pointer parallax uniform; ScrollTrigger-scrubbed `uScroll`; slow ambient camera drift; faint additive dust `Points`.
- [ ] 7.5 Capability ladder: init only when not-reduced-motion + not-mobile/low-power + WebGL OK + hero in view (IntersectionObserver). Else show the static image.
- [ ] 7.6 Disposal: geometries/materials/textures + `renderer.dispose()` + `forceContextLoss()` on hero-out-of-view / teardown; pause rAF when offscreen or tab hidden; one restore attempt on context loss then fall back.

## 8. Site shell — brief §4.1/4.2/4.6/4.7 (`site-shell`)

- [ ] 8.1 `src/preloader.ts`: full-screen `--void`; gilt counter 00→100; SplitText studio-name reveal; curtain wipe upward on complete → reveal hero. Skipped entirely under reduced-motion.
- [ ] 8.2 `src/nav.ts`: fixed nav (wordmark left; Index / Studio / Contact right); transparent over hero; gains blur + hairline border after 40px scroll; hides on scroll-down, reappears on scroll-up (ScrollTrigger direction).
- [ ] 8.3 Hero headline: SplitText chars → mask-reveal with stagger; eyebrow + statement fade in.
- [ ] 8.4 Studio statement section: centered Fraunces pull-quote, SplitText words revealed (scrubbed) on scroll; quiet row of render-engine names. (NICE: brief pin.)
- [ ] 8.5 Contact/footer: oversized Fraunces "Let's build the unbuilt" line reveal; magnetic email button (translates toward cursor on hover); social links; colophon.

## 9. Tier-2 NICE — brief §6 & §7.9

- [ ] 9.1 Custom cursor dot that grows + reads "View" over gallery pieces (pointer-fine only; off on touch/reduced-motion).
- [ ] 9.2 Magnetic button easing refinement.
- [ ] 9.3 (Deferred / documented) WebGL displacement dissolve from piece → lightbox; multi-page curtain transitions.

## 10. Accessibility, performance & docs — brief §9 (`accessibility-performance`)

- [ ] 10.1 Reduced-motion audit: ScrollSmoother off, parallax/SplitText/batch stagger killed (content visible), static hero, preloader skipped — verified via emulation.
- [ ] 10.2 Mobile audit: Three.js disabled, parallax reduced, single column, smaller/disabled smooth value — verified at ≤ 767px.
- [ ] 10.3 Keyboard/AT: visible gilt focus rings throughout; lightbox focus trap + Esc + return; meaningful `alt` on all renders; nav reachable; decorative canvas `aria-hidden`.
- [ ] 10.4 Images: `srcset`/WebP-AVIF, `loading="lazy"`, explicit `width`/`height`, blur-up — no CLS verified.
- [ ] 10.5 Perf: lazy-init Three.js + dispose; `min(dpr,2)`; `will-change` sparingly + removed; transform/opacity-only animations; clean up all GSAP/ScrollTrigger on teardown. Target Lighthouse ≥ 90 perf & a11y.
- [ ] 10.6 `README.md`: how to run (Vite dev/build + the no-build `index.cdn.html`), where to set `VITE_IMAGE_CDN_BASE`, and how to connect Sanity/Decap via `VITE_CMS_SOURCE`.

## 11. Validation & sign-off

- [ ] 11.1 `openspec validate add-cinematic-visualizer-portfolio --strict --no-interactive` passes.
- [ ] 11.2 `npm run build` (or documented CDN-fallback path) produces a working static site.
- [ ] 11.3 Core milestone demonstrated (smooth scroll + parallax gallery + reveals + lightbox + fallbacks) before tier-2 polish is considered done.
