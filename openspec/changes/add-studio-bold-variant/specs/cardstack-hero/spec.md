# cardstack-hero — Delta: Fanned Card-Stack Hero Carousel & Generative WebGL Backdrop

## ADDED Requirements

### Requirement: Fanned Card-Stack Carousel of Featured Work

The hero SHALL present featured projects (from the data layer's `getFeatured`) as a fanned stack of peeled/curved-edge image cards — the front card upright and fully legible, trailing cards offset, slightly rotated, and scaled down behind it using transform/opacity only (no animated clip-path on these GPU-composited layers; masks are static). The visitor SHALL be able to cycle the stack forward and backward via on-screen prev/next controls, via keyboard (ArrowLeft/ArrowRight when the carousel region holds focus), and via horizontal drag/swipe (pointer + touch). On each cycle the previously-front card SHALL recede and the next card SHALL animate to the front using snappy expo/power4 easing within the motion system's branches; the front card SHALL be the focused/active card and SHALL expose its title and mono discipline tags. Each card SHALL link to its project (driving the case-lightbox open) without this capability owning the lightbox itself.

#### Scenario: Cycle forward and backward via controls and keyboard

- **WHEN** a visitor activates the next control, presses ArrowRight while the carousel is focused, or activates prev / presses ArrowLeft
- **THEN** the stack advances or rewinds by one, the new front card animates upright and becomes the active/focused card with its title and discipline tags exposed, and trailing cards re-fan behind it using transform/opacity only

#### Scenario: Drag and swipe to cycle

- **WHEN** a visitor drags with a pointer or swipes on touch horizontally past the threshold
- **THEN** the stack cycles in the drag direction and settles on the next front card; **AND WHEN** the drag is released below threshold the stack snaps back to the current front card

#### Scenario: Degenerate featured set (one or zero featured projects)

- **WHEN** `getFeatured` returns exactly one project
- **THEN** the hero shows that single card with no fan and the prev/next controls are hidden or disabled (no-op), with the hero remaining complete
- **AND WHEN** `getFeatured` returns zero projects, the hero falls back to a non-card statement layout (eyebrow, headline, cue) over the backdrop with no empty card frame

#### Scenario: Activating the front card opens its case

- **WHEN** a visitor activates (click/Enter) the focused front card
- **THEN** the carousel signals the case-lightbox to open for that project, passing the project's identity, without the carousel managing the lightbox lifecycle

### Requirement: Hero Statement Headline, Mono Eyebrow & View-Work Cue

The hero SHALL render, over the dark textured backdrop, a Space-Grotesk-700 oversized statement headline, a Space-Mono uppercase tracked eyebrow label above it, and a Space-Mono "view work" scroll/cue affordance, all as DOM text that remains legible over the backdrop via a scrim or contrast treatment. This text SHALL be present and readable regardless of whether the WebGL backdrop is active, the static fallback is shown, or reduced motion is in effect — it SHALL never depend on the canvas to exist or render.

#### Scenario: Hero text is present and legible

- **WHEN** the hero renders in any state (WebGL active, static fallback, or reduced motion)
- **THEN** the mono eyebrow, Space-Grotesk statement headline, and mono view-work cue are present, legible over the backdrop, and carry their intended typographic treatment

#### Scenario: Kinetic eyebrow under motion, static under reduced motion

- **WHEN** the hero renders under full motion
- **THEN** the mono eyebrow is kinetic — it animates with transform/opacity only (e.g. a masked reveal or looping marquee/letter motion)
- **AND WHEN** `prefers-reduced-motion` is set the eyebrow renders static with no motion

#### Scenario: View-work cue advances to the work index

- **WHEN** a visitor activates the view-work cue
- **THEN** the page scrolls to the WORK index section by computing the target from `rect.top + scrollY` (not by calling `focus()` on a viewport-taller section), so ScrollSmoother is not cancelled and the page does not jump

### Requirement: WebGL Generative Backdrop & Fallback Ladder

The hero backdrop SHALL render a lazy-loaded Three.js generative field — a full-bleed plane driven by a flowing noise/gradient shader — behind the card stack, and the canvas SHALL be `aria-hidden` (decorative). It SHALL initialize ONLY when ALL of the following hold: the hero is in view (IntersectionObserver), `prefers-reduced-motion` is not set, the device is not detected as low-power/mobile, AND a WebGL context is successfully created. In every excluded or failed case the backdrop SHALL show a static fallback (a flat dark textured fill / gradient image) with no error UI and no layout shift, while the card stack and hero text remain fully functional over it.

#### Scenario: Full capability ladder satisfied

- **WHEN** the hero is in view, reduced motion is not requested, the device is not low-power, and WebGL initializes successfully
- **THEN** the Three.js chunk is loaded on demand and the flowing noise/gradient shader field renders behind the card stack on an `aria-hidden` canvas

#### Scenario: Any ladder condition fails

- **WHEN** WebGL is unavailable, the device is low-power/mobile, reduced motion is set, or the hero is offscreen
- **THEN** Three.js is never initialized for that condition and the static dark textured fallback is shown instead, with the card stack and hero text still fully functional and no error UI or layout shift

### Requirement: Backdrop Resource Discipline

The WebGL backdrop SHALL ship as a separate Three.js chunk (not included in first paint) and SHALL initialize only while in view. It SHALL cap pixel ratio at `min(devicePixelRatio, 2)` and any texture at ≤ 2048px on its longest edge, SHALL pause its render loop when the hero is offscreen or the tab is hidden, and SHALL dispose all geometries, materials, textures, and the renderer (including `forceContextLoss()`) when the hero leaves view or on teardown. On a runtime WebGL context loss it SHALL make at most one restore attempt before falling back to the static backdrop.

#### Scenario: Lazy init, pause, and dispose

- **WHEN** the hero scrolls offscreen or the tab is hidden
- **THEN** the render loop pauses; **AND WHEN** the hero leaves view or the page tears down, all geometries, materials, textures, and the renderer are disposed via `forceContextLoss()`, and the Three.js chunk was loaded only on demand rather than at first paint

#### Scenario: Caps enforced and single restore on context loss

- **WHEN** the renderer initializes on a high-DPR display
- **THEN** pixel ratio is clamped to at most 2 and any texture is at most 2048px on its longest edge; **AND WHEN** the WebGL context is lost at runtime, the backdrop attempts a single restore and, failing that, falls back to the static textured backdrop without error UI

### Requirement: Carousel Works Without WebGL and Reduced-Motion Static Front Card

The card-stack carousel SHALL be fully operable independently of the WebGL backdrop — prev/next, keyboard, and drag/swipe cycling SHALL work when the static fallback backdrop is shown. Under `prefers-reduced-motion`, the hero SHALL present a single static front card (no fanned animation, no auto-advance, no smoothing/parallax) as a complete, intentional experience; cycling controls, if exposed, SHALL change the front card via an instant crossfade or static swap rather than animated motion.

#### Scenario: Cycling without WebGL

- **WHEN** the WebGL backdrop is not active (fallback shown) but motion is allowed
- **THEN** prev/next, keyboard, and drag/swipe still cycle the card stack normally over the static backdrop

#### Scenario: Reduced motion shows a static front card

- **WHEN** `prefers-reduced-motion` is set
- **THEN** the hero shows a single static front card with no fanned animation, auto-advance, smoothing, or parallax; **AND** any front-card change occurs as an instant static swap or crossfade rather than an animated cycle
