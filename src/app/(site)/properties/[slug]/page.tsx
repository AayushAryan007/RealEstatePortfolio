import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  BathIcon,
  BedDoubleIcon,
  Building2Icon,
  CalendarCheckIcon,
  CheckIcon,
  CompassIcon,
  LayersIcon,
  MailIcon,
  MapPinIcon,
  MaximizeIcon,
  PhoneIcon,
  SofaIcon,
} from "lucide-react"

import { Gallery } from "@/components/property/gallery"
import { PropertyCard } from "@/components/property/property-card"
import { PropertyMap } from "@/components/property/property-map"
import { PropertyVideo } from "@/components/property/property-video"
import { FavoriteButton } from "@/components/property/favorite-button"
import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { ContactMenu } from "@/components/shared/contact-menu"
import { EnquiryForm } from "@/components/shared/enquiry-form"
import { Ornament } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { getAllPropertySlugs, getPropertyBySlug, getSimilarProperties, type PropertyDetail } from "@/lib/data/properties"
import { getSiteSettings } from "@/lib/data/settings"
import { formatArea, formatPrice, propertyTypeLabel, purposeLabel } from "@/lib/format"
import { facingLabel, furnishingLabel, possessionLabel } from "@/lib/labels"
import { mediaUrl } from "@/lib/media"
import { absoluteUrl, breadcrumbLd, JsonLd } from "@/lib/seo/json-ld"
import { site } from "@/lib/site"

export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs()
  // At least one entry is required; unknown slugs still render on demand.
  return slugs.length ? slugs.map(({ slug }) => ({ slug })) : [{ slug: "__placeholder" }]
}

export async function generateMetadata({ params }: PageProps<"/properties/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const property = await getPropertyBySlug(slug)
  if (!property) return { title: "Property not found", robots: { index: false } }

  const price = formatPrice(property.price, property.purpose, property.price_on_request)
  const where = property.locality?.name ?? "Delhi NCR"
  const title = `${property.title}: ${price}`
  const description =
    property.short_description ??
    `${propertyTypeLabel[property.type]} ${purposeLabel[property.purpose].toLowerCase()} in ${where}. ${price}.`

  return {
    title,
    description,
    alternates: { canonical: `/properties/${slug}` },
    openGraph: { title, description, type: "website", url: `/properties/${slug}` },
  }
}

export default function PropertyPage(props: PageProps<"/properties/[slug]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PropertyDetails params={props.params} />
    </Suspense>
  )
}

