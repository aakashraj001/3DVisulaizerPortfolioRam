# Tasks: add-studio-bold-variant

> New self-contained app under `studio/`. Build order follows the milestones in
> `proposal.md`. Reuse the proven spine from the root app (motion, smoothScroll,
> images, cms pattern, Flip lightbox + focus trap) and the guardrails in
> design.md. The root app is left untouched.
>
> WebGL note: headless Chromium can't software-render WebGL, so the live hero
> backdrop must be eyeballed on a real-GPU browser; gates, lazy-load, disposal,
> and the static fallback ARE verifiable headlessly.

## 1. Scaffold & tooling (`studio/`)
- [x] 1.1 `studio/package.json` (vite, typescript, gsap@^3.13, three@^0.170, @types/three); scripts dev/build/preview.
- [x] 1.2 `vite.config.ts` (base './', manualChunks isolating three/gsap), strict `tsconfig.json`, `vite-env.d.ts`.
- [x] 1.3 `index.html` with `#smooth-wrapper > #smooth-content`, font preconnects (Space Grotesk + Inter + Space Mono), `.js-motion` head guard, favicon + theme-color, `<noscript>` fallback.
- [x] 1.4 `.env.example` (VITE_IMAGE_CDN_BASE, VITE_CMS_SOURCE).

## 2. Design system — `studio-design-system`
- [x] 2.1 `styles/tokens.css`: paper/bone/ink/ash/rule + pop-violet/red/lime/lilac; type scale; mono label tokens; snappy easing; radii (0 for blocks, large for cards).
- [x] 2.2 Load Space Grotesk (700) + Inter (400/500) + Space Mono; tabular figures.
- [x] 2.3 `styles/base.css`: reset, mono-label utility, pop-block utility, peeled-card utility (static mask + radius), gilt-free focus ring, `::selection`, scrollbar, reduced-motion CSS kill.
- [x] 2.4 Pop accents may be used as fills/blocks (no restraint); each project may set its own `accent`.

## 3. Service taxonomy — `service-taxonomy`
- [x] 3.1 `data/services.json`: 5 families ordered; visualisation + visual-identity `active:true`; computational-design, immersive-experiences, digital-fabrication `active:false`; disciplines per family; accent per family.
- [x] 3.2 `src/services.ts`: `getServices()`, `activeServices()`, `disciplinesOf(id)`, label/blurb lookups.
- [x] 3.3 Filters + Services section derive from the taxonomy; in-development families render but aren't populated.

## 4. Content data layer — `content-data-layer`
- [x] 4.1 `src/cms.ts`: `Project` + `ServiceFamily` types; `getProjects()` sorted by order; `getFeatured()`; `projectsByFamily(id)`; in-flight-cached.
- [x] 4.2 `data/projects.json` placeholder (≥ 8 projects across visualisation + visual-identity, one featured, varied disciplines, per-project accent).
- [x] 4.3 Sanity/Decap adapter stubs via `VITE_CMS_SOURCE`; consumers untouched on swap.

## 5. Image delivery — `image-delivery`
- [x] 5.1 `src/images.ts`: `imageUrl()` + `srcSet()` (ImageKit-style, WebP/AVIF, passthrough); CORS-clean Unsplash defaults.
- [x] 5.2 `renderImage()` peeled card: aspect box (no CLS) + lazy + LQIP + static peel mask/radius + alt.
- [ ] 5.3 Local offline placeholder generator (`scripts/generate-placeholders.mjs`) — DEFERRED: curated Unsplash images load (verified); port variant-one's generator if an offline build is needed.

## 6. Motion system — `motion-system`
- [x] 6.1 `src/motion.ts`: register ScrollTrigger/ScrollSmoother/SplitText/Flip; snappy easing exports; matchMedia predicates.
- [x] 6.2 `src/smoothScroll.ts`: ScrollSmoother (smooth:1.1, effects:true, normalizeScroll:true).
- [x] 6.3 `registerMotion()` matchMedia branches (desktop/mobile/reduced); teardown helper.
- [x] 6.4 Generic mask-up / fade reveals via SplitText + ScrollTrigger.batch.

## 7. Work index — `work-index`
- [x] 7.1 `src/work.ts`: build project cards (peeled cover + title + mono discipline tags + big index number) from data.
- [x] 7.2 Desktop: ScrollTrigger horizontal pin + x-translate through the row; mobile/reduced: vertical stack (no pin).
- [x] 7.3 Service filter (from taxonomy); in-development families → explained empty state; re-reveal + ScrollTrigger.refresh on filter.
- [x] 7.4 Card click opens the case lightbox (Flip).

## 8. Case lightbox — `case-lightbox`
- [x] 8.1 `src/lightbox.ts`: Flip card→case morph; case content (cover, summary, client/year, disciplines, link).
- [x] 8.2 Dismiss Esc/backdrop/close; focus trap + return; role=dialog/aria-modal; background `inert`; smoother paused.
- [x] 8.3 Reduced-motion crossfade (no morph).

## 9. Card-stack hero — `cardstack-hero`
- [x] 9.1 `index.html` hero markup: dark stage; statement headline; mono eyebrow; card-stack mount; prev/next; view-work cue; static fallback backdrop.
- [x] 9.2 `src/heroStack.ts`: fanned stack from featured projects; cycle via prev/next + keyboard + drag/swipe; spring motion; reduced-motion = static front card.
- [x] 9.3 `src/heroBg3d.ts` (lazy): Three.js generative shader backdrop; capability ladder (in-view + not-reduced + not-mobile + WebGL OK); DPR≤2; dispose+forceContextLoss; pause offscreen; one restore attempt → static fallback.

## 10. Studio sections — `studio-sections`
- [x] 10.1 `src/nav.ts`: persistent mono nav (wordmark + WORK/ABOUT/CONTACT + accessible Sound-on toggle stub); computed-offset smooth-scroll (no focus()).
- [x] 10.2 `src/preloader.ts`: mono 00→100 + curtain; skipped under reduced motion.
- [x] 10.3 `src/sections.ts`: Services list (5 families, future marked); oversized stats (tabular); numbered process; About statement (word/line reveal); marquee; contact/footer with pop CTA block + mono columns.
- [x] 10.4 `src/clock.ts`: live local clock in the footer (mono).

## 11. Orchestration — `src/main.ts`
- [x] 11.1 Build DOM once (services, work, hero, sections); init lightbox + nav + clock.
- [x] 11.2 matchMedia branches wire smoother + reveals + work pin + hero stack/3d + marquee; reduced branch is a no-op for motion.
- [x] 11.3 Preloader gate → hero intro; HMR teardown.

## 12. Accessibility, performance & docs — `accessibility-performance`
- [x] 12.1 Reduced-motion audit (complete static experience).
- [x] 12.2 Mobile audit (no Three.js, vertical work, reduced motion).
- [x] 12.3 Keyboard/AT (focus rings, lightbox trap, Sound-on control, alt, decorative canvas aria-hidden).
- [x] 12.4 Perf (lazy+disposed three, DPR≤2, no CLS, transform/opacity, cleanup; Lighthouse ≥90 target).
- [x] 12.5 `studio/README.md` (run, CDN base, CMS swap, turning on a future family).

## 13. Validation & deploy
- [x] 13.1 `openspec validate add-studio-bold-variant --strict --no-interactive` passes.
- [x] 13.2 `cd studio && npm run build` green; verify core + reduced-motion via headless screenshots.
- [x] 13.3 GitHub Actions workflow to deploy `studio/` (its own Pages target or path).
