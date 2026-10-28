"use client"

import { useRef } from "react"
import Image from "next/image"
import { LazyMotion, MotionConfig, domAnimation, m, useReducedMotion, useScroll, useTransform } from "motion/react"

import { LazyVideo } from "@/components/shared/lazy-video"
import { SectionHeading } from "@/components/shared/section-heading"

/**
 * Container-scroll showcase (after Aceternity's): on large screens the frame
 * tilts back and settles flat as you scroll it into view. Phones get a plain
 * layout (no 3D) to stay smooth. Only transform is animated.
 */
export function Showcase() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])
  const lift = useTransform(scrollYProgress, [0, 1], [60, 0])
  // Scroll-linked styles bypass MotionConfig, so honour reduced motion here.
  const reduceMotion = useReducedMotion()

  return (
    <section aria-labelledby="showcase-title" className="section-y overflow-hidden">
      <div className="container-luxe">
        <SectionHeading
          eyebrow="Step inside"
          title={<span id="showcase-title">Spaces you&apos;ll be proud to call home</span>}
          description="Take a walk through the kind of homes we help families find: considered layouts, quality finishes and neighbourhoods that grow with you."
        />

        {/* Motion is only loaded with this (lazily imported) section. */}
        <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
        <div ref={ref} className="mt-14 [perspective:1400px]">
          <m.div
            style={reduceMotion ? undefined : { rotateX, scale, y: lift }}
            className="mx-auto max-w-6xl origin-top rounded-xl border border-gold/25 bg-ink-raised p-2 shadow-[0_60px_140px_-40px_rgb(201_164_92/0.35)] will-change-transform max-lg:!transform-none sm:p-3"
          >
            <div className="grid gap-2 overflow-hidden rounded-lg sm:gap-3 lg:grid-cols-[1.6fr_1fr]">
              <div className="relative hidden aspect-[16/11] overflow-hidden rounded-md lg:block">
                <Image
                  src="/media/samples/walnut-hallway.webp"
                  alt="Warmly lit hallway with walnut flooring leading to a living room"
                  fill
                  sizes="60vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-ink/85 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 max-w-sm">
                  <p className="eyebrow">Curated living</p>
                  <p className="mt-3 font-heading text-3xl text-cream">
                    Warm light, honest materials and room to breathe.
                  </p>
                </div>
              </div>
              <div className="relative mx-auto aspect-[9/16] w-full max-w-sm overflow-hidden rounded-md lg:aspect-auto lg:max-w-none">
                <LazyVideo
                  sources={[{ src: "/media/video/showcase.mp4", type: "video/mp4" }]}
                  poster="/media/video/showcase-poster.webp"
                  label="Aerial view of a residential tower followed by an apartment tour"
                  className="absolute inset-0"
                />
              </div>
            </div>
          </m.div>
        </div>
        </MotionConfig>
        </LazyMotion>
      </div>
    </section>
  )
}
