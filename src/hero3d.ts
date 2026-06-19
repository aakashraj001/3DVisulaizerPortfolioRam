/* ============================================================
   Hero WebGL depth scene (lazy chunk — Three.js loads only via dynamic import
   from main, and only in the desktop motion branch). A plane textured with the
   featured render + a grayscale depth map; a displacement shader offsets the
   color UVs by depth so foreground/background shift at different rates. Drivers:
   lerped pointer parallax, ScrollTrigger-scrubbed depth, slow ambient camera
   drift, faint additive dust. Init only while in view; dispose all GPU
   resources on exit; DPR ≤ 2; textures ≤ 2048px; one context-restore attempt
   then fall back to the static image.
   ============================================================ */

import * as THREE from 'three'
import { ScrollTrigger } from './motion'
import { imageUrl } from './images'
import { getFeatured } from './cms'

type Disposer = () => void
const noop: Disposer = () => {}

const MAX_TEX = 2048

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform sampler2D uDepth;
  uniform vec2 uPointer;   // lerped, -1..1
  uniform float uScroll;   // 0..1 across the hero
  uniform float uTime;
  uniform float uHasDepth;

  void main() {
    float depth = mix(0.5, texture2D(uDepth, vUv).r, uHasDepth);
    float centered = depth - 0.5;
    // Slow ambient drift so the field breathes even when still.
    vec2 drift = vec2(sin(uTime * 0.07), cos(uTime * 0.05)) * 0.004;
    vec2 par = (uPointer * 0.035 + vec2(0.0, uScroll * 0.05) + drift) * centered;
    vec3 col = texture2D(uTex, vUv + par).rgb;
    // Gentle radial vignette toward the warm void.
    float d = distance(vUv, vec2(0.5));
    col *= smoothstep(0.95, 0.35, d) * 0.35 + 0.65;
    gl_FragColor = vec4(col, 1.0);
  }
