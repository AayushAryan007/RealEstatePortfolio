import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Stats } from "@/components/home/stats"
import { BlueprintLines } from "@/components/shared/blueprint-lines"
import { PageHero } from "@/components/shared/page-hero"
import { Reveal } from "@/components/shared/reveal"
import { SectionHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { getSiteSettings } from "@/lib/data/settings"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "About Us: Trusted Real Estate Advisors in the NCR",
  description: `${site.name} helps families, investors and businesses buy, sell and rent property across Noida, Vasundhara, Indirapuram and Ghaziabad.`,
  alternates: { canonical: "/about" },
}

const values = [
  { title: "Integrity first", body: "We tell you what we'd tell our own family: the good, the bad and the paperwork." },
  { title: "Local mastery", body: "Years on the ground in every sector and society we serve. We know which lane floods and which park gets the morning sun." },
  { title: "Loyalty for life", body: "Most of our clients come back, or send their friends. That trust is the only metric we chase." },
]

export default async function AboutPage() {
  const { about, stats } = await getSiteSettings()

  return (
    <>
      <PageHero
        eyebrow="Our story"
        title={site.tagline}
        description="A family-run real estate practice serving the NCR with honesty, patience and care."
        crumbs={[{ label: "About" }]}
        image="/media/samples/classic-living.webp"
      />

      <section className="section-y relative overflow-hidden">
        <BlueprintLines />
        <div className="container-luxe grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Since day one</p>
            <h2 className="mt-4 text-4xl leading-[1.1] text-cream sm:text-5xl">{about.title}</h2>
            <p className="mt-6 text-lg leading-relaxed text-taupe">{about.body}</p>
          </Reveal>
          <Reveal delay={0.1} className="relative aspect-[4/5] overflow-hidden rounded-md border border-gold/20">
            <Image src="/media/samples/villa-living.webp" alt="Bright, elegant living room" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </Reveal>
        </div>
      </section>

      <Stats stats={stats} />

      <section className="section-y">
        <div className="container-luxe">
          <SectionHeading eyebrow="What we stand for" title="Values you can hold us to" />
          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((value, i) => (
              <Reveal as="li" key={value.title} delay={i * 0.08} className="rounded-md border border-gold/15 bg-card p-8">
                <span className="font-heading text-5xl text-gold/70">0{i + 1}</span>
                <h3 className="mt-4 text-3xl text-cream">{value.title}</h3>
                <p className="mt-3 leading-relaxed text-taupe">{value.body}</p>
              </Reveal>
            ))}
          </ul>
          <div className="mt-16 text-center">
            <Button size="lg" asChild>
              <Link href="/contact">
                Speak to an advisor <ArrowRightIcon aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
