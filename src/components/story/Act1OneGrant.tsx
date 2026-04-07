import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const GRANT = {
  id: "PD28743922",
  title: "Restoration and Early-Stage Documentation of Chiricahua-Mescalero Apache",
  recipient: "Fort Sill Apache Tribe",
  program: "Documenting Endangered Languages",
  amount: 425823,
  startDate: "2022",
  description:
    "The restoration of archival digital recordings documenting the sound heritage of the Apache prisoners of war who were seized with Geronimo in 1886 and the transcription, translation, and linguistic analysis of the Chihene Apache dialect preserved in these recordings.",
}

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Act1OneGrant() {
  const { ref: dateRef, inView: dateInView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  })

  const imgBase = import.meta.env.BASE_URL + "story/images/"

  return (
    <section className="relative min-h-[200vh] px-4 py-32">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />

      <div className="relative mx-auto max-w-3xl">
        {/* The grant reveal */}
        <FadeIn>
          <p className="text-center text-sm font-medium uppercase tracking-[0.3em] text-gray-500">
            Act I
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <h2 className="mt-6 text-center text-3xl font-bold leading-tight sm:text-5xl">
            One Grant
          </h2>
        </FadeIn>

        {/* Apache Prisoners of War photo */}
        <FadeIn delay={0.3} className="mt-12">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={imgBase + "apache-pow.png"}
              alt="Apache Prisoners of War at Fort Sill — the people whose language recordings this grant aimed to preserve"
              className="w-full object-cover"
              style={{ maxHeight: "400px" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-xs text-gray-400 italic">
              Apache Prisoners of War at Fort Sill — the people whose language
              recordings this grant aimed to preserve
            </p>
          </div>
        </FadeIn>

        <div className="mt-12" />

        <FadeIn delay={0.1}>
          <div className="rounded-2xl border border-gray-800 bg-gray-950/80 p-8 backdrop-blur sm:p-12">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Award {GRANT.id} &middot; {GRANT.program}
            </p>

            <h3 className="mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl">
              {GRANT.title}
            </h3>

            <p className="mt-2 text-lg font-medium text-amber-400">
              {GRANT.recipient}
            </p>

            <p className="mt-6 text-base leading-relaxed text-gray-300">
              {GRANT.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <div>
                <p className="text-gray-500">Awarded</p>
                <p className="text-xl font-bold text-white">
                  ${GRANT.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Started</p>
                <p className="text-xl font-bold text-white">{GRANT.startDate}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="text-xl font-bold text-red-500">Terminated</p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* The date */}
        <div className="mt-32" />

        <FadeIn>
          <div className="text-center">
            <p className="text-lg text-gray-400">
              The descendants of Geronimo&apos;s band were preserving the last
              recordings of their ancestral language — sounds captured from
              prisoners of war over a century ago.
            </p>
          </div>
        </FadeIn>

        <div className="mt-24" />

        <motion.div
          ref={dateRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={
            dateInView
              ? { opacity: 1, scale: 1 }
              : { opacity: 0, scale: 0.8 }
          }
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center"
        >
          <p className="text-sm font-medium uppercase tracking-widest text-gray-500">
            On
          </p>
          <p className="mt-2 text-5xl font-black tracking-tight text-red-500 sm:text-7xl">
            March 14, 2025
          </p>
          <p className="mt-4 text-lg text-gray-400">
            this project was terminated.
          </p>
        </motion.div>

        <div className="mt-24" />

        <FadeIn>
          <p className="text-center text-xl text-gray-300">
            It was not alone.
          </p>
        </FadeIn>

        <div className="mt-8" />

        <FadeIn delay={0.3}>
          <p className="text-center text-lg text-gray-500">
            Over the next 22 days, 1,476 more grants would follow.
          </p>
        </FadeIn>
      </div>
    </section>
  )
}
