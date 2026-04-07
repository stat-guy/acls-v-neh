import { motion } from "framer-motion"
import { ScrollySection, type ScrollyStep } from "./ScrollySection"

/* ------------------------------------------------------------------ */
/*  Chain of command data                                              */
/* ------------------------------------------------------------------ */

interface ChainActor {
  name: string
  role: string
  org: "doge" | "neh" | "whitehouse"
  detail: string
  image?: string
}

const IMG = "story/images/"

const LAYERS: { level: string; actors: ChainActor[] }[] = [
  {
    level: "White House",
    actors: [
      {
        name: "Executive Order",
        role: "Presidential Directive",
        org: "whitehouse",
        detail: "EO on DEI directed agencies to eliminate DEI programs",
        image: IMG + "trump-eo.png",
      },
    ],
  },
  {
    level: "DOGE Operatives",
    actors: [
      {
        name: "Justin Fox",
        role: "DOGE Team Lead at NEH",
        org: "doge",
        detail: "25-year-old operative with no humanities background. Reviewed all 2,415 grants in days.",
        image: IMG + "fox-deposition.png",
      },
      {
        name: "Nate Cavanaugh",
        role: "DOGE Support",
        org: "doge",
        detail: "Assisted Fox with the grant review process and ChatGPT screening.",
        image: IMG + "cavanaugh-deposition.png",
      },
    ],
  },
  {
    level: "NEH Leadership",
    actors: [
      {
        name: "Adam Wolfson",
        role: "Senior Deputy Chairman",
        org: "neh",
        detail: "Political appointee who oversaw compliance with DOGE directives.",
        image: IMG + "wolfson-deposition.png",
      },
      {
        name: "Michael McDonald",
        role: "Deputy Chairman",
        org: "neh",
        detail: "Career official involved in 26 documented actions during the termination period.",
        image: IMG + "mcdonald-deposition.png",
      },
    ],
  },
  {
    level: "NEH Career Staff",
    actors: [
      {
        name: "Brett Bobley",
        role: "Office of Digital Humanities",
        org: "neh",
        detail: "Staff who rated grants as having no DEI connection — overridden by Fox.",
      },
      {
        name: "Program Officers",
        role: "Subject Matter Experts",
        org: "neh",
        detail: "Career professionals whose expertise was bypassed in the review process.",
      },
    ],
  },
]

const ORG_COLORS: Record<string, string> = {
  whitehouse: "#f59e0b",
  doge: "#ef4444",
  neh: "#3b82f6",
}

/* ------------------------------------------------------------------ */
/*  Chain Visual                                                       */
/* ------------------------------------------------------------------ */

