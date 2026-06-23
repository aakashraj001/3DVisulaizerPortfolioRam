## ADDED Requirements

### Requirement: CDN-Served Responsive Images

The image-delivery layer SHALL expose a URL builder that composes a configurable CDN base origin plus transform parameters (width, format, quality) to produce responsive image URLs. The builder SHALL emit modern formats (WebP/AVIF) with `srcset` candidates and a matching `sizes` attribute, MUST NOT request a single full-resolution direct asset for layout-sized rendering, and SHALL pass the original URL through unchanged when no CDN base is configured. All emitted URLs SHALL be CORS-clean (served with permissive `Access-Control-Allow-Origin` and requested with `crossorigin="anonymous"`) so the WebGL hero backdrop can use any image as a GPU texture without tainting the canvas.

#### Scenario: CDN base composes transformed srcset
- **WHEN** the URL builder is given a project image and a configured CDN base origin
- **THEN** it returns a `srcset` of multiple width candidates routed through that CDN base with width and format (WebP/AVIF) transform parameters applied
- **AND** it returns a matching `sizes` attribute and never a single full-resolution direct asset URL

#### Scenario: Passthrough when no CDN configured
- **WHEN** the URL builder is invoked while no CDN base origin is configured
- **THEN** it returns the original image URL unchanged without injecting transform parameters

#### Scenario: CORS-clean for WebGL texturing
- **WHEN** an image delivered by the layer is loaded for use as a Three.js hero texture
- **THEN** the request is made with `crossorigin="anonymous"` and the response carries a permissive `Access-Control-Allow-Origin` header
- **AND** the canvas using that texture is not tainted and remains readable by WebGL

### Requirement: Layout-Stable Lazy Blur-Up

Every delivered image SHALL reserve its space via explicit `width`/`height` attributes or an aspect-ratio box so that loading produces no Cumulative Layout Shift. Below-the-fold images SHALL set `loading="lazy"`, SHALL render a low-quality image placeholder (LQIP) that crossfades to the full image on load, and SHALL carry meaningful, content-describing `alt` text (empty `alt` only for purely decorative imagery).

#### Scenario: No layout shift on load
- **WHEN** a project card image is rendered before its bitmap has loaded
- **THEN** the image element has explicit `width`/`height` (or an aspect-ratio box) reserving its final dimensions
- **AND** the surrounding layout does not shift (CLS contribution is zero) when the bitmap finishes loading

#### Scenario: Lazy blur-up reveal
- **WHEN** a below-the-fold image enters the viewport
- **THEN** it loads lazily (`loading="lazy"`) starting from an LQIP and crossfades to the full-resolution image once decoded

#### Scenario: Meaningful alt text
- **WHEN** a content image is delivered
- **THEN** it carries descriptive `alt` text conveying the project or subject
- **AND** decorative-only images carry an empty `alt=""` so assistive technology skips them

### Requirement: Static GPU-Safe Peel Mask

The signature peeled/curved-edge card treatment SHALL be implemented as a static mask and/or fixed large border-radius applied to the image element. It MUST NOT use an animated `clip-path` on any GPU-composited or parallaxed layer; any motion affecting peeled cards SHALL be limited to `transform` and `opacity`, leaving the mask geometry constant.

#### Scenario: Peel uses static mask, not animated clip-path
- **WHEN** a work card with the peeled-edge treatment is rendered
- **THEN** the curved edge is produced by a static mask or fixed border-radius
- **AND** no `clip-path` animation is applied to that composited or parallaxed layer

#### Scenario: Card motion stays transform/opacity only
- **WHEN** a peeled card animates during scroll or hover
- **THEN** only `transform` and `opacity` are animated while the peel mask geometry remains static
