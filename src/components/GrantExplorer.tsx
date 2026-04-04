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
import { ChevronDown, ChevronLeft, ChevronRight, Search } from "lucide-react"

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
}

const PAGE_SIZE = 50

export function GrantExplorer() {
  const [grants, setGrants] = useState<Grant[]>([])
  const [search, setSearch] = useState("")
  const [programFilter, setProgramFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deiFilter, setDeiFilter] = useState("all")
  const [epFilter, setEpFilter] = useState("all")
  const [page, setPage] = useState(0)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

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
    n != null ? "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "—"

  return (
    <section id="grants" className="relative px-4 py-24">
      <div className="section-gradient pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Data
        </h2>
        <h3 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Grant Explorer
        </h3>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search grants..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0) }}
              className="pl-8"
            />
          </div>
          <Select value={programFilter} onValueChange={(v) => { setProgramFilter(v ?? "all"); setPage(0) }}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p} value={p}>
                  {p.length > 40 ? p.slice(0, 40) + "..." : p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? "all"); setPage(0) }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Terminate">Terminated</SelectItem>
              <SelectItem value="Keep">Kept</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deiFilter} onValueChange={(v) => { setDeiFilter(v ?? "all"); setPage(0) }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="DEI Flag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All DEI Flags</SelectItem>
              <SelectItem value="staff-yes">Staff: DEI Flagged</SelectItem>
              <SelectItem value="fox-yes">Fox: Yes</SelectItem>
              <SelectItem value="chatgpt-yes">ChatGPT: Yes</SelectItem>
              <SelectItem value="override">Override (Staff N/A, Fox Yes)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={epFilter} onValueChange={(v) => { setEpFilter(v ?? "all"); setPage(0) }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Equal Protection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {epCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="mb-4 text-xs text-muted-foreground">
          {filtered.length.toLocaleString()} grants found
        </p>

        {/* Table */}
        <div className="glass-card overflow-hidden rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="w-8" />
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
              {paged.map((grant) => {
                const isExpanded = expandedRow === grant.award_id
                return (
                  <GrantRow
                    key={grant.award_id}
                    grant={grant}
                    isExpanded={isExpanded}
                    onToggle={() =>
                      setExpandedRow(isExpanded ? null : grant.award_id)
                    }
                    formatCurrency={formatCurrency}
                  />
                )
              })}
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
    </section>
  )
}

function GrantRow({
  grant,
  isExpanded,
  onToggle,
  formatCurrency,
}: {
  grant: Grant
  isExpanded: boolean
  onToggle: () => void
  formatCurrency: (n: number) => string
}) {
  return (
    <>
      <TableRow
        className="cursor-pointer border-b border-border/30"
        onClick={onToggle}
      >
        <TableCell>
          <ChevronDown
            className={`h-3 w-3 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </TableCell>
        <TableCell className="font-mono text-xs">{grant.award_id}</TableCell>
        <TableCell className="hidden max-w-[200px] truncate md:table-cell">
          {grant.title}
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
            {grant.keep_or_terminate || "—"}
          </Badge>
        </TableCell>
        <TableCell className="text-right font-mono text-xs">
          {formatCurrency(grant.remaining_amount)}
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="border-b border-border/30 hover:bg-transparent">
          <TableCell colSpan={9}>
            <div className="animate-fade-in-up px-2 py-3" style={{ animationDuration: "0.15s" }}>
              <div className="grid gap-3 text-xs sm:grid-cols-2">
                <div>
                  <p className="font-semibold">Title</p>
                  <p className="text-muted-foreground">{grant.title}</p>
                </div>
                <div>
                  <p className="font-semibold">Recipient</p>
                  <p className="text-muted-foreground">{grant.recipient_name}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="font-semibold">Description</p>
                  <p className="text-muted-foreground leading-relaxed">{grant.description || "N/A"}</p>
                </div>
                <div>
                  <p className="font-semibold">Program</p>
                  <p className="text-muted-foreground">{grant.program}</p>
                </div>
                <div>
                  <p className="font-semibold">Approved Amount</p>
                  <p className="text-muted-foreground">{formatCurrency(grant.approved_amount)}</p>
                </div>
                {grant.dei_rationale && (
                  <div className="sm:col-span-2">
                    <p className="font-semibold">DEI Rationale (ChatGPT)</p>
                    <p className="text-muted-foreground italic">&ldquo;{grant.dei_rationale}&rdquo;</p>
                  </div>
                )}
                {grant.equal_protection_category && (
                  <div>
                    <p className="font-semibold">Equal Protection Category</p>
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {grant.equal_protection_category}
                    </Badge>
                  </div>
                )}
                <div>
                  <p className="font-semibold">ChatGPT DEI Flag</p>
                  <p className="text-muted-foreground">{grant.chatgpt_dei_flag || "N/A"}</p>
                </div>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
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
