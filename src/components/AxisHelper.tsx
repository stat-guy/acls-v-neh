import { useMemo } from "react"
import { Html } from "@react-three/drei"
import * as THREE from "three"

interface AxisHelperProps {
  size?: number
  labels?: { x?: string; y?: string; z?: string }
}

export function AxisHelper({ size = 5, labels = {} }: AxisHelperProps) {
  const axes = useMemo(() => [
    { dir: new THREE.Vector3(1, 0, 0), color: "#ef4444", label: labels.x || "X" },
    { dir: new THREE.Vector3(0, 1, 0), color: "#22c55e", label: labels.y || "Y" },
    { dir: new THREE.Vector3(0, 0, 1), color: "#3b82f6", label: labels.z || "Z" },
  ], [labels.x, labels.y, labels.z])

  return (
    <group>
      {axes.map(({ dir, color, label }) => {
        const end = dir.clone().multiplyScalar(size)
        const points = [new THREE.Vector3(0, 0, 0), end]
        const geometry = new THREE.BufferGeometry().setFromPoints(points)

        return (
          <group key={label}>
            <line>
              <primitive object={geometry} attach="geometry" />
              <lineBasicMaterial color={color} transparent opacity={0.4} />
            </line>
            {/* Axis label */}
            <Html
              position={[end.x * 1.12, end.y * 1.12, end.z * 1.12]}
              center
              style={{ pointerEvents: "none" }}
            >
              <span
                className="select-none rounded px-1.5 py-0.5 text-[10px] font-medium"
                style={{ color, opacity: 0.7 }}
              >
                {label}
              </span>
            </Html>
          </group>
        )
      })}
    </group>
  )
}
