import Image from "next/image"
import Link from "next/link"
import { BedDoubleIcon, MapPinIcon, MaximizeIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { ContactMenu } from "@/components/shared/contact-menu"
import type { PropertyCardData } from "@/lib/data/properties"
import { formatArea, formatPrice, propertyTypeLabel, purposeLabel } from "@/lib/format"
import { mediaUrl } from "@/lib/media"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { DirectionHover } from "./direction-hover"
import { FavoriteButton } from "./favorite-button"

const overlayFrom: Record<string, string> = {
  top: "group-data-[dir=top]/media:-translate-y-full",
  bottom: "group-data-[dir=bottom]/media:translate-y-full",
  left: "group-data-[dir=left]/media:-translate-x-full",
  right: "group-data-[dir=right]/media:translate-x-full",
}

/** Listing card: photo, badges, save heart, key facts, price and WhatsApp. */
export function PropertyCard({ property, priority = false }: { property: PropertyCardData; priority?: boolean }) {
  const href = `/properties/${property.slug}`
  const price = formatPrice(property.price, property.purpose, property.price_on_request)
  const area = formatArea(property.area, property.area_unit)
  const closed = property.availability !== "available"
  const imageSrc = mediaUrl(property.cover?.path_thumb)
  const message = `Hi ${site.shortName} team, I'm interested in "${property.title}" (${site.url}${href}). Is it available?`

  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-md border border-gold/10 bg-card transition-[border-color,box-shadow] duration-500 hover:border-gold/40 hover:shadow-[0_24px_60px_-28px_rgb(201_164_92/0.45)]">
      <DirectionHover className="group/media relative aspect-[4/3] overflow-hidden">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="absolute inset-0">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={property.cover?.alt || `${property.title}, ${property.locality?.name ?? "Delhi NCR"}`}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-luxe group-hover/card:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-ink-raised" />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/10 to-transparent" />

          {/* Direction-aware overlay (desktop hover only) */}
          <div
            className={cn(
              "absolute inset-0 hidden items-center justify-center bg-ink/55 backdrop-blur-[2px] transition-transform duration-500 ease-luxe group-hover/media:translate-x-0 group-hover/media:translate-y-0 pointer-fine:flex",
              Object.values(overlayFrom).join(" "),
            )}
          >
            <span className="border-b border-gold pb-1 text-[0.7rem] font-semibold tracking-[0.3em] text-gold uppercase">
              View details
            </span>
          </div>
        </Link>

        <div className="pointer-events-none absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="rounded-xs bg-ink/75 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-cream uppercase backdrop-blur-md">
            {purposeLabel[property.purpose]}
          </span>
          {property.is_featured && !closed && (
            <span className="rounded-xs bg-gold px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-ink uppercase">
              Featured
            </span>
          )}
        </div>
        <FavoriteButton id={property.id} title={property.title} className="absolute top-3 right-3" />

        {closed && (
          <div className="pointer-events-none absolute top-6 -right-12 w-48 rotate-45 bg-gold py-1.5 text-center text-[0.7rem] font-bold tracking-[0.3em] text-ink uppercase shadow-lg">
            {property.availability === "sold" ? "Sold" : "Rented"}
          </div>
        )}
      </DirectionHover>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="flex items-center gap-1.5 text-xs tracking-wide text-taupe">
          <MapPinIcon className="size-3.5 text-gold" strokeWidth={1.5} aria-hidden="true" />
          {property.locality?.name ?? "Delhi NCR"} · {propertyTypeLabel[property.type]}
        </p>
        <h3 className="mt-2 font-heading text-[1.45rem] leading-snug text-cream">
          <Link href={href} className="transition-colors duration-300 hover:text-gold-light">
            {property.title}
          </Link>
        </h3>

        <ul className="mt-4 mb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-cream/80">
          {property.bhk ? (
            <li className="flex items-center gap-1.5">
              <BedDoubleIcon className="size-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
              {property.bhk} BHK
            </li>
          ) : null}
          {area && (
            <li className="flex items-center gap-1.5">
              <MaximizeIcon className="size-4 text-gold" strokeWidth={1.5} aria-hidden="true" />
              {area}
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-gold/10 pt-5">
          <p className="font-heading text-2xl font-semibold text-gold">{price}</p>
          <ContactMenu mode="whatsapp" message={message} align="end" side="top">
          <button
            type="button"
            aria-label={`Ask about ${property.title} on WhatsApp`}
            className="grid size-10 place-items-center rounded-full border border-gold/30 text-gold transition-colors duration-300 hover:bg-gold hover:text-ink"
          >
            <WhatsAppIcon className="size-[18px]" />
          </button>
          </ContactMenu>
        </div>
      </div>
    </article>
  )
}
