import { motion } from "framer-motion"
import { ScrollySection, type ScrollyStep } from "./ScrollySection"

/* ------------------------------------------------------------------ */
/*  Contradiction data                                                 */
/* ------------------------------------------------------------------ */

interface Contradiction {
  id: number
  witness: string
  topic: string
  underOath: string
  citation: string
  reality: string
  exhibit: string
}

const CONTRADICTIONS: Contradiction[] = [
  {
    id: 1,
    witness: "Justin Fox",
    topic: "Who made the decisions?",
    underOath:
      "We present [our interpretation] back to the agency leads, who ultimately make the final decision.",
    citation: "Fox Dep. 151:5-9",
    reality:
      "McDonald email states: \"it's your decision on whether to discontinue funding any of the projects on this list\" — delegating termination authority back to Fox.",
    exhibit: "Exhibit 5",
  },
  {
    id: 2,
    witness: "Nate Cavanaugh",
    topic: "Were grants individually reviewed?",
    underOath:
      "It was well understood... that you couldn't just look at a title and cancel it. You had to read the actual grant description.",
    citation: "Cavanaugh Dep. 240:12-19",
    reality:
      "ChatGPT output spreadsheet contains 1,089 automated DEI classifications — bulk algorithmic screening, not individual review.",
    exhibit: "Exhibit 31",
  },
  {
    id: 3,
    witness: "Nate Cavanaugh",
    topic: "Did DOGE have termination authority?",
    underOath:
      "DOGE did not have the authority to individually cancel contracts. It was always at the discretion of the head of the agency.",
    citation: "Cavanaugh Dep. 77:12-15",
    reality:
      "Email chain shows Fox making termination decisions with McDonald writing \"it's your decision\" — the agency head deferred to DOGE, not the reverse.",
    exhibit: "Exhibit 23",
  },
  {
    id: 4,
    witness: "Nate Cavanaugh",
    topic: "What were the criteria?",
    underOath:
      "If a grant related to DEI, it couldn't be on the keep list, right? — That's correct.",
    citation: "Cavanaugh Dep. 202:18-20",
    reality:
      "NEH staff annotations show many grants rated 'N/A' for DEI involvement were still terminated. 1,014 grants had no DEI flag from anyone.",
    exhibit: "Exhibit 6",
  },
  {
    id: 5,
    witness: "Nate Cavanaugh",
    topic: "What drove the terminations?",
    underOath:
      "Two guiding principles: executive orders with respect to DEI... and a discretionary list of 'wasteful spending.'",
    citation: "Cavanaugh Dep. 238:17-18",
    reality:
      "The majority of terminated grants (1,014 of 1,477) had no DEI flag and no documented \"waste\" finding. No cost-benefit analysis was performed.",
    exhibit: "Exhibit 6",
  },
]

/* ------------------------------------------------------------------ */
/*  Contradiction Card Visual                                          */
/* ------------------------------------------------------------------ */

function ContradictionVisual({ activeStep }: { activeStep: string | null }) {
  const stepIdx: Record<string, number> = {
    "contra-0": -1,
    "contra-1": 0,
    "contra-2": 1,
    "contra-3": 2,
    "contra-4": 3,
    "contra-5": 4,
    "contra-6": 5,
  }

  const idx = stepIdx[activeStep ?? "contra-0"] ?? -1
  const item = idx >= 0 && idx < CONTRADICTIONS.length ? CONTRADICTIONS[idx] : null

  return (
    <div className="flex h-full w-full items-center justify-center bg-black px-4">
      {item ? (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-2xl space-y-6"
        >
          {/* Topic header */}
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {item.witness} &middot; {item.topic}
            </p>
          </div>

          {/* Side by side cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Under oath */}
            <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-amber-500">
                Under Oath
              </p>
              <blockquote className="text-sm leading-relaxed text-amber-100/90 italic">
                &ldquo;{item.underOath}&rdquo;
              </blockquote>
              <p className="mt-3 text-xs text-amber-700">{item.citation}</p>
            </div>

            {/* Documentary evidence */}
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-red-500">
                Documentary Evidence
              </p>
              <p className="text-sm leading-relaxed text-red-100/90">
                {item.reality}
              </p>
              <p className="mt-3 text-xs text-red-700">{item.exhibit}</p>
            </div>
          </div>

          {/* Counter */}
          <p className="text-center text-sm text-gray-600">
            Contradiction {idx + 1} of {CONTRADICTIONS.length}
          </p>
        </motion.div>
      ) : idx >= CONTRADICTIONS.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="font-mono text-6xl font-black text-red-500 sm:text-8xl">
            52
          </p>
          <p className="mt-4 text-lg text-gray-400">
            total inconsistencies documented in sworn testimony
          </p>
          <div className="mt-6 flex justify-center gap-8 text-sm text-gray-500">
            <div>
              <p className="text-2xl font-bold text-white">10</p>
              <p>Contradictions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">33</p>
              <p>Minimizations</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">9</p>
              <p>Omissions</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-white">
            What they said under oath.
          </p>
          <p className="mt-2 text-lg text-gray-400">
            What the documents show.
          </p>
        </motion.div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const steps: ScrollyStep[] = [
  {
    id: "contra-0",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">
          The sworn testimony doesn&apos;t match the paper trail.
        </p>
        <p className="mt-2 text-gray-300">
          Depositions from Fox and Cavanaugh were taken under oath in January
          2026. The court also obtained 35 internal emails and spreadsheets.
          Here&apos;s what doesn&apos;t line up.
        </p>
      </div>
    ),
  },
  ...CONTRADICTIONS.map((c, i) => ({
    id: `contra-${i + 1}`,
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-sm font-semibold text-amber-400">
          {c.witness} — {c.topic}
        </p>
        <p className="mt-2 text-gray-300">
          {i === 0
            ? "Fox testified that NEH leadership made all termination decisions. But an email from McDonald shows him deferring to Fox."
            : i === 1
              ? "Cavanaugh insisted every grant was individually read before cancellation. But the ChatGPT spreadsheet shows 1,089 bulk-classified entries."
              : i === 2
                ? "Cavanaugh claimed DOGE lacked termination authority. But the email chain tells the opposite story."
                : i === 3
                  ? "Cavanaugh said DEI-related grants couldn't be kept. Yet the majority of terminated grants had no DEI connection whatsoever."
                  : "Cavanaugh cited DEI and waste as the two criteria. But no waste analysis was ever performed, and most terminated grants weren't flagged as DEI."}
        </p>
      </div>
    ),
  })),
  {
    id: "contra-6",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">
          Across both depositions, 52 inconsistencies.
        </p>
        <p className="mt-2 text-gray-300">
          10 direct contradictions. 33 minimizations of their own role. 9
          significant omissions. All documented with exhibit citations.
        </p>
      </div>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export function Act5Contradictions() {
  return (
    <section>
      <div className="py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-500">
          Act V
        </p>
        <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
          The Contradictions
        </h2>
      </div>
      <ScrollySection
        steps={steps}
        renderVisual={(activeStep) => (
          <ContradictionVisual activeStep={activeStep} />
        )}
        visualPosition="background"
      />
    </section>
  )
}
