import type { Metadata } from "next"
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { EnquiryForm } from "@/components/shared/enquiry-form"
import { PageHero } from "@/components/shared/page-hero"
import { getSiteSettings } from "@/lib/data/settings"
import { site, whatsappLink } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact Us: Call, WhatsApp or Send an Enquiry",
  description: `Talk to ${site.name} about buying, selling or renting property in Noida, Vasundhara, Indirapuram and Ghaziabad. Call or WhatsApp +91 70111 91639.`,
  alternates: { canonical: "/contact" },
}

export default async function ContactPage() {
  const { contact } = await getSiteSettings()
  const channels = [
    { Icon: PhoneIcon, label: "Call us", value: contact.phone, href: `tel:${contact.phone.replace(/[^\d+]/g, "")}` },
    { Icon: WhatsAppIcon, label: "WhatsApp", value: "Chat with an advisor", href: whatsappLink(), external: true },
    { Icon: MailIcon, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { Icon: MapPinIcon, label: "Office", value: contact.address },
    { Icon: ClockIcon, label: "Hours", value: contact.hours },
  ]

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Let's find your next address"
        description="Call, WhatsApp or leave your details. An advisor will get back to you within the hour."
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
