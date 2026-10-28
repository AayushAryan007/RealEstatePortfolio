"use client"

import { PhoneIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/shared/brand-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { waLink } from "@/lib/contacts"
import { cn } from "@/lib/utils"
import { useContacts } from "./contact-provider"

type ContactMenuProps = {
  mode: "call" | "whatsapp"
  /** Prefilled WhatsApp message. */
  message?: string
  /** The trigger element (a button/anchor styled by the caller). */
  children: React.ReactElement
  align?: "start" | "center" | "end"
  side?: "top" | "bottom"
}

/**
 * Call / WhatsApp button that lets the visitor pick which number to use.
 * With a single number it's a plain link, no menu.
 */
export function ContactMenu({ mode, message, children, align = "center", side = "bottom" }: ContactMenuProps) {
  const { phones } = useContacts()
  const href = (i: number) => (mode === "call" ? `tel:${phones[i].tel}` : waLink(phones[i], message))
  const external = mode === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {}
  const Icon = mode === "call" ? PhoneIcon : WhatsAppIcon

  if (phones.length <= 1) {
    // Render the caller's element as a link to the only number.
    return (
      <a href={phones.length ? href(0) : "#"} {...external} className="contents">
        {children}
      </a>
    )
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align={align} side={side} sideOffset={8} className="min-w-56 border-gold/20 bg-ink/95 backdrop-blur-xl">
        <DropdownMenuLabel className="text-[0.65rem] font-semibold tracking-[0.22em] text-gold uppercase">
          {mode === "call" ? "Call us on" : "WhatsApp us on"}
        </DropdownMenuLabel>
        {phones.map((phone, i) => (
          <DropdownMenuItem key={phone.tel} asChild className="cursor-pointer py-2.5 text-cream focus:bg-gold/15 focus:text-gold">
            <a href={href(i)} {...external}>
              <Icon className={cn("size-4 text-gold")} />
              <span className="tabular-nums">{phone.display}</span>
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
