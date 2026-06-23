# motion-system — Delta: ScrollSmoother, GSAP Orchestration, Horizontal-Pin & matchMedia Governance (BUNQ Labs)

## ADDED Requirements

### Requirement: ScrollSmoother Wrapper

The studio SHALL wrap its scrollable content in GSAP ScrollSmoother configured with `smooth: 1.1`, `effects: true`, and `normalizeScroll: true`, using a `#smooth-wrapper` containing `#smooth-content` structure. With `effects: true`, declarative parallax via `data-speed` and `data-lag` SHALL be available to any descendant element and SHALL stay synchronized with all ScrollTrigger-driven animations under a single scroll authority (no native/transformed scroll desync). Any sticky bar (the persistent mono nav, a pinned filter rail) SHALL be `position: fixed` and rendered OUTSIDE the `#smooth-content` transform so it is not displaced by the smoothing translate.

#### Scenario: Smooth scrolling with synced effects

- **WHEN** a full-experience visitor scrolls the page
- **THEN** content scrolls with smoothing (`smooth: 1.1`)
- **AND** elements with `data-speed`/`data-lag` parallax accordingly while ScrollTrigger reveals fire at the correct smoothed positions

#### Scenario: Fixed bars stay put

- **WHEN** the page is smooth-scrolled
- **THEN** the persistent mono nav and any pinned filter bar remain visually fixed because they live outside the `#smooth-content` transform, not inside it

### Requirement: GSAP Plugin Registration

The studio SHALL load and register GSAP 3.13+ with ScrollTrigger, ScrollSmoother, SplitText, and Flip, all of which are free for commercial use, with no dependency on any paid Club GreenSock plugin.

#### Scenario: All required plugins available

- **WHEN** the motion system initializes
- **THEN** ScrollTrigger, ScrollSmoother, SplitText, and Flip are registered and usable
- **AND** the build pulls in no paid Club GreenSock plugin

### Requirement: Snappy Easing & Compositor-Only Motion

All animations SHALL be restricted to `transform` and `opacity` so they stay on the compositor and hold ~60fps, and SHALL NOT animate layout-affecting properties such as `width`, `height`, `top`, `left`, or `margin`. No animated `clip-path` SHALL run on any GPU-composited or parallaxed (`data-speed`/`data-lag`) layer; the peeled/curved-edge image cards SHALL use a STATIC mask only. Easing SHALL follow the studio's snappy, punchy language — GSAP `expo` / `power4` (or an equivalent steep `cubic-bezier`) — rather than slow, gentle curves.

#### Scenario: Animations stay on the compositor

- **WHEN** any reveal, parallax, hover, hero-stack, or lightbox transition runs
- **THEN** it animates only `transform`/`opacity`, uses `expo`/`power4`-style easing, and never animates layout properties

#### Scenario: No clip-path on composited layers

- **WHEN** a peeled-edge image card or any parallaxed element is animated
- **THEN** its curved/peeled edge is produced by a static mask
- **AND** no animated `clip-path` is applied to that composited layer

### Requirement: matchMedia Motion Governance

All motion SHALL be registered inside `gsap.matchMedia()` with three branches: a full desktop experience (no reduced-motion, `min-width: 768px`), a reduced mobile branch (no reduced-motion, `max-width: 767px`), and a reduced-motion branch (`prefers-reduced-motion: reduce`). The reduced-motion branch SHALL NOT create ScrollSmoother, SHALL NOT run parallax, SplitText, or any pin, SHALL show the hero's front card statically, SHALL skip the preloader, and SHALL leave ALL content visible in its final state. The mobile branch SHALL disable the WebGL hero backdrop and the horizontal-scroll pin, degrading the Work index to a vertical stack. Switching media conditions SHALL automatically revert the previous branch's animations.

#### Scenario: Reduced-motion is a complete static experience

- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** no ScrollSmoother is created, and no parallax, SplitText, or pin runs
- **AND** the preloader is skipped, the hero shows a static front card, and every section is rendered in its final visible state

#### Scenario: Mobile simplification

- **WHEN** the viewport matches `max-width: 767px` without reduced-motion
- **THEN** the horizontal-scroll pin is not created and the Work index renders as a vertical stack
- **AND** the WebGL hero backdrop is disabled

#### Scenario: Branch revert on media change

- **WHEN** the matching media condition changes (viewport crosses 768px or the OS reduced-motion setting toggles)
- **THEN** the previous branch's animations are reverted and the newly matching branch's setup runs

### Requirement: Horizontal-Pin Work Index

On the desktop branch only, the Work index SHALL be driven by a ScrollTrigger that pins its section and translates the project track horizontally as the user scrolls vertically, mapping vertical scroll distance to horizontal travel of the card row. The horizontal animation SHALL animate `transform` (translateX) only. On the mobile and reduced-motion branches this pin SHALL NOT be created, and the index SHALL be a normally-scrolling vertical stack.

#### Scenario: Desktop horizontal pin

- **WHEN** a full-experience desktop visitor scrolls through the Work index section
- **THEN** the section pins and the card track moves horizontally via translateX in sync with vertical scroll, releasing the pin when the track end is reached

#### Scenario: No pin off desktop

- **WHEN** the active branch is mobile or reduced-motion
- **THEN** no pin ScrollTrigger is created and the Work index scrolls as a vertical stack

### Requirement: Motion Teardown

The motion system SHALL expose a teardown that kills all ScrollTrigger instances (including the Work-index pin) and reverts all `gsap.context()` / `gsap.matchMedia()` scopes, so no listeners or animations leak across hot-module reloads, branch switches, or a future route change.

#### Scenario: Clean teardown

- **WHEN** teardown is invoked (HMR, matchMedia branch switch, or route change)
- **THEN** all ScrollTriggers are killed and all contexts/matchMedia scopes are reverted
- **AND** no scroll or resize listeners from the motion system remain registered
