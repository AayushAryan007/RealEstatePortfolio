import Link from "next/link"
import { cacheLife } from "next/cache"
import { ClockIcon, KeyRoundIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { LogoEmblem } from "@/components/shared/logo"
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
} from "@/components/shared/brand-icons"
import { phonesFrom } from "@/lib/contacts"
import { getSiteSettings } from "@/lib/data/settings"
import { mainNav, propertyTypeLinks, site } from "@/lib/site"

/** Site footer. A Server Component (no JavaScript shipped); contact details come from Site content. */
export async function Footer() {
  const { contact, socials } = await getSiteSettings()
  const phones = phonesFrom(contact.phone, contact.phone2)
  // Until real profiles are added, icons stay as placeholders.
  const socialLinks = [
    { label: "Instagram", href: socials.instagram || "#", Icon: InstagramIcon },
    { label: "Facebook", href: socials.facebook || "#", Icon: FacebookIcon },
    { label: "YouTube", href: socials.youtube || "#", Icon: YouTubeIcon },
    { label: "LinkedIn", href: socials.linkedin || "#", Icon: LinkedInIcon },
  ]

  return (
    <footer className="relative border-t border-gold/10 bg-ink-raised/40">
      <div className="gold-hairline absolute inset-x-0 top-0" />

      <div className="container-luxe grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:py-20">
        <div className="space-y-5">
          <Link href="/" aria-label="Gupta Properties, home" className="inline-block">
            <LogoEmblem className="h-32" />
          </Link>
          <p className="max-w-xs font-heading text-xl text-cream/90 italic">{site.tagline}</p>
          <p className="max-w-xs text-sm leading-relaxed text-taupe">
            Apartments, plots, commercial spaces and rentals across{" "}
            {site.localities.join(", ")}.
          </p>
          <ul className="flex gap-2 pt-1">
            {socialLinks.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  aria-label={label}
                  {...(href !== "#" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="grid size-10 place-items-center rounded-xs border border-gold/20 text-gold transition-colors duration-300 hover:border-gold hover:bg-gold/10"
                >
                  <Icon className="size-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <FooterColumn title="Explore">
          {mainNav.map((item) => (
            <FooterLink key={item.href} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Properties">
          {propertyTypeLinks.map((item) => (
            <FooterLink key={item.href} href={item.href}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Get in touch">
          {phones.map((phone) => (
            <li key={phone.tel}>
              <a href={`tel:${phone.tel}`} className="flex items-start gap-3 tabular-nums hover:text-cream">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
                {phone.display}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${contact.email}`} className="flex items-start gap-3 break-all hover:text-cream">
              <MailIcon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
              {contact.email}
            </a>
          </li>
          <li className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
            {contact.address}
          </li>
          <li className="flex items-start gap-3">
            <ClockIcon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
            {contact.hours}
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-gold/10">
        <div className="container-luxe flex flex-col gap-3 py-6 text-xs text-taupe sm:flex-row sm:items-center sm:justify-between">
          <p>© <CopyrightYear /> {site.name}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-cream">
              Privacy Policy
            </Link>
            {/* Discreet way in for the team; hidden from search engines. */}
            <Link
              href="/admin/login"
              rel="nofollow"
              prefetch={false}
              aria-label="Admin sign in"
              title="Admin sign in"
              className="grid size-7 place-items-center rounded-full border border-gold/15 text-taupe/60 transition-colors duration-300 hover:border-gold/60 hover:text-gold"
            >
              <KeyRoundIcon className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="eyebrow mb-5">{title}</h2>
      <ul className="space-y-3 text-sm text-taupe">{children}</ul>
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="transition-colors duration-300 hover:text-cream">
        {children}
      </Link>
    </li>
  )
}

/** Cached so the footer stays part of the static shell; refreshes daily. */
async function CopyrightYear() {
  "use cache"
  cacheLife("days")
  return new Date().getFullYear()
}
