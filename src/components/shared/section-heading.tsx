import { cn } from "@/lib/utils"

/** Small gold ornament (line · diamond · line) shown above section titles. */
export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 12" aria-hidden="true" className={cn("h-3 w-28 text-gold", className)}>
      <path d="M0 6h48M72 6h48" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
      <path d="M60 1 65 6 60 11 55 6Z" fill="none" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="60" cy="6" r="1.4" fill="currentColor" />
    </svg>
  )
}

type SectionHeadingProps = {
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: "center" | "left"
  className?: string
  /** Heading level; sections use h2 by default. */
  as?: "h1" | "h2"
}

/** Eyebrow + ornament + serif title + optional intro, in the Luxora style. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  as: Heading = "h2",
}: SectionHeadingProps) {
  const centered = align === "center"
  return (
    <div className={cn("max-w-2xl", centered && "mx-auto text-center", className)}>
      <Ornament className={cn("mb-5", centered ? "mx-auto" : "")} />
      <p className="eyebrow">{eyebrow}</p>
      <Heading className="mt-4 text-4xl leading-[1.1] text-cream sm:text-5xl">{title}</Heading>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-taupe sm:text-lg">{description}</p>
      )}
    </div>
  )
}
