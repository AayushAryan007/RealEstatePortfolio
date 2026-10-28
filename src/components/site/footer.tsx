import Link from "next/link"
import { cacheLife } from "next/cache"
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon } from "lucide-react"

import { Logo } from "@/components/shared/logo"
import {
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  YouTubeIcon,
} from "@/components/shared/brand-icons"
import { mainNav, propertyTypeLinks, site } from "@/lib/site"

const socialLinks = [
  { label: "Instagram", href: site.socials.instagram, Icon: InstagramIcon },
  { label: "Facebook", href: site.socials.facebook, Icon: FacebookIcon },
  { label: "YouTube", href: site.socials.youtube, Icon: YouTubeIcon },
  { label: "LinkedIn", href: site.socials.linkedin, Icon: LinkedInIcon },
]

/** Site footer. A Server Component: no JavaScript is shipped for it. */
export function Footer() {
  return (
    <footer className="relative border-t border-gold/10 bg-ink-raised/40">
      <div className="gold-hairline absolute inset-x-0 top-0" />

      <div className="container-luxe grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr] lg:py-20">
        <div className="space-y-5">
          <Logo />
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
          <li>
            <a href={site.contact.phoneHref} className="flex items-start gap-3 hover:text-cream">
              <PhoneIcon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
              {site.contact.phone}
            </a>
          </li>
          <li>
            <a href={`mailto:${site.contact.email}`} className="flex items-start gap-3 break-all hover:text-cream">
              <MailIcon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
              {site.contact.email}
            </a>
          </li>
          <li className="flex items-start gap-3">
            <MapPinIcon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
            {site.contact.address}
          </li>
          <li className="flex items-start gap-3">
            <ClockIcon className="mt-0.5 size-4 shrink-0 text-gold" strokeWidth={1.5} />
            {site.contact.hours}
          </li>
        </FooterColumn>
      </div>

      <div className="border-t border-gold/10">
        <div className="container-luxe flex flex-col gap-3 py-6 text-xs text-taupe sm:flex-row sm:items-center sm:justify-between">
          <p>© <CopyrightYear /> {site.name}. All rights reserved.</p>
          <Link href="/privacy" className="hover:text-cream">
            Privacy Policy
          </Link>
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