async function PropertyDetails({ params }: { params: PageProps<"/properties/[slug]">["params"] }) {
  const { slug } = await params
  const [property, settings] = await Promise.all([getPropertyBySlug(slug), getSiteSettings()])
  if (!property) notFound()

  const similar = await getSimilarProperties(property)
  const price = formatPrice(property.price, property.purpose, property.price_on_request)
  const area = formatArea(property.area, property.area_unit)
  const closed = property.availability !== "available"
  const url = `${site.url}/properties/${property.slug}`
  const waMessage = `Hi ${site.shortName} team, I'm interested in "${property.title}" (${url}). Please share more details.`

  const images = property.images.map((img) => ({
    full: mediaUrl(img.path_full)!,
    thumb: mediaUrl(img.path_thumb)!,
    width: img.width,
    height: img.height,
    alt: img.alt ?? property.title,
  }))

  return (
    <article className="pt-28 pb-20 sm:pt-32">
      <JsonLd data={[listingLd(property, images[0]?.full), breadcrumbLd([
        { name: "Home", path: "/" },
        { name: "Properties", path: "/properties" },
        { name: property.title, path: `/properties/${property.slug}` },
      ])]} />

      <div className="container-luxe">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-taupe">
          <Link href="/properties" className="hover:text-cream">
            ← Back to all properties
          </Link>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_24rem] xl:gap-14">
          {/* ---------- Main column ---------- */}
          <div className="min-w-0">
            <Gallery images={images} title={property.title} />

            <header className="mt-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{purposeLabel[property.purpose]}</Badge>
                <Badge>{propertyTypeLabel[property.type]}</Badge>
                {closed && <Badge gold>{property.availability === "sold" ? "Sold" : "Rented"}</Badge>}
              </div>
              <div className="mt-4 flex items-start justify-between gap-4">
                <h1 className="text-4xl leading-[1.08] text-cream sm:text-5xl">{property.title}</h1>
                <FavoriteButton id={property.id} title={property.title} className="mt-1 shrink-0" />
              </div>
              <p className="mt-3 flex items-center gap-2 text-taupe">
                <MapPinIcon className="size-4 shrink-0 text-gold" strokeWidth={1.5} aria-hidden="true" />
                {property.address ?? property.locality?.name}
              </p>
              <p className="mt-5 font-heading text-4xl font-semibold text-gold lg:hidden">{price}</p>
            </header>

            <Facts property={property} area={area} />

            {property.description && (
              <Section title="About this property">
                {/* Description HTML is sanitised when saved in the admin panel. */}
                <div
                  className="space-y-4 text-base leading-relaxed text-cream/80 [&_a]:text-gold [&_h2]:font-heading [&_h2]:text-2xl [&_h2]:text-cream [&_h3]:font-heading [&_h3]:text-xl [&_h3]:text-cream [&_li]:ml-5 [&_ol]:list-decimal [&_strong]:text-cream [&_ul]:list-disc"
                  dangerouslySetInnerHTML={{ __html: property.description }}
                />
              </Section>
            )}

            {property.amenities.length > 0 && (
              <Section title="Amenities">
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {property.amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-3 text-sm text-cream/85">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full border border-gold/40 text-gold">
                        <CheckIcon className="size-3.5" aria-hidden="true" />
                      </span>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {(property.video_url || property.video_path) && (
              <Section title="Video tour">
                <PropertyVideo url={property.video_url} fileUrl={mediaUrl(property.video_path)} title={property.title} />
              </Section>
            )}

            {property.lat !== null && property.lng !== null && (
              <Section title="Location">
                <PropertyMap lat={property.lat} lng={property.lng} label={property.address ?? property.title} />
              </Section>
            )}
          </div>

          {/* ---------- Sticky contact card ---------- */}
          <aside aria-label="Contact about this property" className="lg:pt-0">
            <div className="sticky top-28 space-y-5 rounded-md border border-gold/20 bg-card p-6 shadow-[0_30px_80px_-40px_rgb(201_164_92/0.35)] sm:p-7">
              <div>
                <p className="eyebrow">{property.purpose === "rent" ? "Monthly rent" : "Asking price"}</p>
                <p className="mt-2 font-heading text-4xl font-semibold text-gold">{price}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <ContactMenu mode="whatsapp" message={waMessage} align="start">
                  <Button>
                    <WhatsAppIcon className="size-4" /> WhatsApp
                  </Button>
                </ContactMenu>
                <ContactMenu mode="call" align="end">
                  <Button variant="gold">
                    <PhoneIcon aria-hidden="true" /> Call
                  </Button>
                </ContactMenu>
              </div>
              <a
                href={`mailto:${settings.contact.email}?subject=${encodeURIComponent(`Enquiry: ${property.title}`)}&body=${encodeURIComponent(url)}`}
                className="flex items-center justify-center gap-2 text-sm text-taupe hover:text-cream"
              >
                <MailIcon className="size-4 text-gold" aria-hidden="true" /> {settings.contact.email}
              </a>
              <div className="gold-hairline" />
              <div>
                <h2 className="mb-4 font-heading text-2xl text-cream">Request a callback</h2>
                <EnquiryForm
                  propertyId={property.id}
                  propertyTitle={property.title}
                  defaultMessage={`I'm interested in ${property.title}.`}
                  idPrefix="detail"
                />
              </div>
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section aria-labelledby="similar-title" className="mt-24">
            <Ornament className="mb-5" />
            <p className="eyebrow">You may also like</p>
            <h2 id="similar-title" className="mt-3 text-4xl text-cream">
              Similar properties
            </h2>
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((p) => (
                <li key={p.id}>
                  <PropertyCard property={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  )
}

function Facts({ property, area }: { property: PropertyDetail; area: string | null }) {
  const facts = [
    property.bhk ? { Icon: BedDoubleIcon, label: "Bedrooms", value: `${property.bhk} BHK` } : null,
    property.bathrooms ? { Icon: BathIcon, label: "Bathrooms", value: String(property.bathrooms) } : null,
    area ? { Icon: MaximizeIcon, label: "Area", value: area } : null,
    property.floor !== null
      ? { Icon: LayersIcon, label: "Floor", value: property.total_floors ? `${property.floor} of ${property.total_floors}` : String(property.floor) }
      : null,
    property.furnishing ? { Icon: SofaIcon, label: "Furnishing", value: furnishingLabel[property.furnishing] } : null,
    property.facing ? { Icon: CompassIcon, label: "Facing", value: facingLabel[property.facing] } : null,
    property.possession ? { Icon: CalendarCheckIcon, label: "Possession", value: possessionLabel[property.possession] } : null,
    { Icon: Building2Icon, label: "Type", value: propertyTypeLabel[property.type] },
  ].filter(Boolean) as { Icon: typeof BedDoubleIcon; label: string; value: string }[]

  return (
    <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-gold/15 bg-gold/15 sm:grid-cols-4">
      {facts.map(({ Icon, label, value }) => (
        <div key={label} className="flex flex-col gap-1 bg-card p-5">
          <dt className="flex items-center gap-2 text-[0.65rem] font-semibold tracking-[0.2em] text-taupe uppercase">
            <Icon className="size-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
            {label}
          </dt>
          <dd className="font-heading text-xl text-cream">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="mb-6 flex items-center gap-4 text-3xl text-cream">
        {title}
        <span aria-hidden="true" className="h-px flex-1 bg-linear-to-r from-gold/40 to-transparent" />
      </h2>
      {children}
    </section>
  )
}

function Badge({ children, gold = false }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span
      className={
        gold
          ? "rounded-xs bg-gold px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-ink uppercase"
          : "rounded-xs border border-gold/30 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.2em] text-cream/85 uppercase"
      }
    >
      {children}
    </span>
  )
}

/** Structured data for the listing (price, location, size, photo). */
function listingLd(property: PropertyDetail, image?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.short_description ?? undefined,
    url: absoluteUrl(`/properties/${property.slug}`),
    image: image ? absoluteUrl(image) : undefined,
    datePosted: property.published_at ?? property.created_at,
    offers: property.price_on_request || property.price === null
      ? undefined
      : {
          "@type": "Offer",
          price: property.price,
          priceCurrency: "INR",
          availability: property.availability === "available" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
          businessFunction: property.purpose === "rent" ? "http://purl.org/goodrelations/v1#LeaseOut" : "http://purl.org/goodrelations/v1#Sell",
        },
    contentLocation: {
      "@type": "Place",
      name: property.locality?.name,
      address: { "@type": "PostalAddress", streetAddress: property.address, addressRegion: "Uttar Pradesh", addressCountry: "IN" },
      geo: property.lat !== null ? { "@type": "GeoCoordinates", latitude: property.lat, longitude: property.lng } : undefined,
    },
  }
}

function DetailSkeleton() {
  return (
    <div className="container-luxe pt-32 pb-20" aria-hidden="true">
      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
        <div>
          <div className="aspect-[4/3] animate-pulse rounded-md bg-card sm:aspect-[16/9]" />
          <div className="mt-8 h-10 w-3/4 animate-pulse rounded-xs bg-card" />
          <div className="mt-4 h-5 w-1/2 animate-pulse rounded-xs bg-card" />
          <div className="mt-10 h-40 animate-pulse rounded-md bg-card" />
        </div>
        <div className="h-[32rem] animate-pulse rounded-md bg-card" />
      </div>
    </div>
  )
}
