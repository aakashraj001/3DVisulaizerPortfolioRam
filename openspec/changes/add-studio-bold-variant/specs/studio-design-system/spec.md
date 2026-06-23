# studio-design-system — Delta: Bold Pop Tokens, Type Voices, Layout Language, Mono Nav, Preloader

## ADDED Requirements

### Requirement: Bold Pop Design Tokens

The site SHALL define its visual identity as CSS custom properties (design tokens) in a single source, and every component SHALL consume those tokens rather than literal colour values. The neutral palette tokens SHALL be exactly `--paper: #F5F2EC` (editorial body background), `--bone: #FBFAF7` (cards), `--ink: #0E0E0C` (type and the dark hero surface), `--ash: #6F6E68` (mono / secondary text), and `--rule: rgba(14,14,12,.14)` (hairlines). The pop accent tokens SHALL be exactly `--pop-violet: #6E2BFF` (primary), `--pop-red: #FF3B23` (CTA / banners), `--pop-lime: #C8FF1E`, and `--pop-lilac: #D9A6FF`. Unlike a restrained scheme, the pop accents SHALL be usable BOLDLY as large full-bleed fills, blocks, and button backgrounds — they SHALL NOT be confined to hairlines or micro-accents.

#### Scenario: Tokens are the single source of colour

- **WHEN** any section renders
- **THEN** its background, type, hairlines, and accents resolve from the palette/accent tokens
- **AND** changing one token value updates every consumer with no other code change

#### Scenario: Pop accents are used as bold fills

- **WHEN** the rendered site is inspected
- **THEN** at least one pop accent (`--pop-violet`, `--pop-red`, `--pop-lime`, or `--pop-lilac`) appears as a large full-bleed block or button background fill
- **AND** none of the four pop accents is restricted to hairline-only usage

#### Scenario: Light body over dark hero surface

- **WHEN** the editorial body and the hero surface render
- **THEN** the body background resolves to `--paper` and the hero surface resolves to `--ink`, drawing both from the shared tokens

### Requirement: Bold Grotesk + Mono Type Voices

The site SHALL use three distinct, named type voices, all loading with `font-display: swap` and preconnect to avoid invisible-text and layout penalties: (1) Space Grotesk 700 for huge display headlines and oversized stat numbers; (2) Inter 400/500 for body and UI copy; and (3) Space Mono in uppercase with positive letter-tracking, using tabular (`font-variant-numeric: tabular-nums`) figures, for labels, tags, section numbers, and any numeric readouts. The mono voice SHALL be visually distinct from the display and body voices and SHALL be the only voice used for labels, tags, and numbered-section markers.

#### Scenario: Three voices are distinct and correctly assigned

- **WHEN** a section containing a display headline, body copy, and a label/tag renders
- **THEN** the headline is set in Space Grotesk 700, the body is set in Inter, and the label/tag is set in uppercase tracked Space Mono

#### Scenario: Mono numerals are tabular

- **WHEN** a stat number, section number, or other numeric readout renders in the mono voice
- **THEN** it uses tabular figures so digits align in a fixed column

### Requirement: Peeled-Card & Pop-Block Layout Language

The site SHALL express a shared visual language across sections: image cards SHALL use a peeled / curved-edge mask with large corner radii implemented as a STATIC mask (no animated clip-path), full-bleed pop-colour blocks SHALL be used as bold section dividers and CTA surfaces, stat numbers SHALL be oversized in the display voice, and content sections SHALL carry mono section numbers with generous Swiss whitespace. The peeled-edge mask SHALL be a static shape that does not animate on GPU-composited or parallaxed layers.

#### Scenario: Peeled image card uses a static mask

- **WHEN** an image card renders
- **THEN** it shows the peeled / curved-edge shape with large radii via a static mask
- **AND** no animated clip-path is applied to that card while it is composited or parallaxed

#### Scenario: Pop block divides sections

- **WHEN** a section divider or CTA surface renders
- **THEN** it is a full-bleed block filled with a pop accent token

#### Scenario: Numbered sections and oversized stats

- **WHEN** a numbered content section or a stat renders
- **THEN** the section carries a mono section number and stat values are set oversized in the display voice with generous whitespace around them

### Requirement: Persistent Mono Nav

The site SHALL render a persistent navigation bar set in the mono voice, containing the studio wordmark on the left and WORK / ABOUT / CONTACT links plus an accessible "Sound on" toggle on the right. The nav SHALL be `position: fixed` and SHALL live OUTSIDE the ScrollSmoother transform so it stays pinned at every scroll position. All nav controls SHALL be keyboard-focusable with a visible focus ring. The "Sound on" toggle SHALL be present as a functional, accessible stub: it SHALL be a real control exposing pressed state via `aria-pressed` and SHALL toggle that state on activation, even though no audio is wired up yet. Activating a section link SHALL smooth-scroll to a position computed as `getBoundingClientRect().top + window.scrollY` minus the fixed nav height (so the nav does not occlude the target), and SHALL NOT call `element.focus()` on the destination section — focusing a viewport-taller section makes browsers ignore `preventScroll` and jump the page, and cancels the ScrollSmoother tween.

#### Scenario: Nav persists outside the smoother

- **WHEN** the page is scrolled to any position
- **THEN** the mono nav remains visible and fixed
- **AND** it is rendered outside the ScrollSmoother transform container

#### Scenario: Nav links jump to sections

- **WHEN** a visitor activates the WORK, ABOUT, or CONTACT link via click or keyboard
- **THEN** the page smooth-scrolls to a target computed from `getBoundingClientRect().top + window.scrollY` offset by the nav height (so the fixed nav does not occlude it)
- **AND** the destination section is NOT `element.focus()`-ed, so the page does not jump and ScrollSmoother is not cancelled
- **AND** each nav control shows a visible focus ring when focused

#### Scenario: Sound-on toggle is an accessible stub

- **WHEN** a visitor activates the "Sound on" toggle
- **THEN** its `aria-pressed` state flips between `true` and `false`
- **AND** the control is operable by keyboard and announced to assistive technology even though no audio plays

### Requirement: Preloader

On initial load of the full experience only, the site SHALL show a full-screen `--ink` preloader in which a mono counter ticks from 00 to 100, followed by a curtain that wipes away to reveal the page. Under `prefers-reduced-motion: reduce`, the preloader SHALL be skipped entirely and content SHALL be shown immediately with no counter and no curtain. The preloader animation SHALL use transform/opacity only.

#### Scenario: Full-experience preload

- **WHEN** a visitor with no reduced-motion preference loads the page
- **THEN** a full-screen `--ink` overlay shows a mono counter animating 00→100
- **AND** on completion a curtain wipes away (via transform/opacity) to uncover the page

#### Scenario: Reduced-motion skips the preloader

- **WHEN** a visitor has `prefers-reduced-motion: reduce`
- **THEN** no preloader overlay, counter, or curtain is shown
- **AND** the page content is visible immediately on load
