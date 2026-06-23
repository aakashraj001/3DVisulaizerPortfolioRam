# work-index — Delta: Service-Filtered, Horizontal-Pinned Work Index

## ADDED Requirements

### Requirement: Service-Filtered Work Index

The Work index SHALL render a filter control whose options are DERIVED from the service taxonomy (via the data layer, e.g. `getServices()`), never a hardcoded list, presented as Space Mono uppercase tracked labels with an "All" option plus one entry per service family in taxonomy order. Selecting a family SHALL show only project cards whose `serviceFamily` matches that family (an "All" selection SHALL show every project), and the active filter SHALL be visually indicated (e.g. a pop-colour fill/underline keyed to the family `accent`). When a selected family is marked in-development (`active: false`) and therefore has no projects, the index SHALL display an explained empty state — a short message indicating the family is "In development" with no projects yet — rather than an empty or broken region. Adding projects to that family later SHALL populate the index with NO code change.

#### Scenario: Filter list is derived from the taxonomy

- **WHEN** the Work index renders
- **THEN** the filter shows "All" plus exactly one option per service family in taxonomy order, each labelled in Space Mono uppercase
- **AND** no service family or label is hardcoded in markup — the options come from the data layer

#### Scenario: Selecting a family filters the cards

- **WHEN** the visitor activates a family filter (e.g. Visualisation)
- **THEN** only project cards whose `serviceFamily` matches that family remain visible, and the active filter is indicated using that family's accent

#### Scenario: In-development family shows an explained empty state

- **WHEN** the visitor selects a family marked in-development (`active: false`) that has no projects (e.g. Computational Design)
- **THEN** the index shows an explained empty state noting the family is "In development" with no projects yet
- **AND** no empty grid, error, or broken layout is shown

#### Scenario: Turning a family on is content-only

- **WHEN** projects are later added to a previously empty family and it is set `active: true`
- **THEN** that family's filter shows its project cards in the index with no code or markup change

### Requirement: Horizontal Pinned Scroll on Desktop

On desktop within the full-motion `gsap.matchMedia()` branch, the Work index section SHALL pin via ScrollTrigger and translate the row of project cards along the x-axis as the visitor scrolls vertically, so the cards advance horizontally for the duration of the pin. The pinned track and its ScrollTrigger SHALL be created inside `gsap.matchMedia()` (desktop branch only) and the section MUST NOT focus()-scroll a viewport-taller pinned element. The pin element SHALL be governed by the smooth-scroll setup (pin lives inside the smooth wrapper; any persistent filter bar that must stay reachable is `position: fixed` OUTSIDE the transformed wrapper, never CSS `sticky`). All movement SHALL animate transform/opacity only (no animated layout or clip-path). Each project card SHALL display a peeled/curved-edge cover image (static mask, large radius), the project title, Space Mono uppercase discipline tags, and an oversized index number.

#### Scenario: Cards advance horizontally while pinned

- **WHEN** a desktop full-motion visitor scrolls through the Work index section
- **THEN** the section pins and the card row translates along the x-axis (transform only) for the duration of the pin, advancing the cards horizontally

#### Scenario: Card anatomy

- **WHEN** a project card renders in the index
- **THEN** it shows a peeled/curved-edge cover (static mask, large radius), the title, Space Mono uppercase discipline tags, and an oversized index number

#### Scenario: Pin is governed and does not break smooth scroll

- **WHEN** the pinned index is set up
- **THEN** the pin and x-translate are created only in the desktop branch of `gsap.matchMedia()`, animate transform/opacity only, and the section is never reached by `focus()`-ing a taller element (so the page does not jump and ScrollSmoother is not cancelled)

### Requirement: Mobile and Reduced-Motion Vertical Stack

In the mobile and `prefers-reduced-motion: reduce` branches of `gsap.matchMedia()`, the Work index SHALL NOT pin and SHALL NOT horizontally translate; it SHALL instead present the same project cards as a fully usable vertical stack scrolled by the normal document flow. Filtering, card content (peeled cover, title, discipline tags, index number), and opening a case SHALL all remain fully functional in this layout. Under reduced motion the cards SHALL appear in their final state (no entrance animation, no pin, no x-translate).

#### Scenario: Mobile renders a vertical stack

- **WHEN** the index renders in the mobile `matchMedia` branch
- **THEN** no ScrollTrigger pin and no x-translate are created, and the cards lay out as a vertical stack scrolled by normal page scroll, with filtering and opening a case still working

#### Scenario: Reduced motion is a complete static index

- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** the index is a static vertical stack with cards in their final state — no pin, no horizontal translate, no entrance reveal — and remains fully filterable and activatable

### Requirement: Filtering Re-runs Reveals and Refreshes Pin Measurement

When the active filter changes, the index SHALL re-run the entrance reveal for the now-visible card set (in the full-motion branch) so newly shown cards animate in, and SHALL refresh the ScrollTrigger measurement (e.g. `ScrollTrigger.refresh()`) because the visible card count and therefore the pinned track width have changed. The refresh SHALL keep the pin distance and x-translate consistent with the filtered card row so the horizontal scroll neither overshoots nor stops short. Reveals SHALL animate transform/opacity only; under reduced motion no reveal is run and the refresh SHALL still recompute layout so the static stack stays correct.

#### Scenario: Re-reveal on filter change

- **WHEN** a full-motion visitor changes the active filter
- **THEN** the now-visible cards re-run their entrance reveal (transform/opacity only) for the filtered set

#### Scenario: Pin measurement refreshes for the new card count

- **WHEN** the visible card count changes due to filtering on desktop
- **THEN** ScrollTrigger is refreshed so the pin distance and x-translate match the filtered track width, with no overshoot or short stop

#### Scenario: Reduced-motion refresh without animation

- **WHEN** the filter changes under `prefers-reduced-motion: reduce`
- **THEN** no reveal animation runs, but layout/measurement is recomputed so the static vertical stack remains correct
