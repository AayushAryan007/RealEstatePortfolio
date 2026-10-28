import "server-only"

import nodemailer from "nodemailer"

import { site } from "@/lib/site"

type EnquiryEmail = {
  name: string
  phone: string
  message?: string
  propertyTitle?: string
  sourceUrl?: string
}

const escape = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

/**
 * Email a new enquiry to the team via Gmail SMTP (App Password).
 * Silently skipped when the Gmail env vars aren't set; the enquiry is
 * still saved in the admin inbox either way.
 */
export async function sendEnquiryEmail(enquiry: EnquiryEmail) {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD
  const to = process.env.ENQUIRY_NOTIFY_TO || site.contact.email
  if (!user || !pass) return

  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user, pass } })
  const phoneDigits = enquiry.phone.replace(/\D/g, "")
  const waNumber = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits

  const rows = [
    ["Name", enquiry.name],
    ["Phone", enquiry.phone],
    ["Property", enquiry.propertyTitle ?? "General enquiry"],
    ["Page", enquiry.sourceUrl ?? "-"],
    ["Message", enquiry.message || "-"],
  ]

  await transporter.sendMail({
    from: `"${site.name} Website" <${user}>`,
    to,
    subject: `New enquiry: ${enquiry.name}${enquiry.propertyTitle ? ` · ${enquiry.propertyTitle}` : ""}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1a1814">
        <h2 style="font-weight:normal;border-bottom:2px solid #c9a45c;padding-bottom:8px">New website enquiry</h2>
        <table style="width:100%;border-collapse:collapse">
          ${rows
            .map(
              ([k, v]) =>
                `<tr><td style="padding:8px 0;color:#7a7264;width:90px;vertical-align:top">${k}</td><td style="padding:8px 0">${escape(v)}</td></tr>`,
            )
            .join("")}
        </table>
        <p style="margin-top:24px">
          <a href="https://wa.me/${waNumber}" style="background:#c9a45c;color:#0e0d0b;padding:10px 18px;text-decoration:none;border-radius:2px">Reply on WhatsApp</a>
          &nbsp;
          <a href="tel:${escape(enquiry.phone)}" style="color:#a8843f">Call ${escape(enquiry.phone)}</a>
        </p>
      </div>`,
  })
}
