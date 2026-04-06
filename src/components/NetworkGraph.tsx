import React, { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Line, Html } from "@react-three/drei"
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import * as THREE from "three"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NetworkNode {
  id: string
  role: string
  organization: string
  group: "doge" | "neh" | "whitehouse" | "other"
  weight: number
}

interface NetworkEdge {
  source: string
  target: string
  weight: number
  type: "directive" | "compliance" | "reporting" | "neutral"
}

interface NetworkData {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
}

interface SimNode extends NetworkNode {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GROUP_COLORS: Record<string, string> = {
  doge: "#ef4444",
  neh: "#3b82f6",
  whitehouse: "#f59e0b",
  other: "#6b7280",
}

const EDGE_COLORS: Record<string, string> = {
  directive: "#ef4444",
  compliance: "#3b82f6",
  reporting: "#f59e0b",
  neutral: "#6b7280",
}

function nodeRadius(weight: number, minW: number, maxW: number): number {
  if (maxW === minW) return 0.6
  const t = (weight - minW) / (maxW - minW)
  return 0.3 + t * 1.2
}

/* ------------------------------------------------------------------ */
/*  Force-directed layout (runs imperatively, not per-frame)           */
/* ------------------------------------------------------------------ */

function runForceLayout(nodes: SimNode[], edges: NetworkEdge[], iterations: number) {
  const REPULSION = 8
  const ATTRACTION = 0.005
  const DAMPING = 0.9
  const MAX_DISPLACEMENT = 1.5

  const idxMap = new Map<string, number>()
  nodes.forEach((n, i) => idxMap.set(n.id, i))

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x
        const dy = nodes[i].y - nodes[j].y
        const dz = nodes[i].z - nodes[j].z
        const dist2 = dx * dx + dy * dy + dz * dz + 0.01
        const dist = Math.sqrt(dist2)
        const force = REPULSION / dist2
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        const fz = (dz / dist) * force
        nodes[i].vx += fx
        nodes[i].vy += fy
        nodes[i].vz += fz
        nodes[j].vx -= fx
        nodes[j].vy -= fy
        nodes[j].vz -= fz
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const si = idxMap.get(edge.source)
      const ti = idxMap.get(edge.target)
      if (si === undefined || ti === undefined) continue
      const dx = nodes[ti].x - nodes[si].x
      const dy = nodes[ti].y - nodes[si].y
      const dz = nodes[ti].z - nodes[si].z
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz + 0.01)
      const force = dist * ATTRACTION * (edge.weight || 1)
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      const fz = (dz / dist) * force
      nodes[si].vx += fx
      nodes[si].vy += fy
      nodes[si].vz += fz
      nodes[ti].vx -= fx
      nodes[ti].vy -= fy
      nodes[ti].vz -= fz
    }

    // Apply velocities with damping
    const cooling = 1 - iter / iterations
    for (const n of nodes) {
      n.vx *= DAMPING
      n.vy *= DAMPING
      n.vz *= DAMPING
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy + n.vz * n.vz)
      const maxD = MAX_DISPLACEMENT * cooling
      if (speed > maxD) {
        const scale = maxD / speed
        n.vx *= scale
        n.vy *= scale
        n.vz *= scale
      }
      n.x += n.vx
      n.y += n.vy
      n.z += n.vz
    }
  }
}

/* ------------------------------------------------------------------ */
/*  3D Node Component                                                  */
/* ------------------------------------------------------------------ */

interface NodeMeshProps {
  node: SimNode
  radius: number
  color: string
  isHighlighted: boolean
  onHover: (id: string | null) => void
  onClick: (id: string) => void
}

