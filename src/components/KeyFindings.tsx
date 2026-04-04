import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronDown } from "lucide-react"

const EXHIBIT_BASE = "https://www.acls.org/wp-content/uploads/2026/03/248-"

interface Finding {
  id: number
  title: string
  summary: string
  detail: string
  exhibits: number[]
}

const findings: Finding[] = [
  {
    id: 1,
    title: "The \"Keep\" List Reveals the Pattern",
    summary: "Only 27 grants survived. All concerned presidential papers or famous white Western figures.",
    detail:
      "Of 1,504 grants reviewed, only 27 were retained. Every surviving grant fell into one of two categories: presidential papers projects (Andrew Jackson, Thomas Edison, Albert Einstein) or scholarship on canonical white Western figures (John Duns Scotus, Karl Barth, the Brownings). Not a single grant focused on a non-white historical figure, non-Western culture, or community-based humanities initiative was kept. The pattern is not explained by any published review criterion.",
    exhibits: [14, 32],
  },
  {
    id: 2,
    title: "DEI Overrides: Staff Said No, Fox Said Yes",
    summary: "10+ grants rated N/A by NEH experts were overridden by Fox using ChatGPT.",
    detail:
      "NEH career staff reviewed grants and rated many as N/A (not applicable) for DEI involvement. Fox then re-reviewed these using ChatGPT and overrode the staff determinations. Topics flagged by Fox as DEI-related included: Asian American Republicans, a study of Yo-Yo Ma's family history, and research on Denmark Vesey. Fox testified he re-reviewed these grants \"at McDonald and Wolfson's direction,\" but documentary evidence shows Fox initiated the process.",
    exhibits: [6, 12],
  },
  {
    id: 3,
    title: "Entire Programs Wiped Out",
    summary: "56 programs had 100% termination rates while presidential papers survived at 38%.",
    detail:
      "Fifty-six NEH programs experienced complete elimination: every single grant terminated. These included State Humanities Councils, Digital Humanities Advancement Grants, Infrastructure Challenge Grants, all education programs, and preservation grants. Meanwhile, Scholarly Editions and Translations (home to presidential papers projects) had only a 38% termination rate. Individual fellowship programs had 0% termination. This pattern demonstrates wholesale programmatic elimination rather than individual grant-level review.",
    exhibits: [25, 39],
  },
  {
    id: 4,
    title: "The Financial Motive Behind the DEI Screen",
    summary: "$149.4M in remaining funds clawed back. DOGE wanted deficit reduction, not DEI enforcement.",
    detail:
      "The total remaining funds on terminated grants was $149.4 million. Acting Chairman McDonald admitted in communications that DOGE wanted cuts \"to assist in deficit reduction\" independent of any DEI concerns. His own text message stated: \"DOGE cut grants having nothing to do with DEI.\" The DEI screening process served as post-hoc justification for a financially motivated mass termination.",
    exhibits: [23, 34],
  },
  {
    id: 5,
    title: "The Mutual Blame Loop",
    summary: "Fox points to McDonald, Cavanaugh points to Fox, McDonald points to DOGE. Nobody claims ownership.",
    detail:
      "Deposition testimony reveals a circular chain of blame. Fox testified that McDonald and Wolfson made all final decisions. Cavanaugh's communications point to Fox as the operational lead. McDonald's testimony deflects to DOGE directives. Yet documentary evidence -- emails, spreadsheets, and the 1:40 AM review package -- consistently shows Fox as the person who built the review framework, ran the ChatGPT analysis, and delivered termination recommendations.",
    exhibits: [1, 2, 5, 23],
  },
  {
    id: 6,
    title: "ChatGPT as Constitutional Decision-Maker",
    summary: "\"Does the following relate at all to DEI?\" -- the prompt that determined the fate of $149M in grants.",
    detail:
      "Fox used a single ChatGPT prompt integrated into an Excel spreadsheet: \"Does the following relate at all to DEI?\" No definition of DEI was provided to the model. Grant descriptions were truncated to approximately 120 characters. When asked in deposition whether a definition was needed, Fox responded: \"It didn't matter. We didn't need to.\" The model's binary yes/no outputs were then used to classify grants for termination -- a process affecting constitutional rights without any human subject-matter review.",
    exhibits: [9, 11, 31],
  },
  {
    id: 7,
    title: "22 Days, Zero Safeguards",
    summary: "From first DOGE contact to mass termination in 22 days. No program officers. No peer review.",
    detail:
      "The timeline ran from March 12 (Cavanaugh's first email with the grant list) to April 2 (mass termination notices sent). In that 22-day window: no NEH program officers were consulted on any termination decision, no peer review process was followed, termination letters bore a forged signature of an official who had not reviewed or approved them, and communications used an unofficial email address. Standard federal grant termination procedures require notice, opportunity to respond, and documented justification -- none of which occurred.",
    exhibits: [20, 22, 27],
  },
]

export function KeyFindings() {
  const [expanded, setExpanded] = useState<number | null>(null)

  return (
    <section id="findings" className="relative px-4 py-24">
      <div className="section-gradient pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-4xl">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Analysis
        </h2>
        <h3 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Key Findings
        </h3>

        <div className="space-y-4">
          {findings.map((finding) => {
            const isOpen = expanded === finding.id
            return (
              <Card
                key={finding.id}
                className="glass-card cursor-pointer border-0 transition-all duration-300"
                onClick={() => setExpanded(isOpen ? null : finding.id)}
              >
                <CardHeader className="pb-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground/10 text-xs font-bold">
                        {finding.id}
                      </span>
                      <div>
                        <CardTitle className="text-base font-semibold leading-snug sm:text-lg">
                          {finding.title}
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {finding.summary}
                        </p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </div>
                </CardHeader>

                {isOpen && (
                  <CardContent className="animate-fade-in-up pt-4" style={{ animationDuration: "0.2s" }}>
                    <div className="border-t border-border/50 pt-4">
                      <p className="text-sm leading-relaxed text-foreground/80">
                        {finding.detail}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {finding.exhibits.map((n) => (
                          <a
                            key={n}
                            href={`${EXHIBIT_BASE}${n}.pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Badge variant="outline" className="cursor-pointer text-xs hover:bg-foreground/10">
                              Exhibit {n}
                            </Badge>
                          </a>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://www.acls.org/wp-content/uploads/2026/03/247-Memo-of-law-in-support-of-motion-for-summary-judgment.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M8 1v10M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Read the full Memorandum of Law
          </a>
        </div>
      </div>
    </section>
  )
}
