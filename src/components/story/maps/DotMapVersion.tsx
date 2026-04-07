import { memo, useEffect, useMemo, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MapState {
  id: string
  name: string
  lat: number
  lng: number
  count: number
  amount: number
  highlights: string[]
}

interface FlyoverStop {
  name: string
  lat: number
  lng: number
  grants: { title: string; recipient: string; amount: number }[]
  description: string
}

interface DotMapProps {
  data: { states: MapState[]; flyoverStops: FlyoverStop[] }
  activeStep: string | null
}

/* ------------------------------------------------------------------ */
/*  US state positions (approximate x,y for a simple projection)       */
/* ------------------------------------------------------------------ */

// AlbersUSA-like positions scaled to 960x600 viewbox
const STATE_POS: Record<string, [number, number]> = {
  AL: [628, 420], AK: [161, 497], AZ: [222, 410], AR: [530, 390],
  CA: [112, 320], CO: [310, 310], CT: [830, 200], DE: [800, 270],
  FL: [720, 490], GA: [680, 410], HI: [280, 530], ID: [210, 190],
  IL: [570, 280], IN: [610, 275], IA: [510, 240], KS: [430, 330],
  KY: [640, 320], LA: [530, 460], ME: [860, 120], MD: [780, 270],
  MA: [845, 190], MI: [610, 200], MN: [480, 160], MS: [570, 430],
  MO: [520, 320], MT: [280, 140], NE: [410, 260], NV: [160, 280],
  NH: [840, 165], NJ: [810, 250], NM: [280, 400], NY: [790, 180],
  NC: [740, 340], ND: [400, 150], OH: [650, 260], OK: [430, 380],
  OR: [130, 170], PA: [760, 230], RI: [850, 200], SC: [720, 370],
  SD: [400, 200], TN: [620, 360], TX: [400, 450], UT: [230, 300],
  VT: [830, 150], VA: [740, 300], WA: [150, 110], WV: [700, 290],
  WI: [530, 175], WY: [300, 230], DC: [785, 275],
  PR: [830, 510], GU: [170, 560],
}

/* ------------------------------------------------------------------ */
/*  Canvas-based dot map                                               */
/* ------------------------------------------------------------------ */

function DotMapInner({ data, activeStep }: DotMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const maxCount = useMemo(
    () => Math.max(...data.states.map((s) => s.count), 1),
    [data.states],
  )

  const isHighlightAll =
    activeStep === "map-0" ||
    activeStep === "map-3" ||
    activeStep === "map-5"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const W = 960
    const H = 600
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = "100%"
    canvas.style.height = "auto"
    canvas.style.maxHeight = "100%"

    ctx.clearRect(0, 0, W, H)

    // Draw each state dot
    for (const state of data.states) {
      const pos = STATE_POS[state.id]
      if (!pos) continue

      const [x, y] = pos
      const radius = 5 + (state.count / maxCount) * 25
      const alpha = isHighlightAll ? 0.85 : 0.4

      // Glow
      ctx.beginPath()
      ctx.arc(x, y, radius + 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.2})`
      ctx.fill()

      // Main dot
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`
      ctx.fill()

      // Border
      ctx.strokeStyle = `rgba(239, 68, 68, ${alpha * 0.5})`
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Label for large dots
      if (state.count > 15) {
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 10px monospace"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(String(state.count), x, y)
      }
    }

    // Draw US outline (simplified)
    ctx.strokeStyle = "rgba(100, 116, 139, 0.3)"
    ctx.lineWidth = 1
    ctx.strokeRect(60, 60, 820, 480)
  }, [data.states, maxCount, isHighlightAll])

  // Active flyover stop
  const activeStop = useMemo(() => {
    if (!data.flyoverStops) return null
    if (activeStep === "map-1") return data.flyoverStops[0]
    if (activeStep === "map-2") return data.flyoverStops[1]
    return null
  }, [activeStep, data.flyoverStops])

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-black p-8">
      <canvas ref={canvasRef} className="max-h-full" />

      {/* Info card overlay */}
      <AnimatePresence>
        {activeStop && (
          <motion.div
            key={activeStop.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-8 right-8 max-w-xs rounded-xl border border-gray-700 bg-gray-900/95 p-4 backdrop-blur"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {activeStop.name}
            </p>
            {activeStop.description && (
              <p className="mt-1 text-xs text-gray-400">
                {activeStop.description}
              </p>
            )}
            <ul className="mt-2 space-y-1">
              {activeStop.grants.slice(0, 3).map((g) => (
                <li key={g.title} className="text-xs text-gray-300">
                  <span className="text-gray-500">{g.recipient}</span>
                  {" — "}
                  {g.title.slice(0, 60)}
                  {g.title.length > 60 ? "..." : ""}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(DotMapInner)
