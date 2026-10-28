"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Building2Icon,
  ExternalLinkIcon,
  InboxIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MapPinnedIcon,
  MenuIcon,
  MessageSquareQuoteIcon,
  PencilRulerIcon,
  Trash2Icon,
} from "lucide-react"

import { signOut } from "@/actions/admin/auth"
import { LogoMark } from "@/components/shared/logo"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboardIcon },
  { href: "/admin/properties", label: "Properties", Icon: Building2Icon },
  { href: "/admin/enquiries", label: "Enquiries", Icon: InboxIcon },
  { href: "/admin/content", label: "Site content", Icon: PencilRulerIcon },
  { href: "/admin/testimonials", label: "Testimonials", Icon: MessageSquareQuoteIcon },
  { href: "/admin/areas", label: "Areas", Icon: MapPinnedIcon },
  { href: "/admin/trash", label: "Trash", Icon: Trash2Icon },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href))

  return (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <ul className="space-y-1">
        {nav.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm transition-colors",
                active(href) ? "bg-gold/12 font-semibold text-gold" : "text-cream/75 hover:bg-white/5 hover:text-cream",
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="mt-auto space-y-1 border-t border-gold/10 pt-4">
        <li>
          <a href="/" target="_blank" className="flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm text-cream/75 hover:bg-white/5 hover:text-cream">
            <ExternalLinkIcon className="size-4" strokeWidth={1.75} aria-hidden="true" /> View website
          </a>
        </li>
        <li>
          <Link
            href="/admin/reset-password"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xs px-3 py-2.5 text-sm text-cream/75 hover:bg-white/5 hover:text-cream"
          >
            <KeyRoundIcon className="size-4" strokeWidth={1.75} aria-hidden="true" /> Change password
          </Link>
        </li>
        <li>
          <form action={signOut}>
            <button className="flex w-full items-center gap-3 rounded-xs px-3 py-2.5 text-sm text-cream/75 hover:bg-white/5 hover:text-cream">
              <LogOutIcon className="size-4" strokeWidth={1.75} aria-hidden="true" /> Sign out
            </button>
          </form>
        </li>
      </ul>
    </nav>
  )
}

/** Desktop sidebar + mobile top bar with a slide-out menu. */
export function AdminNav() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-gold/10 bg-ink-raised/60 p-4 lg:flex">
        <Link href="/admin" className="mb-8 flex items-center gap-3 px-2 pt-2">
          <LogoMark className="h-8" />
          <span className="font-heading text-lg tracking-[0.2em] text-cream">ADMIN</span>
        </Link>
        <NavLinks />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gold/10 bg-ink/90 px-4 backdrop-blur-md lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="h-7" />
          <span className="font-heading tracking-[0.2em] text-cream">ADMIN</span>
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger className="grid size-10 place-items-center text-cream" aria-label="Open admin menu">
            <MenuIcon className="size-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 border-gold/15 bg-ink p-4">
            <SheetTitle className="mb-6 px-2 pt-2 font-heading text-xl font-medium text-cream">Menu</SheetTitle>
            <NavLinks onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </header>
    </>
  )
}
