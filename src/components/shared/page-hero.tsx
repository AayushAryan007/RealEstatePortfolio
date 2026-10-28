import Image from "next/image"
import Link from "next/link"
import { ChevronRightIcon } from "lucide-react"

import { Ornament } from "@/components/shared/section-heading"

type Crumb = { label: string; href?: string }

type PageHeroProps = {
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  crumbs?: Crumb[]
  image?: string
}

/** Header band for inner pages: breadcrumb, eyebrow, serif title, soft photo backdrop. */
export function PageHero({ eyebrow, title, description, crumbs = [], image }: PageHeroProps) {
  return (
    <header className="relative isolate overflow-hidden border-b border-gold/10 pt-36 pb-16 sm:pt-44 sm:pb-20">
      {image && (
        <Image src={image} alt="" fill priority sizes="100vw" className="-z-20 object-cover opacity-25" />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(201_164_92/0.14),transparent_60%),linear-gradient(to_bottom,rgb(14_13_11/0.6),var(--ink))]"
      />
      <div className="container-luxe">
        {crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs tracking-wide text-taupe">
              <li>
                <Link href="/" className="hover:text-cream">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRightIcon className="size-3 text-gold/60" aria-hidden="true" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-cream">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-cream/90">
                      {crumb.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <Ornament className="mb-5" />
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl text-4xl leading-[1.05] text-cream sm:text-6xl">{title}</h1>
        {description && <p className="mt-5 max-w-2xl text-base leading-relaxed text-taupe sm:text-lg">{description}</p>}
      </div>
    </header>
  )
}
