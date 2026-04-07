import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber"
import { OrbitControls, Html, Grid } from "@react-three/drei"
import * as THREE from "three"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface GalaxyGrant {
  id: string
  t: string   // title
  r: string   // recipient
  c: number   // category index (X)
  s: number   // spend bucket (Y)
  z: number   // signed funding amount (Z) — positive=kept, negative=terminated
  a: number   // raw approved amount
  x: number   // terminated flag (0 or 1)
  d: string   // DEI flag status
  ep: string  // equal protection category
}

interface GalaxyData {
  grants: GalaxyGrant[]
  categories: string[]
  spendLabels: string[]
}

interface SceneProps {
  data: GalaxyData
  animKey: number
  playing: boolean
  onAnimEnd: () => void
}

/* ------------------------------------------------------------------ */
/*  Color helpers                                                      */
/* ------------------------------------------------------------------ */

// Height-mapped gradient inspired by surface plots:
// deep blue (bottom) → cyan → green → yellow → red (top)
const gradientColors = [
  new THREE.Color("#1e3a8a"), // deep blue (most negative)
  new THREE.Color("#0ea5e9"), // cyan
  new THREE.Color("#22c55e"), // green (near zero / kept)
  new THREE.Color("#eab308"), // yellow
  new THREE.Color("#ef4444"), // red (top)
]

function heightColor(z: number, zMin: number, zMax: number): THREE.Color {
  const t = Math.max(0, Math.min(1, (z - zMin) / (zMax - zMin || 1)))
  const segments = gradientColors.length - 1
  const idx = t * segments
  const lo = Math.floor(idx)
  const hi = Math.min(lo + 1, segments)
  const frac = idx - lo
  return gradientColors[lo].clone().lerp(gradientColors[hi], frac)
}

const COLOR_NEUTRAL = new THREE.Color("#60a5fa")
const ANIM_DURATION = 4.0

/* ------------------------------------------------------------------ */
/*  Deterministic RNG                                                  */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ------------------------------------------------------------------ */
/*  Layout                                                             */
/* ------------------------------------------------------------------ */

const tempObject = new THREE.Object3D()

interface ParticleLayout {
  positions: Float32Array
  zMin: number
  zMax: number
}

function computeLayout(grants: GalaxyGrant[], numCategories: number): ParticleLayout {
  const positions = new Float32Array(grants.length * 3)
  const rng = mulberry32(42)

  const catSpacing = 1.8
  const spendSpacing = 2.5
  const jitterXZ = 0.7
  const jitterY = 0.4

  let zMin = Infinity
  let zMax = -Infinity

  for (let i = 0; i < grants.length; i++) {
    const g = grants[i]

    // X = program category with jitter
    const px = g.c * catSpacing + (rng() - 0.5) * jitterXZ - (numCategories * catSpacing) / 2

    // Y = spend bucket with jitter (3 bands)
    const py = g.s * spendSpacing + (rng() - 0.5) * jitterY

    // Z = signed funding amount (already computed: positive=kept, negative=terminated)
    const pz = g.z + (rng() - 0.5) * 0.3

    positions[i * 3] = px
    positions[i * 3 + 1] = pz  // Three.js Y = our Z (height)
    positions[i * 3 + 2] = py  // Three.js Z = our Y (depth into screen)

    if (pz < zMin) zMin = pz
    if (pz > zMax) zMax = pz
  }

  return { positions, zMin, zMax }
}

/* ------------------------------------------------------------------ */
/*  Zero-plane grid                                                    */
/* ------------------------------------------------------------------ */

