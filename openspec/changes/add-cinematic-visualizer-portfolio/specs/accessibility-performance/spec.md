# accessibility-performance — Delta: Reduced-Motion, Mobile, Keyboard, Perf Budgets

## ADDED Requirements

### Requirement: Reduced-Motion Is a First-Class Experience

When `prefers-reduced-motion: reduce` is set, the site SHALL disable ScrollSmoother smoothing, kill all parallax and SplitText staggers (content rendered in final visible state), replace the WebGL hero with the static featured image, and skip the preloader. The result SHALL be a complete, intentional, fully usable site — not a degraded one. This behavior SHALL be enforced via `gsap.matchMedia()` rather than ad-hoc checks.

#### Scenario: Reduced-motion produces a complete static site

- **WHEN** a visitor has `prefers-reduced-motion: reduce`
- **THEN** there is no smoothing, no parallax, no SplitText stagger, no preloader, and the hero is the static featured image, while every section, the gallery, the filters, and the lightbox remain fully functional

### Requirement: Mobile Simplification

On mobile / small viewports the site SHALL disable or drastically simplify the Three.js hero (to protect battery), reduce parallax intensity, collapse the gallery to a single column, and use a smaller (or disabled) smooth-scroll value. These adaptations SHALL be driven by the `gsap.matchMedia()` mobile branch and viewport media queries.

#### Scenario: Mobile is light and battery-safe

- **WHEN** the site loads on a small/mobile viewport
- **THEN** Three.js is disabled (static hero shown), parallax is reduced, the gallery is single-column, and smooth-scroll is reduced or off

### Requirement: Keyboard & Assistive-Technology Access

The site SHALL be fully operable by keyboard with visible gilt focus rings on all interactive elements; the lightbox SHALL trap focus, close on Escape, and return focus to its trigger; all render images SHALL have meaningful `alt`; and purely decorative WebGL/canvas elements SHALL be `aria-hidden` with `pointer-events: none`. The site SHALL target a Lighthouse accessibility score of at least 90.

#### Scenario: Keyboard-only journey

- **WHEN** a keyboard-only visitor tabs through the site
- **THEN** focus is always visible (gilt ring), the nav and filters are reachable and operable, and the lightbox can be opened, navigated (focus trapped), and closed (Escape, focus returned)

#### Scenario: Decorative canvas is ignored by AT

- **WHEN** assistive technology traverses the page
- **THEN** the hero WebGL canvas is `aria-hidden` and not announced, while all renders expose meaningful `alt`

### Requirement: Performance Budget & Cleanup

The site SHALL animate only `transform`/`opacity` (plus `filter`/`clip-path` where specified) to hold ~60fps, SHALL use `will-change` sparingly and remove it after transitions, SHALL lazy-initialize Three.js and dispose it on exit with `min(devicePixelRatio, 2)`, SHALL serve responsive lazy images with reserved dimensions to avoid CLS, and SHALL clean up all GSAP/ScrollTrigger instances on teardown. The site SHALL target a Lighthouse performance score of at least 90.

#### Scenario: No leaked instances or layout-affecting animation

- **WHEN** the page is exercised (scrolled, hero entered/left, lightbox opened/closed, teardown invoked)
- **THEN** animations stay on transform/opacity (no layout thrash), `will-change` is not left applied, Three.js resources are disposed when the hero leaves, and no GSAP/ScrollTrigger instances remain after teardown

#### Scenario: Lighthouse targets

- **WHEN** Lighthouse is run on the built site
- **THEN** performance and accessibility scores each target ≥ 90
