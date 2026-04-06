import { Suspense, lazy, useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const Scene = lazy(() => import("./GrantGalaxyScene"))

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
          Each particle represents one of 2,415 NEH grants. Red = terminated.
          Green = kept. Watch the termination wave sweep across 22 days of
          decisions.
        </p>
      </div>

      <div className="glass-card overflow-hidden rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="flex flex-wrap gap-4 text-xs sm:text-sm">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
              Terminated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
              Kept
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-gray-500" />
              Not reviewed
            </span>
          </div>
          <Button
            size="sm"
            onClick={handlePlay}
            disabled={!data || playing}
          >
            {playing ? "Playing..." : "Play Termination Wave"}
          </Button>
        </div>

        <div className="h-[400px] sm:h-[500px]">
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
      </div>
    </section>
  )
}

export default GrantGalaxy