function ZeroPlane({ width, depth }: { width: number; depth: number }) {
  return (
    <mesh position={[0, 0, depth / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color="#ffffff"
        transparent
        opacity={0.06}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/*  Axis labels                                                        */
/* ------------------------------------------------------------------ */

function AxisLabels({
  categories,
  spendLabels,
  numCategories,
  zMin,
  zMax,
}: {
  categories: string[]
  spendLabels: string[]
  numCategories: number
  zMin: number
  zMax: number
}) {
  const catSpacing = 1.8
  const spendSpacing = 2.5
  const halfWidth = (numCategories * catSpacing) / 2

  return (
    <group>
      {/* X-axis: category labels along bottom */}
      {categories.map((cat, i) => {
        const x = i * catSpacing - halfWidth
        return (
          <Html
            key={cat}
            position={[x, zMin - 0.8, -0.5]}
            center
            style={{ pointerEvents: "none" }}
          >
            <span
              className="select-none text-[8px] font-medium"
              style={{
                color: "#94a3b8",
                whiteSpace: "nowrap",
                transform: "rotate(-45deg)",
                transformOrigin: "center",
                display: "block",
              }}
            >
              {cat}
            </span>
          </Html>
        )
      })}

      {/* Y-axis: spend status labels along the depth */}
      {spendLabels.map((label, i) => (
        <Html
          key={label}
          position={[halfWidth + 1.5, zMin - 0.5, i * spendSpacing]}
          center
          style={{ pointerEvents: "none" }}
        >
          <span
            className="select-none text-[9px] font-medium"
            style={{ color: "#94a3b8", whiteSpace: "nowrap" }}
          >
            {label}
          </span>
        </Html>
      ))}

      {/* Z-axis labels: funding impact */}
      {[
        { y: zMax, label: "Kept +" },
        { y: 0, label: "$0 line" },
        { y: zMin, label: "Terminated -" },
      ].map(({ y, label }) => (
        <Html
          key={label}
          position={[-halfWidth - 1.5, y, -0.5]}
          center
          style={{ pointerEvents: "none" }}
        >
          <span
            className="select-none text-[9px] font-medium"
            style={{
              color: label === "$0 line" ? "#f59e0b" : "#94a3b8",
              whiteSpace: "nowrap",
              fontWeight: label === "$0 line" ? 700 : 500,
            }}
          >
            {label}
          </span>
        </Html>
      ))}

      {/* Axis titles */}
      <Html
        position={[0, zMin - 2, -0.5]}
        center
        style={{ pointerEvents: "none" }}
      >
        <span className="select-none text-[10px] font-semibold" style={{ color: "#ef4444" }}>
          Program Category &rarr;
        </span>
      </Html>
      <Html
        position={[halfWidth + 3, zMin - 0.5, 1 * spendSpacing]}
        center
        style={{ pointerEvents: "none" }}
      >
        <span className="select-none text-[10px] font-semibold" style={{ color: "#3b82f6" }}>
          Spend Status &rarr;
        </span>
      </Html>
      <Html
        position={[-halfWidth - 3, 0, -0.5]}
        center
        style={{ pointerEvents: "none" }}
      >
        <span
          className="select-none text-[10px] font-semibold"
          style={{
            color: "#22c55e",
            writingMode: "vertical-rl",
            textOrientation: "mixed",
          }}
        >
          Funding Impact &uarr;
        </span>
      </Html>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Particles                                                          */
/* ------------------------------------------------------------------ */

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

  const layout = useMemo(
    () => computeLayout(data.grants, data.categories.length),
    [data.grants, data.categories.length]
  )

  // Initialize matrices and final colors
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return

    const { positions, zMin, zMax } = layout

    for (let i = 0; i < data.grants.length; i++) {
      const y = positions[i * 3 + 1]
      tempObject.position.set(positions[i * 3], y, positions[i * 3 + 2])
      // Size by absolute Z value (bigger = more money)
      const absZ = Math.abs(data.grants[i].z)
      const scale = 0.04 + absZ * 0.012
      tempObject.scale.setScalar(scale)
      tempObject.updateMatrix()
      mesh.setMatrixAt(i, tempObject.matrix)

      const col = heightColor(y, zMin, zMax)
      mesh.setColorAt(i, col)
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [data.grants, layout])

  // Reset animation on animKey change
  useEffect(() => {
    if (animKey !== prevAnimKeyRef.current) {
      prevAnimKeyRef.current = animKey
      elapsedRef.current = 0
      animatingRef.current = false

      const mesh = meshRef.current
      if (mesh) {
        for (let i = 0; i < data.grants.length; i++) {
          mesh.setColorAt(i, COLOR_NEUTRAL)
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
      }
    }
  }, [animKey, data.grants.length])

  // Wave animation: sweep from left to right, revealing height colors
  useFrame((_, delta) => {
    if (!playing) return
    if (!meshRef.current) return

    const mesh = meshRef.current
    const { positions, zMin, zMax } = layout

    if (!animatingRef.current) {
      animatingRef.current = true
      elapsedRef.current = 0
      for (let i = 0; i < data.grants.length; i++) {
        mesh.setColorAt(i, COLOR_NEUTRAL)
      }
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    }

    elapsedRef.current += delta
    const progress = Math.min(elapsedRef.current / ANIM_DURATION, 1)

    // Find X extent
    let xMin = Infinity
    let xMax = -Infinity
    for (let i = 0; i < data.grants.length; i++) {
      const x = positions[i * 3]
      if (x < xMin) xMin = x
      if (x > xMax) xMax = x
    }

    const waveFrontX = xMin + progress * (xMax - xMin)
    let changed = false

    for (let i = 0; i < data.grants.length; i++) {
      const x = positions[i * 3]
      if (x <= waveFrontX) {
        const y = positions[i * 3 + 1]
        mesh.setColorAt(i, heightColor(y, zMin, zMax))
        changed = true
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
  const hoveredPos =
    hovered !== null
      ? new THREE.Vector3(
          layout.positions[hovered * 3],
          layout.positions[hovered * 3 + 1],
          layout.positions[hovered * 3 + 2]
        )
      : null

  const deiLabel: Record<string, string> = {
    none: "No DEI flag",
    fox: "Fox flagged",
    gpt: "ChatGPT flagged",
    both: "Both flagged",
  }

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, data.grants.length]}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial roughness={0.4} metalness={0.3} />
      </instancedMesh>

      {hoveredGrant && hoveredPos && (
        <Html position={[hoveredPos.x, hoveredPos.y + 0.5, hoveredPos.z]} center>
          <div
            style={{
              background: "rgba(0,0,0,0.9)",
              color: "#fff",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "11px",
              lineHeight: 1.5,
              maxWidth: "260px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 3 }}>{hoveredGrant.t}</div>
            <div style={{ opacity: 0.8, fontSize: 10 }}>{hoveredGrant.r}</div>
            <div style={{ opacity: 0.7, marginTop: 3, fontSize: 10 }}>
              {data.categories[hoveredGrant.c]} &middot;{" "}
              {hoveredGrant.a > 0
                ? "$" + hoveredGrant.a.toLocaleString()
                : "Amount unknown"}
            </div>
            <div style={{ marginTop: 3, fontSize: 10 }}>
              <span
                style={{
                  color: hoveredGrant.x ? "#ef4444" : "#22c55e",
                  fontWeight: 600,
                }}
              >
                {hoveredGrant.x ? "Terminated" : "Kept"}
              </span>
              {" · "}
              {deiLabel[hoveredGrant.d] || "No DEI flag"}
              {hoveredGrant.ep ? ` · EP: ${hoveredGrant.ep}` : ""}
            </div>
          </div>
        </Html>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Scene                                                              */
/* ------------------------------------------------------------------ */

export function GrantGalaxyScene({ data, animKey, playing, onAnimEnd }: SceneProps) {
  const layout = useMemo(
    () => computeLayout(data.grants, data.categories.length),
    [data.grants, data.categories.length]
  )

  const numCats = data.categories.length
  const gridWidth = numCats * 1.8 + 4
  const gridDepth = 3 * 2.5 + 2

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [8, 6, 18], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 15, 10]} intensity={0.9} />
      <pointLight position={[-10, -10, 5]} intensity={0.3} />

      {/* Zero-plane: the termination line */}
      <ZeroPlane width={gridWidth} depth={gridDepth} />

      {/* Subtle grid at y=0 */}
      <Grid
        position={[0, 0, gridDepth / 2 - 0.5]}
        args={[gridWidth, gridDepth]}
        cellSize={1.8}
        cellThickness={0.5}
        cellColor="#334155"
        sectionSize={1.8 * 4}
        sectionThickness={1}
        sectionColor="#475569"
        fadeDistance={40}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* Axis labels */}
      <AxisLabels
        categories={data.categories}
        spendLabels={data.spendLabels}
        numCategories={numCats}
        zMin={layout.zMin}
        zMax={layout.zMax}
      />

      {/* Grant particles */}
      <Particles data={data} animKey={animKey} playing={playing} onAnimEnd={onAnimEnd} />

      <OrbitControls
        autoRotate
        autoRotateSpeed={0.2}
        enableDamping
        minDistance={5}
        maxDistance={50}
        target={[0, -2, 2]}
      />
    </Canvas>
  )
}

export default GrantGalaxyScene
