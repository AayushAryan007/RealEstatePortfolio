"use server"

import { after } from "next/server"
import { headers } from "next/headers"

import { sendEnquiryEmail } from "@/lib/email"
import { createPublicClient } from "@/lib/supabase/public"
import { enquirySchema, type EnquiryFieldErrors, type EnquiryState } from "@/lib/validations/enquiry"

/** Submissions faster than this are almost certainly bots. */
const MIN_FILL_MS = 2500

export async function submitEnquiry(_prev: EnquiryState, formData: FormData): Promise<EnquiryState> {
  // Spam traps: a hidden field humans never fill, and a minimum fill time.
  const honeypot = formData.get("company")
  const startedAt = Number(formData.get("started_at"))
  if (honeypot || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
    return { status: "success" } // pretend it worked; don't help bots adapt
  }

  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    message: formData.get("message") ?? "",
    propertyId: formData.get("propertyId") ?? "",
  })

  if (!parsed.success) {
    const fieldErrors: EnquiryFieldErrors = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof EnquiryFieldErrors
      fieldErrors[key] ??= issue.message
    }
    return { status: "error", message: "Please check the highlighted fields.", fieldErrors }
  }

  const { name, phone, message, propertyId } = parsed.data
  const referer = (await headers()).get("referer") ?? undefined
  const propertyTitle = (formData.get("propertyTitle") as string | null)?.slice(0, 140) || undefined

  const { error } = await createPublicClient()
    .from("enquiries")
    .insert({
      name,
      phone,
      message: message || null,
      property_id: propertyId || null,
      source_url: referer?.slice(0, 500) ?? null,
    })

  if (error) {
    console.error("Enquiry insert failed", error.message)
    return { status: "error", message: "Something went wrong. Please call or WhatsApp us instead." }
  }

  // Send the email after responding, so the visitor isn't kept waiting.
  after(async () => {
    try {
      await sendEnquiryEmail({ name, phone, message, propertyTitle, sourceUrl: referer })
    } catch (err) {
      console.error("Enquiry email failed", err)
    }
  })

  return { status: "success" }
}
