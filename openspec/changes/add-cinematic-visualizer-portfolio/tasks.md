# Tasks: add-cinematic-visualizer-portfolio

> Build order follows the motion inventory (brief §7) and the milestones in
> `proposal.md`. Sections 1–6 are the **Core** milestone; 7–9 add the Three.js
> hero, shell, and tier-2 NICE; 10 is a11y/perf/docs.
>
> STATUS: implemented and built (`npm run build` green; `tsc` clean). Verified
> headlessly via Chrome CDP: all modules execute, full layout + reduced-motion
> path render, both `index.html` and `index.cdn.html` run. Placeholder renders
> are local SVGs (`public/renders/`, `scripts/generate-placeholders.mjs`) so the
> gallery + hero display with no network. A 10-finding adversarial code review
> was run and all findings fixed.
>
> WebGL caveat: headless Chromium won't software-render WebGL, so the live hero
> render must be eyeballed on a real-GPU browser. Gates, lazy-load, disposal,
> texture caps, and the static fallback ARE verified by code + headless.

## 1. Scaffold & tooling

- [x] 1.1 `package.json` with `vite`, `typescript`, `gsap@^3.13` (resolved 3.15), `three@^0.170`, `@types/three`.
- [x] 1.2 `vite.config.ts` (base `./`, `manualChunks` → separate `three`/`gsap` chunks), strict `tsconfig.json`.
- [x] 1.3 `.env.example` with `VITE_IMAGE_CDN_BASE`, `VITE_CMS_SOURCE` (default `placeholder`).
- [x] 1.4 `index.html` Vite entry with `#smooth-wrapper > #smooth-content`, font preconnects, `.js-motion` head guard.
- [x] 1.5 `index.cdn.html` no-build fallback using the brief's exact GSAP CDN snippet (shares `styles/` + `data/`).

## 2. Design system (tokens) — brief §3

- [x] 2.1 `styles/tokens.css`: exact palette, type scale, easing `--ease`, radius 1px, z-layers.
- [x] 2.2 Fraunces (300–500 + italic) + Inter (400/500) with `display=swap` + preconnect.
- [x] 2.3 `styles/base.css`: reset, museum-label / hairline / gilt focus-ring utilities, skip link.
- [x] 2.4 `--gilt` used only on hairlines, micro-caps, hover frames (no fills/buttons).

## 3. CMS data layer — brief §8 (`cms-data-layer`)

- [x] 3.1 `src/cms.ts`: `Project` interface; `getProjects()` (sorted, in-flight cached); `getFeatured()` (fallback to first).
- [x] 3.2 Placeholder adapter reads `data/projects.json` (8 entries, all categories, one featured w/ depthMap).
- [x] 3.3 Sanity + Decap adapter stubs by `VITE_CMS_SOURCE`; `public/admin/` Decap config matching the schema.
- [x] 3.4 Category filters derived from data (`categoriesOf`).

## 4. Image delivery — brief §2 & §9 (`image-delivery`)

- [x] 4.1 `src/images.ts`: `imageUrl()` + `srcSet()` (ImageKit-style transforms; passthrough/template when no CDN).
- [x] 4.2 `renderImage()` with `srcset`/`sizes`, `loading="lazy"`, explicit `width`/`height`, `alt`, blur-up LQIP.
- [x] 4.3 Aspect-ratio box (no CLS).

## 5. Motion system — brief §7.1 & §2 (`motion-system`)

- [x] 5.1 `src/motion.ts`: register ScrollTrigger/ScrollSmoother/SplitText/Flip; `EASE`; predicates.
- [x] 5.2 `src/smoothScroll.ts`: `ScrollSmoother.create({ smooth:1.2, effects:true, normalizeScroll:true })`.
- [x] 5.3 `gsap.matchMedia()` governance (desktop / mobile / reduced) via `registerMotion`.
- [x] 5.4 Generic `ScrollTrigger.batch()` reveals (`animateReveals`) with transient `will-change`.
- [x] 5.5 `teardownMotion()` kills ScrollTriggers + reverts contexts (HMR dispose wired).

## 6. Gallery + lightbox (Core) — brief §4.4/4.5 & §6 (`gallery`, `lightbox`)

