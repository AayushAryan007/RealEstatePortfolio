"use client"

import { cloneElement, useEffect, useId, useRef, useState, type ReactElement } from "react"
import { PhoneIcon } from "lucide-react"

import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { waLink } from "@/lib/contacts"
import { cn } from "@/lib/utils"
import { useContacts } from "./contact-provider"

type TriggerProps = {
  onClick?: (event: React.MouseEvent) => void
  "aria-expanded"?: boolean
  "aria-haspopup"?: "menu"
  "aria-controls"?: string
}

type ContactMenuProps = {
  mode: "call" | "whatsapp"
  /** Prefilled WhatsApp message. */
  message?: string
  /** The trigger button, styled by the caller. */
  children: ReactElement<TriggerProps>
  align?: "start" | "center" | "end"
  side?: "top" | "bottom"
}

const alignClass = { start: "left-0", center: "left-1/2 -translate-x-1/2", end: "right-0" }

/**
 * Call / WhatsApp button that lets the visitor pick which number to use.
 * A tiny hand-rolled popover (no menu library): closes on Escape, outside
 * click or choosing a number, and moves focus into the list when opened.
 * With a single number the trigger simply opens that number.
 */
export function ContactMenu({ mode, message, children, align = "center", side = "bottom" }: ContactMenuProps) {
  const { phones } = useContacts()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLSpanElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const id = useId()

  const href = (i: number) => (mode === "call" ? `tel:${phones[i].tel}` : waLink(phones[i], message))
  const external = mode === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {}
  const Icon = mode === "call" ? PhoneIcon : WhatsAppIcon

  useEffect(() => {
    if (!open) return
    listRef.current?.querySelector("a")?.focus()
    const onPointer = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        wrapperRef.current?.querySelector<HTMLElement>("[aria-haspopup]")?.focus()
      }
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  if (phones.length <= 1) {
    return cloneElement(children, {
      onClick: (event) => {
        event.preventDefault()
        event.stopPropagation()
        if (phones[0]) window.open(href(0), mode === "whatsapp" ? "_blank" : "_self", "noopener")
      },
    })
  }

  return (
    <span ref={wrapperRef} className="relative inline-flex">
      {cloneElement(children, {
        onClick: (event) => {
          // Cards place this button over a link: don't navigate.
          event.preventDefault()
          event.stopPropagation()
          setOpen((o) => !o)
        },
        "aria-expanded": open,
        "aria-haspopup": "menu",
        "aria-controls": id,
      })}
      {open && (
        <div
          id={id}
          className={cn(
            "absolute z-50 min-w-56 animate-in rounded-md border border-gold/20 bg-ink/95 p-1.5 text-left shadow-2xl backdrop-blur-xl duration-200 fade-in zoom-in-95",
            side === "top" ? "bottom-full mb-2" : "top-full mt-2",
            alignClass[align],
          )}
        >
          <p className="px-2.5 pt-1.5 pb-2 text-[0.65rem] font-semibold tracking-[0.22em] text-gold uppercase">
            {mode === "call" ? "Call us on" : "WhatsApp us on"}
          </p>
          <ul ref={listRef}>
            {phones.map((phone, i) => (
              <li key={phone.tel}>
                <a
                  href={href(i)}
                  {...external}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xs px-2.5 py-2.5 text-sm text-cream transition-colors outline-none hover:bg-gold/15 hover:text-gold focus-visible:bg-gold/15 focus-visible:text-gold"
                >
                  <Icon className="size-4 text-gold" />
                  <span className="tabular-nums">{phone.display}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </span>
  )
}
