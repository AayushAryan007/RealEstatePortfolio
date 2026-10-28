import type { Metadata } from "next"

import { PageHero } from "@/components/shared/page-hero"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects and uses your information.`,
  alternates: { canonical: "/privacy" },
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" crumbs={[{ label: "Privacy Policy" }]} />
      <section className="container-luxe max-w-3xl space-y-6 py-16 leading-relaxed text-cream/80 [&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-3xl [&_h2]:text-cream">
        <p>
          {site.name} (&ldquo;we&rdquo;) respects your privacy. This page explains what we collect when you use this
          website and how we use it.
        </p>
        <h2>What we collect</h2>
        <p>
          When you send an enquiry we store your name, phone number, optional message and the page you enquired from.
          We do not use advertising cookies. Saved (&ldquo;hearted&rdquo;) properties are stored only in your own browser.
          We use privacy-friendly, cookie-free analytics to understand overall page visits.
        </p>
        <h2>How we use it</h2>
        <p>
          Only to respond to your enquiry and help you with your property search. We never sell or share your
          details with third parties for marketing.
        </p>
        <h2>Your choices</h2>
        <p>
          To have your details deleted, email us at <a className="text-gold" href={`mailto:${site.contact.email}`}>{site.contact.email}</a> or call{" "}
          {site.contact.phone}.
        </p>
      </section>
    </>
  )
}
