# hero-webgl — Delta: Three.js Depth Hero & Fallback Ladder

## ADDED Requirements

### Requirement: WebGL Depth Hero Scene

The hero SHALL render a full-viewport Three.js (r170+) scene of a single plane textured with the featured render plus a grayscale depth map of the same image, where a displacement shader offsets the color texture (UV and/or vertex z) by the depth value so foreground and background shift at different rates, producing a subtle 2.5D depth effect. The scene SHALL apply a dark scrim for legibility; the hero text overlay (eyebrow, Fraunces headline, statement, featured-work label, scroll cue) is rendered as DOM by the `site-shell` "Hero Headline & Intro Reveal" requirement and SHALL remain legible over the scrim. When the featured project has no depth map, the shader SHALL run with a flat depth (still allowing subtle pointer parallax) rather than failing.

#### Scenario: Featured render gains depth

- **WHEN** a capable visitor loads the hero and the featured project has a depth map
- **THEN** the render displays with depth-driven displacement so foreground elements shift more than background, reading as three-dimensional under a dark scrim with the headline and scroll cue legible on top

#### Scenario: Missing depth map degrades gracefully

- **WHEN** the featured project has no depth map but WebGL is otherwise active
- **THEN** the scene renders the featured image on a flat-depth plane with subtle pointer parallax and no error

### Requirement: Depth Parallax Drivers

The hero depth SHALL respond to two drivers, both small and slow: (a) pointer position — a lerped camera/UV offset that follows the cursor; and (b) scroll — a depth offset that increases slightly as the user scrolls past the hero, tied to ScrollTrigger. The scene SHALL also include faint atmospheric dust particles drifting in the light and a slow ambient camera drift. Movement SHALL be restrained (gentle breathing), never a fast or distracting gimmick.

#### Scenario: Pointer and scroll parallax

- **WHEN** a capable visitor moves the cursor over the hero and scrolls
- **THEN** the depth offset eases toward the cursor and increases gently with scroll progress, while dust drifts and the camera drifts slowly

### Requirement: Hero WebGL Fallback Ladder

The hero SHALL initialize Three.js only when ALL hold: `prefers-reduced-motion` is not set, the device is not detected as low-power/mobile, a WebGL context is successfully created, AND the hero is in view (IntersectionObserver). In every excluded or failed case the hero SHALL display the static featured image instead, with the hero text overlay still rendered over it (per the `site-shell` hero requirement), no error UI, and no layout shift. A WebGL context loss at runtime SHALL make at most one restore attempt before falling back to the static image.

#### Scenario: No WebGL or low-power device

- **WHEN** WebGL is unavailable, the device is low-power/mobile, or `prefers-reduced-motion` is set
- **THEN** Three.js is never initialized and the static featured image is shown — with the eyebrow, headline, statement, featured-work label, and scroll cue still rendered over it — as a complete, intentional hero

#### Scenario: Context loss falls back

- **WHEN** the WebGL context is lost at runtime
- **THEN** the scene attempts a single restore and, failing that, fades to the static featured image without error UI

### Requirement: Hero WebGL Resource Discipline

The hero scene SHALL lazy-load its Three.js code (separate chunk, not shipped to first paint) and SHALL initialize only while in view. It SHALL cap pixel ratio at `min(devicePixelRatio, 2)` and texture size at ≤ 2048px (downscaling larger source images on load), SHALL pause its render loop when the hero is offscreen or the tab is hidden, and SHALL dispose all geometries, materials, textures, and the renderer (including `forceContextLoss()`) when the hero leaves view or on teardown.

#### Scenario: Lazy init and dispose

- **WHEN** the hero scrolls out of view (or the page tears down)
- **THEN** the render loop stops and all GPU resources (geometries, materials, textures, renderer) are disposed, and **WHEN** the hero is offscreen the Three.js chunk has been loaded only on demand, not at first paint

#### Scenario: Caps are enforced

- **WHEN** the renderer initializes on a high-DPR display with a large source render
- **THEN** pixel ratio is clamped to at most 2 and the texture is at most 2048px on its longest edge
