import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Html } from "@react-three/drei"
import * as THREE from "three"

interface GalaxyGrant {
  id: string
  t: string
  r: string
  p: number
  a: number
  s: number
  ep: string
  f: string
}

interface GalaxyData {
  grants: GalaxyGrant[]
  programs: string[]
}

interface SceneProps {
  data: GalaxyData
  animKey: number
  playing: boolean
  onAnimEnd: () => void
}

const COLOR_TERMINATED = new THREE.Color("#ef4444")
const COLOR_KEPT = new THREE.Color("#22c55e")
const COLOR_UNKNOWN = new THREE.Color("#4b5563")
const COLOR_NEUTRAL = new THREE.Color("#60a5fa")

const STATUS_COLORS: Record<number, THREE.Color> = {
  0: COLOR_UNKNOWN,
  1: COLOR_TERMINATED,
  2: COLOR_KEPT,
}

const ANIM_DURATION = 3.0

const tempObject = new THREE.Object3D()
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface ParticleLayout {
  positions: Float32Array
  sortedIndices: number[]
  xMin: number
  xMax: number
}

function computeLayout(grants: GalaxyGrant[]): ParticleLayout {
  const positions = new Float32Array(grants.length * 3)
  const rng = mulberry32(42)

  const programCount = Math.max(...grants.map((g) => g.p)) + 1
  const programSpread = 0.6

  for (let i = 0; i < grants.length; i++) {
    const g = grants[i]
    const px = g.p * programSpread + (rng() - 0.5) * 0.8
    const py = Math.log1p(g.a / 5000) * 0.8 + (rng() - 0.5) * 0.3
    const pz = (rng() - 0.5) * 2.5
    positions[i * 3] = px - (programCount * programSpread) / 2
    positions[i * 3 + 1] = py
    positions[i * 3 + 2] = pz
  }

  const indices = Array.from({ length: grants.length }, (_, i) => i)
  indices.sort((a, b) => positions[a * 3] - positions[b * 3])

  let xMin = Infinity
  let xMax = -Infinity
  for (let i = 0; i < grants.length; i++) {
    const x = positions[i * 3]
    if (x < xMin) xMin = x
    if (x > xMax) xMax = x
  }

  return { positions, sortedIndices: indices, xMin, xMax }
}

function Particles({ data, animKey, playing, onAnimEnd }: SceneProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const elapsedRef = useRef(0)
  const animatingRef = useRef(false)
  const prevAnimKeyRef = useRef(animKey)
  const onAnimEndRef = useRef(onAnimEnd)
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    onAnimEndRef.current = onAnimEnd
  }, [onAnimEnd])

  const layout = useMemo(() => computeLayout(data.grants), [data.grants])

  // Initialize instance matrices and colors
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const { positions } = layout

    for (let i = 0; i < data.grants.length; i++) {
      tempObject.position.set(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2]
      )
      tempObject.scale.setScalar(0.06)
      tempObject.updateMatrix()
      mesh.setMatrixAt(i, tempObject.matrix)

      const statusColor = STATUS_COLORS[data.grants[i].s] ?? COLOR_UNKNOWN
      mesh.setColorAt(i, statusColor)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [data.grants, layout])

  // Reset animation when animKey changes
  useEffect(() => {
    if (animKey !== prevAnimKeyRef.current) {
      prevAnimKeyRef.current = animKey
      elapsedRef.current = 0
      animatingRef.current = false

      // Reset all colors to neutral
      const mesh = meshRef.current
      if (mesh) {
        for (let i = 0; i < data.grants.length; i++) {
          mesh.setColorAt(i, COLOR_NEUTRAL)
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      }
    }
  }, [animKey, data.grants.length])

  useFrame((_, delta) => {
    if (!playing) return
    if (!meshRef.current) return

    const mesh = meshRef.current
    const { positions, sortedIndices, xMin, xMax } = layout

    // Start animating
    if (!animatingRef.current) {
      animatingRef.current = true
      elapsedRef.current = 0

      // Ensure all start as neutral
      for (let i = 0; i < data.grants.length; i++) {
        mesh.setColorAt(i, COLOR_NEUTRAL)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }

    elapsedRef.current += delta
    const progress = Math.min(elapsedRef.current / ANIM_DURATION, 1)
    const waveFrontX = xMin + progress * (xMax - xMin)

    let changed = false
    for (const idx of sortedIndices) {
      const x = positions[idx * 3]
      if (x <= waveFrontX) {
        const statusColor = STATUS_COLORS[data.grants[idx].s] ?? COLOR_UNKNOWN
        mesh.setColorAt(idx, statusColor)
        changed = true
      } else {
        break
      }
    }

    if (changed && mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }

    if (progress >= 1 && animatingRef.current) {
      animatingRef.current = false
      onAnimEndRef.current()
    }
  })

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.instanceId !== undefined) {
      setHovered(e.instanceId)
    }
  }

  const handlePointerOut = () => {
    setHovered(null)
  }

  const hoveredGrant = hovered !== null ? data.grants[hovered] : null
  const hoveredPos = hovered !== null
    ? new THREE.Vector3(
        layout.positions[hovered * 3],
        layout.positions[hovered * 3 + 1],
        layout.positions[hovered * 3 + 2]
      )
    : null

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, data.grants.length]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial roughness={0.5} metalness={0.2} />
      </instancedMesh>

      {hoveredGrant && hoveredPos && (
        <Html position={[hoveredPos.x, hoveredPos.y + 0.3, hoveredPos.z]} center>
          <div
            style={{
              background: "rgba(0,0,0,0.85)",
              color: "#fff",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              lineHeight: 1.4,
              maxWidth: "220px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{hoveredGrant.t}</div>
            <div style={{ opacity: 0.8 }}>{hoveredGrant.r}</div>
            <div style={{ opacity: 0.7 }}>
              {data.programs[hoveredGrant.p]} &middot; ${hoveredGrant.a.toLocaleString()}
            </div>
          </div>
        </Html>
      )}
    </>
  )
}

export function GrantGalaxyScene({ data, animKey, playing, onAnimEnd }: SceneProps) {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 5, 20], fov: 50 }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <Particles data={data} animKey={animKey} playing={playing} onAnimEnd={onAnimEnd} />
      <OrbitControls
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        minDistance={3}
        maxDistance={40}
        target={[0, 2, 0]}
      />
    </Canvas>
  )
}

export default GrantGalaxyScene
