/* ============================================================
   Hero WebGL backdrop (lazy chunk). A flowing domain-warped noise/gradient
   field on a fullscreen shader plane behind the card stack, on the dark hero.
   Decorative (aria-hidden). Init only in view; DPR≤2; dispose + forceContextLoss
   on exit; pause offscreen; one context-restore attempt then static fallback.
   ============================================================ */
import * as THREE from 'three'

type Disposer = () => void
const noop: Disposer = () => {}

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
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`
const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime; uniform vec2 uRes; uniform vec2 uPointer;
  // hash + value noise + fbm
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5;} return v; }
  void main(){
    vec2 uv = vUv; uv.x *= uRes.x/uRes.y;
    vec2 q = vec2(fbm(uv*2.0 + uTime*0.04), fbm(uv*2.0 - uTime*0.05 + 4.0));
    float n = fbm(uv*2.5 + q*1.6 + uPointer*0.3 + uTime*0.02);
    vec3 ink = vec3(0.055,0.055,0.047);
    vec3 violet = vec3(0.43,0.17,1.0);
    vec3 red = vec3(1.0,0.23,0.14);
    vec3 col = mix(ink, violet, smoothstep(0.45,0.85,n)*0.5);
    col = mix(col, red, smoothstep(0.7,0.95,n)*0.18);
    float vig = smoothstep(1.15, 0.25, distance(vUv, vec2(0.5)));
    col *= 0.5 + 0.5*vig;
    gl_FragColor = vec4(col, 1.0);
  }
`

export async function mountHeroBg(): Promise<Disposer> {
  if (!hasWebGL()) return noop
  const heroEl = document.querySelector<HTMLElement>('.hero')
  const bgEl = document.querySelector<HTMLElement>('.hero__bg')
  if (!heroEl || !bgEl) return noop
  const hero: HTMLElement = heroEl
  const bg: HTMLElement = bgEl

  const canvas = document.createElement('canvas')
  canvas.className = 'hero__canvas'
  canvas.setAttribute('aria-hidden', 'true')
  bg.appendChild(canvas)

  let renderer: THREE.WebGLRenderer
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' })
  } catch {
    canvas.remove()
    return noop
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  const scene = new THREE.Scene()
  const camera = new THREE.Camera()
  const uniforms = {
    uTime: { value: 0 },
    uRes: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(0, 0) },
  }
  const geo = new THREE.PlaneGeometry(2, 2)
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms })
  const mesh = new THREE.Mesh(geo, mat)
  scene.add(mesh)

  function resize(): void {
    const w = hero.clientWidth
    const h = hero.clientHeight
    renderer.setSize(w, h, false)
    uniforms.uRes.value.set(w, h)
  }
  resize()
  window.addEventListener('resize', resize)

  const ptr = new THREE.Vector2(0, 0)
  const onPointer = (e: PointerEvent) =>
    ptr.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
  window.addEventListener('pointermove', onPointer)

  let raf = 0
  let running = false
  let inView = true
  const clock = new THREE.Clock()
  function frame(): void {
    raf = requestAnimationFrame(frame)
    uniforms.uTime.value += Math.min(clock.getDelta(), 0.05)
    uniforms.uPointer.value.lerp(ptr, 0.04)
    renderer.render(scene, camera)
  }
  function start(): void {
    if (running) return
    running = true
    clock.getDelta()
    frame()
  }
  function stop(): void {
    running = false
    cancelAnimationFrame(raf)
  }

  const io = new IntersectionObserver(
    ([e]) => {
      inView = e.isIntersecting
      if (inView && document.visibilityState === 'visible') {
        hero.classList.add('webgl-active')
        start()
      } else stop()
    },
    { threshold: 0.01 },
  )
  io.observe(hero)
  const onVis = () => (document.visibilityState === 'visible' && inView ? start() : stop())
  document.addEventListener('visibilitychange', onVis)

  let restoreAttempted = false
  let restored = false
  let disposed = false
  const onLost = (e: Event) => {
    e.preventDefault()
    stop()
    if (restoreAttempted) return dispose()
    restoreAttempted = true
    restored = false
    window.setTimeout(() => {
      if (!disposed && !restored) dispose()
    }, 1800)
  }
  const onRestored = () => {
    restored = true
    if (!disposed && inView) start()
  }
  canvas.addEventListener('webglcontextlost', onLost as EventListener)
  canvas.addEventListener('webglcontextrestored', onRestored)

  function dispose(): void {
    if (disposed) return
    disposed = true
    stop()
    io.disconnect()
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onPointer)
    document.removeEventListener('visibilitychange', onVis)
    canvas.removeEventListener('webglcontextlost', onLost as EventListener)
    canvas.removeEventListener('webglcontextrestored', onRestored)
    geo.dispose()
    mat.dispose()
    renderer.dispose()
    renderer.forceContextLoss()
    canvas.remove()
    hero.classList.remove('webgl-active')
  }

  return dispose
}