function NodeMesh({ node, radius, color, isHighlighted, onHover, onClick }: NodeMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const handlePointerOver = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setHovered(true)
      onHover(node.id)
      document.body.style.cursor = "pointer"
    },
    [node.id, onHover],
  )

  const handlePointerOut = useCallback(() => {
    setHovered(false)
    onHover(null)
    document.body.style.cursor = "auto"
  }, [onHover])

  const handleClick = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      onClick(node.id)
    },
    [node.id, onClick],
  )

  const emissiveColor = useMemo(() => new THREE.Color(color), [color])
  const scale = hovered || isHighlighted ? 1.2 : 1

  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh
        ref={meshRef}
        scale={scale}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={hovered || isHighlighted ? 0.6 : 0.2}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={10} zIndexRange={[100, 0]} center style={{ pointerEvents: "none" }}>
          <div className="rounded-lg border border-border/60 bg-background/90 px-3 py-2 shadow-lg backdrop-blur-sm"
            style={{ whiteSpace: "nowrap" }}
          >
            <p className="text-sm font-semibold text-foreground">{node.id}</p>
            <p className="text-xs text-muted-foreground">{node.role}</p>
            <p className="text-xs text-muted-foreground">{node.organization}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  3D Edge Component                                                  */
/* ------------------------------------------------------------------ */

interface EdgeLineProps {
  source: SimNode
  target: SimNode
  edge: NetworkEdge
  isHighlighted: boolean
  maxWeight: number
}

function EdgeLine({ source, target, edge, isHighlighted, maxWeight }: EdgeLineProps) {
  const color = EDGE_COLORS[edge.type] ?? "#6b7280"
  const opacity = isHighlighted ? 0.9 : 0.15 + (edge.weight / maxWeight) * 0.5
  const lineWidth = isHighlighted ? 2 : 0.5 + (edge.weight / maxWeight) * 2

  const points: [number, number, number][] = useMemo(
    () => [
      [source.x, source.y, source.z],
      [target.x, target.y, target.z],
    ],
    [source.x, source.y, source.z, target.x, target.y, target.z],
  )

  const dashProps = edge.type === "reporting" ? { dashed: true, dashSize: 0.3, gapSize: 0.15 } : {}

  return (
    <Line
      points={points}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      {...dashProps}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Scene (contains nodes + edges + controls)                          */
/* ------------------------------------------------------------------ */

interface SceneProps {
  data: NetworkData
}

function Scene({ data }: SceneProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [, setHoveredNode] = useState<string | null>(null)

  // Build simulation nodes with force layout
  const { simNodes, minWeight, maxWeight, maxEdgeWeight } = useMemo(() => {
    const minW = Math.min(...data.nodes.map((n) => n.weight))
    const maxW = Math.max(...data.nodes.map((n) => n.weight))
    const maxEW = Math.max(...data.edges.map((e) => e.weight), 1)

    // Deterministic seed based on node id for reproducible layout
    const seed = (s: string) => {
      let h = 0
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
      return ((h & 0x7fffffff) / 0x7fffffff) - 0.5
    }
    const sn: SimNode[] = data.nodes.map((n, i) => ({
      ...n,
      x: seed(n.id + "x" + i) * 6,
      y: seed(n.id + "y" + i) * 6,
      z: seed(n.id + "z" + i) * 3,
      vx: 0,
      vy: 0,
      vz: 0,
    }))

    runForceLayout(sn, data.edges, 150)
    return { simNodes: sn, minWeight: minW, maxWeight: maxW, maxEdgeWeight: maxEW }
  }, [data])

  const nodeMap = useMemo(() => {
    const m = new Map<string, SimNode>()
    for (const n of simNodes) m.set(n.id, n)
    return m
  }, [simNodes])

  // Edges connected to selected node
  const connectedEdgeSet = useMemo(() => {
    if (!selectedNode) return new Set<number>()
    const s = new Set<number>()
    data.edges.forEach((e, i) => {
      if (e.source === selectedNode || e.target === selectedNode) s.add(i)
    })
    return s
  }, [selectedNode, data.edges])

  const handleNodeClick = useCallback((id: string) => {
    setSelectedNode((prev) => (prev === id ? null : id))
  }, [])

  const handleHover = useCallback((id: string | null) => {
    setHoveredNode(id)
  }, [])

  // Deselect when clicking background
  const handlePointerMissed = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Slow auto-rotate, stops on interaction
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update()
    }
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} />

      <group onPointerMissed={handlePointerMissed}>
        {/* Edges */}
        {data.edges.map((edge, i) => {
          const src = nodeMap.get(edge.source)
          const tgt = nodeMap.get(edge.target)
          if (!src || !tgt) return null
          return (
            <EdgeLine
              key={`${edge.source}-${edge.target}-${i}`}
              source={src}
              target={tgt}
              edge={edge}
              isHighlighted={connectedEdgeSet.has(i)}
              maxWeight={maxEdgeWeight}
            />
          )
        })}

        {/* Nodes */}
        {simNodes.map((node) => (
          <NodeMesh
            key={node.id}
            node={node}
            radius={nodeRadius(node.weight, minWeight, maxWeight)}
            color={GROUP_COLORS[node.group] ?? "#6b7280"}
            isHighlighted={
              selectedNode === node.id ||
              (selectedNode !== null &&
                data.edges.some(
                  (e) =>
                    (e.source === selectedNode && e.target === node.id) ||
                    (e.target === selectedNode && e.source === node.id),
                ))
            }
            onHover={handleHover}
            onClick={handleNodeClick}
          />
        ))}
      </group>

      <OrbitControls
        ref={controlsRef}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.1}
        minDistance={5}
        maxDistance={30}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Legend                                                              */
