import { PhoneIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { site, whatsappLink } from "@/lib/site"

/**
 * Fixed WhatsApp button (all screens) plus a call button on phones.
 * Styled in brand gold rather than WhatsApp green. The pulse is a CSS
 * transform/opacity animation, so it costs no JavaScript.
 */
export function FloatingContact() {
  return (
    <div className="fixed right-4 bottom-4 z-30 flex flex-col items-center gap-3 sm:right-6 sm:bottom-6">
      <a
        href={site.contact.phoneHref}
        aria-label={`Call ${site.contact.phone}`}
        className="grid size-12 place-items-center rounded-full border border-gold/40 bg-ink/80 text-gold shadow-lg backdrop-blur-md transition-colors duration-300 hover:bg-gold hover:text-ink sm:hidden"
      >
        <PhoneIcon className="size-5" strokeWidth={1.5} />
      </a>

      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group relative grid size-14 place-items-center rounded-full bg-linear-to-br from-gold-light to-gold-deep text-ink shadow-[0_10px_30px_-8px_rgb(201_164_92/0.6)] transition-transform duration-300 ease-luxe hover:scale-105"
      >
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-gold animate-pulse-ring motion-reduce:hidden"
        />
        <WhatsAppIcon className="relative size-7" />
      </a>
    </div>
  )
}
