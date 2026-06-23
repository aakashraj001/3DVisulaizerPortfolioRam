# Design: BUNQ Labs — bold pop studio variant

## Context

A second portfolio variant for a Digital Design & Visualisation Studio. It must feel like a **different studio**, not a re-skin: where variant one is dark, quiet, serif and restrained, this one is **bold, bright, grotesk, and pop**, with a dark signature hero. It reuses the *engineering* of variant one (which is proven and carries hard-won guardrails) but replaces the *design system, content model, hero, and gallery paradigm* entirely. The product risks are the same as before — motion that breaks, scroll desync under ScrollSmoother, WebGL crashes, motion-sickness, and a gallery that can't grow — plus one new risk: an information architecture that can't absorb the three future service families without a rebuild.

## Goals / Non-Goals

- **Goals**: a fresh, memorable, minimal-but-funky studio site; a service-family IA that already fits all five families; a signature card-stack hero; a horizontal work index; bold pop typography/colour; the same accessibility/performance bar and fallbacks as variant one; clean reuse of the proven spine.
- **Non-Goals**: SSR/routing, a backend, live AR/VR/fabrication, an audio engine, sharing build output with variant one.

## Decisions

### D1 — New app under `studio/`, reusing the spine
A separate Vite + vanilla-TS app (`base: './'`, manual chunks isolating `three`/`gsap`, lazy hero chunk). It copies and adapts the variant-one modules whose behaviour is proven: `motion.ts` (plugin registration + easing + `gsap.matchMedia()` predicates), `smoothScroll.ts`, `images.ts` (CDN URL builder + responsive blur-up), the `cms.ts` source-agnostic pattern, and the Flip lightbox + focus-trap pattern. The first variant is left untouched. *Alternative*: a theme flag in one app — rejected; the two differ in IA, hero, and gallery paradigm, so a shared codebase would be more complex than two clean apps.

### D2 — Design system: bold grotesk + mono labels + pop colour (the opposite of variant one)
- **Palette** (light body, dark hero):
  `--paper #F5F2EC` (body bg), `--bone #FBFAF7` (cards), `--ink #0E0E0C` (type & dark hero bg), `--ash #6F6E68` (secondary/mono), `--rule rgba(14,14,12,.14)` (hairlines on light).
  **Pop accents, used as fills/blocks** (no restraint rule): `--pop-violet #6E2BFF`, `--pop-red #FF3B23`, `--pop-lime #C8FF1E`, `--pop-lilac #D9A6FF`. One pop is the **primary** (violet); red drives CTAs/banners; lime/lilac are spot accents. Each project may declare its own `accent` for its card.
- **Type**: Display = **Space Grotesk** (700) — huge, tight tracking, near-1 line-height, for hero/section/stat type. Body/UI = **Inter** (400/500). Labels/tags/specs/numbers = **Space Mono** (uppercase, tracked) — the "studio spec" voice. Tabular figures for numbers.
- **Layout language**: generous Swiss whitespace; oversized type and stat numbers; **monospace micro-labels**; pop-colour **full-bleed blocks** (CTA banner, section dividers); near-0 radius on type/blocks but **large radii + a "peeled" corner on image cards** (signature). Numbered sections.
- *Loaded from Google Fonts*; all three families are reliably available.

### D3 — Service-family taxonomy is the IA spine (D for "future-proof")
A `data/services.json` defines the five families in order, each `{ id, label, blurb, disciplines[], active, accent }`. **Active**: `visualisation`, `visual-identity`. **In development**: `computational-design`, `immersive-experiences`, `digital-fabrication`. The Work filters, the Services section, and the Index all derive from this list — never hardcoded. Active families filter to real projects; in-development families render with an "In development" state, are not selectable as work filters (or select to an empty, explained state), and carry no projects. Adding a project to a future family + flipping `active: true` switches it on with content alone.

