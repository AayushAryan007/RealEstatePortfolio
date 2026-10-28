import Link from "next/link"

import { LogoMark } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { site } from "@/lib/site"

/**
 * Temporary home page for Phase 1: shows the theme, fonts and layout shell.
 * The full homepage sections arrive in Phase 2.
 */
export default function HomePage() {
  return (
    <section className="relative isolate flex min-h-dvh items-center overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgb(201_164_92/0.14),transparent_60%)]"
      />
      <div className="container-luxe flex flex-col items-center py-32 text-center">
        <LogoMark className="mb-8 h-16" />
        <p className="eyebrow">Welcome to {site.name}</p>
        <h1 className="mt-6 max-w-4xl text-5xl leading-[1.05] text-cream sm:text-6xl lg:text-7xl">
          Find an address worthy of your trust
        </h1>
        <div className="gold-hairline mx-auto mt-8 max-w-48" />
        <p className="mt-8 max-w-xl text-base leading-relaxed text-taupe sm:text-lg">
          Handpicked apartments, plots, commercial spaces and rentals across Noida, Vasundhara,
          Indirapuram and Ghaziabad.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/properties">Explore Properties</Link>
          </Button>
          <Button size="lg" variant="gold" asChild>
            <Link href="/contact">Talk to Us</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
