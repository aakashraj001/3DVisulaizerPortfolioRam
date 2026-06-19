# image-delivery — Delta: CDN-Backed Responsive Images

## ADDED Requirements

### Requirement: CDN-Served Responsive Renders

All render images SHALL be served through an image CDN (ImageKit or Cloudinary) via a URL builder that composes a single configurable CDN base (`VITE_IMAGE_CDN_BASE`) with transform parameters, requesting automatic modern formats (WebP/AVIF) and an appropriate size. Full-resolution renders SHALL NEVER be loaded directly. Every render `<img>` SHALL include a responsive `srcset` with a `sizes` hint so the browser fetches a size appropriate to the layout and device. When no CDN base is configured, the builder SHALL pass the source URL through unchanged so the site still renders.

#### Scenario: Responsive, modern-format delivery

- **WHEN** a render is displayed in the gallery
- **THEN** its `<img>` carries a `srcset`/`sizes` set built from the CDN base with WebP/AVIF requested, and no full-resolution original is fetched for a thumbnail

#### Scenario: Passthrough without a CDN

- **WHEN** `VITE_IMAGE_CDN_BASE` is unset
- **THEN** the URL builder returns the source image URL unchanged and images still render

### Requirement: Layout-Stable, Lazy, Blur-Up Images

Every render `<img>` SHALL declare explicit `width` and `height` (or sit in an aspect-ratio-reserved box) to prevent cumulative layout shift, SHALL use `loading="lazy"`, and SHALL present a blur-up low-quality placeholder that is replaced when the full image loads. All render images SHALL carry meaningful `alt` text.

#### Scenario: No layout shift

- **WHEN** images load during scroll
- **THEN** their space is reserved ahead of load (explicit dimensions / aspect-ratio box) so no surrounding content shifts (CLS stays low)

#### Scenario: Lazy blur-up

- **WHEN** an offscreen render scrolls toward the viewport
- **THEN** it loads lazily, first showing a blurred low-quality placeholder that resolves to the full image on load, and the `<img>` has meaningful `alt`
