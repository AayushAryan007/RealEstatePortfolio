import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { SectionHeading } from "@/components/shared/section-heading"
import { mediaUrl } from "@/lib/media"
import type { LocalityRow } from "@/types/database"

/** Localities we serve; each links to its own area page (good for local SEO). */
export function Areas({ localities }: { localities: LocalityRow[] }) {
  if (!localities.length) return null

  return (
    <section aria-labelledby="areas-title" className="section-y">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Areas we serve"
          title={<span id="areas-title">Rooted in the neighbourhoods we know best</span>}
          description="Deep local knowledge of every society, sector and street, so you never buy blind."
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {localities.map((locality, i) => {
            const image = mediaUrl(locality.image_path)
            return (
              <Reveal as="li" key={locality.id} delay={i * 0.08}>
                <Link
                  href={`/areas/${locality.slug}`}
                  className="group relative isolate flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-md border border-gold/10 p-6 transition-colors duration-500 hover:border-gold/50"
                >
                  {image && (
                    <Image
                      src={image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="-z-10 object-cover grayscale-[35%] transition-[transform,filter] duration-[1400ms] ease-luxe group-hover:scale-105 group-hover:grayscale-0"
                    />
                  )}
                  <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/40 to-transparent" />
                  <h3 className="text-3xl text-cream">{locality.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-cream/70">{locality.intro}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-[0.24em] text-gold uppercase">
                    Explore <ArrowUpRightIcon aria-hidden="true" className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