function ChainVisual({ activeStep }: { activeStep: string | null }) {
  const stepIndex: Record<string, number> = {
    "chain-0": -1,
    "chain-1": 0,
    "chain-2": 1,
    "chain-3": 2,
    "chain-4": 3,
    "chain-5": 4,
  }

  const activeLayerIdx = stepIndex[activeStep ?? "chain-0"] ?? -1

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black px-4 py-8">
      <div className="w-full max-w-lg space-y-3">
        {LAYERS.map((layer, layerIdx) => {
          const isRevealed = layerIdx <= activeLayerIdx
          const isActive = layerIdx === activeLayerIdx

          return (
            <motion.div
              key={layer.level}
              initial={{ opacity: 0, x: -30 }}
              animate={{
                opacity: isRevealed ? 1 : 0.15,
                x: isRevealed ? 0 : -30,
                scale: isActive ? 1.02 : 1,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Connector line */}
              {layerIdx > 0 && (
                <div className="mx-auto mb-1 flex w-8 flex-col items-center">
                  <motion.div
                    className="h-6 w-0.5"
                    style={{
                      backgroundColor: isRevealed
                        ? "#ef4444"
                        : "#1e293b",
                    }}
                    animate={{
                      scaleY: isRevealed ? 1 : 0,
                    }}
                    transition={{ duration: 0.4 }}
                  />
                  <motion.div
                    className="text-xs"
                    animate={{ opacity: isRevealed ? 0.6 : 0 }}
                  >
                    ▼
                  </motion.div>
                </div>
              )}

              <div
                className={`rounded-xl border p-4 transition-colors duration-500 ${
                  isActive
                    ? "border-gray-600 bg-gray-900"
                    : "border-gray-800/50 bg-gray-950/50"
                }`}
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {layer.level}
                </p>
                <div className="space-y-3">
                  {layer.actors.map((actor) => (
                    <div key={actor.name} className="flex items-start gap-3">
                      {actor.image ? (
                        <img
                          src={import.meta.env.BASE_URL + actor.image}
                          alt={actor.name}
                          className="mt-0.5 h-10 w-10 flex-shrink-0 rounded-full object-cover border-2"
                          style={{
                            borderColor: ORG_COLORS[actor.org],
                            opacity: isRevealed ? 1 : 0.3,
                          }}
                        />
                      ) : (
                        <div
                          className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor: ORG_COLORS[actor.org],
                            opacity: isRevealed ? 1 : 0.3,
                          }}
                        />
                      )}
                      <div>
                        <p className="text-sm font-bold text-white">
                          {actor.name}
                        </p>
                        <p className="text-xs text-gray-400">{actor.role}</p>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-1 text-xs text-gray-500"
                          >
                            {actor.detail}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const steps: ScrollyStep[] = [
  {
    id: "chain-0",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">
          Who made the decision to terminate 1,477 grants?
        </p>
        <p className="mt-2 text-gray-300">
          The answer traces through four layers of authority — from the White
          House to the career staff whose expertise was overridden.
        </p>
      </div>
    ),
  },
  {
    id: "chain-1",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-lg font-bold text-amber-400">The Directive</p>
        <p className="mt-2 text-gray-300">
          The executive order directed agencies to eliminate DEI-related
          programs. But the NEH doesn&apos;t run DEI programs — it funds
          humanities research, preservation, and education.
        </p>
      </div>
    ),
  },
  {
    id: "chain-2",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-lg font-bold text-red-400">The Operatives</p>
        <p className="mt-2 text-gray-300">
          DOGE sent Justin Fox, 25, to NEH. Fox had no experience with
          humanities funding. He used ChatGPT to screen grants, then overrode
          its results when they didn&apos;t flag enough grants as DEI.
        </p>
      </div>
    ),
  },
  {
    id: "chain-3",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-lg font-bold text-blue-400">The Compliance</p>
        <p className="mt-2 text-gray-300">
          NEH leadership — including appointee Adam Wolfson and career official
          Michael McDonald — carried out Fox&apos;s recommendations. McDonald
          alone was involved in 26 documented actions.
        </p>
      </div>
    ),
  },
  {
    id: "chain-4",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-lg font-bold text-blue-400">The Overridden</p>
        <p className="mt-2 text-gray-300">
          NEH career staff — program officers with decades of expertise — had
          rated nearly every grant as having no DEI connection. Their
          professional judgment was systematically bypassed.
        </p>
      </div>
    ),
  },
  {
    id: "chain-5",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">
          The result: a 25-year-old&apos;s judgment replaced decades of
          professional expertise.
        </p>
        <p className="mt-2 text-gray-300">
          No subject matter expert was consulted. No cost-benefit analysis was
          performed. The entire review took 22 days.
        </p>
      </div>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export function Act3WhoDecided() {
  return (
    <section>
      <div className="py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-500">
          Act III
        </p>
        <h2 className="mt-4 text-3xl font-bold sm:text-5xl">Who Decided?</h2>
      </div>
      <ScrollySection
        steps={steps}
        renderVisual={(activeStep) => (
          <ChainVisual activeStep={activeStep} />
        )}
        visualPosition="left"
      />
    </section>
  )
}
