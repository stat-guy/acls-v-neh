import { Badge } from "@/components/ui/badge"

const EXHIBIT_BASE = "https://www.acls.org/wp-content/uploads/2026/03/248-"
const MEMO_URL =
  "https://www.acls.org/wp-content/uploads/2026/03/247-Memo-of-law-in-support-of-motion-for-summary-judgment.pdf"

interface ExhibitGroup {
  label: string
  exhibits: { number: number; description: string }[]
}

const exhibitGroups: ExhibitGroup[] = [
  {
    label: "Core Communications",
    exhibits: [
      { number: 5, description: "Fox-McDonald email chain re: grant decisions" },
      { number: 8, description: "Wolfson sharing review spreadsheet with DOGE" },
      { number: 13, description: "Fox overriding N/A grants for DEI" },
      { number: 23, description: "McDonald texts re: DOGE and deficit reduction" },
      { number: 27, description: "Cavanaugh initial grant list to McDonald" },
      { number: 30, description: "Fox 1:40 AM review package" },
    ],
  },
  {
    label: "DEI Review Process",
    exhibits: [
      { number: 4, description: "OMB Memo M-25-13 and Bobley data call" },
      { number: 6, description: "DEI override examples (staff vs. Fox)" },
      { number: 9, description: "ChatGPT prompt and methodology" },
      { number: 11, description: "Excel/LLM integration evidence" },
      { number: 12, description: "Specific override cases" },
      { number: 31, description: "ChatGPT output samples" },
    ],
  },
  {
    label: "Termination Actions",
    exhibits: [
      { number: 14, description: "Keep list (27 surviving grants)" },
      { number: 20, description: "Termination notice template" },
      { number: 22, description: "Unofficial email / forged signature evidence" },
      { number: 25, description: "Program-level termination data" },
      { number: 32, description: "Analysis of kept grants" },
      { number: 34, description: "Financial motivation evidence" },
    ],
  },
  {
    label: "Executive Orders & Policy",
    exhibits: [
      { number: 37, description: "E.O. 14217 - Reduction of Federal Bureaucracy" },
      { number: 38, description: "E.O. 14151, 14168, 14190" },
      { number: 39, description: "Program termination rate analysis" },
    ],
  },
]

export function SourceDocuments() {
  return (
    <section id="sources" className="relative px-4 py-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Primary Sources
        </h2>
        <h3 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Source Documents
        </h3>
        <p className="mx-auto mb-12 max-w-xl text-center text-sm text-muted-foreground leading-relaxed">
          All exhibits are drawn from the public case record in{" "}
          <em>American Council of Learned Societies v. National Endowment for the Humanities</em>.
        </p>

        {/* Memo link */}
        <div className="mb-10 flex justify-center">
          <a
            href={MEMO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card glow-hover inline-flex items-center gap-3 rounded-xl px-6 py-4 transition-all hover:scale-[1.01]"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-muted-foreground">
              <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V6L9 1z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className="text-sm font-semibold">Memorandum of Law</p>
              <p className="text-xs text-muted-foreground">
                In support of motion for summary judgment
              </p>
            </div>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="ml-2 text-muted-foreground">
              <path d="M6 3H3v10h10v-3M10 2h4v4M8 8l6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        {/* Exhibit groups */}
        <div className="space-y-8">
          {exhibitGroups.map((group) => (
            <div key={group.label}>
              <h4 className="mb-4 text-sm font-semibold text-foreground/80">
                {group.label}
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.exhibits.map((exhibit) => (
                  <a
                    key={exhibit.number}
                    href={`${EXHIBIT_BASE}${exhibit.number}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card flex items-center gap-3 rounded-lg p-3 transition-all hover:scale-[1.01]"
                  >
                    <Badge variant="outline" className="shrink-0 text-[10px] font-mono">
                      Ex. {exhibit.number}
                    </Badge>
                    <span className="text-xs text-muted-foreground leading-snug">
                      {exhibit.description}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 border-t border-border/30 pt-8 text-center">
          <p className="text-xs text-muted-foreground/60 leading-relaxed">
            This site presents publicly available court documents and depositions for
            research and analysis purposes. It is not affiliated with any party to
            the litigation.
          </p>
        </div>
      </div>
    </section>
  )
}
