import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ScrollySection, type ScrollyStep } from "./ScrollySection"

/* ------------------------------------------------------------------ */
/*  Dot-unit visualization (each dot = 1 grant)                        */
/* ------------------------------------------------------------------ */

const TOTAL_TERMINATED = 1477
const TOTAL_FUNDING_LOST = 525_000_000 // ~$525M approximate

// Deterministic grid positions for dots
function dotPositions(count: number, cols: number) {
  const positions: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    positions.push({ x: i % cols, y: Math.floor(i / cols) })
  }
  return positions
}

interface DotFieldProps {
  revealCount: number
  total: number
  color: string
  neutralColor?: string
  dotSize?: number
  cols?: number
  counterLabel?: string
  showCounter?: boolean
}

function DotField({
  revealCount,
  total,
  color,
  neutralColor = "#1e293b",
  dotSize = 4,
  cols = 50,
  counterLabel,
  showCounter = true,
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const positions = useMemo(() => dotPositions(total, cols), [total, cols])

  const gap = dotSize + 2
  const rows = Math.ceil(total / cols)
  const width = cols * gap
  const height = rows * gap

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < total; i++) {
      const { x, y } = positions[i]
      ctx.fillStyle = i < revealCount ? color : neutralColor
      ctx.beginPath()
      ctx.arc(
        x * gap + dotSize / 2,
        y * gap + dotSize / 2,
        dotSize / 2,
        0,
        Math.PI * 2,
      )
      ctx.fill()
    }
  }, [revealCount, total, color, neutralColor, dotSize, positions, gap, width, height])

  return (
    <div className="flex flex-col items-center">
      {showCounter && (
        <div className="mb-4 text-center">
          <span
            className="font-mono text-5xl font-black tabular-nums sm:text-7xl"
            style={{ color }}
          >
            {revealCount.toLocaleString()}
          </span>
          {counterLabel && (
            <span className="ml-3 text-lg text-gray-400">{counterLabel}</span>
          )}
        </div>
      )}
      <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Animated counter that ticks up                                     */
/* ------------------------------------------------------------------ */

function useAnimatedCount(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  const animate = useCallback(() => {
    if (target === 0) {
      setCount(0)
      return
    }
    startRef.current = null
    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp
      const elapsed = timestamp - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step)
      }
    }
    rafRef.current = requestAnimationFrame(step)
  }, [target, duration])

  useEffect(() => {
    animate()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  return count
}

/* ------------------------------------------------------------------ */
/*  Wave Visual                                                        */
/* ------------------------------------------------------------------ */

function WaveVisual({ activeStep }: { activeStep: string | null }) {
  const stepTargets: Record<string, number> = {
    "wave-1": 1,
    "wave-2": 10,
    "wave-3": 100,
    "wave-4": 500,
    "wave-5": TOTAL_TERMINATED,
    "wave-6": TOTAL_TERMINATED,
  }

  const target = stepTargets[activeStep ?? "wave-1"] ?? 1
  const count = useAnimatedCount(target, target > 100 ? 3000 : 1500)

  const isFinalStep = activeStep === "wave-6"

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-black p-4">
      {!isFinalStep ? (
        <DotField
          revealCount={count}
          total={TOTAL_TERMINATED}
          color="#ef4444"
          cols={Math.min(50, Math.ceil(Math.sqrt(TOTAL_TERMINATED * 1.5)))}
          counterLabel="grants terminated"
          dotSize={4}
        />
      ) : (
        <div className="text-center">
          <DotField
            revealCount={TOTAL_TERMINATED}
            total={TOTAL_TERMINATED}
            color="#ef4444"
            cols={50}
            showCounter={false}
            dotSize={3}
          />
          <div className="mt-8">
            <p className="text-sm uppercase tracking-widest text-gray-500">
              Total funding terminated
            </p>
            <p className="mt-2 font-mono text-4xl font-black text-red-500 sm:text-6xl">
              ${(TOTAL_FUNDING_LOST / 1_000_000).toFixed(0)}M+
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Steps                                                              */
/* ------------------------------------------------------------------ */

const steps: ScrollyStep[] = [
  {
    id: "wave-1",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">One grant.</p>
        <p className="mt-2 text-gray-300">
          A project to preserve the language of Geronimo&apos;s descendants.
        </p>
      </div>
    ),
  },
  {
    id: "wave-2",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">Then ten.</p>
        <p className="mt-2 text-gray-300">
          On the first day, March 14, DOGE operative Justin Fox — a 25-year-old
          with no humanities background — began reviewing every active NEH
          grant.
        </p>
      </div>
    ),
  },
  {
    id: "wave-3",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">Then a hundred.</p>
        <p className="mt-2 text-gray-300">
          Fox used ChatGPT to screen grants for &ldquo;DEI content.&rdquo; But
          the AI flagged only 259 out of 2,415. So Fox made his own list —
          overriding the algorithm he was supposed to be following.
        </p>
      </div>
    ),
  },
  {
    id: "wave-4",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">Then five hundred.</p>
        <p className="mt-2 text-gray-300">
          NEH career staff had rated nearly all grants as having no DEI
          connection. Fox overrode their professional judgment in 434 cases. But
          even that wasn&apos;t enough.
        </p>
      </div>
    ),
  },
  {
    id: "wave-5",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white sm:text-2xl">
          One thousand, four hundred and seventy-seven.
        </p>
        <p className="mt-3 text-gray-300">
          In the end, 1,014 grants were terminated with no DEI flag from anyone
          — not Fox, not ChatGPT, not NEH staff. No reason was given. They were
          simply wiped out.
        </p>
      </div>
    ),
  },
  {
    id: "wave-6",
    content: (
      <div className="rounded-xl bg-black/80 p-6 backdrop-blur-sm">
        <p className="text-xl font-bold text-white">
          Each dot is a project that will never be completed.
        </p>
        <p className="mt-2 text-gray-300">
          Language archives that will never be built. Archaeological digs
          abandoned mid-excavation. Community newspapers lost to history.
          Scholarly editions left unfinished.
        </p>
      </div>
    ),
  },
]

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export function Act2TheWave() {
  return (
    <section>
      <div className="py-16 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-500">
          Act II
        </p>
        <h2 className="mt-4 text-3xl font-bold sm:text-5xl">The Wave</h2>
      </div>
      <ScrollySection
        steps={steps}
        renderVisual={(activeStep) => <WaveVisual activeStep={activeStep} />}
        visualPosition="background"
      />
    </section>
  )
}
