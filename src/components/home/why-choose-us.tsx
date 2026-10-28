"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { FileCheck2Icon, HandshakeIcon, KeyRoundIcon, SearchCheckIcon } from "lucide-react"

import { SectionHeading } from "@/components/shared/section-heading"
import { cn } from "@/lib/utils"

const reasons = [
  {
    Icon: SearchCheckIcon,
    title: "Verified listings only",
    body: "Every property is visited, photographed and title-checked by our team before it reaches you. No fake listings, no bait pricing.",
    image: "/media/samples/sunken-living.webp",
  },
  {
    Icon: HandshakeIcon,
    title: "Advice you can trust",
    body: "We work for you, not the deal. Expect honest comparisons, fair negotiation and clear answers, even when the answer is 'not this one'.",
    image: "/media/samples/classic-living.webp",
  },
  {
    Icon: FileCheck2Icon,
    title: "Paperwork, handled",
    body: "From agreements and loans to registry and mutation, we coordinate lawyers, banks and authorities so you don't have to.",
    image: "/media/samples/wood-foyer.webp",
  },
  {
    Icon: KeyRoundIcon,
    title: "With you after the keys",
    body: "Interior partners, tenant search, resale or rental management. Our relationship doesn't end at possession.",
    image: "/media/samples/beige-bedroom.webp",
  },
]

/**
 * Sticky-scroll reveal (after Aceternity's): on desktop the photo stays
 * pinned while the reasons scroll past, cross-fading to match the active one.
 * On phones it's a simple stack of cards.
 */
export function WhyChooseUs() {
  const [active, setActive] = useState(0)
  const itemRefs = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        }
      },
      // A thin band across the middle of the screen decides which item is active.
      { rootMargin: "-45% 0px -45% 0px" },
    )
    itemRefs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section aria-labelledby="why-title" className="section-y relative bg-ink-raised/30">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Why choose us"
          title={<span id="why-title">Built on trust. Bound by loyalty.</span>}
          description="Four promises we've kept with every family, investor and business we've worked with."
        />

        <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
          <ol className="space-y-6 lg:space-y-0">
            {reasons.map(({ Icon, title, body, image }, i) => (
              <li
                key={title}
                ref={(el) => {
                  itemRefs.current[i] = el
                }}
                data-index={i}
                className="lg:flex lg:min-h-[62vh] lg:items-center"
              >
                <div
                  className={cn(
                    "rounded-md border border-gold/10 bg-card p-6 transition-[opacity,border-color] duration-500 sm:p-8 lg:border-transparent lg:bg-transparent lg:p-0",
                    active === i ? "lg:opacity-100" : "lg:opacity-35",
                  )}
                >
                  <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-md lg:hidden">
                    <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="grid size-12 place-items-center rounded-full border border-gold/40 text-gold">
                      <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="font-heading text-lg text-gold">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-3xl text-cream sm:text-4xl">{title}</h3>
                  <p className="mt-4 max-w-md text-base leading-relaxed text-taupe">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="hidden lg:block">
            <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-md border border-gold/25">
              {reasons.map(({ image, title }, i) => (
                <Image
                  key={title}
                  src={image}
                  alt=""
                  fill
                  sizes="45vw"
                  className={cn(
                    "object-cover transition-[opacity,transform] duration-1000 ease-luxe",
                    active === i ? "scale-100 opacity-100" : "scale-105 opacity-0",
                  )}
                />
              ))}
              <div className="absolute inset-0 bg-linear-to-t from-ink/60 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
