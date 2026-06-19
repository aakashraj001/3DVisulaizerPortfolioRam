# Studio Bhū — Cinematic 3D-Visualizer Portfolio

A dark, cinematic, CMS-driven portfolio for a 3D / architectural visualizer — a private viewing room where photoreal renders glow like hung artworks. Built with **GSAP ScrollSmoother** (smooth scroll + declarative parallax), a **Three.js depth hero**, a **GSAP Flip** lightbox, and a source-agnostic content layer so new renders are added through a CMS, never by editing code.

Every effect degrades to a complete, intentional static experience under `prefers-reduced-motion`, on low-power/mobile devices, and when WebGL is unavailable.

---

## Quick start

```bash
npm install
npm run dev        # Vite dev server (HMR)
npm run build      # type-check + production build → dist/
npm run preview    # serve the built dist/ on :5050
```

No build tools? Open **`index.cdn.html`** — a zero-install version that loads GSAP + Three from a CDN (the exact snippet from the brief) and runs the core experience (smooth scroll + parallax gallery + reveals + Flip lightbox + fallbacks). Serve the folder over any static server so `data/projects.json` can be fetched, e.g. `npx serve .` then open `/index.cdn.html`.

> Renders in the placeholder data come from `picsum.photos`; they need network access to load. With no network the gallery still lays out (image areas render as the dark `--char` panel with their museum captions).

---

## Project structure

```
index.html              Vite entry (#smooth-wrapper > #smooth-content + all sections)
index.cdn.html          No-build fallback (CDN GSAP + Three, core experience)
styles/
  tokens.css            Design tokens — the single source of palette/type/motion
  base.css              Reset + museum-label / hairline / focus-ring utilities
  shell.css             Preloader, nav, hero, statement, contact, cursor
  gallery.css           Shared media (blur-up), Index filters, grid, pieces, lightbox
src/
  main.ts               Orchestrator: build DOM → gsap.matchMedia() branches → preloader gate
  motion.ts             GSAP plugin registration, easing, reduced-motion/pointer predicates, matchMedia
  smoothScroll.ts       ScrollSmoother (smooth:1.2, effects:true, normalizeScroll:true)
  hero.ts               Hero text + SplitText intro reveal + scroll drift (WebGL-independent)
  hero3d.ts             Three.js depth scene (lazy chunk; gated, disposed, context-loss safe)
  gallery.ts            Grid render, filters (Flip), clip-path batch reveal, parallax control
  lightbox.ts           Flip morph thumbnail→full, focus trap, Esc/backdrop/close, reduced-motion crossfade
  sections.ts           Studio-statement word reveal, magnetic contact button, generic reveals
  cursor.ts             NICE: custom "View" cursor (fine-pointer + motion only)
  preloader.ts          Counter 00→100 + SplitText + curtain wipe
  cms.ts                Project schema + source-agnostic data layer (placeholder / Sanity / Decap)
  images.ts             CDN URL builder (WebP/AVIF + srcset) + responsive blur-up <img>
data/projects.json      Placeholder content behind the CMS interface
public/admin/           Decap CMS admin + config.yml (git-based, optional)
openspec/               The spec-driven proposal (changes/add-cinematic-visualizer-portfolio)
```

---

## Configuration

Copy `.env.example` → `.env` (all values are optional; the site runs with none).

### Image CDN — `VITE_IMAGE_CDN_BASE`

All renders are served through an image CDN with automatic WebP/AVIF, responsive `srcset`, and `loading="lazy"`. The base URL is the single place to configure it:

```bash
# ImageKit
VITE_IMAGE_CDN_BASE=https://ik.imagekit.io/your_id
# Cloudinary (fetch)
VITE_IMAGE_CDN_BASE=https://res.cloudinary.com/your_cloud/image/fetch
```

Unset = **passthrough** (the source URL is used as-is, with `{w}/{h}` size tokens filled). The transform string lives in one function — `cdn`-style params in `src/images.ts` (`imageUrl()`); switch vendors by editing that one function.

### CMS — `VITE_CMS_SOURCE`

The gallery and hero read **only** through `src/cms.ts` (`getProjects()`, `getFeatured()`), so the source is swappable without touching any consumer.

| Value | Source | Notes |
|---|---|---|
| `placeholder` (default) | `data/projects.json` | Runs with no CMS. |
| `sanity` | Sanity dataset | Set `VITE_SANITY_PROJECT_ID` (+ `VITE_SANITY_DATASET`). Query stub in `cms.ts`. |
| `decap` | Decap (git-based) | Edit content at `/admin/` (see `public/admin/config.yml`). |

**Adding a render later = create one `Project` entry in the CMS → it appears automatically** (sorted by `order`, its category joins the filters, and it becomes the hero if `featured`).

#### Project schema

```ts
Project {
  title: string
  category: 'architecture' | 'interior' | 'product' | 'experimental'
  year: number
  engine: string          // "Corona" | "V-Ray" | "Unreal" | …
  image: ImageAsset        // main render (responsive via CDN)
  depthMap?: ImageAsset    // optional grayscale map for the WebGL hero
  featured: boolean        // marks the hero piece
  order: number            // sort order
}
```

---

## Accessibility & performance

- **`prefers-reduced-motion`**: no ScrollSmoother, no parallax/SplitText/stagger, static hero image, preloader skipped — a complete static site (governed by `gsap.matchMedia()`; motion-only initial states gated behind a `.js-motion` class so reduced-motion users never see hidden content).
- **Mobile**: Three.js disabled, parallax reduced, single-column grid, smaller smooth value.
- **Keyboard / AT**: visible gilt focus rings, lightbox focus trap + Esc + focus return, meaningful `alt` on all renders, decorative canvas `aria-hidden`, skip link.
- **Images**: responsive `srcset` + WebP/AVIF, `loading="lazy"`, explicit `width`/`height` + aspect-ratio boxes (no CLS), blur-up LQIP.
- **Three.js**: lazy chunk (never blocks first paint), inits only while the hero is in view, DPR ≤ 2, textures ≤ 2048px, paused offscreen/hidden, full GPU disposal on exit, one context-restore attempt then fall back.
- Animations are `transform`/`opacity`/`filter`/`clip-path` only; all GSAP/ScrollTrigger instances are torn down on HMR/teardown.

---

## Verification status

- ✅ `npm run build` — type-check + bundle clean; `three` + `hero3d` are isolated lazy chunks (never in the initial graph).
- ✅ Runtime — gallery (8 pieces), filters, hero label, and lightbox all render from the data layer; no app console errors.
- ✅ Reduced-motion path renders the full static site (verified via emulation).
- ⚠️ The live WebGL hero render must be eyeballed in a **real-GPU browser** — headless Chromium refuses to software-render WebGL, so only the gates, lazy-load, disposal, and static fallback are verifiable headlessly.

The full requirements live in `openspec/changes/add-cinematic-visualizer-portfolio/` (proposal, design, tasks, and 8 capability specs). Validate with `openspec validate add-cinematic-visualizer-portfolio --strict`.
