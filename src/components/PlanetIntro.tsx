import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '../lib/motion'

/**
 * Opening shot rendered live from the resort's real 8000×4000 drone 360°.
 * A "little planet" (stereographic, eye on the sphere) spins and unfolds into
 * a rectilinear horizon view (eye at centre), then dives toward the ground.
 * Being a projection of a single 8K photo, it stays pin-sharp at any size.
 */
export interface PlanetHandle {
  play: () => void
  reset: () => void
}

interface Props {
  src: string
  onLoad?: () => void
  onProgress?: (p: number) => void
  onDive?: () => void // fired as the dive starts — hand over to the next shot
  reduced?: boolean
  className?: string
}

const vert = /* glsl */ `
out vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`

const frag = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 outColor;
uniform sampler2D tex;
uniform float aspect;
uniform float d;      // 1 = little planet (stereographic), 0 = rectilinear
uniform float scale;  // zoom (tan of half-FOV)
uniform float yaw;
uniform float pitch;
uniform float vignette;
const float PI = 3.141592653589793;

mat3 rotX(float a){ float c=cos(a), s=sin(a); return mat3(1.,0.,0., 0.,c,s, 0.,-s,c); }
mat3 rotY(float a){ float c=cos(a), s=sin(a); return mat3(c,0.,-s, 0.,1.,0., s,0.,c); }

vec2 dirToUv(vec3 p){
  float lon = atan(p.x, -p.z);
  float lat = asin(clamp(p.y, -1., 1.));
  return vec2(lon / (2.*PI) + .5, lat / PI + .5);
}

vec3 rayDir(vec2 uv){
  vec2 q = (uv * 2. - 1.) * vec2(aspect, 1.) * scale;
  vec3 v = normalize(vec3(q, -1.));
  vec3 e = vec3(0., 0., d);
  float b = dot(e, v);
  float c = dot(e, e) - 1.;
  float s = -b + sqrt(max(b*b - c, 0.));
  vec3 p = normalize(e + s * v);
  return rotY(yaw) * rotX(pitch) * p;
}

