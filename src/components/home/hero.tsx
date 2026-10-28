import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { LazyVideo } from "@/components/shared/lazy-video"
import { Button } from "@/components/ui/button"
import type { HeroSettings } from "@/lib/data/settings"
import { HeroSearch } from "./hero-search"
import { Spotlight } from "./spotlight"

const heroVideo = {
  sources: [
    { src: "/media/video/hero.webm", type: "video/webm" },
    { src: "/media/video/hero.mp4", type: "video/mp4" },
  ],
  poster: "/media/video/hero-poster.webp",
}

/**
 * Phones: the vertical video fills the screen behind the text.
 * Desktop: text on the left, the video in a framed portrait panel on the
 * right (the 720px-wide source would look soft stretched edge to edge).
 */
export function Hero({ hero, localities }: { hero: HeroSettings; localities: { name: string; slug: string }[] }) {
  return (
    <section className="relative isolate">
      <div className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-40 lg:min-h-[52rem] lg:pb-48">
        {/* Phone/tablet: full-bleed video background */}
        <div aria-hidden="true" className="absolute inset-0 -z-20 lg:hidden">
          <LazyVideo {...heroVideo} label="" className="opacity-60" />
          <div className="absolute inset-0 bg-linear-to-b from-ink/70 via-ink/55 to-ink" />
        </div>

        {/* Desktop: soft gold glow + spotlight sweep */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 hidden bg-[radial-gradient(ellipse_at_30%_20%,rgb(201_164_92/0.12),transparent_55%)] lg:block"
        />
        <Spotlight className="hidden lg:block" />

        <div className="container-luxe grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="max-w-2xl animate-in duration-1000 ease-luxe fade-in slide-in-from-bottom-4 max-lg:text-center max-lg:mx-auto">
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 className="mt-6 text-[2.75rem] leading-[1.02] text-cream sm:text-6xl xl:text-7xl">
              {hero.title}
            </h1>
            <div className="gold-hairline mt-8 max-w-56 max-lg:mx-auto" />
            <p className="mt-8 text-base leading-relaxed text-cream/75 sm:text-lg">{hero.subtitle}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row max-lg:justify-center">
              <Button size="lg" asChild>
                <Link href="/properties">
                  Explore Properties <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button size="lg" variant="gold" asChild>
                <Link href="/contact">Talk to an Advisor</Link>
              </Button>
            </div>
          </div>

          {/* Desktop video panel inside an arch-topped gold frame (echoes the logo) */}
          <div className="relative mx-auto hidden w-full max-w-sm animate-in duration-1000 ease-luxe fade-in zoom-in-95 lg:block">
            <div className="absolute -inset-3 rounded-t-full border border-gold/25" aria-hidden="true" />
            <div className="relative aspect-[9/14] overflow-hidden rounded-t-full border border-gold/50 bg-ink-raised shadow-[0_40px_120px_-30px_rgb(201_164_92/0.35)]">
              <LazyVideo {...heroVideo} label="Walkthrough of a luxury apartment interior" />
              <div className="absolute inset-0 bg-linear-to-t from-ink/50 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* Search bar overlapping the bottom edge of the hero */}
      <div className="container-luxe relative z-10 -mt-28 lg:-mt-32">
        <HeroSearch localities={localities} />
      </div>
    </section>
  )
}