### D4 — Card-stack hero over a lazy WebGL backdrop (signature, with fallback)
The hero shows the featured projects as a **fanned stack of cards** (rotated/offset, front card focused), cycled by prev/next (and drag/keys), with a bold statement headline, a mono eyebrow, and a "View work" cue. Behind it, a **Three.js generative backdrop** (a slow flowing noise/gradient field on a fullscreen shader plane — distinct from variant one's depth-map parallax) on the dark hero. The backdrop is the lazy `three` chunk and follows the **same capability ladder** as variant one: init only when in view + not reduced-motion + not low-power + WebGL OK; otherwise a static CSS gradient/texture stands in. Card cycling itself is GSAP/CSS (works without WebGL). DPR ≤ 2, dispose on exit, pause offscreen, one context-restore attempt.

### D5 — Horizontal-scroll Work index (ScrollTrigger pin), service-filtered
On desktop, the Work section **pins and scrolls horizontally** (ScrollTrigger pin + x-translate tied to vertical scroll) through project cards — a deliberate contrast to variant one's vertical museum grid and a match to the Oblica reference. Each card: a peeled-edge cover image, the project title, and **monospace discipline tags**, plus a big index number. A service filter (from the taxonomy) shows only matching projects. On mobile and under reduced-motion the row **degrades to a vertical stack** (no pin), so it stays usable. Filtering re-runs reveals and refreshes the pin measurement.

### D6 — Peeled/curved image-card treatment (signature, GPU-safe)
Image cards get a distinctive **soft "page-peel" corner** plus large rounded corners. Implemented with `border-radius` + a layered `mask`/`radial-gradient` corner that is **static** (not animated on a composited/parallaxed layer) — never an animated `clip-path` (see Guardrails). The peel reads as a sticker/print edge (Kirk/Swissbrut) without per-frame GPU masking.

### D7 — Motion personality: snappy + kinetic (vs variant one's slow filmic)
Crisper easing (`expo`/`power4` entrances), big-type **mask-up reveals** (SplitText), a **marquee** strip (services/clients), card-stack spring cycling, horizontal pin, and pop-block hover swaps. Smooth scroll + parallax via ScrollSmoother (`smooth: 1.1`, `effects: true`, `normalizeScroll: true`). All under `gsap.matchMedia()` with a complete reduced-motion branch.

### D8 — Data model
`Project { title, client?, serviceFamily (one of 5 ids), disciplines: string[], year, image, gallery?: image[], summary?, url?, accent?, featured: boolean, order }`. `ServiceFamily { id, label, blurb, disciplines: string[], active: boolean, accent, order }`. Consumers read only through the data layer (`getProjects`, `getServices`, `getFeatured`, `projectsByFamily`); placeholder JSON now, Sanity/Decap documented swaps.

## Capability Map

| Capability | Owns |
|---|---|
| `studio-design-system` | tokens, bold grotesk + mono type, pop palette, peeled-card + block language, nav, preloader |
| `service-taxonomy` | 5-family model, active vs in-development, disciplines, deriving filters + Services section |
| `content-data-layer` | Project + ServiceFamily schema, source-agnostic access, featured selection |
| `cardstack-hero` | fanned card carousel + WebGL backdrop + fallback ladder + dispose |
| `work-index` | service filter + horizontal-pin work gallery + discipline tags + mobile/reduced stack |
| `case-lightbox` | Flip card→case morph, focus trap, dismiss, background inert |
| `studio-sections` | Services list, stat numbers, numbered process, About, contact/footer, marquee, clock |
| `motion-system` | ScrollSmoother, GSAP plugins, easing, matchMedia branches, horizontal pin, teardown |
| `image-delivery` | CDN responsive srcset, lazy, blur-up, peel-mask-safe, no CLS |
| `accessibility-performance` | reduced-motion, mobile, keyboard/AT, perf budgets, the guardrails |

## Risks / Trade-offs & Guardrails (carried from variant one — do NOT relearn)

- **No animated `clip-path` on a GPU-composited/parallaxed layer** — it paints garbage/red on real GPUs (invisible in software-rendered headless). Reveals + the peel use transform/opacity and *static* masks only.
- **Never `element.focus()` a viewport-taller section to move focus after a scroll** — browsers ignore `preventScroll` and jump the page, and focus also cancels ScrollSmoother's tween. In-page nav smooth-scrolls to a computed offset (`rect.top + scrollY − navHeight`) and does not move focus.
- **Sticky/pinned bars must be `position: fixed` OUTSIDE the ScrollSmoother transform** (CSS `position: sticky` breaks under the transform; an in-flow ScrollTrigger pin mis-positions when the section has large padding). Use ScrollTrigger pin only for the deliberate horizontal Work scroll, and `position: fixed` for the nav/any sticky filter.
- **`ScrollSmoother.scrollTop()` can return undefined; `scrollTo(target,'top top')` mis-measures** — compute scroll positions from `getBoundingClientRect().top + window.scrollY`.
- **FOUC**: gate motion-only initial-hidden states behind a `.js-motion` class set in a tiny inline `<head>` script only when motion is allowed; `matchMedia` governs the rest.
- **Images must be CORS-clean** (Unsplash `auto=format`) so the WebGL hero can texture them; ship a local offline generator/placeholder fallback.
- **WebGL**: lazy chunk, init in-view only, DPR ≤ 2, texture ≤ 2048px, dispose + `forceContextLoss()` on exit, pause offscreen/hidden, one restore attempt then static fallback.
- **Stale preview port** during verification → kill the listener on the port before re-serving.

## Migration Plan

Greenfield, additive — variant one untouched. Build order = milestones in `proposal.md`: Core (data + work index + lightbox + design system) verified first; hero + sections second; polish + deploy last. Turning on a future service family is a content change (`active: true` + projects), no code.

## Open Questions

- Which family is the hero's featured set drawn from — any `featured` project across active families (default) or Visualisation only? *(Default: any featured; does not block.)*
- Real CMS/CDN vendor — documented swaps; does not block v1.
