import { useState, useEffect, lazy, Suspense } from "react"
import { useTheme } from "@/components/theme-provider"
import { Hero } from "@/components/Hero"
import { KeyFindings } from "@/components/KeyFindings"
import { Timeline } from "@/components/Timeline"
import { GrantExplorer } from "@/components/GrantExplorer"
import { Inconsistencies } from "@/components/Inconsistencies"
import { Charts } from "@/components/Charts"
import { SourceDocuments } from "@/components/SourceDocuments"

const GrantGalaxy = lazy(() => import("@/components/GrantGalaxy"))
const NetworkGraph = lazy(() => import("@/components/NetworkGraph"))
import { Moon, Sun, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const NAV_ITEMS = [
  { label: "Findings", href: "#findings" },
  { label: "Timeline", href: "#timeline" },
  { label: "Grants", href: "#grants" },
  { label: "Inconsistencies", href: "#inconsistencies" },
  { label: "Charts", href: "#charts" },
  { label: "Network", href: "#network" },
  { label: "Galaxy", href: "#galaxy" },
  { label: "Sources", href: "#sources" },
]

function Navbar() {
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleTheme = () => {
    if (theme === "dark") setTheme("light")
    else if (theme === "light") setTheme("dark")
    else {
      const sys = window.matchMedia("(prefers-color-scheme: dark)").matches
      setTheme(sys ? "light" : "dark")
    }
  }

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <nav
      className={`navbar-blur fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/50 bg-background/80 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Title */}
        <a
          href="#hero"
          className="text-sm font-bold tracking-tight transition-colors hover:text-foreground/80"
        >
          <span className="hidden sm:inline">ACLS v. NEH</span>
          <span className="sm:hidden">ACLS v. NEH</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {item.label}
            </a>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="ml-2 h-8 w-8 p-0"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="h-8 w-8 p-0"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="navbar-blur border-t border-border/50 bg-background/95 md:hidden">
          <div className="flex flex-col px-4 py-3">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <KeyFindings />
        <Timeline />
        <GrantExplorer />
        <Inconsistencies />
        <Charts />
        <Suspense fallback={null}>
          <NetworkGraph />
        </Suspense>
        <Suspense fallback={null}>
          <GrantGalaxy />
        </Suspense>
        <SourceDocuments />
      </main>
    </div>
  )
}

export default App
