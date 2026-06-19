# site-shell — Delta: Design System, Preloader, Nav, Statement, Contact

## ADDED Requirements

### Requirement: Design Token System

The site SHALL define its visual identity as CSS custom properties (design tokens) in a single source, and all components SHALL consume those tokens rather than literal values. The palette tokens SHALL be exactly `--void: #14110E` (page background), `--char: #1C1813` (lifted panels), `--bone: #ECE5D8` (primary type), `--ash: #8A8073` (secondary / captions), `--line: rgba(236,229,216,.13)` (hairlines), and `--gilt: #B89B6E`. The `--gilt` token SHALL be used only for hairlines, micro-caps, and hover frames — it SHALL NOT be used as a fill or as a button background.

#### Scenario: Tokens are the single source of color

- **WHEN** any section renders
- **THEN** its background, type, hairlines, and accents resolve from the palette tokens, and changing a token value updates every consumer with no other code change

#### Scenario: Gilt restraint is honored

- **WHEN** the rendered site is inspected
- **THEN** `--gilt` appears only on hairlines, micro-caps text, and hover frames, and never as a filled background or button fill

### Requirement: Typography Voice

The site SHALL use Fraunces (weights 300–500, italic for accents) for display headlines, Inter (400/500) for body and UI, and an uppercase tracked label style (letter-spacing `.14em`–`.32em`, 11–12px) for labels and captions — the "museum label" voice. Fonts SHALL load with `font-display: swap` and preconnect to avoid invisible-text and layout penalties.

#### Scenario: Display vs label voices are distinct

- **WHEN** a section with a headline and a caption renders
- **THEN** the headline is set in Fraunces and the caption/label is set in uppercase tracked Inter at 11–12px

### Requirement: Preloader

On initial load (full experience only), the site SHALL show a full-screen `--void` preloader in which a gilt counter ticks from 00 to 100 and the studio name performs a SplitText reveal; on completion a curtain SHALL wipe upward to reveal the hero. Under `prefers-reduced-motion: reduce`, the preloader SHALL be skipped entirely and content SHALL be shown immediately.

#### Scenario: Full-experience preload

- **WHEN** a visitor with no reduced-motion preference loads the page
- **THEN** the gilt counter animates 00→100, the studio name reveals via SplitText, and a curtain wipes upward to uncover the hero

#### Scenario: Reduced-motion skips the preloader

- **WHEN** a visitor has `prefers-reduced-motion: reduce`
- **THEN** no preloader or curtain is shown and the hero is visible immediately on load

### Requirement: Fixed Navigation Behavior

The site SHALL render a fixed, minimal nav (wordmark left; Index / Studio / Contact links right). It SHALL be transparent over the hero, SHALL gain a backdrop blur and a hairline bottom border after the page is scrolled past 40px, SHALL hide when the user scrolls down, and SHALL reappear when the user scrolls up. All nav links SHALL be keyboard-focusable with a visible gilt focus ring.

#### Scenario: Nav solidifies after 40px

- **WHEN** the page is scrolled more than 40px from the top
- **THEN** the nav shows a backdrop blur and a hairline bottom border (and returns to transparent at the top)

#### Scenario: Nav hides on scroll-down and returns on scroll-up

- **WHEN** the user scrolls down past the hero
- **THEN** the nav translates out of view, and **WHEN** the user then scrolls up the nav reappears

### Requirement: Hero Headline & Intro Reveal

The hero SHALL present — as ordinary DOM, independent of WebGL — an eyebrow, a large Fraunces headline, a one-line statement, a featured-work label, and a scroll cue, rendered over whichever hero backdrop is active (the WebGL depth scene or the static featured image). On the full experience the headline SHALL reveal its characters via SplitText with a masked stagger, and the eyebrow, statement, featured-work label, and scroll cue SHALL fade in (transform/opacity only). Under reduced motion all hero text SHALL appear immediately in its final state with no SplitText or stagger. (The `hero-webgl` capability owns only the canvas scene, scrim, and fallback; this requirement owns the hero text and its reveal.)

#### Scenario: Hero headline character mask-reveal

- **WHEN** a full-experience visitor reaches the hero (after the preloader curtain)
- **THEN** the Fraunces headline reveals its characters with a masked stagger, and the eyebrow, one-line statement, featured-work label, and scroll cue fade in via transform/opacity

#### Scenario: Hero text persists over the static fallback

- **WHEN** the WebGL scene is unavailable (no WebGL, low-power/mobile, or reduced-motion) and the static featured image is shown
- **THEN** the eyebrow, headline, one-line statement, featured-work label, and scroll cue still render over the static image as a complete hero

#### Scenario: Reduced-motion hero text

- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** all hero text is shown immediately in its final state with no SplitText reveal or stagger

### Requirement: Studio Statement Section

The site SHALL include a centered editorial pull-quote section set in Fraunces, revealed word-by-word as the section scrolls into view, followed by a quiet row of render-engine names. Under reduced motion the full quote SHALL be visible without the word-by-word animation.

#### Scenario: Word-by-word reveal on scroll

- **WHEN** the statement section scrolls into view (full experience)
- **THEN** the pull-quote reveals word-by-word tied to scroll progress, and the engine-name row reads as a quiet tracked-caps line

### Requirement: Contact / Footer

The site SHALL end with a contact/footer containing an oversized Fraunces line ("Let's build the unbuilt"), a magnetic email button that translates slightly toward the cursor on hover, social links, and a colophon. Under reduced motion or on touch/coarse pointers the button SHALL NOT apply the magnetic translation but SHALL remain a fully functional link.

#### Scenario: Magnetic email button

- **WHEN** a fine-pointer visitor with motion enabled hovers the email button
- **THEN** the button eases slightly toward the cursor and returns on leave, while remaining an accessible mailto link

#### Scenario: Touch / reduced-motion button is static but functional

- **WHEN** the visitor is on a coarse pointer or has reduced motion
- **THEN** the email button does not translate and still activates the mailto action via click or keyboard
