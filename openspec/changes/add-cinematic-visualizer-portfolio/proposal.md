# Change: Build the Cinematic 3D-Visualizer Portfolio (GSAP + ScrollSmoother + Three.js, CMS-driven)

## Why

We need a portfolio for a 3D / architectural visualizer that feels like a private, dark, cinematic viewing room — a museum where photoreal renders glow like hung artworks. The work must be the hero; the chrome stays out of its way. Today there is only a visual direction (a deep warm-espresso room, high-contrast serif headlines, museum-style captions, a single restrained gilt hairline). This change turns that direction into a real, responsive, accessible, content-managed site with orchestrated motion, smooth scrolling, a WebGL depth hero, and image parallax — so the renders read as in-depth and three-dimensional.

Two hard constraints shape everything: (1) **new renders are added through a CMS, never by editing code** — so the gallery and hero must be driven by a data layer, not hardcoded arrays; and (2) **motion is a privilege, not a tax** — every effect must degrade to a complete, intentional static experience under `prefers-reduced-motion`, on low-power/mobile devices, and when WebGL is unavailable.

## What Changes

- **Project scaffold** — a Vite + vanilla TypeScript app (animation-friendly, fast) with a clean module split: `styles/` (design tokens as CSS variables), and `js/` split into `smoothScroll`, `hero3d`, `gallery`, `lightbox`, `cms`. A CDN no-build `index.html` variant is included as a zero-install fallback so the deliverable runs even without a successful `npm install`.
- **Design system as tokens** — the exact palette (`--void`, `--char`, `--bone`, `--ash`, `--line`, `--gilt`), Fraunces display + Inter body/labels, museum-label caption voice, hairline dividers, ~1px radius. The gilt accent is restraint-only (hairlines, micro-caps, hover frames) — **never a fill or button background**.
- **Site shell & sections** — preloader (gilt 00→100 counter, SplitText studio-name reveal, curtain wipe), fixed nav (transparent over hero → blur + hairline after 40px, hides on scroll-down / reappears on scroll-up), hero, the Index (category filters), gallery grid, studio statement (word-by-word reveal), and contact/footer (oversized Fraunces line + magnetic email button + colophon).
- **Motion system** — GSAP 3.13+ with ScrollTrigger, ScrollSmoother (`smooth: 1.2`, `effects: true`, `normalizeScroll: true`), SplitText, and Flip (all now free). ScrollSmoother wraps the page and unlocks declarative parallax via `data-speed` / `data-lag`. Reveals use `ScrollTrigger.batch()`; AOS is an **optional** convenience fallback only, dropped if it desyncs under the transform wrapper. All motion is wrapped in `gsap.matchMedia()` with a reduced-motion branch.
- **Hero WebGL depth scene** — a Three.js (r170+) plane textured with the featured render plus a grayscale depth map, displaced in-shader so foreground/background shift at different rates. Parallax driven by cursor (lerped UV/camera offset) and scroll (ScrollTrigger). Faint drifting dust particles + slow ambient camera drift. Lazy-loaded, in-view-only init, full GPU disposal on exit, DPR capped at 2, texture ≤ 2048px. Static featured image fallback when WebGL/low-power/reduced-motion.
- **Gallery** — Index filters (All / Architecture / Interior / Product / Experimental) as tracked-caps links with a gilt active underline; a 2-column asymmetric grid (1-col mobile) of render "pieces". Each piece: clip-path inset reveal + 1.06→1.0 scale via `ScrollTrigger.batch()` stagger; `data-speed`/`data-lag` parallax separating image from caption; slow 1.3s hover zoom + brightness + gilt frame; museum caption (serif title / tracked-caps `Category · Year · Engine` / index number).
- **Lightbox** — click opens a GSAP **Flip** morph from thumbnail to full view (dark backdrop, full render, museum caption); dismiss via Esc / backdrop / close button; focus trapped and returned.
- **CMS data layer** — a `Project` schema (title, category, year, engine, image, optional depthMap, featured, order). A single data source module fetches projects, sorts by `order`, drives filters from `category`, and selects the `featured` project for the hero. Ships with placeholder data behind the same interface so swapping in Sanity or Decap (git-based config included) is trivial — adding a render later = one CMS entry, no code.
- **Image delivery** — all renders served through an image CDN (ImageKit/Cloudinary) with WebP/AVIF, responsive `srcset`/`sizes`, `loading="lazy"`, explicit `width`/`height` (no CLS), and blur-up placeholders. The CDN base URL is a single configurable value. Full-res renders are never loaded directly.
- **Accessibility & performance (non-negotiable)** — reduced-motion disables smoothing/parallax/SplitText and swaps the static hero and skips the preloader; mobile drastically simplifies or disables Three.js and parallax; visible gilt focus rings, lightbox focus trap, meaningful `alt`; target Lighthouse ≥ 90 performance and accessibility; animate transform/opacity only, `will-change` sparingly, all GSAP/ScrollTrigger instances cleaned up.

## Impact

- **Affected specs** (all ADDED — greenfield, no existing capabilities):
  - `site-shell`, `motion-system`, `hero-webgl`, `gallery`, `lightbox`, `cms-data-layer`, `image-delivery`, `accessibility-performance`
- **Affected code** (new, under repo root):
  - `index.html` (Vite entry) + optional `index.cdn.html` (no-build fallback)
  - `styles/` — `tokens.css` (design tokens), `base.css`, section styles
  - `src/` (or `js/`) — `main.ts`, `smoothScroll.ts`, `hero3d.ts`, `gallery.ts`, `lightbox.ts`, `cms.ts`, `images.ts`, `motion.ts` (matchMedia governance), `preloader.ts`, `nav.ts`
  - `src/shaders/` — depth-displacement GLSL for the hero
  - `data/projects.json` — placeholder CMS data
  - `public/admin/` + `static/admin/config.yml` — Decap CMS config (git-based, optional)
  - `package.json`, `vite.config.ts`, `tsconfig.json`, `.env.example`, `README.md`
- **Not affected**: no backend, no auth, no database. The CMS is git/markdown or external SaaS; the build output is static.

## Non-Goals

- No paid GSAP Club plugins beyond what is now free (ScrollTrigger, ScrollSmoother, SplitText, Flip are all free; we use only those).
- No React/Next/Astro in v1 (vanilla TS keeps it fast and animation-friendly). The proposal records how to wire GSAP via `useGSAP()` if a React stack is later adopted, but does not implement it.
- No WebGL gallery-to-lightbox displacement dissolve in v1 (NICE, deferred behind the Flip lightbox).
- No real CMS account provisioning (Sanity project / Decap backend auth) — the data layer is wired to placeholder data with the swap documented; connecting a live backend is a config step, not code.
- No live image-CDN account is required to run; the CDN base URL defaults to a passthrough so placeholder images work, with a real CDN dropped in via one env var.
- No multi-page routing in v1 (single page); the curtain page-transition is recorded as NICE for a future multi-page build.

## Milestones

1. **Core (verify before polish)**: ScrollSmoother + parallax gallery + `ScrollTrigger.batch` reveals + working Flip lightbox, on placeholder data, with reduced-motion and mobile fallbacks proven.
2. **Hero + shell**: Three.js depth hero (with static fallback), preloader, nav show/hide/solidify, studio statement, contact.
3. **Tier-2 NICE**: custom cursor, magnetic button refinements, (deferred) WebGL→lightbox dissolve, page transitions.
