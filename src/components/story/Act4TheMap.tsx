import { Suspense, lazy, useEffect, useState } from "react"
import { ScrollySection, type ScrollyStep } from "./ScrollySection"

/* ------------------------------------------------------------------ */
/*  Data types                                                         */
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

interface MapData {
  states: MapState[]
  flyoverStops: FlyoverStop[]
}

/* ------------------------------------------------------------------ */
/*  Lazy-load both map implementations                                 */
/* ------------------------------------------------------------------ */

const DotMap = lazy(() => import("./maps/DotMapVersion"))
const AerialMap = lazy(() => import("./maps/AerialMapVersion"))

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const steps: ScrollyStep[] = [
  {
    id: "map-0",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">Every state was hit.</p>
        <p className="mt-2 text-gray-300">
          Terminated grants span institutions in all 50 states, tribal nations,
          and U.S. territories. This is not a regional story — it is a national
          one.
        </p>
      </div>
    ),
  },
  {
    id: "map-1",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-lg font-bold text-amber-400">
          Tribal Nations & Indigenous Communities
        </p>
        <p className="mt-2 text-gray-300">
          Language preservation projects at the Fort Sill Apache Tribe.
          Community heritage programs at the Port Gamble S&apos;Klallam Tribe.
          Cultural resilience grants at Tribal Colleges across the Southwest.
          All terminated.
        </p>
      </div>
    ),
  },
  {
    id: "map-2",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-lg font-bold text-blue-400">
          HBCUs & Minority-Serving Institutions
        </p>
        <p className="mt-2 text-gray-300">
          Programs at Historically Black Colleges, Hispanic-Serving
          Institutions, and Tribal Colleges — many receiving their first federal
          humanities funding — saw grants terminated at higher rates than
          flagship universities.
        </p>
      </div>
    ),
  },
  {
    id: "map-3",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-lg font-bold text-green-400">
          State Humanities Councils
        </p>
        <p className="mt-2 text-gray-300">
          $187 million in state council funding terminated — the largest single
          category. These councils run local programs in every state: reading
          groups, speaker series, teacher workshops, community archives.
        </p>
      </div>
    ),
  },
  {
    id: "map-4",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-lg font-bold text-purple-400">
          Research Universities
        </p>
        <p className="mt-2 text-gray-300">
          Major research institutions saw dozens of grants each terminated: Yale,
          Michigan, Indiana, UCLA. Projects ranging from ancient archaeology to
          Civil War archives to digital newspaper preservation.
        </p>
      </div>
    ),
  },
  {
    id: "map-5",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">
          This was not a targeted review.
        </p>
        <p className="mt-2 text-gray-300">
          It was a blanket termination across every type of institution, in every
          region, covering every area of the humanities. The geographic spread
          alone undermines any claim of principled selection.
        </p>
      </div>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Map toggle                                                         */
/* ------------------------------------------------------------------ */

type MapVersion = "dot" | "aerial"

export function Act4TheMap() {
  const [data, setData] = useState<MapData | null>(null)
  const [version, setVersion] = useState<MapVersion>("dot")

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "story/act4_map.json")
      .then((r) => r.json())
      .then((d: MapData) => setData(d))
      .catch(console.error)
  }, [])

  if (!data) {
    return (
      <section className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading map data...</p>
      </section>
    )
  }

  return (
    <section>
      <div className="py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-500">
          Act IV
        </p>
        <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
          Across the Nation
        </h2>

        {/* Map version toggle */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              version === "dot"
                ? "bg-white text-black"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
            onClick={() => setVersion("dot")}
          >
            Dot Map
          </button>
          <button
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              version === "aerial"
                ? "bg-white text-black"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
            onClick={() => setVersion("aerial")}
          >
            Aerial View
          </button>
        </div>
      </div>

      <ScrollySection
        steps={steps}
        renderVisual={(activeStep) => (
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-black text-gray-500">
                Loading map...
              </div>
            }
          >
            {version === "dot" ? (
              <DotMap data={data} activeStep={activeStep} />
            ) : (
              <AerialMap data={data} activeStep={activeStep} />
            )}
          </Suspense>
        )}
        visualPosition="background"
      />
    </section>
  )
}
