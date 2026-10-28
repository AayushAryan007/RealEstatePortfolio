"use client"

import Link from "next/link"
import { Dialog } from "radix-ui"
import { m } from "motion/react"
import { MailIcon, PhoneIcon, XIcon } from "lucide-react"

import { LogoMark } from "@/components/shared/logo"
import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { mainNav, site, whatsappLink } from "@/lib/site"
import { cn } from "@/lib/utils"

type MobileMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isActive: (href: string) => boolean
}

/**
 * Full-screen mobile menu built on Radix Dialog, so focus is trapped,
 * Escape closes it and the page behind is hidden from screen readers.
 */
export function MobileMenu({ open, onOpenChange, isActive }: MobileMenuProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Content
          className="fixed inset-0 z-50 flex flex-col bg-ink/97 backdrop-blur-xl duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          aria-describedby={undefined}
        >
          <Dialog.Title className="sr-only">Menu</Dialog.Title>

          <div className="flex h-24 items-center justify-between px-6">
            <LogoMark className="h-9" />
            <Dialog.Close
              className="grid size-11 place-items-center rounded-xs text-cream transition-colors hover:text-gold"
              aria-label="Close menu"
            >
              <XIcon className="size-6" strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center px-8">
            <ul className="space-y-2">
              {mainNav.map((item, i) => (
                <m.li
                  key={item.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={item.href}
                    onClick={() => onOpenChange(false)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "block py-2 font-heading text-5xl font-medium transition-colors",
                      isActive(item.href) ? "text-gold" : "text-cream hover:text-gold-light",
                    )}
                  >
                    {item.label}
                  </Link>
                </m.li>
              ))}
            </ul>
            <div className="gold-hairline my-10" />
            <div className="space-y-4 text-sm text-taupe">
              <a href={site.contact.phoneHref} className="flex items-center gap-3 hover:text-cream">
                <PhoneIcon className="size-4 text-gold" strokeWidth={1.5} /> {site.contact.phone}
              </a>
              <a href={`mailto:${site.contact.email}`} className="flex items-center gap-3 break-all hover:text-cream">
                <MailIcon className="size-4 shrink-0 text-gold" strokeWidth={1.5} /> {site.contact.email}
              </a>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-cream"
              >
                <WhatsAppIcon className="size-4 text-gold" /> Chat on WhatsApp
              </a>
            </div>
          </nav>

          <p className="px-8 pb-10 font-heading text-lg text-taupe italic">{site.tagline}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
