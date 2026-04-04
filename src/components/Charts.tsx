import { useEffect, useState, useRef } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar, Doughnut, Pie } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

interface ProgramRate {
  program: string
  total: number
  terminated: number
  pct_terminated: number
}

interface DeiComparison {
  staff_level: string | null
  fox_flag: string | null
  count: number
}

interface EpCategory {
  category: string
  count: number
}

export function Charts() {
  const [programRates, setProgramRates] = useState<ProgramRate[]>([])
  const [deiComparison, setDeiComparison] = useState<DeiComparison[]>([])
  const [epData, setEpData] = useState<EpCategory[]>([])
  const [stats, setStats] = useState<{ terminated: number; kept: number; total_grants: number } | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/program_termination_rates.json").then((r) => r.json()),
      fetch("/dei_comparison.json").then((r) => r.json()),
      fetch("/equal_protection.json").then((r) => r.json()),
      fetch("/stats.json").then((r) => r.json()),
    ]).then(([pr, dc, ep, st]) => {
      setProgramRates(pr)
      setDeiComparison(dc)
      setEpData(ep)
      setStats(st)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  if (!visible) {
    return (
      <section id="charts" ref={sectionRef} className="min-h-[400px] px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            Visualization
          </h2>
          <h3 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Data at a Glance
          </h3>
        </div>
      </section>
    )
  }

  // Program termination rates - top 15 + bottom programs
  const topPrograms = programRates
    .filter((p) => p.total >= 5)
    .sort((a, b) => b.pct_terminated - a.pct_terminated)
    .slice(0, 12)

  const bottomPrograms = programRates
    .filter((p) => p.pct_terminated < 100 && p.total >= 5)
    .sort((a, b) => a.pct_terminated - b.pct_terminated)
    .slice(0, 4)

  const chartPrograms = [...topPrograms, ...bottomPrograms.filter((bp) => !topPrograms.find((tp) => tp.program === bp.program))]

  const truncateLabel = (s: string, max: number) =>
    s.length > max ? s.slice(0, max) + "..." : s

  const programChartData = {
    labels: chartPrograms.map((p) => truncateLabel(p.program, 35)),
    datasets: [
      {
        label: "Termination Rate (%)",
        data: chartPrograms.map((p) => p.pct_terminated),
        backgroundColor: chartPrograms.map((p) =>
          p.pct_terminated === 100
            ? "rgba(239, 68, 68, 0.7)"
            : p.pct_terminated === 0
              ? "rgba(34, 197, 94, 0.7)"
              : "rgba(234, 179, 8, 0.7)"
        ),
        borderColor: chartPrograms.map((p) =>
          p.pct_terminated === 100
            ? "rgba(239, 68, 68, 0.9)"
            : p.pct_terminated === 0
              ? "rgba(34, 197, 94, 0.9)"
              : "rgba(234, 179, 8, 0.9)"
        ),
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  }

  const chartTextColor = "rgba(160, 160, 160, 0.9)"

  const barOptions = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          afterLabel: (ctx: { dataIndex: number }) => {
            const p = chartPrograms[ctx.dataIndex]
            return `${p.terminated} of ${p.total} grants`
          },
        },
      },
    },
    scales: {
      x: {
        max: 100,
        ticks: { color: chartTextColor, font: { size: 10 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: chartTextColor, font: { size: 10 } },
        grid: { display: false },
      },
    },
  }

  // Keep vs Terminate donut
  const kept = stats?.kept ?? 27
  const terminated = stats?.terminated ?? 1477
  const other = (stats?.total_grants ?? 2415) - kept - terminated

  const donutData = {
    labels: ["Terminated", "Kept", "Other / Not Reviewed"],
    datasets: [
      {
        data: [terminated, kept, other],
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)",
          "rgba(34, 197, 94, 0.7)",
          "rgba(100, 100, 100, 0.4)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 0.9)",
          "rgba(34, 197, 94, 0.9)",
          "rgba(100, 100, 100, 0.6)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: chartTextColor, font: { size: 11 }, padding: 16 },
      },
    },
  }

  // DEI comparison stacked bar
  const staffLevels = ["High", "Medium", "Low", "N/A"]
  const deiStackedData = {
    labels: staffLevels,
    datasets: [
      {
        label: "Fox: Yes",
        data: staffLevels.map((sl) => {
          const match = deiComparison.find((d) => d.staff_level === sl && d.fox_flag === "Yes")
          return match?.count ?? 0
        }),
        backgroundColor: "rgba(239, 68, 68, 0.6)",
        borderColor: "rgba(239, 68, 68, 0.8)",
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: "Fox: No / Null",
        data: staffLevels.map((sl) => {
          const match = deiComparison.find((d) => d.staff_level === sl && !d.fox_flag)
          return match?.count ?? 0
        }),
        backgroundColor: "rgba(100, 100, 100, 0.4)",
        borderColor: "rgba(100, 100, 100, 0.6)",
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  }

  const stackedOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: chartTextColor, font: { size: 11 }, padding: 16 },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: chartTextColor, font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        stacked: true,
        ticks: { color: chartTextColor, font: { size: 11 } },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
    },
  }

  // Equal protection pie
  const epPieData = {
    labels: epData.map((e) => e.category),
    datasets: [
      {
        data: epData.map((e) => e.count),
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(234, 179, 8, 0.7)",
          "rgba(168, 85, 247, 0.7)",
          "rgba(34, 197, 94, 0.7)",
          "rgba(236, 72, 153, 0.7)",
        ],
        borderColor: [
          "rgba(239, 68, 68, 0.9)",
          "rgba(59, 130, 246, 0.9)",
          "rgba(234, 179, 8, 0.9)",
          "rgba(168, 85, 247, 0.9)",
          "rgba(34, 197, 94, 0.9)",
          "rgba(236, 72, 153, 0.9)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: chartTextColor, font: { size: 11 }, padding: 12 },
      },
    },
  }

  return (
    <section id="charts" ref={sectionRef} className="relative px-4 py-24">
      <div className="section-gradient pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Visualization
        </h2>
        <h3 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Data at a Glance
        </h3>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Program termination rates */}
          <div className="glass-card rounded-xl p-6 lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold">
              Program Termination Rates
            </h4>
            <p className="mb-4 text-xs text-muted-foreground">
              Programs with 5+ grants. Red indicates 100% termination.
            </p>
            <div style={{ height: Math.max(chartPrograms.length * 28, 300) }}>
              <Bar data={programChartData} options={barOptions} />
            </div>
          </div>

          {/* Keep vs Terminate */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="mb-4 text-sm font-semibold">
              Keep vs. Terminate
            </h4>
            <div style={{ height: 280 }}>
              <Doughnut data={donutData} options={donutOptions} />
            </div>
          </div>

          {/* DEI Stacked */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="mb-4 text-sm font-semibold">
              Staff Assessment vs. Fox Override
            </h4>
            <p className="mb-4 text-xs text-muted-foreground">
              By staff DEI level, showing Fox flag distribution
            </p>
            <div style={{ height: 250 }}>
              <Bar data={deiStackedData} options={stackedOptions} />
            </div>
          </div>

          {/* Equal Protection Pie */}
          <div className="glass-card rounded-xl p-6 lg:col-span-2 lg:mx-auto lg:max-w-lg">
            <h4 className="mb-4 text-sm font-semibold text-center">
              Equal Protection Categories
            </h4>
            <p className="mb-4 text-xs text-muted-foreground text-center">
              Protected class categories among grants with equal protection claims
            </p>
            <div style={{ height: 300 }}>
              <Pie data={epPieData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
