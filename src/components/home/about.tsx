import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { BlueprintLines } from "@/components/shared/blueprint-lines"
import { Reveal } from "@/components/shared/reveal"
import { Ornament } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import type { AboutSettings } from "@/lib/data/settings"

/** Experience badge + intro, with a layered photo composition. */
export function About({ about }: { about: AboutSettings }) {
  return (
    <section aria-labelledby="about-title" className="section-y relative overflow-hidden">
      <BlueprintLines />
      <div className="container-luxe grid items-center gap-16 lg:grid-cols-2">
        <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-gold/20">
            <Image
              src="/media/samples/wood-foyer.webp"
              alt="Warm wooden entrance foyer with a bench and plants"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -right-4 -bottom-8 w-2/5 overflow-hidden rounded-md border border-gold/30 shadow-2xl sm:-right-8">
            <div className="relative aspect-square">
              <Image
                src="/media/samples/beige-bedroom-800.webp"
                alt=""
                fill
                sizes="20vw"
                className="object-cover"
              />
            </div>
          </div>
          {/* Experience badge */}
          <div className="absolute -top-6 -left-2 grid size-32 place-items-center rounded-full border border-gold/40 bg-ink/90 text-center backdrop-blur-md sm:-left-6 sm:size-36">
            <div>
              <p className="font-heading text-5xl leading-none font-semibold text-gold">{about.years}+</p>
              <p className="mt-1 text-[0.6rem] font-semibold tracking-[0.24em] text-cream/80 uppercase">
                Years of
                <br />
                trust
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Ornament className="mb-5" />
          <p className="eyebrow">About Gupta Properties</p>
          <h2 id="about-title" className="mt-4 text-4xl leading-[1.1] text-cream sm:text-5xl">
            {about.title}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-taupe sm:text-lg">{about.body}</p>
          <ul className="mt-8 grid gap-4 text-sm text-cream/85 sm:grid-cols-2">
            {["Verified, clear-title listings", "Transparent pricing, no surprises", "End-to-end paperwork support", "After-sale & tenant assistance"].map(
              (point) => (
                <li key={point} className="flex items-center gap-3">
                  <span aria-hidden="true" className="size-1.5 rotate-45 bg-gold" />
                  {point}
                </li>
              ),
            )}
          </ul>
          <Button size="lg" variant="gold" asChild className="mt-10">
            <Link href="/about">
              Our story <ArrowRightIcon aria-hidden="true" />
            </Link>
          </Button>
        </Reveal>
      </div>
    </section>
  )
}
