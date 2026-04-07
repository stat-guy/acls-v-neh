import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useCallback, useEffect, useRef, useState } from "react"

/* ------------------------------------------------------------------ */
/*  Category data                                                      */
/* ------------------------------------------------------------------ */

interface LostCategory {
  name: string
  count: number
  amount: number
  color: string
  description: string
}

const CATEGORIES: LostCategory[] = [
  {
    name: "Preservation & Archives",
    count: 237,
    amount: 50_538_773,
    color: "#f59e0b",
    description:
      "Historical collections, newspaper digitization, cultural heritage preservation",
  },
  {
    name: "State Humanities Councils",
    count: 108,
    amount: 187_508_534,
    color: "#3b82f6",
    description:
      "State-level humanities programming serving communities in all 50 states",
  },
  {
    name: "Education",
    count: 142,
    amount: 22_562_708,
    color: "#22c55e",
    description:
      "K-12 educator programs, higher education initiatives, institutional support",
  },
  {
    name: "Public Programs & Media",
    count: 126,
    amount: 29_642_216,
    color: "#a855f7",
    description:
      "Documentaries, exhibitions, public dialogues, media productions",
  },
  {
    name: "Digital Humanities",
    count: 107,
    amount: 22_513_641,
    color: "#06b6d4",
    description:
      "Digital archives, computational analysis, online educational resources",
  },
  {
    name: "Research & Scholarship",
    count: 103,
    amount: 19_867_456,
    color: "#ec4899",
    description:
      "Collaborative research, scholarly editions, academic translations",
  },
  {
    name: "Infrastructure",
    count: 87,
    amount: 40_892_672,
    color: "#64748b",
    description:
      "Challenge grants for institutional capacity building",
  },
  {
    name: "Research Fellowships",
    count: 83,
    amount: 16_509_767,
    color: "#f97316",
    description:
      "Individual scholars, public scholars, summer stipends",
  },
  {
    name: "Community & Culture",
    count: 49,
    amount: 6_991_418,
    color: "#14b8a6",
    description:
      "Community resilience, cultural programs, local heritage",
  },
  {
    name: "HBCUs, HSIs & Tribal Colleges",
    count: 32,
    amount: 4_404_690,
    color: "#ef4444",
    description:
      "Programs specifically supporting historically underserved institutions",
  },
  {
    name: "Endangered Languages",
    count: 12,
    amount: 4_193_680,
    color: "#eab308",
    description:
      "Documentation of languages spoken by fewer than 1,000 people — work that cannot be redone once speakers are gone",
  },
]

const TOTAL_AMOUNT = 422_711_424
const TOTAL_COUNT = 1477

/* ------------------------------------------------------------------ */
/*  Animated counter                                                   */
/* ------------------------------------------------------------------ */

function useAnimatedCount(target: number, duration = 2000, trigger = true) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  const animate = useCallback(() => {
    if (!trigger || target === 0) {
      if (!trigger) setCount(0)
      return
    }
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
  }, [target, duration, trigger])

  useEffect(() => {
    animate()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [animate])

  return count
}

/* ------------------------------------------------------------------ */
/*  Category row                                                       */
/* ------------------------------------------------------------------ */

function CategoryRow({
  cat,
  index,
  maxAmount,
}: {
  cat: LostCategory
  index: number
  maxAmount: number
}) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })
  const barWidth = (cat.amount / maxAmount) * 100

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className="group"
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: cat.color }}
          />
          <span className="font-medium text-white">{cat.name}</span>
        </div>
        <span className="font-mono text-gray-400">
          {cat.count} grants &middot; ${(cat.amount / 1_000_000).toFixed(1)}M
        </span>
      </div>

      {/* Bar */}
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-800">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: cat.color }}
          initial={{ width: 0 }}
          animate={inView ? { width: `${barWidth}%` } : { width: 0 }}
          transition={{ duration: 1, delay: index * 0.08 + 0.3, ease: "easeOut" }}
        />
      </div>

      <p className="mt-1 text-xs text-gray-500">{cat.description}</p>
      <div className="mt-3" />
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export function Act6WhatWasLost() {
  const { ref: totalRef, inView: totalInView } = useInView({
    threshold: 0.3,
    triggerOnce: true,
  })

  const animatedAmount = useAnimatedCount(
    Math.round(TOTAL_AMOUNT / 1_000_000),
    3000,
    totalInView,
  )
  const animatedCount = useAnimatedCount(TOTAL_COUNT, 2500, totalInView)

  const maxAmount = Math.max(...CATEGORIES.map((c) => c.amount))

  return (
    <section className="relative px-4 py-32">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />

      <div className="relative mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-500">
            Act VI
          </p>
          <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
            What Was Lost
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-gray-400">
            Every category of humanities work was hit. These are not abstractions
            — they are language archives, teacher training programs, community
            newspapers, and archaeological digs that will never be completed.
          </p>
        </div>

        {/* Category breakdown */}
        <div className="mt-16 space-y-1">
          {CATEGORIES.map((cat, i) => (
            <CategoryRow
              key={cat.name}
              cat={cat}
              index={i}
              maxAmount={maxAmount}
            />
          ))}
        </div>

        {/* Grand total */}
        <motion.div
          ref={totalRef}
          initial={{ opacity: 0, y: 30 }}
          animate={
            totalInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
          }
          transition={{ duration: 1 }}
          className="mt-20 rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center sm:p-12"
        >
          <p className="text-sm font-semibold uppercase tracking-widest text-red-400">
            Total funding terminated
          </p>
          <p className="mt-4 font-mono text-5xl font-black text-red-500 sm:text-7xl">
            ${animatedAmount}M
          </p>
          <p className="mt-4 text-lg text-gray-400">
            across{" "}
            <span className="font-mono font-bold text-white">
              {animatedCount.toLocaleString()}
            </span>{" "}
            grants
          </p>
          <p className="mt-2 text-sm text-gray-500">In 22 days.</p>
        </motion.div>

        {/* Call to action */}
        <div className="mt-20 text-center">
          <p className="text-lg text-gray-300">
            The data behind this investigation is fully searchable.
          </p>
          <a
            href="/acls-v-neh/explore"
            className="mt-4 inline-block rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
          >
            Explore the Data &rarr;
          </a>
        </div>
      </div>
    </section>
  )
}
