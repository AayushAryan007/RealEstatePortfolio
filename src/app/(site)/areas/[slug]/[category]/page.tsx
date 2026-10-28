import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"

import { Results, ResultsSkeleton } from "@/components/listing/results"
import { AreaSeo } from "@/components/shared/area-seo"
import { PageHero } from "@/components/shared/page-hero"
import { getLocalities, getLocalityBySlug } from "@/lib/data/content"
import { parseFilters } from "@/lib/filters"
import { mediaUrl } from "@/lib/media"
import { breadcrumbLd, JsonLd } from "@/lib/seo/json-ld"
import { isLandingCategory, landingCategories, landingSlugs } from "@/lib/seo/landing"
import { site } from "@/lib/site"

/** Prerender every area × category combination (e.g. /areas/vasundhara/flats-for-sale). */
export async function generateStaticParams() {
  const localities = await getLocalities()
  const params = localities.flatMap(({ slug }) => landingSlugs.map((category) => ({ slug, category })))
  return params.length ? params : [{ slug: "__placeholder", category: "flats-for-sale" }]
}

export async function generateMetadata({ params }: PageProps<"/areas/[slug]/[category]">): Promise<Metadata> {
  const { slug, category } = await params
  const locality = await getLocalityBySlug(slug)
  if (!locality || !isLandingCategory(category)) return { title: "Not found", robots: { index: false } }
  const c = landingCategories[category]
  return {
    title: `${c.label} in ${locality.name}`,
    description: `${c.blurb} in ${locality.name}. Browse ${c.noun} in ${locality.name} with ${site.name}, trusted since ${site.since}. Call 7011191639 / 9911550651.`,
    alternates: { canonical: `/areas/${slug}/${category}` },
  }
}

export default function AreaCategoryPage(props: PageProps<"/areas/[slug]/[category]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <Content {...props} />
    </Suspense>
  )
}

async function Content({ params, searchParams }: PageProps<"/areas/[slug]/[category]">) {
  const [{ slug, category }, query] = await Promise.all([params, searchParams])
  if (!isLandingCategory(category)) notFound()
  const locality = await getLocalityBySlug(slug)
  if (!locality) notFound()

  const c = landingCategories[category]
  const filters = { ...parseFilters(query), ...c.filters, locality: slug }

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: locality.name, path: `/areas/${slug}` },
          { name: c.label, path: `/areas/${slug}/${category}` },
        ])}
      />
      <PageHero
        eyebrow={`${locality.name} · ${site.name}`}
        title={`${c.label} in ${locality.name}`}
        description={`${c.blurb} in ${locality.name}, handpicked by ${site.name}, trusted since ${site.since}.`}
        crumbs={[
          { label: locality.name, href: `/areas/${slug}` },
          { label: c.label },
        ]}
        image={mediaUrl(locality.image_path) ?? undefined}
      />
      <section className="container-luxe py-12 sm:py-16">
        <Suspense fallback={<ResultsSkeleton withFilters={false} />}>
          <Results filters={filters} localities={[]} basePath={`/areas/${slug}/${category}`} showFilters={false} />
        </Suspense>
      </section>
      <AreaSeo area={locality.name} slug={slug} current={category} />
    </>
  )
}