`

function makeDust(count: number): THREE.Points {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.sin(i * 12.9898) * 43758.5453) % 1 * 2 - 1
    positions[i * 3 + 1] = (Math.sin(i * 78.233) * 43758.5453) % 1 * 2 - 1
    positions[i * 3 + 2] = (Math.sin(i * 39.425) * 43758.5453) % 1 * 0.6
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    color: 0xb89b6e,
    size: 0.006,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  return new THREE.Points(geo, mat)
}

export async function mountHero3D(): Promise<Disposer> {
  if (!hasWebGL()) return noop
  const featured = await getFeatured()
  const heroEl = document.querySelector<HTMLElement>('.hero')
  const bgEl = document.querySelector<HTMLElement>('.hero__bg')
  if (!featured || !heroEl || !bgEl) return noop
  // Non-null bindings so the closures below (resize/io/dispose) keep narrowing.
  const hero: HTMLElement = heroEl
  const bg: HTMLElement = bgEl

  const canvas = document.createElement('canvas')
  canvas.className = 'hero__canvas'
  canvas.setAttribute('aria-hidden', 'true')
  bg.appendChild(canvas)

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'low-power',
    })
  } catch {
    canvas.remove()
    return noop
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.z = 1

  // Load textures at a capped size; flat depth when no depth map.
  const loader = new THREE.TextureLoader()
  loader.setCrossOrigin('anonymous')
  // Cap by the LONGEST edge ≤ 2048 (request a width that yields height ≤ 2048 too).
  const cappedWidth = (a: { width: number; height: number }) =>
    Math.round(a.width * Math.min(1, MAX_TEX / Math.max(a.width, a.height)))
  const load = (url: string) =>
    new Promise<THREE.Texture>((res, rej) => loader.load(url, res, undefined, rej))

  let colorTex: THREE.Texture
  try {
    colorTex = await load(imageUrl(featured.image, cappedWidth(featured.image), 80))
  } catch {
    canvas.remove()
    renderer.dispose()
    return noop // can't even load the color texture → keep static image
  }
  colorTex.colorSpace = THREE.SRGBColorSpace

  let depthTex: THREE.Texture | null = null
  let hasDepth = 0
  if (featured.depthMap) {
    try {
      depthTex = await load(imageUrl(featured.depthMap, cappedWidth(featured.depthMap), 70))
      hasDepth = 1
    } catch {
      hasDepth = 0
    }
  }
  if (!depthTex) {
    const flat = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1)
    flat.needsUpdate = true
    depthTex = flat
  }

  const uniforms = {
    uTex: { value: colorTex },
    uDepth: { value: depthTex },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
    uTime: { value: 0 },
    uHasDepth: { value: hasDepth },
  }
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG })

  const geometry = new THREE.PlaneGeometry(1, 1)
  const plane = new THREE.Mesh(geometry, material)
  scene.add(plane)

  const dust = makeDust(140)
  scene.add(dust)

  // Size the oversized plane to fill (and exceed) the frustum so camera drift
  // never reveals an edge. imageAspect drives cover-fit.
  const imgAspect = featured.image.width / featured.image.height
  function resize() {
    const w = hero.clientWidth
    const h = hero.clientHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    const dist = camera.position.z
    const vH = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist
    const vW = vH * camera.aspect
    // Cover-fit the image into the viewport, then oversize 1.15× for drift.
    const viewAspect = vW / vH
    let pw = vW
    let ph = vH
    if (viewAspect > imgAspect) ph = vW / imgAspect
    else pw = vH * imgAspect
    plane.scale.set(pw * 1.15, ph * 1.15, 1)
    dust.scale.set(vW * 0.6, vH * 0.6, 1)
  }
  resize()
  window.addEventListener('resize', resize)

  // ---- Drivers ----
  const pointerTarget = new THREE.Vector2(0, 0)
  const camTarget = new THREE.Vector2(0, 0)
  let scrollTarget = 0

  const onPointer = (e: PointerEvent) => {
    pointerTarget.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
  }
  window.addEventListener('pointermove', onPointer)

  const st = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      scrollTarget = self.progress
    },
  })

  // ---- Render loop, gated by visibility ----
  let raf = 0
  let inView = true
  let running = false
  const clock = new THREE.Clock()

  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    uniforms.uTime.value += dt
    uniforms.uPointer.value.lerp(pointerTarget, 0.05)
    uniforms.uScroll.value += (scrollTarget - uniforms.uScroll.value) * 0.08
    camTarget.lerp(pointerTarget, 0.04)
    camera.position.x = camTarget.x * 0.06
    camera.position.y = camTarget.y * 0.06
    camera.lookAt(0, 0, 0)
    dust.rotation.z += dt * 0.01
    dust.position.y = Math.sin(uniforms.uTime.value * 0.1) * 0.02
    renderer.render(scene, camera)
  }
  function start() {
    if (running) return
    running = true
    clock.getDelta()
    frame()
  }
  function stop() {
    running = false
    cancelAnimationFrame(raf)
  }

  // Init only while in view; pause when offscreen or tab hidden.
  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting
      if (inView && document.visibilityState === 'visible') {
        hero.classList.add('webgl-active')
        start()
      } else {
        stop()
      }
    },
    { threshold: 0.01 },
  )
  io.observe(hero)

  const onVisibility = () => {
    if (document.visibilityState === 'visible' && inView) start()
    else stop()
  }
  document.addEventListener('visibilitychange', onVisibility)

  // ---- Context loss: one restore attempt, else fall back to static ----
  let restoreAttempted = false
  let restored = false
  let disposed = false
  const onLost = (e: Event) => {
    e.preventDefault()
    stop()
    if (restoreAttempted) {
      dispose()
      return
    }
    restoreAttempted = true
    restored = false
    // Fall back only if the context never actually came back — not merely
    // because the loop is paused (offscreen/hidden also call stop()).
    window.setTimeout(() => {
      if (!disposed && !restored) dispose()
    }, 1800)
  }
  const onRestored = () => {
    restored = true
    if (!disposed && inView && document.visibilityState === 'visible') start()
  }
  canvas.addEventListener('webglcontextlost', onLost as EventListener)
  canvas.addEventListener('webglcontextrestored', onRestored)

  function dispose() {
    if (disposed) return
    disposed = true
    stop()
    io.disconnect()
    st.kill()
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onPointer)
    document.removeEventListener('visibilitychange', onVisibility)
    canvas.removeEventListener('webglcontextlost', onLost as EventListener)
    canvas.removeEventListener('webglcontextrestored', onRestored)
    geometry.dispose()
    material.dispose()
    colorTex.dispose()
    depthTex?.dispose()
    ;(dust.geometry as THREE.BufferGeometry).dispose()
    ;(dust.material as THREE.Material).dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
    hero.classList.remove('webgl-active') // reveal the static image
  }

  return dispose
}
