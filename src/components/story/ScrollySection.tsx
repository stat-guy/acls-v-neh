import { useState, useEffect, type ReactNode } from "react"
import { useInView } from "react-intersection-observer"
import { AnimatePresence, motion } from "framer-motion"

export interface ScrollyStep {
  id: string
  content: ReactNode
}

export interface ScrollySectionProps {
  steps: ScrollyStep[]
  renderVisual: (activeStepId: string | null) => ReactNode
  visualPosition?: "left" | "right" | "full" | "background"
}

function Step({
  step,
  onInView,
}: {
  step: ScrollyStep
  onInView: (id: string) => void
}) {
  const { ref, inView } = useInView({ threshold: 0.5 })

  useEffect(() => {
    if (inView) {
      onInView(step.id)
    }
  }, [inView, step.id, onInView])

  return (
    <div ref={ref} className="flex min-h-[60vh] items-center py-16">
      {step.content}
    </div>
  )
}

export function ScrollySection({
  steps,
  renderVisual,
  visualPosition = "background",
}: ScrollySectionProps) {
  const [activeStep, setActiveStep] = useState<string | null>(
    steps[0]?.id ?? null,
  )
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check, { passive: true })
    return () => window.removeEventListener("resize", check)
  }, [])

  // On mobile, always use background layout
  const layout = isMobile ? "background" : visualPosition

  const visual = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="h-full w-full"
      >
        {renderVisual(activeStep)}
      </motion.div>
    </AnimatePresence>
  )

  const stepsContent = (
    <div className="relative z-10">
      {steps.map((step) => (
        <Step key={step.id} step={step} onInView={setActiveStep} />
      ))}
    </div>
  )

  if (layout === "background") {
    return (
      <section className="relative">
        {/* Sticky visual behind text */}
        <div className="sticky top-0 h-screen w-full" aria-hidden>
          {visual}
        </div>

        {/* Overlaid step text cards */}
        <div className="relative z-10 -mt-[100vh]">
          <div className="mx-auto max-w-xl px-4">
            {steps.map((step) => (
              <Step key={step.id} step={step} onInView={setActiveStep} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (layout === "full") {
    return (
      <section className="relative">
        <div className="sticky top-0 h-screen w-full" aria-hidden>
          {visual}
        </div>
        <div className="relative z-10 -mt-[100vh]">
          <div className="mx-auto max-w-xl px-4">{stepsContent}</div>
        </div>
      </section>
    )
  }

  // Side-by-side layouts: left or right
  const visualSide = layout === "left" ? "order-first" : "order-last"
  const textSide = layout === "left" ? "order-last" : "order-first"

  return (
    <section className="relative flex">
      {/* Sticky visual panel */}
      <div
        className={`sticky top-0 h-screen w-[60%] ${visualSide}`}
        aria-hidden
      >
        {visual}
      </div>

      {/* Scrolling text panel */}
      <div className={`w-[40%] px-6 ${textSide}`}>{stepsContent}</div>
    </section>
  )
}
