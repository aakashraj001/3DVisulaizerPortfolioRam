## ADDED Requirements

### Requirement: Reduced-Motion is a Complete Static Experience

When the user's `prefers-reduced-motion: reduce` preference is active, the studio site SHALL present a complete, fully usable static experience with all decorative motion disabled, governed by a dedicated `gsap.matchMedia()` branch so the behaviour is declarative and torn down cleanly when the preference changes.

In this branch ScrollSmoother smoothing and `effects:true` parallax MUST NOT initialise, SplitText word/line reveals MUST NOT run (text renders in final position), ScrollTrigger pinning (including the horizontal WORK index pin) MUST NOT be created, the preloader MUST be skipped (content visible immediately with no 00->100 counter or curtain), the card-stack hero MUST render a static front card (no auto-advance, no flowing-shader entrance), and the marquee strip MUST be paused. The case lightbox transition MUST degrade to a crossfade rather than a Flip morph. No layout, navigation, content, or interactive control may be removed solely because motion is disabled.

#### Scenario: Reduced-motion branch disables all decorative motion
- **WHEN** the document is loaded with `prefers-reduced-motion: reduce` active
- **THEN** ScrollSmoother is not initialised and no parallax/`effects` transforms are applied
- **AND** SplitText reveals, ScrollTrigger pins, and the horizontal WORK pin do not run
- **AND** the preloader is skipped and the page content is visible and scrollable from first paint

#### Scenario: Static hero and paused marquee under reduced motion
- **WHEN** the hero and marquee render under reduced motion
- **THEN** the card-stack hero shows a single static front card with no auto-advance or shader entrance
- **AND** the marquee strip is paused (no continuous translate animation)
- **AND** all hero/marquee content, links, and controls remain present and operable

#### Scenario: Lightbox degrades to crossfade
- **WHEN** a work card is activated while reduced motion is active
- **THEN** the case lightbox opens via an opacity crossfade instead of a GSAP Flip morph
- **AND** the lightbox is still focus-trapped, dismissible by Esc/backdrop/close, and returns focus on close

### Requirement: Mobile Simplification

On mobile (the `mobile reduced` `gsap.matchMedia()` branch), the studio site SHALL reduce its motion and resource footprint while preserving all content and functionality. The lazy Three.js generative backdrop MUST NOT initialise, the horizontal-scroll WORK index pin MUST be disabled in favour of a vertical project-card stack, and animations MUST be reduced (no parallax-heavy or pin-driven sequences). All projects, services, stats, and contact information MUST remain reachable by scrolling.

#### Scenario: Three.js and horizontal pin disabled on mobile
- **WHEN** the site is loaded within the mobile matchMedia branch
- **THEN** the Three.js backdrop is not initialised (no WebGL context is created)
- **AND** the WORK index renders as a vertically scrolling stack of project cards with no ScrollTrigger pin

#### Scenario: Mobile content parity
- **WHEN** a mobile visitor scrolls the page
- **THEN** every project card, all five service families, the stat numbers, the numbered process, and the contact/footer are reachable and legible
- **AND** the case lightbox still opens, traps focus, and dismisses correctly

### Requirement: Keyboard and Assistive-Technology Access

The studio site SHALL be fully operable by keyboard and usable with assistive technology. Every interactive element MUST expose a visible keyboard focus ring; the in-page navigation (WORK/ABOUT/CONTACT) MUST be reachable and operable by keyboard. The "Sound on" toggle MUST be a real accessible control (a focusable button with an accurate accessible name and `aria-pressed` reflecting state), not a non-semantic visual stub. Content images MUST carry meaningful `alt` text and the decorative Three.js canvas MUST be marked `aria-hidden="true"` and removed from the tab order. The case lightbox MUST trap focus while open, close on Esc, and return focus to the originating trigger on close.

#### Scenario: Visible focus and keyboard-reachable navigation
- **WHEN** a keyboard user tabs through the page
- **THEN** each focused interactive element shows a clearly visible focus ring
- **AND** the nav links and the Sound-on toggle receive focus in a logical order and activate via Enter/Space

#### Scenario: Sound-on toggle is an accessible control
- **WHEN** assistive technology inspects the Sound-on toggle
- **THEN** it is announced as a button with an accurate name and an `aria-pressed` state that updates when toggled
- **AND** it is operable by keyboard even though audio playback is a stub

#### Scenario: Lightbox focus trap and return
- **WHEN** the case lightbox is opened from a work card
- **THEN** keyboard focus is trapped within the lightbox and the background is inert
- **AND** pressing Esc (or activating close/backdrop) dismisses it and returns focus to the originating work card

#### Scenario: Meaningful alt and hidden decorative canvas
- **WHEN** a screen reader traverses the page
- **THEN** every content image announces meaningful `alt` text
- **AND** the decorative generative canvas is `aria-hidden="true"` and is skipped in the tab order

### Requirement: Performance Budget and Resource Cleanup

The studio site SHALL meet its performance budget and clean up all resources on teardown. Decorative animations MUST animate `transform`/`opacity` only (no layout-thrashing or animated `clip-path` on GPU-composited/parallaxed layers). The Three.js backdrop MUST load lazily and initialise only when in view, cap device pixel ratio at `<=2` and textures at `<=2048px`, pause when offscreen, and on exit dispose its GPU resources and call `forceContextLoss()`. Images MUST be responsive (`srcset`), lazy-loaded, declare explicit dimensions to prevent CLS, and use a blur-up placeholder. On teardown (route change/branch switch via matchMedia), all GSAP/ScrollTrigger/ScrollSmoother instances MUST be reverted/killed. The site MUST achieve Lighthouse Performance and Accessibility scores `>=90`.

#### Scenario: Transform/opacity-only animation
- **WHEN** any scroll, hero, or reveal animation runs
- **THEN** only `transform` and `opacity` are animated
- **AND** no animated `clip-path` is applied to GPU-composited or parallaxed layers

#### Scenario: Lazy, bounded, and disposed Three.js
- **WHEN** the generative backdrop is initialised in view
- **THEN** device pixel ratio is clamped to `<=2` and any texture is `<=2048px`
- **AND** when it scrolls offscreen it pauses, and on teardown it disposes resources and calls `forceContextLoss()`

#### Scenario: Images cause no layout shift
- **WHEN** project and gallery images load
- **THEN** each declares explicit width/height (or reserved aspect ratio), `loading="lazy"`, and a responsive `srcset`
- **AND** a blur-up placeholder is shown so cumulative layout shift from images is effectively zero

#### Scenario: GSAP teardown and Lighthouse budget
- **WHEN** a matchMedia branch deactivates or the view is torn down
- **THEN** the associated GSAP, ScrollTrigger, and ScrollSmoother instances are reverted/killed with no leaked tweens or pin spacers
- **AND** the page scores `>=90` on both Lighthouse Performance and Accessibility
