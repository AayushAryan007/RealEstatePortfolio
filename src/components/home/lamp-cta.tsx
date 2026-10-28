"use client"

import Link from "next/link"
import { m } from "motion/react"
import { PhoneIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { Button } from "@/components/ui/button"
import { whatsappLink } from "@/lib/site"

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Lamp effect (after Aceternity's): two gold light cones that widen as the
 * section scrolls in, over a glowing lamp line. Gradients plus scaleX/opacity
 * only, no animated widths or blur filters.
 */
export function LampCta({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  return (
    <section aria-labelledby="cta-title" className="relative isolate overflow-hidden pt-40 pb-28 sm:pt-48">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex h-[28rem] justify-center">
        <m.div
          initial={{ opacity: 0.4, scaleX: 0.45 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease }}
          className="absolute top-0 right-1/2 h-full w-[min(36rem,50vw)] origin-right bg-[conic-gradient(from_180deg_at_100%_0%,rgb(201_164_92/0.5),transparent_70deg)]"
        />
        <m.div
          initial={{ opacity: 0.4, scaleX: 0.45 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease }}
          className="absolute top-0 left-1/2 h-full w-[min(36rem,50vw)] origin-left bg-[conic-gradient(from_110deg_at_0%_0%,transparent,rgb(201_164_92/0.5)_70deg,transparent_70.5deg)]"
        />
        {/* Soft glow pooled under the lamp */}
        <div className="absolute top-0 h-48 w-[min(40rem,90vw)] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(227_200_138/0.35),transparent)]" />
        {/* Lamp line */}
        <m.div
          initial={{ scaleX: 0.4 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease }}
          className="absolute top-0 h-px w-[min(30rem,80vw)] bg-gold-light shadow-[0_0_24px_4px_rgb(227_200_138/0.6)]"
        />
        {/* Fade the cones into the page background */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-ink to-transparent" />
      </div>

      <m.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 1, delay: 0.2, ease }}
        className="container-luxe text-center"
      >
        <p className="eyebrow">Your next address awaits</p>
        <h2 id="cta-title" className="mx-auto mt-5 max-w-3xl text-4xl leading-[1.08] text-cream sm:text-6xl">
          Let&apos;s find a place worthy of your story
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base text-taupe sm:text-lg">
          Tell us what you&apos;re looking for. An advisor will reply within the hour, every day of the week.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon className="size-4" /> WhatsApp us
            </a>
          </Button>
          <Button size="lg" variant="gold" asChild>
            <a href={phoneHref}>
              <PhoneIcon aria-hidden="true" /> {phone}
            </a>
          </Button>
          <Button size="lg" variant="ghost" asChild className="text-cream/80 hover:text-cream">
            <Link href="/contact">Send an enquiry</Link>
          </Button>
        </div>
      </m.div>
    </section>
  )
}
