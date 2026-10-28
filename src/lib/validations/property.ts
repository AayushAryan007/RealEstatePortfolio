import { z } from "zod"

const optionalNumber = (schema: z.ZodNumber) =>
  z.preprocess((v) => (v === "" || v === null || v === undefined || Number.isNaN(v) ? null : Number(v)), schema.nullable())

export const propertyImageSchema = z.object({
  path_full: z.string().min(1),
  path_thumb: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string().max(200).nullable().optional(),
  is_cover: z.boolean(),
})

/** Everything the admin property form submits. Shared by the form and the server action. */
export const propertySchema = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(5, "At least 5 characters").max(140, "Keep it under 140 characters"),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only")
      .max(120),
    short_description: z.string().trim().max(300, "Keep it under 300 characters").optional().default(""),
    description: z.string().max(20000).optional().default(""),

    price: optionalNumber(z.number().int().min(0, "Must be positive")),
    price_on_request: z.boolean(),
    purpose: z.enum(["sale", "rent"]),
    type: z.enum(["apartment", "plot", "commercial"]),

    locality_id: z.preprocess((v) => (v === "" ? null : v), z.uuid().nullable()),
    address: z.string().trim().max(300).optional().default(""),
    lat: optionalNumber(z.number().min(-90).max(90)),
    lng: optionalNumber(z.number().min(-180).max(180)),

    bhk: optionalNumber(z.number().int().min(0).max(20)),
    bathrooms: optionalNumber(z.number().int().min(0).max(20)),
    area: optionalNumber(z.number().positive("Must be greater than 0")),
    area_unit: z.enum(["sqft", "sqyd", "acre"]),
    floor: optionalNumber(z.number().int().min(-5).max(200)),
    total_floors: optionalNumber(z.number().int().min(0).max(200)),
    furnishing: z.preprocess((v) => (v === "" ? null : v), z.enum(["unfurnished", "semi_furnished", "fully_furnished"]).nullable()),
    facing: z.preprocess(
      (v) => (v === "" ? null : v),
      z.enum(["north", "south", "east", "west", "north_east", "north_west", "south_east", "south_west"]).nullable(),
    ),
    possession: z.preprocess((v) => (v === "" ? null : v), z.enum(["ready_to_move", "under_construction"]).nullable()),
    availability: z.enum(["available", "sold", "rented"]),
    amenities: z.array(z.string().trim().min(1).max(60)).max(40),

    video_url: z
      .string()
      .trim()
      .max(500)
      .refine((v) => !v || /^https:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com)\//.test(v), "Paste a YouTube link")
      .optional()
      .default(""),
    video_path: z.string().max(500).nullable().optional(),

    is_featured: z.boolean(),
    status: z.enum(["draft", "published"]),
    images: z.array(propertyImageSchema).max(20, "Up to 20 photos"),
  })
  .superRefine((data, ctx) => {
    if (!data.price_on_request && data.price === null) {
      ctx.addIssue({ code: "custom", path: ["price"], message: "Enter a price or tick “Price on request”" })
    }
    if (data.status === "published" && data.images.length === 0) {
      ctx.addIssue({ code: "custom", path: ["images"], message: "Add at least one photo before publishing" })
    }
  })

export type PropertyFormValues = z.input<typeof propertySchema>
export type PropertyInput = z.output<typeof propertySchema>

/** Suggested amenities shown as quick-pick chips in the form. */
export const AMENITY_SUGGESTIONS = [
  "Lift",
  "Power backup",
  "Covered parking",
  "Visitor parking",
  "24×7 security",
  "CCTV",
  "Gated community",
  "Club house",
  "Swimming pool",
  "Gym",
  "Park",
  "Kids play area",
  "Piped gas",
  "Rainwater harvesting",
  "Intercom",
  "Modular kitchen",
  "Wardrobes",
  "Air conditioning",
  "Balcony",
  "Servant room",
]

/** "3 BHK Luxury Flat, Noida!" → "3-bhk-luxury-flat-noida" */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100)
}
