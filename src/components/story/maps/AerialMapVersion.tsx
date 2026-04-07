import { memo, useEffect, useMemo, useRef } from "react"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
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

interface AerialMapProps {
  data: { states: MapState[]; flyoverStops: FlyoverStop[] }
  activeStep: string | null
}

/* ------------------------------------------------------------------ */
/*  View states per step                                               */
/* ------------------------------------------------------------------ */

interface ViewState {
  center: [number, number]
  zoom: number
  pitch: number
  bearing: number
}

const VIEWS: Record<string, ViewState> = {
  "map-0": { center: [-96, 38], zoom: 3.5, pitch: 0, bearing: 0 },
  "map-1": { center: [-105, 36.5], zoom: 5.5, pitch: 45, bearing: -20 },
  "map-2": { center: [-85, 33.5], zoom: 5, pitch: 40, bearing: 10 },
  "map-3": { center: [-96, 38], zoom: 3.5, pitch: 20, bearing: 0 },
  "map-4": { center: [-83, 42], zoom: 5, pitch: 45, bearing: -15 },
  "map-5": { center: [-96, 38], zoom: 3.5, pitch: 30, bearing: 15 },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function AerialMapInner({ data, activeStep }: AerialMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])

  const maxCount = useMemo(
    () => Math.max(...data.states.map((s) => s.count), 1),
    [data.states],
  )

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution: "&copy; CARTO &copy; OpenStreetMap",
          },
        },
        layers: [
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [-96, 38],
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
      interactive: true,
    })

    map.on("load", () => {
      // Add state markers
      data.states.forEach((state) => {
        const size = 12 + (state.count / maxCount) * 40
        const el = document.createElement("div")
        el.style.width = `${size}px`
        el.style.height = `${size}px`
        el.style.borderRadius = "50%"
        el.style.backgroundColor = "rgba(239, 68, 68, 0.7)"
        el.style.border = "2px solid rgba(239, 68, 68, 0.4)"
        el.style.display = "flex"
        el.style.alignItems = "center"
        el.style.justifyContent = "center"
        el.style.cursor = "pointer"
        el.style.transition = "transform 0.3s ease"

        if (state.count > 15) {
          el.innerHTML = `<span style="color:white;font-size:10px;font-weight:700;font-family:monospace">${state.count}</span>`
        }

        el.title = `${state.name}: ${state.count} grants terminated ($${(state.amount / 1_000_000).toFixed(1)}M)`

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([state.lng, state.lat])
          .addTo(map)

        markersRef.current.push(marker)
      })
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [data.states, maxCount])

  // Fly to view on step change
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const view = VIEWS[activeStep ?? "map-0"] ?? VIEWS["map-0"]

    map.flyTo({
      center: view.center,
      zoom: view.zoom,
      pitch: view.pitch,
      bearing: view.bearing,
      duration: 2000,
      essential: true,
    })
  }, [activeStep])

  // Active flyover stop info
  const activeStop = useMemo(() => {
    if (activeStep === "map-1") return data.flyoverStops[0]
    if (activeStep === "map-2") return data.flyoverStops[1]
    return null
  }, [activeStep, data.flyoverStops])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />

      {/* Info overlay */}
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
            <p className="mt-1 text-xs text-gray-400">
              {activeStop.description}
            </p>
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

export default memo(AerialMapInner)
