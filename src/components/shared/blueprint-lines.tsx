import { cn } from "@/lib/utils"

/**
 * Faint architectural line drawing (arches, a facade grid and a stair) used
 * as a decorative section background. Pure SVG, so it's tiny and needs no JavaScript.
 */
export function BlueprintLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-gold opacity-[0.06]", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      {/* Facade grid */}
      <path d="M40 560V180h220v380M40 240h220M40 300h220M40 360h220M40 420h220M40 480h220M95 180v380M150 180v380M205 180v380" />
      {/* Arched doorways */}
      <path d="M320 560V360a60 60 0 0 1 120 0v200M340 560V365a40 40 0 0 1 80 0v195" />
      <path d="M480 560V300a90 90 0 0 1 180 0v260M505 560V305a65 65 0 0 1 130 0v255" />
      {/* Stair */}
      <path d="M680 560h80v-30h-20v-30h-20v-30h-20v-30h-20" />
      {/* Ground + dimension lines */}
      <path d="M0 560h800M40 590h220M40 584v12M260 584v12" />
      <path d="M300 120h460M300 114v12M760 114v12" strokeDasharray="4 6" />
    </svg>
  )
}
