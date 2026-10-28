import { z } from "zod"

/** Shared by the browser (instant feedback) and the server action (the real check). */
export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(/^(\+?91)?[6-9]\d{9}$|^\+\d{8,15}$/, "Enter a valid mobile number")),
  message: z.string().trim().max(1000, "Please keep it under 1000 characters").optional().or(z.literal("")),
  propertyId: z.uuid().optional().or(z.literal("")),
})

export type EnquiryInput = z.input<typeof enquirySchema>
export type EnquiryFieldErrors = Partial<Record<"name" | "phone" | "message", string>>

export type EnquiryState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: EnquiryFieldErrors }
