## ADDED Requirements

### Requirement: Flip Card-to-Case Morph

Activating a WORK-index project card SHALL open a case lightbox whose content is hydrated from the data layer for that project, and under full-motion the transition SHALL be a GSAP Flip morph from the card's peeled cover into the case panel cover (animating transform/opacity only, no animated clip-path). The case panel SHALL present the project cover, summary, discipline tags (Space Mono uppercase), client and year, and, when `url` is present, an external link; if `summary` or `client` is absent the corresponding region SHALL be omitted rather than rendered empty. The morph and its content SHALL be driven entirely by the project record (title, image, summary, disciplines, client, year, url) read via the source-agnostic data layer.

#### Scenario: Card activates and morphs into the case panel

- **WHEN** a user clicks or presses Enter on a WORK-index project card under full-motion (desktop)
- **THEN** GSAP Flip captures the card cover's rect and morphs it into the case panel cover using only transform and opacity
- **AND** the panel renders the project cover, summary, discipline tags, client, year, and an external link when `url` exists
- **AND** all displayed fields are sourced from that project's record via the data layer (none hardcoded)

#### Scenario: Optional fields are omitted when absent

- **WHEN** the activated project has no `summary`, no `client`, or no `url`
- **THEN** the case panel omits the missing region entirely (no empty heading, label, or dangling link)
- **AND** the remaining present fields render unaffected

### Requirement: Dismissal & Focus Management

The case lightbox SHALL expose `role="dialog"` and `aria-modal="true"`, label itself from the project title, and on open SHALL move focus into the panel, trap Tab/Shift+Tab focus within it, and mark all background content inert (`inert`/`aria-hidden`) so it is neither focusable nor exposed to assistive technology. On open the lightbox SHALL also pause ScrollSmoother (when present) so the background does not scroll behind the dialog, and SHALL resume it on dismissal. The lightbox SHALL be dismissible by pressing Esc, clicking the backdrop, and activating the close control, and on dismissal SHALL remove the inert/hidden state from the background and return focus to the originating WORK-index card.

#### Scenario: Open establishes dialog semantics, focus trap, and inert background

- **WHEN** the case lightbox opens
- **THEN** the panel has `role="dialog"`, `aria-modal="true"`, and an accessible name derived from the project title
- **AND** focus moves into the panel and Tab / Shift+Tab cycle only among the panel's focusable elements
- **AND** all background content is set inert and hidden from assistive technology
- **AND** ScrollSmoother (when present) is paused so the background does not scroll, and resumes on dismissal

#### Scenario: Each dismissal path closes and restores

- **WHEN** the user presses Esc, clicks the backdrop, or activates the close control
- **THEN** the lightbox closes
- **AND** the background's inert/aria-hidden state is removed
- **AND** focus returns to the WORK-index card that opened the lightbox

### Requirement: Reduced-Motion Crossfade

Under `prefers-reduced-motion: reduce`, opening the case lightbox SHALL NOT perform the Flip morph and SHALL instead crossfade (opacity only) between states, while presenting the identical content (cover, summary, disciplines, client/year, external link) and preserving the full dialog semantics, focus trap, background inert behavior, and Esc/backdrop/close dismissal with focus return.

#### Scenario: Reduced-motion opens via crossfade without morph

- **WHEN** a user activates a WORK-index card while `prefers-reduced-motion: reduce` is active
- **THEN** no GSAP Flip morph runs and the case panel appears via an opacity-only crossfade
- **AND** the panel shows the same content (cover, summary, disciplines, client/year, external link when `url` exists)

#### Scenario: Reduced-motion preserves accessibility and dismissal

- **WHEN** the reduced-motion case lightbox is open
- **THEN** it retains `role="dialog"`, `aria-modal="true"`, the focus trap, and the inert background
- **AND** Esc, backdrop click, and the close control each dismiss it and return focus to the originating card
