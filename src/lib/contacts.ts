/** Phone helpers shared by server and client components. */

export type Phone = {
  /** As shown to people: "+91 70111 91639" */
  display: string
  /** For tel: links: "+917011191639" */
  tel: string
  /** For wa.me links: "917011191639" */
  wa: string
}

/** Normalise an Indian (or international) number into display, tel and WhatsApp forms. */
export function toPhone(raw: string): Phone | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length < 8) return null
  const full = digits.length === 10 ? `91${digits}` : digits.replace(/^0+/, "")
  const local = full.startsWith("91") && full.length === 12 ? full.slice(2) : null
  return {
    display: local ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : `+${full}`,
    tel: `+${full}`,
    wa: full,
  }
}

export function phonesFrom(...numbers: (string | null | undefined)[]): Phone[] {
  const seen = new Set<string>()
  return numbers
    .map((n) => (n ? toPhone(n) : null))
    .filter((p): p is Phone => p !== null && !seen.has(p.tel) && Boolean(seen.add(p.tel)))
}

export const DEFAULT_WA_MESSAGE = "Hi, I'm interested in a property listed on Gupta Properties."

export function waLink(phone: Phone, message = DEFAULT_WA_MESSAGE) {
  return `https://wa.me/${phone.wa}?text=${encodeURIComponent(message)}`
}
