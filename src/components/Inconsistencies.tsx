import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const EXHIBIT_BASE = "https://www.acls.org/wp-content/uploads/2026/03/248-"

interface Inconsistency {
  witness: string
  type: string
  severity: string
  deposition_citation: string
  documentary_exhibit: number
  explanation: string
  claim: string
  category: string
  quote: string
}

const SEVERITY_COLORS: Record<string, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
}

const TYPE_COLORS: Record<string, string> = {
  contradiction: "bg-red-500/10 text-red-400",
  minimization: "bg-amber-500/10 text-amber-400",
  omission: "bg-purple-500/10 text-purple-400",
}

export function Inconsistencies() {
  const [data, setData] = useState<Inconsistency[]>([])
  const [witnessFilter, setWitnessFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")

  useEffect(() => {
    fetch("/inconsistencies.json")
      .then((r) => r.json())
      .then((d: Inconsistency[]) => setData(d))
      .catch(() => {})
  }, [])

  const filtered = useMemo(() => {
    let result = data
    if (witnessFilter !== "all") result = result.filter((d) => d.witness === witnessFilter)
    if (typeFilter !== "all") result = result.filter((d) => d.type === typeFilter)
    if (severityFilter !== "all") result = result.filter((d) => d.severity === severityFilter)
    return result
  }, [data, witnessFilter, typeFilter, severityFilter])

  const witnesses = Array.from(new Set(data.map((d) => d.witness))).sort()
  const types = Array.from(new Set(data.map((d) => d.type))).sort()
  const severities = Array.from(new Set(data.map((d) => d.severity))).sort()

  return (
    <section id="inconsistencies" className="relative px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Credibility
        </h2>
        <h3 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Claims vs. Evidence
        </h3>
        <p className="mx-auto mb-8 max-w-2xl text-center text-sm text-muted-foreground leading-relaxed">
          Comparing what DOGE operatives said under oath with what the documentary evidence shows. Each card pairs a deposition quote with the contradicting document.
        </p>

        {/* Filters */}
        <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Witness</label>
            <Select value={witnessFilter} onValueChange={(v) => setWitnessFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Witness" />
              </SelectTrigger>
              <SelectContent className="min-w-[200px] max-w-[90vw]">
                <SelectItem value="all">All Witnesses</SelectItem>
                {witnesses.map((w) => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Type</label>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="min-w-[200px] max-w-[90vw]">
                <SelectItem value="all">All Types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Severity</label>
            <Select value={severityFilter} onValueChange={(v) => setSeverityFilter(v ?? "all")}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="min-w-[200px] max-w-[90vw]">
                <SelectItem value="all">All Severities</SelectItem>
                {severities.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mb-6 text-center text-xs text-muted-foreground">
          {filtered.length} inconsistencies found
        </p>

        <div className="space-y-4">
          {filtered.map((item, i) => (
            <Card key={`${item.deposition_citation}-${item.documentary_exhibit}-${i}`} className="glass-card border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid gap-0 md:grid-cols-2">
                  {/* Left: Deposition claim */}
                  <div className="border-b border-border/30 p-4 md:border-b-0 md:border-r">
                    <div className="mb-3 flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {item.witness}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {item.deposition_citation}
                      </span>
                    </div>
                    <p className="mb-2 text-xs font-medium text-foreground/70">
                      Deposition Testimony
                    </p>
                    <blockquote className="border-l-2 border-foreground/20 pl-3 text-sm italic leading-relaxed text-foreground/80">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold">Claim:</span> {item.claim}
                    </p>
                  </div>

                  {/* Right: Documentary evidence */}
                  <div className="p-4">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={`border text-[10px] ${SEVERITY_COLORS[item.severity] || ""}`}>
                        {item.severity}
                      </Badge>
                      <Badge className={`text-[10px] ${TYPE_COLORS[item.type] || ""}`}>
                        {item.type}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        {item.category.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="mb-2 text-xs font-medium text-foreground/70">
                      Documentary Evidence
                    </p>
                    <p className="text-sm leading-relaxed text-foreground/80">
                      {item.explanation}
                    </p>
                    <a
                      href={`${EXHIBIT_BASE}${item.documentary_exhibit}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M6 3H3v10h10v-3M10 2h4v4M8 8l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Exhibit {item.documentary_exhibit}
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
