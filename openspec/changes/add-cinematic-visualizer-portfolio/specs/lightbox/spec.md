# lightbox — Delta: Flip Morph Lightbox

## ADDED Requirements

### Requirement: Flip Morph From Thumbnail

Clicking (or activating via keyboard) a gallery piece SHALL open a lightbox using GSAP Flip so the thumbnail smoothly morphs into the full-size view: the thumbnail's state is captured (`Flip.getState`), the image is reparented/restyled into the lightbox layout, and `Flip.from(...)` animates the transform delta. The lightbox SHALL show a dark backdrop, the full render (served at a large CDN size), and the piece's museum caption. Under reduced motion the lightbox SHALL open as a cross-fade (no morph) but with identical content and dismissal behavior.

#### Scenario: Thumbnail morphs to full view

- **WHEN** a full-experience visitor activates a gallery piece
- **THEN** the thumbnail morphs via Flip into the full-size render over a dark backdrop, with the museum caption shown alongside

#### Scenario: Reduced-motion open

- **WHEN** `prefers-reduced-motion: reduce` is set and a piece is activated
- **THEN** the lightbox cross-fades open (no morph) with the same full render, caption, and dismissal controls

### Requirement: Lightbox Dismissal & Focus Management

The lightbox SHALL be dismissible via the Escape key, a click on the backdrop, and a visible close button. While open it SHALL trap keyboard focus within the dialog, expose `role="dialog"`/`aria-modal="true"` with an accessible label, and on close SHALL return focus to the gallery piece that opened it. The full render `<img>` SHALL have meaningful `alt` text.

#### Scenario: Three ways to dismiss

- **WHEN** the lightbox is open
- **THEN** pressing Escape, clicking the backdrop, or activating the close button each closes it

#### Scenario: Focus trap and return

- **WHEN** the lightbox is open
- **THEN** Tab/Shift+Tab cycle only within the dialog, and **WHEN** it closes focus returns to the originating gallery piece

#### Scenario: Accessible dialog semantics

- **WHEN** assistive technology encounters the open lightbox
- **THEN** it is announced as a modal dialog with an accessible label, and the render image exposes meaningful `alt` text
