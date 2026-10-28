import Image from "next/image"
import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Reveal } from "@/components/shared/reveal"
import { SectionHeading } from "@/components/shared/section-heading"
import { cn } from "@/lib/utils"

type Counts = { apartment: number; plot: number; commercial: number; rent: number }

const tiles = [
  {
    key: "apartment",
    title: "Apartments & Flats",
    blurb: "From smart 2 BHKs to sky-high penthouses.",
    href: "/properties?type=apartment",
    image: "/media/samples/sunken-living-800.webp",
    className: "sm:col-span-2 lg:row-span-2",
  },
  {
    key: "plot",
    title: "Plots",
    blurb: "Clear-title land in gated townships.",
    href: "/properties?type=plot",
    image: "/media/samples/villa-living-800.webp",
    className: "",
  },
  {
    key: "commercial",
    title: "Commercial",
    blurb: "Offices and retail on prime high streets.",
    href: "/properties?type=commercial",
    image: "/media/samples/walnut-hallway-800.webp",
    className: "",
  },
  {
    key: "rent",
    title: "Rentals",
    blurb: "Move-in ready homes for families and teams.",
    href: "/properties?purpose=rent",
    image: "/media/samples/beige-bedroom-800.webp",
    className: "sm:col-span-2",
  },
] as const

/** Bento grid of property categories with live counts. */
export function PropertyTypes({ counts }: { counts: Counts }) {
  return (
    <section aria-labelledby="types-title" className="section-y">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="What we offer"
          title={<span id="types-title">Every kind of address, under one roof</span>}
          description="Whether you're buying your first home, investing in land or scaling your business, we've curated the best of the NCR for you."
        />

        <div className="mt-14 grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[16rem]">
          {tiles.map((tile, i) => {
            const count = counts[tile.key]
            return (
              <Reveal key={tile.key} delay={i * 0.08} className={cn("h-full", tile.className)}>
                <Link
                  href={tile.href}
                  className="group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-md border border-gold/10 p-6 transition-[border-color,box-shadow] duration-500 hover:border-gold/50 hover:shadow-[0_0_60px_-20px_rgb(201_164_92/0.5)]"
                >
                  <Image
                    src={tile.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="-z-10 object-cover transition-transform duration-[1400ms] ease-luxe group-hover:scale-105"
                  />
                  <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-ink/55 to-ink/10" />
                  <ArrowUpRightIcon
                    aria-hidden="true"
                    className="absolute top-5 right-5 size-5 text-gold transition-transform duration-500 ease-luxe group-hover:translate-x-1 group-hover:-translate-y-1"
                    strokeWidth={1.5}
                  />
                  <p className="eyebrow">
                    {count} {count === 1 ? "listing" : "listings"}
                  </p>
                  <h3 className="mt-2 text-3xl text-cream">{tile.title}</h3>
                  <p className="mt-1 text-sm text-cream/70">{tile.blurb}</p>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
