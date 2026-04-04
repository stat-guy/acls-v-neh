import { useEffect, useRef, useState } from "react"

interface StatItem {
  value: number
  label: string
  prefix?: string
  suffix?: string
  decimals?: number
}

const stats: StatItem[] = [
  { value: 1477, label: "Grants Terminated" },
  { value: 149.4, label: "Funds Clawed Back", prefix: "$", suffix: "M", decimals: 1 },
  { value: 22, label: "Days Start to Finish" },
  { value: 27, label: "Grants Kept" },
  { value: 52, label: "Deposition Inconsistencies" },
  { value: 0, label: "Program Officers Consulted" },
]

function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  inView,
}: StatItem & { inView: boolean }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (value === 0) {
      setCurrent(0)
      return
    }
    const duration = 1500
    const steps = 60
    const increment = value / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      if (step >= steps) {
        setCurrent(value)
        clearInterval(timer)
      } else {
        setCurrent(increment * step)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [inView, value])

  const display = decimals > 0 ? current.toFixed(decimals) : Math.round(current).toLocaleString()

  return (
    <span className="tabular-nums">
      {prefix}{display}{suffix}
    </span>
  )
}

export function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="hero"
      ref={ref}
      className="hero-gradient relative flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center"
    >
      {/* Subtle radial overlay */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.4_0.15_270_/_8%)_0%,_transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-4xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground animate-fade-in-up">
          Case Analysis
        </p>
        <h1
          className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          ACLS v. NEH
        </h1>
        <p
          className="mb-2 text-lg font-medium text-muted-foreground sm:text-xl md:text-2xl animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          Inside the Grant Terminations
        </p>
        <p
          className="mx-auto mb-16 max-w-2xl text-sm text-muted-foreground/80 leading-relaxed sm:text-base animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          An interactive investigation into how DOGE used ChatGPT to terminate 1,477 NEH grants in 22 days
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="glass-card glow-hover rounded-xl px-4 py-6 animate-counter"
              style={{ animationDelay: `${0.4 + i * 0.1}s`, opacity: 0 }}
            >
              <div className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
                <AnimatedCounter {...stat} inView={inView} />
              </div>
              <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-fade-in-up" style={{ animationDelay: "1.2s", opacity: 0 }}>
          <a
            href="#findings"
            className="inline-flex flex-col items-center gap-2 text-xs text-muted-foreground/60 transition-colors hover:text-muted-foreground"
          >
            <span>Scroll to explore</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="animate-bounce">
              <path d="M8 3v10M4 9l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
