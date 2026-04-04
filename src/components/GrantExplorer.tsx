import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Search, X } from "lucide-react"

interface Grant {
  award_id: string
  title: string
  recipient_name: string
  program: string
  description: string
  approved_amount: number
  remaining_amount: number
  staff_dei_level: string | null
  chatgpt_dei_flag: string | null
  fox_dei_flag: string | null
  dei_rationale: string | null
  keep_or_terminate: string
  terminated: number
  equal_protection_category: string | null
  in_ex06: number
  in_ex07: number
  in_ex09: number
  in_ex12: number
  in_ex25: number
}

const PAGE_SIZE = 50

const EXHIBIT_LABELS: Record<string, string> = {
  in_ex06: "Exhibit 6",
  in_ex07: "Exhibit 7",
  in_ex09: "Exhibit 9",
  in_ex12: "Exhibit 12",
  in_ex25: "Exhibit 25",
}

export function GrantExplorer() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [search, setSearch] = useState("")
  const [programFilter, setProgramFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deiFilter, setDeiFilter] = useState("all")
  const [epFilter, setEpFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null)

  useEffect(() => {
    fetch("/grants_sample.json")
      .then((r) => r.json())
      .then((data: Grant[]) => setGrants(data))
      .catch(() => {})
  }, [])

  const programs = useMemo(
    () => Array.from(new Set(grants.map((g) => g.program).filter((p) => p && p.trim()))).sort(),
    [grants]
  )

  const epCategories = useMemo(
    () =>
      Array.from(new Set(grants.map((g) => g.equal_protection_category).filter(Boolean))).sort() as string[],
    [grants]
  )

  const filtered = useMemo(() => {
    let result = grants

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (g) =>
          (g.title ?? "").toLowerCase().includes(q) ||
          (g.recipient_name ?? "").toLowerCase().includes(q) ||
          (g.award_id ?? "").toLowerCase().includes(q) ||
          (g.description ?? "").toLowerCase().includes(q)
      )
    }
    if (programFilter !== "all") {
      result = result.filter((g) => g.program === programFilter)
    }
    if (statusFilter !== "all") {
      result = result.filter((g) => g.keep_or_terminate === statusFilter)
    }
    if (deiFilter === "staff-yes") {
      result = result.filter((g) => g.staff_dei_level && g.staff_dei_level !== "N/A")
    } else if (deiFilter === "fox-yes") {
      result = result.filter((g) => g.fox_dei_flag === "Yes")
    } else if (deiFilter === "chatgpt-yes") {
      result = result.filter((g) => g.chatgpt_dei_flag === "Yes")
    } else if (deiFilter === "override") {
      result = result.filter(
        (g) =>
          (!g.staff_dei_level || g.staff_dei_level === "N/A") &&
          g.fox_dei_flag === "Yes"
      )
    }
    if (epFilter !== "all") {
      result = result.filter((g) => g.equal_protection_category === epFilter)
    }

    return result
  }, [grants, search, programFilter, statusFilter, deiFilter, epFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(0, totalPages - 1))
  const paged = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const formatCurrency = (n: number | null | undefined) =>
    n != null ? "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "\u2014"

  return (
    <section id="grants" className="relative px-4 py-24">
      <div className="section-gradient pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Data
        </h2>
        <h3 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Grant Explorer
        </h3>

        <p className="mx-auto mb-8 max-w-3xl text-center text-sm text-muted-foreground leading-relaxed">
          Browse all 2,415 NEH grants reviewed during the DOGE termination process.
          Filter by program, termination status, DEI classification, or equal protection
          category. Click any row to see full details.
        </p>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex flex-col flex-1 sm:max-w-xs">
            <label className="text-xs text-muted-foreground mb-1">Search</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search grants..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0) }}
                className="pl-8 pr-8"
              />
              {search && (
                <button
                  onClick={() => { setSearch(""); setPage(0) }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">Program</label>
            <Select value={programFilter} onValueChange={(v) => { setProgramFilter(v ?? "all"); setPage(0) }}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Program" />
              </SelectTrigger>
              <SelectContent className="min-w-[280px] max-w-[90vw]">
                <SelectItem value="all">All Programs</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">Decision</label>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(0) }}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Decision" />
              </SelectTrigger>
              <SelectContent className="min-w-[280px] max-w-[90vw]">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Terminate">Terminated</SelectItem>
                <SelectItem value="Keep">Kept</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">DEI Flag</label>
            <Select value={deiFilter} onValueChange={(v) => { setDeiFilter(v ?? "all"); setPage(0) }}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="DEI Flag" />
              </SelectTrigger>
              <SelectContent className="min-w-[280px] max-w-[90vw]">
                <SelectItem value="all">All DEI Flags</SelectItem>
                <SelectItem value="staff-yes">Staff: DEI Flagged</SelectItem>
                <SelectItem value="fox-yes">Fox: Yes</SelectItem>
                <SelectItem value="chatgpt-yes">ChatGPT: Yes</SelectItem>
                <SelectItem value="override">Override (Staff N/A, Fox Yes)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground mb-1">Equal Protection</label>
            <Select value={epFilter} onValueChange={(v) => { setEpFilter(v ?? "all"); setPage(0) }}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Equal Protection" />
              </SelectTrigger>
              <SelectContent className="min-w-[280px] max-w-[90vw]">
                <SelectItem value="all">All Categories</SelectItem>
                {epCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mb-4 text-xs text-muted-foreground">
          {filtered.length.toLocaleString()} grants found
        </p>

        {/* Table */}
        <div className="glass-card overflow-x-auto rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead>Award ID</TableHead>
                <TableHead className="hidden md:table-cell">Title</TableHead>
                <TableHead className="hidden lg:table-cell">Recipient</TableHead>
                <TableHead className="hidden xl:table-cell">Program</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Fox</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((grant) => (
                <TableRow
                  key={grant.award_id}
                  className="cursor-pointer border-b border-border/30"
                  onClick={() => setSelectedGrant(grant)}
                >
                  <TableCell className="font-mono text-xs">{grant.award_id}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="max-w-[200px]">
                      <p className="truncate">{grant.title}</p>
                      {grant.description && (
                        <p className="truncate text-[10px] text-muted-foreground">{grant.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="hidden max-w-[150px] truncate lg:table-cell">
                    {grant.recipient_name}
                  </TableCell>
                  <TableCell className="hidden max-w-[180px] truncate text-xs xl:table-cell">
                    {grant.program}
                  </TableCell>
                  <TableCell>
                    <DeiLabel value={grant.staff_dei_level} />
                  </TableCell>
                  <TableCell>
                    <DeiLabel value={grant.fox_dei_flag} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={grant.keep_or_terminate === "Keep" ? "secondary" : grant.keep_or_terminate ? "destructive" : "outline"}
                      className="text-[10px]"
                    >
                      {grant.keep_or_terminate || "\u2014"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(grant.remaining_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Grant Detail Modal */}
      {selectedGrant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedGrant(null)}
        >
          <div
            className="glass-card relative mx-4 max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedGrant(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-5 text-sm">
              {/* Title & Recipient */}
              <div>
                <p className="font-mono text-xs text-muted-foreground">{selectedGrant.award_id}</p>
                <h4 className="mt-1 text-lg font-semibold leading-snug">{selectedGrant.title}</h4>
                <p className="mt-1 text-muted-foreground">{selectedGrant.recipient_name}</p>
              </div>

              {/* Description */}
              {selectedGrant.description && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
                  <p className="leading-relaxed">{selectedGrant.description}</p>
                </div>
              )}

              {/* Program */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Program</p>
                <p>{selectedGrant.program}</p>
              </div>

              {/* Financial Details */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financial Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Approved</p>
                    <p className="font-mono">{formatCurrency(selectedGrant.approved_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Remaining</p>
                    <p className="font-mono">{formatCurrency(selectedGrant.remaining_amount)}</p>
                  </div>
                </div>
              </div>

              {/* DEI Analysis */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">DEI Analysis</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Staff Level</p>
                    <p>{selectedGrant.staff_dei_level || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ChatGPT Flag</p>
                    <p>{selectedGrant.chatgpt_dei_flag || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fox Flag</p>
                    <p>{selectedGrant.fox_dei_flag || "N/A"}</p>
                  </div>
                </div>
                {selectedGrant.dei_rationale && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">DEI Rationale</p>
                    <p className="mt-0.5 italic text-muted-foreground">&ldquo;{selectedGrant.dei_rationale}&rdquo;</p>
                  </div>
                )}
              </div>

              {/* Equal Protection */}
              {selectedGrant.equal_protection_category && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Equal Protection Category</p>
                  <Badge variant="outline">{selectedGrant.equal_protection_category}</Badge>
                </div>
              )}

              {/* Termination Status */}
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Termination Status</p>
                <Badge
                  variant={selectedGrant.keep_or_terminate === "Keep" ? "secondary" : selectedGrant.keep_or_terminate ? "destructive" : "outline"}
                >
                  {selectedGrant.keep_or_terminate || "Unknown"}
                </Badge>
              </div>

              {/* Exhibits */}
              {(() => {
                const exhibits = Object.entries(EXHIBIT_LABELS).filter(
                  ([key]) => selectedGrant[key as keyof Grant] === 1
                )
                if (exhibits.length === 0) return null
                return (
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Referenced in Exhibits</p>
                    <div className="flex flex-wrap gap-1.5">
                      {exhibits.map(([key, label]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function DeiLabel({ value }: { value: string | null }) {
  if (!value) return <span className="text-[10px] text-muted-foreground/50">--</span>
  if (value === "Yes" || value === "High" || value === "Medium")
    return (
      <Badge variant="destructive" className="text-[10px]">
        {value}
      </Badge>
    )
  if (value === "N/A")
    return (
      <span className="text-[10px] text-muted-foreground">N/A</span>
    )
  return (
    <Badge variant="outline" className="text-[10px]">
      {value}
    </Badge>
  )
}
