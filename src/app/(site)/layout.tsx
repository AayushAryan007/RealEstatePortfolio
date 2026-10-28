import { ContactProvider } from "@/components/shared/contact-provider"
import { CursorDot } from "@/components/site/cursor-dot"
import { FloatingContact } from "@/components/site/floating-contact"
import { Footer } from "@/components/site/footer"
import { Navbar } from "@/components/site/navbar"
import { MotionProvider } from "@/components/shared/motion-provider"
import { Toaster } from "@/components/ui/sonner"
import { phonesFrom } from "@/lib/contacts"
import { getSiteSettings } from "@/lib/data/settings"

/** Public site chrome: navbar, footer, floating contact buttons and cursor. */
export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { contact } = await getSiteSettings()
  const contacts = { phones: phonesFrom(contact.phone, contact.phone2), email: contact.email }

  return (
    <ContactProvider value={contacts}>
    <MotionProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-xs bg-gold px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="min-h-dvh">
        {children}
      </main>
      <Footer />
      <FloatingContact />
      <CursorDot />
      <Toaster position="top-center" />
    </MotionProvider>
    </ContactProvider>
  )
}
