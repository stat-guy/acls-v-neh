import { useEffect, useState, useRef, useMemo } from "react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import { Bar, Line } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  ChartDataLabels,
)

interface Grant {
  award_id: string
  program: string
  remaining_amount: number | null
  staff_dei_level: string | null
  chatgpt_dei_flag: string | null
  fox_dei_flag: string | null
  keep_or_terminate: string
  terminated: number
  equal_protection_category: string | null
}

interface ProgramRate {
  program: string
  total: number
  terminated: number
  pct_terminated: number
}

/* ---------- helpers ---------- */

function formatDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

/* ---------- component ---------- */

export function Charts() {
  const [programRates, setProgramRates] = useState<ProgramRate[]>([])
  const [grants, setGrants] = useState<Grant[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/program_termination_rates.json").then((r) => r.json()),
      fetch("/grants_sample.json").then((r) => r.json()),
    ]).then(([pr, gr]) => {
      setProgramRates(pr)
      setGrants(gr)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  /* --- Derived data --- */

  // Chart 1: Top 15 programs by terminated grant count
  const top15Programs = useMemo(() => {
    return programRates
      .filter((p) => p.program && p.program !== "None")
      .sort((a, b) => b.terminated - a.terminated)
      .slice(0, 15)
  }, [programRates])

  // Chart 2: Timeline — 2-point mass termination step
  const timelineData = useMemo(() => {
    const terminated = grants.filter((g) => g.terminated === 1)
    const totalTerminated = terminated.length
    // From court docs: ~1208 org grants on Apr 2, rest (~269 individual) on Apr 3
    const orgGrants = Math.round(totalTerminated * (1208 / 1477))
    const individualGrants = totalTerminated - orgGrants
    return { orgGrants, individualGrants, totalTerminated }
  }, [grants])

  // Chart 3: DEI Classification Pipeline
  const pipelineData = useMemo(() => {
    if (grants.length === 0) return null
    const total = grants.length

    let staffHigh = 0, staffMedium = 0, staffLow = 0, staffNA = 0, staffNotReviewed = 0
    let gptYes = 0, gptNo = 0, gptNotScreened = 0
    let foxYes = 0, foxNo = 0, foxNotReviewed = 0

    for (const g of grants) {
      // Staff
      const sl = g.staff_dei_level
      if (sl === "High") staffHigh++
      else if (sl === "Medium") staffMedium++
      else if (sl === "Low") staffLow++
      else if (sl === "N/A") staffNA++
      else staffNotReviewed++

      // ChatGPT
      const cf = g.chatgpt_dei_flag
      if (cf === "Yes") gptYes++
      else if (cf === "No") gptNo++
      else gptNotScreened++

      // Fox
      const ff = g.fox_dei_flag
      if (ff === "Yes") foxYes++
      else if (ff === "No") foxNo++
      else foxNotReviewed++
    }

    return {
      total,
      staff: { High: staffHigh, Medium: staffMedium, Low: staffLow, "N/A": staffNA, "Not Reviewed": staffNotReviewed },
      chatgpt: { "Flagged Yes": gptYes, "Flagged No": gptNo, "Not Screened": gptNotScreened },
      fox: { "DEI Yes": foxYes, "DEI No": foxNo, "Not Reviewed": foxNotReviewed },
    }
  }, [grants])

  // Chart 4: Equal protection funds by category
  const epFundsData = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {}
    for (const g of grants) {
      const cat = g.equal_protection_category
      if (!cat) continue
      if (!map[cat]) map[cat] = { amount: 0, count: 0 }
      map[cat].amount += g.remaining_amount ?? 0
      map[cat].count++
    }
    return Object.entries(map)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)
  }, [grants])

  const chartTextColor = "rgba(160, 160, 160, 0.9)"
  const gridColor = "rgba(255,255,255,0.05)"

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

  /* ============================================================
     Chart 1 — Program Impact: top 15 by terminated grant count
     ============================================================ */
  const chart1Data = {
    labels: top15Programs.map((p) => p.program || "(No Program Listed)"),
    datasets: [
      {
        label: "Terminated",
        data: top15Programs.map((p) => p.terminated),
        backgroundColor: "rgba(239, 68, 68, 0.7)",
        borderColor: "rgba(239, 68, 68, 0.9)",
        borderWidth: 1,
        borderRadius: 3,
      },
      {
        label: "Kept",
        data: top15Programs.map((p) => p.total - p.terminated),
        backgroundColor: "rgba(34, 197, 94, 0.7)",
        borderColor: "rgba(34, 197, 94, 0.9)",
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  }

  const chart1Options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { right: 50 },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: { color: chartTextColor, font: { size: 11 }, padding: 16 },
      },
      tooltip: {
        callbacks: {
          afterBody: (ctx: Array<{ dataIndex: number }>) => {
            const p = top15Programs[ctx[0].dataIndex]
            return `Total: ${p.total} grants (${p.pct_terminated.toFixed(0)}% terminated)`
          },
        },
      },
      datalabels: {
        display: (ctx: any) => {
          // Only show label on the last (rightmost) stacked segment
          if (ctx.datasetIndex === 1) {
            const kept = top15Programs[ctx.dataIndex].total - top15Programs[ctx.dataIndex].terminated
            return kept > 0
          }
          if (ctx.datasetIndex === 0) {
            const kept = top15Programs[ctx.dataIndex].total - top15Programs[ctx.dataIndex].terminated
            return kept === 0
          }
          return false
        },
        anchor: "end" as const,
        align: "right" as const,
        color: chartTextColor,
        font: { size: 10, weight: "bold" as const },
        formatter: (_value: number, ctx: any) => {
          return top15Programs[ctx.dataIndex].total
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: chartTextColor, font: { size: 10 } },
        grid: { color: gridColor },
        title: {
          display: true,
          text: "Number of Grants",
          color: chartTextColor,
          font: { size: 11 },
        },
      },
      y: {
        stacked: true,
        ticks: {
          color: chartTextColor,
          font: { size: 10 },
          autoSkip: false,
        },
        grid: { display: false },
        afterFit: (axis: { width: number }) => {
          axis.width = 320
        },
      },
    },
  }

  /* ============================================================
     Chart 2 — The 22-Day Timeline: cumulative terminations
     ============================================================ */
  const { orgGrants, individualGrants, totalTerminated } = timelineData

  const chart2Data = {
    labels: [
      "Before Apr 2",
      "Apr 2, 2025",
      "Apr 2 (after)",
      "Apr 3, 2025",
      "Apr 3 (after)",
    ],
    datasets: [
      {
        label: "Cumulative Grants Terminated",
        data: [
          0,
          0,
          orgGrants,
          orgGrants,
          orgGrants + individualGrants,
        ],
        fill: true,
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderColor: "rgba(239, 68, 68, 0.8)",
        borderWidth: 2,
        pointRadius: [0, 4, 6, 4, 6],
        pointBackgroundColor: "rgba(239, 68, 68, 0.9)",
        stepped: "before" as const,
        tension: 0,
      },
    ],
  }

  const chart2Options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed.y
            if (ctx.dataIndex === 2) return `${val.toLocaleString()} organizational grants terminated`
            if (ctx.dataIndex === 4) return `${val.toLocaleString()} total grants terminated`
            return `${val.toLocaleString()} grants`
          },
        },
      },
      datalabels: {
        display: (ctx: any) => ctx.dataIndex === 2 || ctx.dataIndex === 4,
        anchor: "end" as const,
        align: "top" as const,
        color: chartTextColor,
        font: { size: 11, weight: "bold" as const },
        formatter: (value: number, ctx: any) => {
          if (ctx.dataIndex === 2) return `${value.toLocaleString()} org grants`
          if (ctx.dataIndex === 4) return `${value.toLocaleString()} total`
          return value.toLocaleString()
        },
      },
    },
    scales: {
      x: {
        ticks: { color: chartTextColor, font: { size: 11 } },
        grid: { color: gridColor },
      },
      y: {
        beginAtZero: true,
        ticks: { color: chartTextColor, font: { size: 11 } },
        grid: { color: gridColor },
        title: {
          display: true,
          text: "Cumulative Grants Terminated",
          color: chartTextColor,
          font: { size: 11 },
        },
      },
    },
  }

  /* ============================================================
     Chart 3 — DEI Classification Pipeline (horizontal stacked)
     ============================================================ */
  const pipeline = pipelineData
  const pipelineColors = {
    "High": "rgba(239, 68, 68, 0.75)",
    "Medium": "rgba(234, 179, 8, 0.7)",
    "Low": "rgba(59, 130, 246, 0.7)",
    "N/A": "rgba(100, 100, 100, 0.5)",
    "Not Reviewed": "rgba(55, 55, 55, 0.5)",
    "Flagged Yes": "rgba(239, 68, 68, 0.75)",
    "Flagged No": "rgba(34, 197, 94, 0.7)",
    "Not Screened": "rgba(55, 55, 55, 0.5)",
    "DEI Yes": "rgba(239, 68, 68, 0.75)",
    "DEI No": "rgba(34, 197, 94, 0.7)",
  }

  const pipelineBorders: Record<string, string> = {
    "High": "rgba(239, 68, 68, 0.9)",
    "Medium": "rgba(234, 179, 8, 0.9)",
    "Low": "rgba(59, 130, 246, 0.9)",
    "N/A": "rgba(100, 100, 100, 0.7)",
    "Not Reviewed": "rgba(55, 55, 55, 0.7)",
    "Flagged Yes": "rgba(239, 68, 68, 0.9)",
    "Flagged No": "rgba(34, 197, 94, 0.9)",
    "Not Screened": "rgba(55, 55, 55, 0.7)",
    "DEI Yes": "rgba(239, 68, 68, 0.9)",
    "DEI No": "rgba(34, 197, 94, 0.9)",
  }

  // Build datasets for all unique segment keys across all 3 rows
  const allSegments = [
    "High", "Medium", "Low", "N/A", "Not Reviewed",
    "Flagged Yes", "Flagged No", "Not Screened",
    "DEI Yes", "DEI No",
  ]

  const chart3Labels = ["NEH Staff Review", "ChatGPT Screening", "Fox Final Decision"]

  const chart3Datasets = pipeline
    ? allSegments.map((seg) => ({
        label: seg,
        data: [
          pipeline.staff[seg as keyof typeof pipeline.staff] ?? 0,
          pipeline.chatgpt[seg as keyof typeof pipeline.chatgpt] ?? 0,
          pipeline.fox[seg as keyof typeof pipeline.fox] ?? 0,
        ],
        backgroundColor: pipelineColors[seg as keyof typeof pipelineColors] ?? "rgba(100,100,100,0.3)",
        borderColor: pipelineBorders[seg] ?? "rgba(100,100,100,0.5)",
        borderWidth: 1,
        borderRadius: 2,
      }))
    : []

  const chart3Data = {
    labels: chart3Labels,
    datasets: chart3Datasets,
  }

  const chart3Options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          color: chartTextColor,
          font: { size: 10 },
          padding: 10,
          filter: (item: { text: string; datasetIndex: number }) => {
            // Only show legend items that have non-zero values
            const ds = chart3Datasets[item.datasetIndex]
            return ds ? ds.data.some((v: number) => v > 0) : false
          },
        },
      },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => {
            const total = pipeline?.total ?? 1
            const val = ctx.parsed?.x ?? 0
            const pct = ((val / total) * 100).toFixed(1)
            return `${ctx.dataset?.label ?? ""}: ${val.toLocaleString()} (${pct}%)`
          },
        },
      },
      datalabels: {
        display: (ctx: any) => {
          return ctx.dataset.data[ctx.dataIndex] > 50
        },
        color: "#fff",
        font: { size: 9, weight: "bold" as const },
        formatter: (value: number) => value > 0 ? value.toLocaleString() : "",
      },
    },
    scales: {
      x: {
        stacked: true,
        ticks: { color: chartTextColor, font: { size: 10 } },
        grid: { color: gridColor },
        title: {
          display: true,
          text: "Number of Grants",
          color: chartTextColor,
          font: { size: 11 },
        },
      },
      y: {
        stacked: true,
        ticks: { color: chartTextColor, font: { size: 11 } },
        grid: { display: false },
        afterFit: (axis: { width: number }) => {
          axis.width = 160
        },
      },
    },
  }

  /* ============================================================
     Chart 4 — Equal Protection: Funds Lost by Category
     ============================================================ */
  const epColors = [
    "rgba(239, 68, 68, 0.7)",
    "rgba(59, 130, 246, 0.7)",
    "rgba(234, 179, 8, 0.7)",
    "rgba(168, 85, 247, 0.7)",
    "rgba(236, 72, 153, 0.7)",
    "rgba(34, 197, 94, 0.7)",
  ]
  const epBorders = [
    "rgba(239, 68, 68, 0.9)",
    "rgba(59, 130, 246, 0.9)",
    "rgba(234, 179, 8, 0.9)",
    "rgba(168, 85, 247, 0.9)",
    "rgba(236, 72, 153, 0.9)",
    "rgba(34, 197, 94, 0.9)",
  ]

  const chart4Data = {
    labels: epFundsData.map((e) => e.category),
    datasets: [
      {
        label: "Remaining Amount ($)",
        data: epFundsData.map((e) => e.amount),
        backgroundColor: epFundsData.map((_, i) => epColors[i % epColors.length]),
        borderColor: epFundsData.map((_, i) => epBorders[i % epBorders.length]),
        borderWidth: 1,
        borderRadius: 3,
      },
    ],
  }

  const chart4Options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { right: 20 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const item = epFundsData[ctx.dataIndex]
            return [
              `Funds at risk: ${formatDollars(ctx.parsed.x)}`,
              `Grants: ${item.count}`,
            ]
          },
        },
      },
      datalabels: {
        anchor: "end" as const,
        align: "right" as const,
        color: chartTextColor,
        font: { size: 10, weight: "bold" as const },
        formatter: (value: number) => formatDollars(value),
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartTextColor,
          font: { size: 10 },
          callback: (value: string | number) => formatDollars(Number(value)),
        },
        grid: { color: gridColor },
        title: {
          display: true,
          text: "Funds at Risk (Remaining Amount)",
          color: chartTextColor,
          font: { size: 11 },
        },
      },
      y: {
        ticks: { color: chartTextColor, font: { size: 11 }, autoSkip: false },
        grid: { display: false },
        afterFit: (axis: { width: number }) => {
          axis.width = 200
        },
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

        <div className="grid gap-6">
          {/* Chart 1: Program Impact */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="mb-1 text-sm font-semibold">
              Program Impact: Top 15 by Grants Terminated
            </h4>
            <p className="mb-4 text-xs text-muted-foreground">
              Showing the 15 programs with the most terminated grants. Total count shown at end of each bar.
            </p>
            <div style={{ height: Math.max(top15Programs.length * 36, 400) }}>
              <Bar data={chart1Data} options={chart1Options} />
            </div>
          </div>

          {/* Row of 2 smaller charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart 2: The 22-Day Timeline */}
            <div className="glass-card rounded-xl p-6">
              <h4 className="mb-1 text-sm font-semibold">
                The 22-Day Timeline
              </h4>
              <p className="mb-4 text-xs text-muted-foreground">
                Mass termination events: {totalTerminated.toLocaleString()} grants terminated across two days in April 2025.
              </p>
              <div style={{ height: 280 }}>
                <Line data={chart2Data} options={chart2Options} />
              </div>
            </div>

            {/* Chart 4: Equal Protection — Funds Lost */}
            <div className="glass-card rounded-xl p-6">
              <h4 className="mb-1 text-sm font-semibold">
                Equal Protection — Funds at Risk by Category
              </h4>
              <p className="mb-4 text-xs text-muted-foreground">
                Total remaining grant dollars for grants with equal protection claims. Hover for grant count.
              </p>
              <div style={{ height: 280 }}>
                <Bar data={chart4Data} options={chart4Options} />
              </div>
            </div>
          </div>

          {/* Chart 3: DEI Classification Pipeline */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="mb-1 text-sm font-semibold">
              DEI Classification Pipeline
            </h4>
            <p className="mb-4 text-xs text-muted-foreground">
              How grants flowed through three screening stages. Staff reviewed only {pipeline ? (pipeline.total - pipeline.staff["Not Reviewed"]).toLocaleString() : "—"} of {pipeline?.total.toLocaleString()} grants,
              ChatGPT flagged {pipeline?.chatgpt["Flagged Yes"].toLocaleString()}, and Fox flagged {pipeline?.fox["DEI Yes"].toLocaleString()} as DEI.
            </p>
            <div style={{ height: 220 }}>
              <Bar data={chart3Data} options={chart3Options} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
