# Change: BUNQ Labs — a bold, pop, "Digital Design & Visualisation Studio" variant

## Why

We have one portfolio variant: a dark, quiet, cinematic "private viewing room." We want a **second, completely different** variant for a **Digital Design & Visualisation Studio** ("BUNQ Labs") — fresh, memorable, and minimal, but with **pop colour and a touch of funkiness** for character without overwhelming the simplicity. The visual language is drawn from the supplied references: BUNQ's dark **fanned card-stack hero** with a textured 3D backdrop; Swissbrut's **giant grotesk type, numbered sections and oversized stat numbers**; Kirk Sinner's **pop-colour blocks and peeled/curved-edge image cards**; Oblica's **horizontal-scroll work index with monospace category tags**; Aerra's **dense image-grid** energy.

Unlike the first variant (a single-discipline render gallery), this studio sells **service families**. It will, for now, present only **Visualisation** and **Visual Identity**, but the information architecture and data model must already accommodate the three planned families — **Computational Design, Immersive Experiences, Digital Fabrication** — so they can be switched on later with content alone, no rebuild.

## What Changes

- **New self-contained app** at `studio/` (its own Vite + vanilla-TS project, `base: './'`), reusing the proven engineering spine and guardrails from the first variant (ScrollSmoother, GSAP plugins, Three.js lazy hero, source-agnostic data layer, responsive images, `gsap.matchMedia()` governance) so it is fast, accessible, and deploys cleanly.
- **A brand-new visual identity** — light/paper editorial body with a **dark, textured card-stack hero**: huge bold **grotesk** display type, **monospace micro-labels**, **pop-colour blocks** used boldly (the opposite of the first variant's gilt restraint), **peeled/curved-edge image cards**, near-zero radius on type blocks, generous Swiss whitespace.
- **A service-family taxonomy** (5 families; 2 active, 3 "in development") that drives the work filters, the Services section, and the Index. Each project belongs to one family and carries one or more **discipline tags** (e.g. "Architectural rendering", "Packaging").
- **A fanned card-stack hero carousel** of featured work over a lazy **WebGL generative backdrop** (flowing noise/gradient field), with prev/next + a kinetic eyebrow, and a complete static fallback.
- **A horizontal-scroll Work index** (ScrollTrigger-pinned) of project cards with monospace discipline tags and a service filter; collapses to a vertical stack on mobile / reduced-motion.
- **Studio sections**: a bold **Services** list (5 families, future ones marked), oversized **stat numbers**, a numbered **process** (Start / Build / Ship), an editorial **About** statement, and a **contact/footer** with a pop CTA block, mono contact columns, and a live local clock.
- **A Flip "case" lightbox** that morphs a work card into a case-study panel (cover, summary, disciplines, client/year, link).
- **Same non-negotiables**: full `prefers-reduced-motion` experience, mobile simplification, keyboard/AT access, responsive lazy images (no CLS), Lighthouse ≥ 90 targets, lazy+disposed Three.js, and the hard guardrails the first build taught us (see design.md).

## Impact

- **Affected specs** (all ADDED — new app, new capabilities):
  `studio-design-system`, `service-taxonomy`, `content-data-layer`, `cardstack-hero`, `work-index`, `case-lightbox`, `studio-sections`, `motion-system`, `accessibility-performance`, `image-delivery`.
- **Affected code** (new, under `studio/`):
  `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json`, `.env.example`, `README.md`; `styles/` (`tokens.css`, `base.css`, `app.css`); `src/` (`main.ts`, `motion.ts`, `smoothScroll.ts`, `cms.ts`, `services.ts`, `images.ts`, `heroStack.ts`, `heroBg3d.ts`, `work.ts`, `lightbox.ts`, `sections.ts`, `nav.ts`, `preloader.ts`, `clock.ts`); `src/shaders/`; `data/projects.json` + `data/services.json`; `public/` placeholders; a GitHub Actions deploy workflow.
- **Not affected**: the first variant (root app) is untouched. No backend; static build.

## Non-Goals

- No live AR/VR/fabrication tooling — the three future families are **modelled and surfaced as "in development"** only.
- No CMS account provisioning — ships placeholder JSON behind the same interface; Sanity/Decap are documented swaps.
- No audio engine for the "Sound on" affordance in v1 — the toggle is present and accessible but a documented stub (NICE: wire a short ambient loop later).
- No multi-page routing — single page; case views are the Flip lightbox.
- Does not modify or share build output with the first variant.

## Milestones

1. **Core**: data layer + service taxonomy + work index (with filters) + Flip lightbox + bold design system, on placeholder data, with reduced-motion + mobile fallbacks.
2. **Signature**: card-stack hero + WebGL backdrop (with static fallback), Services list, stats, process, contact, marquee.
3. **Polish & deploy**: peeled-card refinement, kinetic micro-interactions, clock, README, GitHub Pages workflow.
