## ADDED Requirements

### Requirement: Services List Section

The Services section SHALL render all 5 service families from the taxonomy in their canonical order, deriving content (label, blurb, disciplines) entirely from the data layer (`getServices`) and never from hardcoded markup. Each family SHALL display its label (Space Grotesk display), mono eyebrow (numbered, tabular figures), blurb, and disciplines, with families where `active` is false visibly marked "In development". Turning a family on SHALL require only data changes (no markup edits).

#### Scenario: All five families render in order from data
- **WHEN** the Services section mounts and reads from `getServices`
- **THEN** exactly 5 family entries render in taxonomy order: visualisation, visual-identity, computational-design, immersive-experiences, digital-fabrication
- **AND** each entry shows its label, numbered mono eyebrow, blurb, and discipline list sourced from the data layer

#### Scenario: In-development families are marked
- **WHEN** a family's `active` flag is `false` (computational-design, immersive-experiences, digital-fabrication)
- **THEN** that family renders an "In development" label/badge
- **AND** the active families (visualisation, visual-identity) render without that marker

#### Scenario: Activating a family is content-only
- **WHEN** a family's data is changed to `active: true` with projects added
- **THEN** the Services section reflects the change with no markup or component rebuild required

### Requirement: Oversized Stat Numbers

The Stats section SHALL display oversized tabular figures (Space Mono / tabular-nums) that count up from a baseline to their target value when the section reveals into view, animating opacity/transform only. Under reduced motion the final values SHALL appear statically with no count-up.

#### Scenario: Stats count up on reveal
- **WHEN** the Stats section scrolls into view with motion enabled
- **THEN** each oversized number animates (counts) from its baseline to its target value using tabular figures
- **AND** only transform/opacity properties are animated (no layout-shifting properties)

#### Scenario: Reduced motion shows final values
- **WHEN** the user prefers reduced motion
- **THEN** each stat renders immediately at its final target value with no count-up animation

### Requirement: Numbered Process

The Process section SHALL present a numbered sequence of stages in a Start / Build / Ship style, each with a mono number (tabular), a Space Grotesk title, and a description. Steps SHALL reveal sequentially on scroll with motion enabled, and SHALL all be visible statically under reduced motion.

#### Scenario: Numbered stages render in order
- **WHEN** the Process section renders
- **THEN** the stages appear in order with sequential mono numbers (e.g. 01 Start, 02 Build, 03 Ship) using tabular figures
- **AND** each stage shows a title and description

#### Scenario: Reduced-motion static process
- **WHEN** the user prefers reduced motion
- **THEN** all process stages are fully visible with no sequential reveal animation

### Requirement: Editorial About Statement

The About section SHALL present an editorial statement that reveals by word or line on scroll using SplitText with motion enabled (transform/opacity only). Under reduced motion the full statement SHALL render statically with SplitText disabled.

#### Scenario: Word/line reveal on scroll
- **WHEN** the About section scrolls into view with motion enabled
- **THEN** the statement reveals progressively by word or line via SplitText, animating transform/opacity only

#### Scenario: Reduced-motion static statement
- **WHEN** the user prefers reduced motion
- **THEN** the full About statement renders immediately as static text with no SplitText splitting or reveal animation

### Requirement: Marquee Strip

The page SHALL include a marquee strip scrolling services and/or client names horizontally as a continuous loop, animating transform only. The marquee SHALL be paused (static) under reduced motion and SHALL be marked decorative so it does not trap or distract assistive technology.

#### Scenario: Marquee loops with motion enabled
- **WHEN** the marquee strip is on screen with motion enabled
- **THEN** the strip scrolls continuously via a transform-only loop showing services/client names

#### Scenario: Marquee paused under reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** the marquee strip is static (no scrolling animation) with its content fully readable

### Requirement: Contact / Footer

The contact/footer SHALL include a bold pop-colour CTA block, mono contact columns (tabular labels), and a live local clock that updates while the page is open. The footer SHALL remain functional and accessible under reduced motion, with the clock continuing to update (clock ticking is not parallax/decorative motion).

#### Scenario: Footer composition renders
- **WHEN** the contact/footer renders
- **THEN** a full-bleed pop-colour CTA block is shown alongside mono contact columns using tabular figures

#### Scenario: Live local clock updates
- **WHEN** the page is open and the footer is present
- **THEN** the local clock displays the current local time and updates over time (at least once per minute)
- **AND** it continues updating under reduced motion
