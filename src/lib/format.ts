import type { AreaUnit, PropertyPurpose, PropertyType } from "@/types/database"

const inr = new Intl.NumberFormat("en-IN")

/** Trim a number to at most 2 decimals without trailing zeros (1.50 → 1.5). */
function compact(value: number) {
  return Number(value.toFixed(2)).toString()
}

/**
 * Indian price format: ₹1.45 Cr, ₹78 L, ₹42,000/mo.
 * Rentals show the full monthly figure; sale prices use lakh/crore.
 */
export function formatPrice(price: number | null, purpose: PropertyPurpose, onRequest = false) {
  if (onRequest || price === null) return "Price on request"
  if (purpose === "rent") return `₹${inr.format(price)}/mo`
  if (price >= 1_00_00_000) return `₹${compact(price / 1_00_00_000)} Cr`
  if (price >= 1_00_000) return `₹${compact(price / 1_00_000)} L`
  return `₹${inr.format(price)}`
}

const areaUnitLabel: Record<AreaUnit, string> = { sqft: "sq ft", sqyd: "sq yd", acre: "acre" }

export function formatArea(area: number | null, unit: AreaUnit) {
  if (area === null) return null
  return `${inr.format(area)} ${areaUnitLabel[unit]}`
}

export const propertyTypeLabel: Record<PropertyType, string> = {
  apartment: "Apartment",
  plot: "Plot",
  commercial: "Commercial",
}

export const purposeLabel: Record<PropertyPurpose, string> = {
  sale: "For Sale",
  rent: "For Rent",
}
