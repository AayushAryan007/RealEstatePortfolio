import type { Metadata } from "next"
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { EnquiryForm } from "@/components/shared/enquiry-form"
import { PageHero } from "@/components/shared/page-hero"
import { getSiteSettings } from "@/lib/data/settings"
import { phonesFrom, waLink } from "@/lib/contacts"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact Us: Call, WhatsApp or Send an Enquiry",
  description: `Talk to ${site.name} about buying, selling or renting property in Noida, Vasundhara, Indirapuram and Ghaziabad. Call or WhatsApp ${site.contact.phone} or ${site.contact.phone2}.`,
  alternates: { canonical: "/contact" },
}

export default async function ContactPage() {
  const { contact } = await getSiteSettings()
  const phones = phonesFrom(contact.phone, contact.phone2)
  const channels = [
    ...phones.map((phone, i) => ({
      Icon: PhoneIcon,
      label: phones.length > 1 ? `Call · line ${i + 1}` : "Call us",
      value: phone.display,
      href: `tel:${phone.tel}`,
      external: false,
    })),
    ...phones.map((phone, i) => ({
      Icon: WhatsAppIcon,
      label: phones.length > 1 ? `WhatsApp · line ${i + 1}` : "WhatsApp",
      value: phone.display,
      href: waLink(phone),
      external: true,
    })),
    { Icon: MailIcon, label: "Email", value: contact.email, href: `mailto:${contact.email}`, external: false },
    { Icon: MapPinIcon, label: "Office", value: contact.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`, external: true },
    { Icon: ClockIcon, label: "Hours", value: contact.hours, href: undefined, external: false },
  ]

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact Gupta Properties, Vasundhara"
        description="Visit us at 1267, Sector-3, Vasundhara, Ghaziabad, or call, WhatsApp or leave your details and an advisor will get back to you."
        crumbs={[{ label: "Contact" }]}
        image="/media/samples/wood-foyer.webp"
      />
      <section className="container-luxe grid gap-12 py-16 sm:py-20 lg:grid-cols-[1fr_28rem]">
        <ul className="grid content-start gap-4 sm:grid-cols-2">
          {channels.map(({ Icon, label, value, href, external }) => {
            const body = (
              <>
                <span className="grid size-12 place-items-center rounded-full border border-gold/40 text-gold">
                  <Icon className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <p className="mt-5 eyebrow">{label}</p>
                <p className="mt-2 break-words text-cream">{value}</p>
              </>
            )
            return (
              <li key={label}>
                {href ? (
                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="block h-full rounded-md border border-gold/15 bg-card p-7 transition-colors duration-300 hover:border-gold/50"
                  >
                    {body}
                  </a>
                ) : (
                  <div className="h-full rounded-md border border-gold/15 bg-card p-7">{body}</div>
                )}
              </li>
            )
          })}
        </ul>

        <div className="rounded-md border border-gold/20 bg-card p-7 sm:p-8">
          <h2 className="font-heading text-3xl text-cream">Send an enquiry</h2>
          <p className="mt-2 mb-6 text-sm text-taupe">Tell us what you&apos;re looking for: budget, area, size.</p>
          <EnquiryForm idPrefix="contact" />
        </div>
      </section>
    </>
  )
}
