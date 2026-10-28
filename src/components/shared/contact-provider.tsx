"use client"

import { createContext, use } from "react"

import type { Phone } from "@/lib/contacts"

export type Contacts = { phones: Phone[]; email: string }

const ContactContext = createContext<Contacts | null>(null)

/** Makes the business phone numbers (from Site content) available to every button. */
export function ContactProvider({ value, children }: { value: Contacts; children: React.ReactNode }) {
  return <ContactContext value={value}>{children}</ContactContext>
}

export function useContacts() {
  const contacts = use(ContactContext)
  if (!contacts) throw new Error("useContacts must be used inside ContactProvider")
  return contacts
}
