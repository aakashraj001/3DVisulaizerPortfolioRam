# gallery — Delta: Index Filters, Asymmetric Grid, Piece Behavior

## ADDED Requirements

### Requirement: The Index & Category Filters

The site SHALL render an "Index" section with a heading and category filters (All / Architecture / Interior / Product / Experimental) as tracked-caps text links, where the active filter shows a gilt underline. The filter set SHALL be derived from the project data's `category` values (plus "All"), not a hardcoded list, and selecting a filter SHALL show only matching pieces and re-run the entrance reveals for the now-visible set. The Index header (heading + filters) SHALL stay pinned beneath the top navigation while the gallery is scrolled, so the filters remain reachable throughout the gallery; because the smooth-scroll wrapper is transformed, this SHALL be implemented via ScrollTrigger pinning rather than CSS `position: sticky`, and the header SHALL release when the gallery scrolls past.

#### Scenario: Filtering by category

- **WHEN** the visitor activates a category filter (e.g. Interior)
- **THEN** only pieces in that category remain visible, the active link gains a gilt underline, and the visible pieces re-reveal

#### Scenario: Index header stays accessible while scrolling the gallery

- **WHEN** the visitor scrolls down through the gallery pieces
- **THEN** the Index header (heading + filters) remains pinned just beneath the top nav with the pieces scrolling under it, so any filter can be activated at any point, and it releases once the gallery has scrolled past

#### Scenario: Filters reflect the data

- **WHEN** the project data contains a set of categories
- **THEN** the filter row shows "All" plus exactly those categories, with no category hardcoded in markup

### Requirement: Asymmetric Gallery Grid

The gallery SHALL present render "pieces" in a two-column asymmetric grid on desktop and a single column on mobile, with generous negative space and 1px hairline language consistent with the design system. Each piece SHALL display a museum caption beneath the image: the title in Fraunces, a tracked-caps `Category · Year · Engine` line, and a small index number.

#### Scenario: Responsive grid + museum caption

- **WHEN** the gallery renders on desktop
- **THEN** pieces lay out in a two-column asymmetric grid each with a Fraunces title, a tracked-caps `Category · Year · Engine` line, and an index number; **WHEN** on mobile the grid collapses to a single column

### Requirement: Gallery Piece Entrance Reveal

As a piece scrolls into view (full experience), it SHALL reveal with a compositor-safe entrance — a fade with a slight rise plus a gentle image scale-down (~1.07 → 1.0) — driven by `ScrollTrigger.batch()` with a stagger across pieces entering together. The caption hairline SHALL draw in via `scaleX` 0→1 and the index number SHALL fade up. The reveal SHALL animate only `transform`/`opacity` and SHALL NOT use `clip-path` (animating `clip-path` on a GPU-composited, parallaxed layer paints garbage/red on some GPUs). Under reduced motion pieces SHALL appear in their final state with no rise, scale, or stagger.

#### Scenario: Staggered entrance reveal

- **WHEN** a row of pieces enters the viewport (full experience)
- **THEN** each piece fades and rises in while the image settles from a slight scale (~1.07→1.0) with a batched stagger, the caption hairline draws in, and the index number fades up — using transform/opacity only (no clip-path)

#### Scenario: Reduced-motion reveal

- **WHEN** `prefers-reduced-motion: reduce` is set
- **THEN** pieces are shown fully visible immediately with no clip-path, scale, or stagger animation

### Requirement: Gallery Piece Parallax

Within each piece, the `<img>` SHALL carry `data-speed="0.9"` (moving slightly slower than scroll) while the caption block uses a different speed and/or `data-lag`, so the image and caption separate into distinct depth layers as the page scrolls; the surrounding frame SHALL remain fixed. On mobile the parallax intensity SHALL be reduced, and under reduced motion it SHALL be disabled.

#### Scenario: Layered parallax separation

- **WHEN** a full-experience visitor scrolls past a piece
- **THEN** the image moves slower than the scroll (`data-speed="0.9"`) and the caption moves at a different rate, separating into depth layers while the frame stays put

### Requirement: Gallery Piece Hover

On hover (fine pointer), a piece SHALL perform a slow (~1.3s) zoom to scale 1.045 with a brightness lift, and a gilt 1px frame SHALL fade in around the image, using transform/opacity/filter only. As a NICE enhancement a custom cursor dot MAY grow and read "View" over pieces. Hover effects SHALL not be required for any functionality and SHALL be absent on touch devices.

#### Scenario: Slow hover zoom + gilt frame

- **WHEN** a fine-pointer visitor hovers a piece
- **THEN** the image eases to scale 1.045 with a brightness lift over ~1.3s and a gilt 1px frame fades in, all via compositor-friendly properties

#### Scenario: No hover effects on touch

- **WHEN** the visitor is on a coarse/touch pointer device
- **THEN** no zoom, brightness lift, or gilt frame is applied, and the piece remains fully activatable (opens the lightbox via tap/keyboard)