/* ------------------------------------------------------------------ */

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground">Nodes:</span>
        {[
          { label: "DOGE", color: "#ef4444" },
          { label: "NEH", color: "#3b82f6" },
          { label: "White House", color: "#f59e0b" },
          { label: "Other", color: "#6b7280" },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="font-medium text-foreground">Edges:</span>
        {[
          { label: "Directive", color: "#ef4444", dashed: false },
          { label: "Compliance", color: "#3b82f6", dashed: false },
          { label: "Reporting", color: "#f59e0b", dashed: true },
          { label: "Neutral", color: "#6b7280", dashed: false },
        ].map((item) => (
          <span key={item.label} className="flex items-center gap-1">
            <span
              className="inline-block h-0.5 w-4"
              style={{
                backgroundColor: item.color,
                borderTop: item.dashed ? `2px dashed ${item.color}` : undefined,
                height: item.dashed ? 0 : undefined,
              }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading Spinner                                                    */
/* ------------------------------------------------------------------ */

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Exported Component                                            */
/* ------------------------------------------------------------------ */

export function NetworkGraph() {
  const [data, setData] = useState<NetworkData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "network.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load network.json (${res.status})`)
        return res.json() as Promise<NetworkData>
      })
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unknown error"))
  }, [])

  return (
    <section id="network" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Mapping the Operation</h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
          The chain of command behind the grant terminations. Node size reflects involvement. Red
          lines show DOGE directives flowing to NEH; blue lines show NEH compliance.
        </p>
      </div>

      <div className="glass-card overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="h-[400px] sm:h-[500px]">
          {error ? (
            <div className="flex h-full items-center justify-center text-sm text-destructive">
              {error}
            </div>
          ) : !data ? (
            <LoadingSpinner />
          ) : (
            <React.Suspense fallback={<LoadingSpinner />}>
              <Canvas
                dpr={[1, 2]}
                gl={{ antialias: true, alpha: true }}
                camera={{ position: [0, 0, 15], fov: 50 }}
                style={{ background: "transparent" }}
              >
                <Scene data={data} />
              </Canvas>
            </React.Suspense>
          )}
        </div>
        <div className="border-t border-border/50 px-4 py-3">
          <Legend />
        </div>
      </div>
    </section>
  )
}

export default NetworkGraph
