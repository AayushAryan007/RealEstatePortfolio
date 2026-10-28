"use client"

import { useEffect, useRef } from "react"
import { animate, useInView } from "motion/react"

import type { Stat } from "@/lib/data/settings"

const nf = new Intl.NumberFormat("en-IN")

/** One number that counts up once when it scrolls into view. */
function Counter({ value, suffix }: { value: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-10% 0px" })

  // Reset to zero after hydration (it's below the fold) so the count-up starts from 0.
  useEffect(() => {
    if (ref.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      ref.current.textContent = `0${suffix}`
    }
  }, [suffix])

  useEffect(() => {
    const el = ref.current
    if (!inView || !el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // Write straight to the DOM: no React re-render per frame.
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = nf.format(Math.round(v)) + suffix
      },
    })
    return () => controls.stop()
  }, [inView, value, suffix])

  // Server HTML shows the final number, so crawlers and no-JS visitors see real values.
  return (
    <span ref={ref} className="tabular-nums">
      {nf.format(value)}
      {suffix}
    </span>
  )
}

export function Stats({ stats }: { stats: Stat[] }) {
  return (
    <section aria-label="Gupta Properties in numbers" className="border-y border-gold/10">
      <dl className="container-luxe grid grid-cols-2 gap-y-12 py-16 lg:grid-cols-4 lg:py-20">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={
              i % 2 === 1
                ? "flex flex-col-reverse border-l border-gold/15 text-center"
                : "flex flex-col-reverse text-center lg:border-l lg:border-gold/15 lg:first:border-l-0"
            }
          >
            {/* dt must come first in a <dl> group; flex-col-reverse shows the number on top. */}
            <dt className="mt-3 text-[0.7rem] font-semibold tracking-[0.24em] text-cream/75 uppercase">
              {stat.label}
            </dt>
            <dd className="font-heading text-5xl font-semibold text-gold sm:text-6xl">
              <Counter value={stat.value} suffix={stat.suffix} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