void main(){
  vec3 p = rayDir(vUv);
  vec2 tuv = dirToUv(p);
  // seam-safe gradients (longitude wraps at ±π)
  vec2 dx = dFdx(tuv), dy = dFdy(tuv);
  if (abs(dx.x) > .5) dx.x -= sign(dx.x);
  if (abs(dy.x) > .5) dy.x -= sign(dy.x);
  vec3 col = textureGrad(tex, tuv, dx, dy).rgb;
  // gentle cinematic grade
  col = pow(col, vec3(.97));
  col = mix(vec3(dot(col, vec3(.299,.587,.114))), col, 1.08);
  vec2 c = vUv - .5;
  col *= 1. - vignette * dot(c, c) * 1.6;
  outColor = vec4(col, 1.);
}
`

export const PlanetIntro = forwardRef<PlanetHandle, Props>(function PlanetIntro(
  { src, onLoad, onProgress, onDive, reduced, className },
  ref,
) {
  const host = useRef<HTMLDivElement>(null)
  const uni = useRef<Record<string, THREE.IUniform> | null>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  const cbs = useRef({ onLoad, onProgress, onDive })
  cbs.current = { onLoad, onProgress, onDive }

  const build = () => {
    const u = uni.current
    if (!u) return
    tl.current?.kill()
    // Equirect u→yaw: yaw = (0.5 − u)·2π. Resort centre u≈0.52, entrance plaza u≈0.53 / 52° below horizon.
    const start = { d: 1, scale: 3.4, yaw: -3.0, pitch: -Math.PI / 2 } // looking straight down = planet
    Object.entries(start).forEach(([k, v]) => (u[k].value = v))
    const t = gsap.timeline({ paused: true })
    // spin the planet while it grows
    t.to(u.yaw, { value: -0.3, duration: 7.5, ease: 'power2.inOut' }, 0)
      .to(u.scale, { value: 1.35, duration: 3.2, ease: 'power2.out' }, 0)
      // unfold: eye slides from the sphere surface to its centre, view tilts up to frame resort + horizon
      .to(u.d, { value: 0, duration: 3.6, ease: 'power3.inOut' }, 2.4)
      .to(u.pitch, { value: -0.42, duration: 3.8, ease: 'power3.inOut' }, 2.3)
      .to(u.scale, { value: 0.74, duration: 3.8, ease: 'power3.inOut' }, 2.3)
      // slow drift across the grounds
      .to(u.yaw, { value: -0.08, duration: 2.6, ease: 'sine.inOut' }, 7.5)
      // dive onto the entrance plaza → hand over to the buggy shot
      .add(() => cbs.current.onDive?.(), 10.6)
      .to(u.pitch, { value: -0.92, duration: 1.7, ease: 'power3.in' }, 9.9)
      .to(u.yaw, { value: -0.19, duration: 1.7, ease: 'power2.inOut' }, 9.9)
      .to(u.scale, { value: 0.2, duration: 1.7, ease: 'power3.in' }, 9.9)
    tl.current = t
  }

  useImperativeHandle(ref, () => ({
    play: () => { build(); tl.current?.play(0) },
    reset: () => { tl.current?.kill() },
  }))

  useEffect(() => {
    const el = host.current!
    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
    const scene = new THREE.Scene()
    const cam = new THREE.Camera()
    const uniforms: Record<string, THREE.IUniform> = {
      tex: { value: null }, aspect: { value: 1 }, d: { value: 1 }, scale: { value: 3.4 },
      yaw: { value: -3.0 }, pitch: { value: -Math.PI / 2 }, vignette: { value: 0.9 },
    }
    uni.current = uniforms
    const mat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: vert, fragmentShader: frag, uniforms, depthTest: false })
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat)
    scene.add(quad)

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight
      renderer.setSize(w, h, false)
      uniforms.aspect.value = w / h
    }
    const ro = new ResizeObserver(resize); ro.observe(el); resize()

    // stream the panorama with progress so the preloader can show real progress
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(src)
        const total = Number(res.headers.get('content-length')) || 0
        const reader = res.body!.getReader()
        const chunks: Uint8Array[] = []
        let got = 0
        for (;;) {
          const { done, value } = await reader.read()
          if (done || cancelled) break
          chunks.push(value); got += value.length
          if (total) cbs.current.onProgress?.(got / total)
        }
        if (cancelled) return
        const blob = new Blob(chunks as BlobPart[], { type: 'image/webp' })
        const bmp = await createImageBitmap(blob, { imageOrientation: 'flipY' })
        const tex = new THREE.Texture(bmp)
        tex.flipY = false
        tex.colorSpace = THREE.SRGBColorSpace
        tex.generateMipmaps = true
        tex.minFilter = THREE.LinearMipmapLinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy())
        tex.wrapS = THREE.RepeatWrapping
        tex.needsUpdate = true
        uniforms.tex.value = tex
        renderer.render(scene, cam)
        cbs.current.onProgress?.(1)
        cbs.current.onLoad?.()
      } catch {
        cbs.current.onProgress?.(1)
        cbs.current.onLoad?.()
      }
    })()

    let raf = 0
    const tick = () => { if (uniforms.tex.value) renderer.render(scene, cam); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      tl.current?.kill()
      ro.disconnect()
      ;(uniforms.tex.value as THREE.Texture | null)?.dispose()
      mat.dispose(); quad.geometry.dispose(); renderer.dispose(); renderer.domElement.remove()
    }
  }, [src])

  // reduced motion: hold a calm horizon view
  useEffect(() => {
    if (!reduced || !uni.current) return
    const u = uni.current
    u.d.value = 0; u.scale.value = 0.72; u.pitch.value = -0.12; u.yaw.value = 2.0
  }, [reduced])

  return <div ref={host} className={className} aria-hidden />
})
