"use client"

import { PhoneIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { ContactMenu } from "@/components/shared/contact-menu"

/**
 * Fixed WhatsApp button (all screens) plus a call button on phones. Each one
 * asks which number to use. Styled in brand gold rather than WhatsApp green;
 * the pulse is a CSS transform/opacity animation.
 */
export function FloatingContact() {
  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-center gap-3 sm:right-6 sm:bottom-6">
      <ContactMenu mode="call" side="top" align="end">
        <button
          type="button"
          aria-label="Call us"
          className="grid size-12 place-items-center rounded-full border border-gold/40 bg-ink/80 text-gold shadow-lg backdrop-blur-md transition-colors duration-300 hover:bg-gold hover:text-ink sm:hidden"
        >
          <PhoneIcon className="size-5" strokeWidth={1.5} />
        </button>
      </ContactMenu>

      <ContactMenu mode="whatsapp" side="top" align="end">
        <button
          type="button"
          aria-label="Chat with us on WhatsApp"
          className="group relative grid size-14 place-items-center rounded-full bg-linear-to-br from-gold-light to-gold-deep text-ink shadow-[0_10px_30px_-8px_rgb(201_164_92/0.6)] transition-transform duration-300 ease-luxe hover:scale-105"
        >
          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-gold animate-pulse-ring motion-reduce:hidden" />
          <WhatsAppIcon className="relative size-7" />
        </button>
      </ContactMenu>
    </div>
  )
}
