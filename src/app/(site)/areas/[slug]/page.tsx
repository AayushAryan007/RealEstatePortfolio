import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"

import { Results, ResultsSkeleton } from "@/components/listing/results"
import { PageHero } from "@/components/shared/page-hero"
import { getLocalities, getLocalityBySlug } from "@/lib/data/content"
import { parseFilters } from "@/lib/filters"
import { mediaUrl } from "@/lib/media"
import { breadcrumbLd, JsonLd } from "@/lib/seo/json-ld"

export async function generateStaticParams() {
  const localities = await getLocalities()
  return localities.length ? localities.map(({ slug }) => ({ slug })) : [{ slug: "__placeholder" }]
}

export async function generateMetadata({ params }: PageProps<"/areas/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const locality = await getLocalityBySlug(slug)
  if (!locality) return { title: "Area not found", robots: { index: false } }
  return {
    title: `Properties in ${locality.name}: Flats, Plots & Rentals`,
    description: `Buy or rent apartments, plots and commercial property in ${locality.name}. ${locality.intro ?? ""}`.trim(),
    alternates: { canonical: `/areas/${slug}` },
  }
}

/** Local landing page per area: intro + every listing there (local SEO). */
export default function AreaPage(props: PageProps<"/areas/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <AreaContent {...props} />
    </Suspense>
  )
}

async function AreaContent({ params, searchParams }: PageProps<"/areas/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const locality = await getLocalityBySlug(slug)
  if (!locality) notFound()

  const filters = { ...parseFilters(query), locality: slug }

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Areas", path: "/properties" },
          { name: locality.name, path: `/areas/${slug}` },
        ])}
      />
      <PageHero
        eyebrow="Area guide"
        title={`Properties in ${locality.name}`}
        description={locality.intro}
        crumbs={[{ label: "Properties", href: "/properties" }, { label: locality.name }]}
        image={mediaUrl(locality.image_path) ?? undefined}
      />
      <section className="container-luxe py-12 sm:py-16">
        <Suspense fallback={<ResultsSkeleton withFilters={false} />}>
          <Results filters={filters} localities={[]} basePath={`/areas/${slug}`} showFilters={false} />
        </Suspense>
      </section>
    </>
  )
}
