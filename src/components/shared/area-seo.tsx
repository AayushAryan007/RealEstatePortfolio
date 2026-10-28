import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Ornament } from "@/components/shared/section-heading"
import { areaFaqs, faqLd, landingCategories, landingSlugs, type LandingCategory } from "@/lib/seo/landing"
import { JsonLd } from "@/lib/seo/json-ld"
import { site } from "@/lib/site"

/**
 * Local-SEO block for area pages: a short guide, links to every search-intent
 * page for this area, and an FAQ (with FAQPage structured data).
 */
export function AreaSeo({ area, slug, current }: { area: string; slug: string; current?: LandingCategory }) {
  const faqs = areaFaqs(area)

  return (
    <section aria-labelledby="area-guide-title" className="border-t border-gold/10">
      <JsonLd data={faqLd(faqs)} />
      <div className="container-luxe grid gap-14 py-16 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <Ornament className="mb-5" />
          <p className="eyebrow">Local property experts</p>
          <h2 id="area-guide-title" className="mt-4 text-3xl leading-tight text-cream sm:text-4xl">
            Buy, sell or rent property in {area} with {site.name}
          </h2>
          <div className="mt-6 space-y-4 leading-relaxed text-taupe">
            <p>
              Since {site.since}, {site.name} has been a trusted property dealer for {area} and the wider NCR, from our office at{" "}
              {site.contact.address}. We help families, investors and businesses with sale, purchase and rent of flats, plots and
              commercial property, as well as building design and construction.
            </p>
            <p>
              Tell us your budget and preferred society or sector and we&apos;ll shortlist the right options, arrange visits and guide you
              through the paperwork.
            </p>
          </div>

          <h3 className="mt-10 text-2xl text-cream">Popular searches in {area}</h3>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {landingSlugs
              .filter((c) => c !== current)
              .map((c) => (
                <li key={c}>
                  <Link
                    href={`/areas/${slug}/${c}`}
                    className="group flex items-center justify-between gap-3 rounded-xs border border-gold/15 px-4 py-3 text-sm text-cream/85 transition-colors hover:border-gold/50 hover:text-cream"
                  >
                    {landingCategories[c].label} in {area}
                    <ArrowUpRightIcon className="size-4 text-gold transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div>
          <h2 className="text-3xl text-cream sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-gold/10 border-y border-gold/10">
            {faqs.map((faq, i) => (
              <details key={faq.q} className="group py-5" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-heading text-xl text-cream [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span aria-hidden="true" className="mt-1 text-gold transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 leading-relaxed text-taupe">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
