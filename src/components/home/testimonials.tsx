import { QuoteIcon, StarIcon } from "lucide-react"

import { SectionHeading } from "@/components/shared/section-heading"
import type { TestimonialRow } from "@/types/database"

/**
 * Infinite moving cards (after Aceternity's), done in pure CSS: the list is
 * rendered twice and slid by -50% in a loop. Pauses on hover/focus; becomes
 * a swipeable row for reduced-motion visitors.
 */
export function Testimonials({ testimonials }: { testimonials: TestimonialRow[] }) {
  if (!testimonials.length) return null
  const loop = [...testimonials, ...testimonials]

  return (
    <section aria-labelledby="testimonials-title" className="section-y overflow-hidden bg-ink-raised/30">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Client stories"
          title={<span id="testimonials-title">Families who trusted us with their address</span>}
        />
      </div>

      <div className="group relative mt-14 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto motion-reduce:[mask-image:none]">
        <ul className="flex w-max animate-marquee gap-6 px-3 group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] motion-reduce:animate-none">
          {loop.map((t, i) => (
            <li
              key={`${t.id}-${i}`}
              // The second copy exists only for the visual loop.
              aria-hidden={i >= testimonials.length || undefined}
              className="w-[min(85vw,26rem)] shrink-0 rounded-md border border-gold/15 bg-card p-7 sm:p-8"
            >
              <QuoteIcon className="size-8 text-gold/60" strokeWidth={1} aria-hidden="true" />
              <blockquote className="mt-4 font-heading text-xl leading-relaxed text-cream/90 italic">
                “{t.quote}”
              </blockquote>
              <div className="mt-6 flex items-center justify-between border-t border-gold/10 pt-5">
                <div>
                  <p className="text-sm font-semibold text-cream">{t.name}</p>
                  {t.location && <p className="text-xs text-taupe">{t.location}</p>}
                </div>
                <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`} role="img">
                  {Array.from({ length: 5 }, (_, s) => (
                    <StarIcon
                      key={s}
                      aria-hidden="true"
                      className={s < t.rating ? "size-3.5 fill-gold text-gold" : "size-3.5 text-gold/30"}
                    />
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
