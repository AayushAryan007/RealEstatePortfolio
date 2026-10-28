import { useId } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { site } from "@/lib/site"

/*
 * Brand mark, redrawn as vector from the Gupta Properties badge:
 * a double gold ring, a roof with a four-pane window, the "GP" monogram
 * and a key. `LogoEmblem` adds the ring lettering ("GUPTA PROPERTIES" /
 * "SINCE 2006") for large sizes; `LogoMark` drops it so it stays legible small.
 */

function GoldGradient({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#efd9a4" />
        <stop offset="45%" stopColor="#c9a45c" />
        <stop offset="100%" stopColor="#9b7636" />
      </linearGradient>
    </defs>
  )
}

/** Roof, window, GP monogram and key, drawn in a 200×200 box centred on (100,100). */
function Monogram({ fill }: { fill: string }) {
  return (
    <g>
      {/* Roof */}
      <path d="M58 98 100 62l42 36" fill="none" stroke={fill} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Four-pane window */}
      <g fill={fill}>
        <rect x="93" y="76" width="6.5" height="6.5" />
        <rect x="101" y="76" width="6.5" height="6.5" />
        <rect x="93" y="84" width="6.5" height="6.5" />
        <rect x="101" y="84" width="6.5" height="6.5" />
      </g>
      {/* G P */}
      <text
        x="78"
        y="138"
        textAnchor="middle"
        fill={fill}
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 600, fontSize: 52 }}
      >
        G
      </text>
      <text
        x="124"
        y="138"
        textAnchor="middle"
        fill={fill}
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 600, fontSize: 52 }}
      >
        P
      </text>
      {/* Key: bow between the letters, shaft and teeth below */}
      <g fill="none" stroke={fill} strokeWidth="3" strokeLinecap="round">
        <circle cx="101" cy="124" r="6" />
        <path d="M101 130v26M101 146h6M101 152h5" />
      </g>
    </g>
  )
}

/** Compact badge (no ring lettering) for the navbar, favicon-size spots and buttons. */
export function LogoMark({ className }: { className?: string }) {
  // Unique ids: a gradient inside a hidden copy (e.g. a closed menu) must not be shared.
  const gold = `gp-gold-${useId().replace(/:/g, "")}`
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={cn("h-10 w-auto", className)}>
      <GoldGradient id={gold} />
      <circle cx="100" cy="100" r="95" fill="#14120f" stroke={`url(#${gold})`} strokeWidth="5" />
      <circle cx="100" cy="100" r="84" fill="none" stroke={`url(#${gold})`} strokeWidth="1.5" strokeOpacity="0.7" />
      <g transform="translate(100 102) scale(1.08) translate(-100 -100)">
        <Monogram fill={`url(#${gold})`} />
      </g>
    </svg>
  )
}

/** Full badge with "GUPTA PROPERTIES" and "SINCE 2006" around the ring. */
export function LogoEmblem({ className, title = `${site.name}, since ${site.since}` }: { className?: string; title?: string }) {
  const letter = { fontFamily: "var(--font-cormorant), Georgia, serif", fontWeight: 600, letterSpacing: "0.18em", fontVariantNumeric: "lining-nums" }
  const uid = useId().replace(/:/g, "")
  const goldId = `gp-gold-${uid}`
  const gold = `url(#${goldId})`
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={title} className={cn("h-40 w-auto", className)}>
      <GoldGradient id={goldId} />
      <defs>
        {/* Text paths: top arc runs left→right over the top; bottom arc left→right under the bottom. */}
        <path id={`gp-arc-top-${uid}`} d="M30 100a70 70 0 0 1 140 0" />
        <path id={`gp-arc-bottom-${uid}`} d="M36 100a64 64 0 0 0 128 0" />
      </defs>

      <circle cx="100" cy="100" r="97" fill="#14120f" stroke={gold} strokeWidth="3" />
      <circle cx="100" cy="100" r="90" fill="none" stroke={gold} strokeWidth="1" strokeOpacity="0.6" />
      <circle cx="100" cy="100" r="58" fill="none" stroke={gold} strokeWidth="1.5" />

      <text fill={gold} style={{ ...letter, fontSize: 15 }}>
        <textPath href={`#gp-arc-top-${uid}`} startOffset="50%" textAnchor="middle">
          GUPTA PROPERTIES
        </textPath>
      </text>
      <text fill={gold} style={{ ...letter, fontSize: 12 }}>
        <textPath href={`#gp-arc-bottom-${uid}`} startOffset="50%" textAnchor="middle" dominantBaseline="hanging">
          SINCE {site.since}
        </textPath>
      </text>
      {/* Side dots */}
      <circle cx="24" cy="100" r="3" fill={gold} />
      <circle cx="176" cy="100" r="3" fill={gold} />

      <g transform="translate(100 101) scale(0.6) translate(-100 -100)">
        <Monogram fill={gold} />
      </g>
    </svg>
  )
}

/** Navbar logo: badge + wordmark, linking home. */
export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" aria-label={`${site.name}, home`} className={cn("group inline-flex items-center gap-3", className)}>
      <LogoMark className="h-11 transition-transform duration-500 ease-luxe group-hover:rotate-[-4deg]" />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-[1.35rem] font-semibold tracking-[0.24em] text-cream">GUPTA</span>
        <span className="mt-1 text-[0.55rem] font-semibold tracking-[0.5em] text-gold">PROPERTIES</span>
      </span>
    </Link>
  )
}
