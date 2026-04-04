import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const EXHIBIT_BASE = "https://www.acls.org/wp-content/uploads/2026/03/248-"

interface TimelineEvent {
  date: string
  actor: string
  action: string
  exhibit_source: number
  event_type: string
}

const EVENT_COLORS: Record<string, string> = {
  executive_order: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  policy: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  email: "bg-green-500/20 text-green-400 border-green-500/30",
  termination: "bg-red-500/20 text-red-400 border-red-500/30",
  legal: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  deposition: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  review: "bg-orange-500/20 text-orange-400 border-orange-500/30",
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function dedupeEvents(events: TimelineEvent[]): TimelineEvent[] {
  const seen = new Set<string>()
  return events.filter((e) => {
    const key = `${e.date}|${e.actor}|${e.action}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function Timeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [actorFilter, setActorFilter] = useState<string>("all")

  useEffect(() => {
    fetch("/timeline.json")
      .then((r) => r.json())
      .then((data: TimelineEvent[]) => setEvents(dedupeEvents(data)))
      .catch(() => {})
  }, [])

  const actors = Array.from(new Set(events.map((e) => e.actor))).sort()

  const filtered = actorFilter === "all"
    ? events
    : events.filter((e) => e.actor === actorFilter)

  return (
    <section id="timeline" className="relative px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Chronology
        </h2>
        <h3 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Timeline of Events
        </h3>

        {/* Filter */}
        <div className="mb-10 flex justify-center">
          <Select value={actorFilter} onValueChange={(v) => setActorFilter(v ?? "all")}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by actor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actors</SelectItem>
              {actors.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line */}
          <div className="timeline-line absolute left-4 top-0 h-full w-px sm:left-1/2 sm:-translate-x-px" />

          <div className="space-y-8">
            {filtered.map((event, i) => {
              const isLeft = i % 2 === 0
              const colorClass = EVENT_COLORS[event.event_type] || "bg-foreground/10 text-foreground/70 border-foreground/20"

              return (
                <div
                  key={`${event.date}-${event.actor}-${i}`}
                  className={`relative flex items-start gap-4 sm:gap-0 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* Dot */}
                  <div className="absolute left-4 top-3 z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-foreground/40 ring-4 ring-background sm:left-1/2" />

                  {/* Spacer (hidden on mobile) */}
                  <div className="hidden w-1/2 sm:block" />

                  {/* Card */}
                  <div
                    className={`ml-8 w-full sm:ml-0 sm:w-1/2 ${isLeft ? "sm:pr-8" : "sm:pl-8"}`}
                  >
                    <div className="glass-card rounded-lg p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <time className="text-xs font-medium text-muted-foreground">
                          {formatDate(event.date)}
                        </time>
                        <Badge variant="outline" className={`border text-[10px] ${colorClass}`}>
                          {event.event_type.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      <p className="mb-1 text-xs font-semibold text-foreground/90">
                        {event.actor}
                      </p>

                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {event.action}
                      </p>

                      <a
                        href={`${EXHIBIT_BASE}${event.exhibit_source}.pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-[10px] font-medium text-muted-foreground/60 transition-colors hover:text-foreground"
                      >
                        Exhibit {event.exhibit_source} &rarr;
                      </a>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
