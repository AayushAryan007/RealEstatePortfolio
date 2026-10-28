import Link from "next/link"

import { cn } from "@/lib/utils"
import { site } from "@/lib/site"

/**
 * Brand mark: an arched doorway with a keyhole, the "door you can trust".
 * Drawn with thin gold strokes so it stays crisp at any size.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 48"
      fill="none"
      aria-hidden="true"
      className={cn("h-10 w-auto text-gold", className)}
    >
      {/* Outer arch */}
      <path d="M4 46V20a16 16 0 0 1 32 0v26" stroke="currentColor" strokeWidth="1.5" />
      {/* Inner arch, a lighter echo of the outer one */}
      <path
        d="M9 46V21a11 11 0 0 1 22 0v25"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      {/* Threshold */}
      <path d="M1 46.25h38" stroke="currentColor" strokeWidth="1.5" />
      {/* Keyhole */}
      <circle cx="20" cy="26" r="3.2" fill="currentColor" />
      <path d="M18.5 28.4 17.3 36h5.4l-1.2-7.6Z" fill="currentColor" />
    </svg>
  )
}

/** Full logo (mark + wordmark), linking home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${site.name}, home`}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <LogoMark className="h-9 transition-transform duration-500 ease-luxe group-hover:-translate-y-0.5" />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-[1.35rem] font-semibold tracking-[0.28em] text-cream">
          GUPTA
        </span>
        <span className="mt-1 text-[0.55rem] font-semibold tracking-[0.52em] text-gold">
          PROPERTIES
        </span>
      </span>
    </Link>
  )
}
