import { Suspense, lazy, useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const Scene = lazy(() => import("./GrantGalaxyScene"))

interface GalaxyGrant {
  id: string
  t: string
  r: string
  c: number
  s: number
  z: number
  a: number
  x: number
  d: string
  ep: string
}

interface GalaxyData {
  grants: GalaxyGrant[]
  categories: string[]
  spendLabels: string[]
}

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center text-muted-foreground">
      <div className="text-center">
        <div className="mb-2 text-lg">Loading 3D visualization...</div>
        <div className="text-sm">2,415 grant particles</div>
      </div>
    </div>
  )
}

export function GrantGalaxy() {
  const [data, setData] = useState<GalaxyData | null>(null)
  const [playing, setPlaying] = useState(false)
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "galaxy.json")
      .then((r) => r.json())
      .then((d: GalaxyData) => setData(d))
      .catch((e) => console.error("Failed to load galaxy data:", e))
  }, [])

  const handlePlay = useCallback(() => {
    setPlaying(true)
    setAnimKey((k) => k + 1)
  }, [])

  const handleAnimEnd = useCallback(() => {
    setPlaying(false)
  }, [])

  return (
    <section id="galaxy" className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
          The Grant Galaxy
        </h2>
        <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
          2,415 NEH grants in 3D. Above the zero line: grants that survived.
          Below: grants terminated. Color encodes funding impact — deep blue
          marks the heaviest losses. Rotate to explore by program and spend
          status.
        </p>
      </div>

      <div className="glass-card overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "#1e3a8a" }}
              />
              Large loss
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "#0ea5e9" }}
              />
              Moderate loss
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "#22c55e" }}
              />
              Near zero / Kept
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: "#eab308" }}
              />
              Kept (funded)
            </span>
          </div>
          <Button size="sm" onClick={handlePlay} disabled={!data || playing}>
            {playing ? "Playing..." : "Play Reveal Wave"}
          </Button>
        </div>

        <div className="h-[450px] sm:h-[550px]">
          {data ? (
            <Suspense fallback={<LoadingFallback />}>
              <Scene
                data={data}
                animKey={animKey}
                playing={playing}
                onAnimEnd={handleAnimEnd}
              />
            </Suspense>
          ) : (
            <LoadingFallback />
          )}
        </div>

        <div className="border-t border-border/50 px-4 py-2.5 text-center text-xs text-muted-foreground">
          <strong>X:</strong> Program Category &nbsp;|&nbsp; <strong>Y:</strong>{" "}
          Spend Status &nbsp;|&nbsp; <strong>Z (height):</strong> Funding Impact
          (+ kept, - terminated) &nbsp;|&nbsp; Drag to rotate, scroll to zoom
        </div>
      </div>
    </section>
  )
}

export default GrantGalaxy
