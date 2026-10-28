import { z } from "zod"

const text = (max: number, min = 0) => z.string().trim().min(min, min ? "Required" : undefined).max(max, `Keep it under ${max} characters`)
const optionalUrl = z
  .string()
  .trim()
  .max(300)
  .refine((v) => !v || /^https:\/\//.test(v), "Must start with https://")

/** Editable site text, one schema per settings key. */
export const settingsSchemas = {
  hero: z.object({ eyebrow: text(60, 2), title: text(90, 5), subtitle: text(240, 10) }),
  about: z.object({ years: z.coerce.number().int().min(0).max(200), title: text(120, 5), body: text(1200, 20) }),
  stats: z
    .array(z.object({ label: text(40, 2), value: z.coerce.number().int().min(0).max(1_000_000), suffix: text(4) }))
    .min(1)
    .max(4),
  contact: z.object({
    phone: text(20, 8),
    phone2: text(20),
    email: z.email("Enter a valid email"),
    address: text(200, 5),
    hours: text(80),
  }),
  socials: z.object({ instagram: optionalUrl, facebook: optionalUrl, youtube: optionalUrl, linkedin: optionalUrl }),
} as const

export type SettingsKey = keyof typeof settingsSchemas

export const testimonialSchema = z.object({
  id: z.uuid().optional(),
  name: text(80, 2),
  location: text(80),
  quote: text(600, 10),
  rating: z.coerce.number().int().min(1).max(5),
  sort_order: z.coerce.number().int().min(0).max(999),
  is_published: z.boolean(),
})

export const localitySchema = z.object({
  id: z.uuid().optional(),
  name: text(60, 2),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only"),
  intro: text(1200),
  image_path: z.string().max(500).nullable(),
  sort_order: z.coerce.number().int().min(0).max(999),
})
