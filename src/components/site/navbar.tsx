"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { m, useMotionValueEvent, useScroll } from "motion/react"
import { MenuIcon, PhoneIcon } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"
import { mainNav, site } from "@/lib/site"
import { cn } from "@/lib/utils"
import { MobileMenu } from "./mobile-menu"

/**
 * Floating navbar: transparent over the hero, then a compact glass bar once
 * the page scrolls. It slides away while scrolling down and returns as soon
 * as the visitor scrolls up. Only transform/opacity change, so it stays at 60fps.
 */
export function Navbar() {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useMotionValueEvent(scrollY, "change", (y) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(y > 40)
    // Hide after the first screen when scrolling down; ignore tiny jitters.
    if (y > 320 && y - previous > 6) setHidden(true)
    else if (previous - y > 6 || y < 320) setHidden(false)
  })

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))

  return (
    <m.header
      initial={false}
      animate={{ y: hidden && !menuOpen ? "-110%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5"
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-6 rounded-md border px-4 transition-[background-color,border-color,height] duration-500 sm:px-6",
          scrolled
            ? "h-16 border-gold/15 bg-ink/70 shadow-[0_8px_40px_-12px_rgb(0_0_0/0.6)] backdrop-blur-xl"
            : "h-20 border-transparent bg-transparent",
        )}
      >
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "relative py-2 text-[0.78rem] font-semibold tracking-[0.2em] uppercase transition-colors duration-300",
                    "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 after:ease-luxe hover:after:scale-x-100",
                    isActive(item.href)
                      ? "text-gold after:scale-x-100"
                      : "text-cream/80 hover:text-cream",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="hidden sm:inline-flex">
            <a href={site.contact.phoneHref}>
              <PhoneIcon aria-hidden="true" />
              Call Now
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            className="text-cream lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon className="size-6" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} isActive={isActive} />
    </m.header>
  )
}