- [x] 6.1 `src/gallery.ts`: asymmetric grid (1-col mobile) with museum captions.
- [x] 6.2 Entrance: clip-path inset wipe + scale 1.06→1.0 via `ScrollTrigger.batch()` stagger; rule `scaleX`; index fade (`clearProps` so hover survives).
- [x] 6.3 Parallax: image block `data-speed="0.9"`, caption `data-lag`; gilt frame is a sibling → stays fixed.
- [x] 6.4 Hover: 1.3s zoom (1.045) + brightness + gilt frame (CSS, fine-pointer + motion only; absent on touch).
- [x] 6.5 Index filters with gilt active underline; Flip-animated filtering; derived from data.
- [x] 6.6 `src/lightbox.ts`: Flip morph thumbnail→full (large CDN size), museum caption, dark backdrop.
- [x] 6.7 Dismiss Esc/backdrop/close; focus trap; focus return; `aria-modal`; background `inert`.

## 7. Hero WebGL depth scene — brief §5 & §4.3 (`hero-webgl`)

- [x] 7.1 Hero markup: canvas mount + scrim + eyebrow + Fraunces headline + statement + featured label + scroll cue; static image underneath.
- [x] 7.2 `src/hero3d.ts` (lazy chunk): renderer (DPR≤2, low-power), plane + ShaderMaterial, capped textures.
- [x] 7.3 Depth-displacement GLSL (inline): UV offset by `depth * strength`; flat-depth path when no map.
- [x] 7.4 Drivers: lerped pointer, ScrollTrigger-scrubbed `uScroll`, ambient drift, additive dust.
- [x] 7.5 Ladder: init only when not-reduced + not-mobile + WebGL OK + hero in view; else static image (with text overlay).
- [x] 7.6 Dispose all GPU resources + `forceContextLoss()`; pause offscreen/hidden; one restore attempt then fall back. *(Live render pending real-GPU eyeball.)*

## 8. Site shell — brief §4.1/4.2/4.6/4.7 (`site-shell`)

- [x] 8.1 `src/preloader.ts`: gilt 00→100 counter + SplitText name + curtain wipe; skipped under reduced motion.
- [x] 8.2 `src/nav.ts`: transparent → blur+hairline after 40px; hide on scroll-down / show on scroll-up; smooth-scroll anchors + focus.
- [x] 8.3 Hero headline SplitText char mask-reveal + eyebrow/statement fade (`src/hero.ts`, disposer returned).
- [x] 8.4 Studio statement: word-by-word scrubbed reveal + engine row.
- [x] 8.5 Contact: oversized Fraunces line + magnetic email button (fine-pointer/motion only) + social + colophon.

## 9. Tier-2 NICE — brief §6 & §7.9

- [x] 9.1 Custom cursor dot that grows + reads "View" (fine-pointer + motion only).
- [x] 9.2 Magnetic button easing (`gsap.quickTo`, transient `will-change`).
- [ ] 9.3 (Deferred / documented) WebGL piece→lightbox displacement dissolve; multi-page curtain transitions. *(Non-goal in v1 per proposal.)*

## 10. Accessibility, performance & docs — brief §9 (`accessibility-performance`)

- [x] 10.1 Reduced-motion: ScrollSmoother off, parallax/SplitText/stagger killed (content visible via `.js-motion` gating), static hero, no preloader — verified by emulation.
- [x] 10.2 Mobile branch: Three.js disabled, reduced parallax, single column, smaller smooth value.
- [x] 10.3 Keyboard/AT: gilt focus rings, lightbox trap + Esc + return + background `inert`, meaningful `alt`, decorative canvas `aria-hidden`, skip link wired.
- [x] 10.4 Images: `srcset`/lazy/explicit dims/blur-up — no CLS.
- [~] 10.5 Perf: transform/opacity-only, transient `will-change`, lazy+disposed Three.js, DPR≤2, GSAP cleanup. *(Lighthouse ≥90 is the target; not measurable in this headless env — run in a real browser.)*
- [x] 10.6 `README.md`: run instructions (Vite + CDN fallback), CDN base, CMS wiring, local renders.

## 11. Validation & sign-off

- [x] 11.1 `openspec validate add-cinematic-visualizer-portfolio --strict --no-interactive` passes.
- [x] 11.2 `npm run build` produces a working static site; `index.cdn.html` runs (verified via headless DOM dump + screenshots).
- [x] 11.3 Core milestone demonstrated (smooth scroll + parallax gallery + reveals + lightbox + fallbacks) before tier-2.
