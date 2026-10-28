"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { CheckCircle2Icon, Loader2Icon, SendIcon } from "lucide-react"
import { toast } from "sonner"

import { submitEnquiry } from "@/actions/enquiry"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EnquiryFieldErrors, EnquiryState } from "@/lib/validations/enquiry"

type EnquiryFormProps = {
  propertyId?: string
  propertyTitle?: string
  defaultMessage?: string
  idPrefix?: string
}

const initialState: EnquiryState = { status: "idle" }

/**
 * Enquiry form with instant field validation, a server action fallback that
 * works without JavaScript, spam traps, and a toast on success or failure.
 */
export function EnquiryForm({ propertyId, propertyTitle, defaultMessage = "", idPrefix = "enq" }: EnquiryFormProps) {
  const [state, action, pending] = useActionState(submitEnquiry, initialState)
  const [errors, setErrors] = useState<EnquiryFieldErrors>({})
  const formRef = useRef<HTMLFormElement>(null)
  const startedAtRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state.status === "success") {
      toast.success("Thank you! We'll get back to you shortly.")
      formRef.current?.reset()
    } else if (state.status === "error") {
      toast.error(state.message)
    }
  }, [state])

  const shownErrors = { ...(state.status === "error" ? state.fieldErrors : {}), ...errors }

  /** Validate one field as the visitor leaves it (mirrors the server rules, without shipping zod). */
  const validateField = (field: keyof EnquiryFieldErrors, value: string) => {
    setErrors((prev) => ({ ...prev, [field]: checkField(field, value) }))
  }

  if (state.status === "success") {
    return (
      <div className="rounded-md border border-gold/30 bg-gold/5 p-6 text-center" role="status">
        <CheckCircle2Icon className="mx-auto size-10 text-gold" strokeWidth={1.25} aria-hidden="true" />
        <p className="mt-3 font-heading text-2xl text-cream">Enquiry received</p>
        <p className="mt-2 text-sm text-taupe">An advisor will call or WhatsApp you soon.</p>
      </div>
    )
  }

  const id = (name: string) => `${idPrefix}-${name}`

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className="space-y-4"
      // Start the anti-spam timer on the first interaction.
      onFocusCapture={() => {
        if (startedAtRef.current && !startedAtRef.current.value) startedAtRef.current.value = String(Date.now())
      }}
    >
      <input type="hidden" name="propertyId" value={propertyId ?? ""} />
      <input type="hidden" name="propertyTitle" value={propertyTitle ?? ""} />
      <input ref={startedAtRef} type="hidden" name="started_at" defaultValue="" />
      {/* Honeypot: hidden from people and screen readers, tempting to bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor={id("company")}>Company</label>
        <input id={id("company")} name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <FormField id={id("name")} label="Your name" error={shownErrors.name}>
        <input
          id={id("name")}
          name="name"
          autoComplete="name"
          required
          aria-invalid={Boolean(shownErrors.name)}
          aria-describedby={shownErrors.name ? `${id("name")}-error` : undefined}
          onBlur={(e) => validateField("name", e.target.value)}
          className={inputClass(Boolean(shownErrors.name))}
        />
      </FormField>

      <FormField id={id("phone")} label="Mobile number" error={shownErrors.phone}>
        <input
          id={id("phone")}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98xxxxxxxx"
          required
          aria-invalid={Boolean(shownErrors.phone)}
          aria-describedby={shownErrors.phone ? `${id("phone")}-error` : undefined}
          onBlur={(e) => validateField("phone", e.target.value)}
          className={inputClass(Boolean(shownErrors.phone))}
        />
      </FormField>

      <FormField id={id("message")} label="Message (optional)" error={shownErrors.message}>
        <textarea
          id={id("message")}
          name="message"
          rows={3}
          defaultValue={defaultMessage}
          aria-invalid={Boolean(shownErrors.message)}
          onBlur={(e) => validateField("message", e.target.value)}
          className={cn(inputClass(Boolean(shownErrors.message)), "h-auto resize-none py-3")}
        />
      </FormField>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <SendIcon aria-hidden="true" />}
        {pending ? "Sending…" : "Send enquiry"}
      </Button>
      <p className="text-center text-xs text-taupe">We reply within the hour. Your details are never shared.</p>
    </form>
  )
}

function checkField(field: keyof EnquiryFieldErrors, raw: string): string | undefined {
  const value = raw.trim()
  if (field === "name") {
    if (value.length < 2) return "Please enter your name"
    if (value.length > 80) return "Name is too long"
  }
  if (field === "phone") {
    const digits = value.replace(/[\s-]/g, "")
    if (!/^(\+?91)?[6-9]\d{9}$|^\+\d{8,15}$/.test(digits)) return "Enter a valid mobile number"
  }
  if (field === "message" && value.length > 1000) return "Please keep it under 1000 characters"
  return undefined
}

function inputClass(invalid: boolean) {
  return cn(
    "h-11 w-full rounded-xs border bg-ink/60 px-3 text-sm text-cream placeholder:text-taupe/60 transition-colors focus-visible:border-gold",
    invalid ? "border-destructive" : "border-input",
  )
}

function FormField({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium tracking-wide text-cream/80">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
