import { cn } from "@/lib/utils"

/**
 * Lightweight take on the Aceternity spotlight: two soft gold light cones
 * that drift in once. A gradient + transform/opacity animation, with no SVG blur
 * filters, so it's cheap to render. Shown on desktop only.
 */
export function Spotlight({ className }: { className?: string }) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <div className="absolute -top-1/3 -left-1/4 h-[140%] w-[55%] origin-top-left -rotate-[28deg] animate-in bg-[radial-gradient(ellipse_at_top,rgb(227_200_138/0.16),transparent_62%)] duration-[2000ms] ease-luxe fade-in slide-in-from-top-12" />
      <div className="absolute -top-1/3 left-[8%] h-[120%] w-[30%] origin-top-left -rotate-[22deg] animate-in bg-[radial-gradient(ellipse_at_top,rgb(227_200_138/0.08),transparent_60%)] delay-300 duration-[2400ms] ease-luxe fade-in fill-mode-backwards slide-in-from-top-12" />
    </div>
  )
}
