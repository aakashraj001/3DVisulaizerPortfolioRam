# motion-system — Delta: Smooth Scroll, GSAP Orchestration, matchMedia Governance

## ADDED Requirements

### Requirement: ScrollSmoother Wrapper

The site SHALL wrap its scrollable content in GSAP ScrollSmoother configured with `smooth: 1.2`, `effects: true`, and `normalizeScroll: true`, using a `#smooth-wrapper` containing `#smooth-content` structure. With `effects: true`, declarative parallax via `data-speed` and `data-lag` SHALL be available to any descendant element and SHALL stay synchronized with all ScrollTrigger-driven animations (single scroll authority — no native/transformed scroll desync).

#### Scenario: Smooth scrolling with synced effects

- **WHEN** a full-experience visitor scrolls the page
- **THEN** content scrolls with smoothing (`smooth: 1.2`), elements with `data-speed`/`data-lag` parallax accordingly, and ScrollTrigger reveals fire at the correct (smoothed) positions

### Requirement: GSAP Plugin Registration

The site SHALL load and register GSAP 3.13+ with ScrollTrigger, ScrollSmoother, SplitText, and Flip (all free for commercial use), with no dependency on paid Club GreenSock plugins.

#### Scenario: All required plugins available

- **WHEN** the motion system initializes
- **THEN** ScrollTrigger, ScrollSmoother, SplitText, and Flip are registered and usable, with no dependency on paid Club GreenSock plugins

### Requirement: Compositor-Only Motion & Easing Language

All animations SHALL be restricted to `transform` and `opacity` (plus `filter` and `clip-path` where a requirement specifies them) so they stay on the compositor and hold ~60fps, and SHALL NOT animate layout-affecting properties. Easing SHALL follow the site's refined, slow language: the CSS curve `cubic-bezier(.2, .7, .25, 1)` (exposed as `--ease`) or GSAP `power3`.

#### Scenario: Animations stay on the compositor

- **WHEN** any reveal, parallax, hover, or transition animation runs
- **THEN** it animates only `transform`/`opacity` (plus `filter`/`clip-path` where specified), uses `cubic-bezier(.2,.7,.25,1)` / `power3` easing, and never animates layout properties such as `width`, `height`, `top`, or `margin`

### Requirement: Batched Scroll Reveals

Simple section and element reveals SHALL be implemented with `ScrollTrigger.batch()` so elements entering the viewport together animate as a staggered group, rather than registering one ScrollTrigger per element. AOS MAY be included only as an optional convenience fallback initialized after ScrollSmoother with `AOS.init({ once: true })` and a `ScrollSmoother` `onUpdate → AOS.refresh()` hook; if AOS desyncs under the transformed wrapper it SHALL be removed and all reveals done in GSAP.

#### Scenario: Grouped staggered reveal

- **WHEN** multiple reveal-eligible elements enter the viewport in the same frame
- **THEN** they animate as one batched, staggered group (not N independent triggers)

#### Scenario: AOS fallback is non-authoritative

- **WHEN** AOS is enabled and a desync with the smooth-scroll wrapper is observed
- **THEN** AOS is dropped and the affected reveals are handled by GSAP ScrollTrigger instead

### Requirement: matchMedia Motion Governance

All motion SHALL be registered inside `gsap.matchMedia()` with three branches: full desktop experience (no reduced-motion, `min-width: 768px`), a reduced mobile branch (no reduced-motion, `max-width: 767px`), and a reduced-motion branch (`prefers-reduced-motion: reduce`). The reduced-motion branch SHALL NOT create ScrollSmoother, SHALL NOT run parallax, SplitText, or batch staggers, and SHALL leave content visible. Switching media conditions SHALL automatically revert the previous branch's animations.

#### Scenario: Reduced-motion branch disables motion

- **WHEN** `prefers-reduced-motion: reduce` is active
- **THEN** no ScrollSmoother is created, no parallax/SplitText/stagger runs, and all content is rendered in its final visible state

#### Scenario: Branch revert on media change

- **WHEN** the matching media condition changes (e.g. viewport crosses 768px or the OS reduced-motion setting toggles)
- **THEN** the previous branch's animations are reverted and the newly matching branch's setup runs

### Requirement: Motion Teardown

The motion system SHALL expose a teardown that kills all ScrollTrigger instances and reverts all `gsap.context()` scopes, so no listeners or animations leak across hot-module reloads or a future route change.

#### Scenario: Clean teardown

- **WHEN** teardown is invoked (HMR or route change)
- **THEN** all ScrollTriggers are killed, contexts reverted, and no scroll/resize listeners from the motion system remain registered
