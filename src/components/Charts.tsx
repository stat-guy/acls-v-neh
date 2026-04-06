/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

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

interface EpCategory {
  category: string
  grants: number
  remaining: number
  exhibit_24?: number
  keyword_match?: number
}

interface WhyTerminated {
  reason: string
  grants: number
  funds: number
}

interface KeptFlagged {
  title: string
  rationale: string
}

/* ---------- helpers ---------- */

function formatDollars(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

/* ---------- component ---------- */

export function Charts() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [epOriginal, setEpOriginal] = useState<EpCategory[]>([])
  const [epCombined, setEpCombined] = useState<EpCategory[]>([])
  const [epMode, setEpMode] = useState<"combined" | "original">("combined")
  const [whyData, setWhyData] = useState<WhyTerminated[]>([])
  const [keptFlagged, setKeptFlagged] = useState<KeptFlagged[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/grants_sample.json").then((r) => r.json()),
      fetch("/ep_expanded.json").then((r) => r.json()),
      fetch("/ep_combined.json").then((r) => r.json()),
      fetch("/why_terminated.json").then((r) => r.json()),
      fetch("/kept_flagged.json").then((r) => r.json()),
    ]).then(([gr, epOrig, epComb, why, kept]) => {
      setGrants(gr)
      setEpOriginal(epOrig)
      setEpCombined(epComb)
      setWhyData(why)
      setKeptFlagged(kept)
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

  // Chart 2: Timeline — 2-point mass termination step
  const timelineData = useMemo(() => {
    const terminated = grants.filter((g) => g.terminated === 1)
    const totalTerminated = terminated.length
    const orgGrants = Math.round(totalTerminated * (1208 / 1477))
    const individualGrants = totalTerminated - orgGrants
    return { orgGrants, individualGrants, totalTerminated }
  }, [grants])

  const epData = epMode === "combined" ? epCombined : epOriginal

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
     Chart 1 — Equal Protection: Funds Terminated by Category
     ============================================================ */
  const warmColors: Record<string, string> = {
    "Race": "rgba(220, 38, 38, 0.8)",
    "Race-Tribal": "rgba(234, 88, 12, 0.8)",
    "National Origin / Ethnicity": "rgba(217, 119, 6, 0.8)",
    "Sex/Gender": "rgba(245, 158, 11, 0.8)",
    "Sexuality": "rgba(251, 191, 36, 0.8)",
    "Religion": "rgba(252, 211, 77, 0.8)",
    "No EP claim": "rgba(120, 120, 120, 0.6)",
    "No protected class detected": "rgba(120, 120, 120, 0.6)",
  }

  const chart1Data = {
    labels: epData.map((e) => e.category),
    datasets: [
      {
        label: "Funds Terminated ($)",
        data: epData.map((e) => e.remaining),
        backgroundColor: epData.map((e) => warmColors[e.category] ?? "rgba(160,160,160,0.5)"),
        borderColor: epData.map((e) => (warmColors[e.category] ?? "rgba(160,160,160,0.7)").replace("0.8)", "1)").replace("0.6)", "0.8)")),
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
      padding: { right: typeof window !== "undefined" && window.innerWidth < 640 ? 50 : 80 },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any): any => {
            const item = epData[ctx.dataIndex]
            return `${item.category}: ${formatDollars(ctx.parsed.x)} — ${item.grants} grants`
          },
        },
      },
      datalabels: {
        anchor: "end" as const,
        align: "right" as const,
        color: chartTextColor,
        font: { size: 11, weight: "bold" as const },
        formatter: (value: any): any => formatDollars(Number(value)),
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartTextColor,
          font: { size: 10 },
          callback: (value: any): any => formatDollars(Number(value)),
        },
        grid: { color: gridColor },
        title: {
          display: true,
          text: "Funds Terminated (Remaining Amount)",
          color: chartTextColor,
          font: { size: 11 },
        },
      },
      y: {
        ticks: { color: chartTextColor, font: { size: typeof window !== "undefined" && window.innerWidth < 640 ? 9 : 11 }, autoSkip: false },
        grid: { display: false },
        afterFit: (axis: any): any => {
          axis.width = typeof window !== "undefined" && window.innerWidth < 640 ? 160 : 280
        },
      },
    },
  }

  const epTotalGrants = epData.reduce((s, e) => s + e.grants, 0)
  const epTotalFunds = epData.reduce((s, e) => s + e.remaining, 0)

  /* ============================================================
     Chart 2 — The 22-Day Blitz (preserved exactly)
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
          label: (ctx: any): any => {
            const val = ctx.parsed.y
            if (ctx.dataIndex === 2) return `${val.toLocaleString()} organizational grants terminated`
            if (ctx.dataIndex === 4) return `${val.toLocaleString()} total grants terminated`
            return `${val.toLocaleString()} grants`
          },
        },
      },
      datalabels: {
        display: (ctx: any): any => ctx.dataIndex === 2 || ctx.dataIndex === 4,
        anchor: "end" as const,
        align: "top" as const,
        color: chartTextColor,
        font: { size: 11, weight: "bold" as const },
        formatter: (value: any, ctx: any): any => {
          if (ctx.dataIndex === 2) return `${Number(value).toLocaleString()} org grants`
          if (ctx.dataIndex === 4) return `${Number(value).toLocaleString()} total`
          return Number(value).toLocaleString()
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
     Chart 3 — Why Were Grants Terminated?
     ============================================================ */
  const whyColorMap: Record<string, string> = {
    "No DEI flag": "rgba(120, 120, 120, 0.7)",
    "Fox DEI override": "rgba(220, 38, 38, 0.8)",
    "Both flagged DEI": "rgba(234, 88, 12, 0.8)",
  }

  const chart3Datasets = whyData.map((w) => ({
    label: w.reason,
    data: [w.grants],
    backgroundColor: whyColorMap[w.reason] ?? "rgba(160,160,160,0.5)",
    borderColor: (whyColorMap[w.reason] ?? "rgba(160,160,160,0.7)").replace("0.7)", "0.9)").replace("0.8)", "1)"),
    borderWidth: 1,
    borderRadius: 2,
  }))

  const chart3Data = {
    labels: ["Terminated Grants"],
    datasets: chart3Datasets,
  }

  const chart3Options = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: chartTextColor, font: { size: 11 }, padding: 12 },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any): any => {
            const item = whyData[ctx.datasetIndex]
            if (!item) return ""
            return `${item.reason}: ${item.grants.toLocaleString()} grants — ${formatDollars(item.funds)}`
          },
        },
      },
      datalabels: {
        color: "#fff",
        font: { size: 12, weight: "bold" as const },
        formatter: (value: any): any => Number(value) > 0 ? Number(value).toLocaleString() : "",
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
        ticks: { display: false },
        grid: { display: false },
      },
    },
  }

  /* ============================================================
     Render
     ============================================================ */
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
          {/* Chart 1: Equal Protection — Funds Terminated by Category (full width) */}
          <div className="glass-card rounded-xl p-4 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h4 className="mb-1 text-lg font-semibold">
                  Equal Protection — Funds Terminated by Category
                </h4>
                <p className="text-sm text-muted-foreground">
                  Remaining funds terminated, grouped by the protected class referenced in the grant&apos;s description or DEI rationale.
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
                <button
                  onClick={() => setEpMode("combined")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    epMode === "combined"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Combined
                </button>
                <button
                  onClick={() => setEpMode("original")}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    epMode === "original"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Original (Exhibit 24)
                </button>
              </div>
            </div>
            <div style={{ height: 400 }}>
              <Bar data={chart1Data} options={chart1Options} />
            </div>
            <p className="mt-4 text-sm font-medium text-muted-foreground">
              Total: {epTotalGrants.toLocaleString()} grants terminated | {formatDollars(epTotalFunds)} in terminated funds
            </p>
            <p className="mt-2 text-xs text-muted-foreground/70">
              {epMode === "combined"
                ? "Combined view: 74 grants from Exhibit 24 + 337 additional grants classified by keyword analysis of descriptions and DEI rationales. This expanded classification was developed beyond what Exhibit 24 originally identified."
                : "Original view: 74 grants explicitly identified by plaintiffs in Exhibit 24. The remaining 1,403 grants are categorized as \"No EP claim.\""}
            </p>
          </div>

          {/* Charts 2 & 3 side-by-side on desktop */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Chart 2: The 22-Day Blitz */}
            <div className="glass-card rounded-xl p-6">
              <h4 className="mb-1 text-lg font-semibold">
                The 22-Day Blitz
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Mass termination events: {totalTerminated.toLocaleString()} grants terminated across two days in April 2025.
              </p>
              <div style={{ height: 280 }}>
                <Line data={chart2Data} options={chart2Options} />
              </div>
            </div>

            {/* Chart 3: Why Were Grants Terminated? */}
            <div className="glass-card rounded-xl p-6">
              <h4 className="mb-1 text-lg font-semibold">
                Why Were Grants Terminated?
              </h4>
              <p className="mb-4 text-sm text-muted-foreground">
                Of 1,477 terminated grants, only 463 (31%) were flagged for DEI by any measure.
              </p>
              <div style={{ height: 200 }}>
                <Bar data={chart3Data} options={chart3Options} />
              </div>
              <p className="mt-4 text-center text-lg font-bold text-red-400">
                64% of terminated grants had NO DEI classification — they were cut for &ldquo;deficit reduction.&rdquo;
              </p>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Card A: Even the Kept Grants Were DEI-Flagged */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">Even the Kept Grants Were DEI-Flagged</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm font-semibold text-muted-foreground">
                  7 of 27 kept grants were flagged as DEI by ChatGPT
                </p>
                <ul className="space-y-3">
                  {keptFlagged.map((g) => (
                    <li key={g.title} className="text-sm">
                      <span className="font-medium">{g.title}</span>
                      <br />
                      <span className="italic text-muted-foreground">&ldquo;{g.rationale}&rdquo;</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm font-semibold text-amber-400">
                  If Einstein &ldquo;promotes DEI&rdquo; but gets kept while a Holocaust documentary gets cut, the screening wasn&apos;t about DEI.
                </p>
              </CardContent>
            </Card>

            {/* Card E: The Keyword Asymmetry */}
            <Card className="glass-card border-0">
              <CardHeader>
                <CardTitle className="text-lg">The Keyword Asymmetry</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h5 className="mb-2 text-sm font-semibold text-red-400">Keywords Fox searched for</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {["LGBTQ", "Gay", "Queer", "Transgender", "Indigenous", "Native", "Tribal", "BIPOC", "Immigrant", "Asylum", "Marginalized"].map((kw) => (
                        <li key={kw}>{kw}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="mb-2 text-sm font-semibold text-green-400">Keywords Fox did NOT search for</h5>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {["White", "Caucasian", "Heterosexual", "Christian", "European", "Male"].map((kw) => (
                        <li key={kw}>{kw}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-4 border-t border-white/10 pt-4 text-sm italic text-muted-foreground">
                  &ldquo;Very well could have put heterosexual, but it is not on this list... I don&apos;t know why I didn&apos;t put heterosexual.&rdquo; — Fox Dep. 242:3-19
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
