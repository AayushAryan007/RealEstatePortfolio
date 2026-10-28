"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Controller, useForm, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ExternalLinkIcon, Loader2Icon, PlusIcon, SaveIcon, XIcon } from "lucide-react"
import { toast } from "sonner"

import { saveProperty } from "@/actions/admin/properties"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AMENITY_SUGGESTIONS, propertySchema, slugify, type PropertyFormValues, type PropertyInput } from "@/lib/validations/property"
import { ImageManager, type ManagedImage } from "./image-manager"
import { MapPinField } from "./map-pin-field"
import { RichTextEditor } from "./rich-text-editor"
import { AdminCard, FieldError, adminInput, adminLabel } from "./ui"
import { VideoField } from "./video-field"

type FormValues = PropertyFormValues & { images: ManagedImage[] }

/** Number inputs: empty string → null, otherwise a number. */
const asNumber = { setValueAs: (v: string) => (v === "" || v === null ? null : Number(v)) }

export function PropertyForm({
  initial,
  localities,
  isNew,
}: {
  initial: FormValues
  localities: { id: string; name: string }[]
  isNew: boolean
}) {
  const router = useRouter()
  const [saving, startSaving] = useTransition()
  const [slugTouched, setSlugTouched] = useState(!isNew)
  const [customAmenity, setCustomAmenity] = useState("")

  const form = useForm<FormValues, unknown, PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: initial,
    mode: "onBlur",
  })
  const { register, control, handleSubmit, watch, setValue, setError, formState } = form
  const { errors, isDirty } = formState
  const err = (name: string) => (errors as Record<string, { message?: string }>)[name]?.message

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!isDirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [isDirty])

  const title = watch("title")
  useEffect(() => {
    if (!slugTouched && title) setValue("slug", slugify(title), { shouldDirty: true })
  }, [title, slugTouched, setValue])

  const purpose = watch("purpose")
  const type = watch("type")
  const priceOnRequest = watch("price_on_request")
  const amenities = watch("amenities") ?? []

  const onSubmit = (values: PropertyInput) =>
    startSaving(async () => {
      const result = await saveProperty(values)
      if (!result.ok) {
        toast.error(result.error)
        for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
          setError(field as FieldPath<FormValues>, { message })
        }
        return
      }
      toast.success(values.status === "published" ? "Saved and live on the website" : "Saved as draft")
      form.reset({ ...values, slug: result.slug } as FormValues)
      if (isNew) router.replace(`/admin/properties/${result.id}`)
      else router.refresh()
    })

  const onInvalid = () => toast.error("Please fix the highlighted fields.")

  const toggleAmenity = (name: string) =>
    setValue("amenities", amenities.includes(name) ? amenities.filter((a) => a !== name) : [...amenities, name], { shouldDirty: true })

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      <div className="min-w-0 space-y-6">
        {/* ---------- Basics ---------- */}
        <Section title="Basics">
          <Field label="Title" htmlFor="title" error={err("title")}>
            <input id="title" {...register("title")} placeholder="3 BHK Luxury Apartment in Indirapuram" className={adminInput} />
          </Field>
          <Field label="Web address" htmlFor="slug" error={err("slug")} hint="Auto-filled from the title. Change only if needed.">
            <div className="flex items-center rounded-xs border border-input bg-ink/60 focus-within:border-gold">
              <span className="pl-3 text-xs text-taupe">/properties/</span>
              <input
                id="slug"
                {...register("slug", { onChange: () => setSlugTouched(true) })}
                className="h-10 flex-1 bg-transparent pr-3 text-sm text-cream outline-none"
              />
            </div>
          </Field>
          <Field label="Short summary" htmlFor="short_description" error={err("short_description")} hint="One or two lines shown in search results and link previews.">
            <textarea id="short_description" rows={2} maxLength={300} {...register("short_description")} className={cn(adminInput, "h-auto py-2")} />
          </Field>
          <Field label="Full description" htmlFor="description-editor">
            <Controller
              control={control}
              name="description"
              render={({ field }) => <RichTextEditor id="description-editor" value={field.value ?? ""} onChange={field.onChange} />}
            />
          </Field>
        </Section>

        {/* ---------- Price & type ---------- */}
        <Section title="Price & type">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Looking to" htmlFor="purpose">
              <select id="purpose" {...register("purpose")} className={adminInput}>
                <option value="sale">Sell</option>
                <option value="rent">Rent out</option>
              </select>
            </Field>
            <Field label="Property type" htmlFor="type">
              <select id="type" {...register("type")} className={adminInput}>
                <option value="apartment">Apartment / Flat</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
              </select>
            </Field>
            <Field label={purpose === "rent" ? "Monthly rent (₹)" : "Price (₹)"} htmlFor="price" error={err("price")} hint="Full amount in rupees, e.g. 14500000 for ₹1.45 Cr.">
              <input id="price" type="number" inputMode="numeric" min={0} {...register("price", asNumber)} disabled={priceOnRequest} className={adminInput} />
            </Field>
            <Field label="Status" htmlFor="availability">
              <select id="availability" {...register("availability")} className={adminInput}>
                <option value="available">Available</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
              </select>
            </Field>
          </div>
          <label className="flex items-center gap-3 text-sm text-cream/85">
            <Controller
              control={control}
              name="price_on_request"
              render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
            />
            Show &ldquo;Price on request&rdquo; instead of a price
          </label>
        </Section>

        {/* ---------- Location ---------- */}
        <Section title="Location">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Area" htmlFor="locality_id" error={err("locality_id")}>
              <select id="locality_id" {...register("locality_id")} className={adminInput}>
                <option value="">Select an area</option>
                {localities.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Address / society / sector" htmlFor="address">
              <input id="address" {...register("address")} placeholder="Shakti Khand 2, Indirapuram" className={adminInput} />
            </Field>
          </div>
          <MapPinField
            lat={(watch("lat") as number | null) ?? null}
            lng={(watch("lng") as number | null) ?? null}
            onChange={({ lat, lng }) => {
              setValue("lat", lat, { shouldDirty: true })
              setValue("lng", lng, { shouldDirty: true })
            }}
          />
        </Section>

        {/* ---------- Details ---------- */}
        <Section title="Details">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {type !== "plot" && (
              <>
                <Field label="Bedrooms (BHK)" htmlFor="bhk" error={err("bhk")}>
                  <input id="bhk" type="number" min={0} {...register("bhk", asNumber)} className={adminInput} />
                </Field>
                <Field label="Bathrooms" htmlFor="bathrooms" error={err("bathrooms")}>
                  <input id="bathrooms" type="number" min={0} {...register("bathrooms", asNumber)} className={adminInput} />
                </Field>
              </>
            )}
            <Field label="Area" htmlFor="area" error={err("area")}>
              <input id="area" type="number" min={0} step="any" {...register("area", asNumber)} className={adminInput} />
            </Field>
            <Field label="Unit" htmlFor="area_unit">
              <select id="area_unit" {...register("area_unit")} className={adminInput}>
                <option value="sqft">sq ft</option>
                <option value="sqyd">sq yd</option>
                <option value="acre">acre</option>
              </select>
            </Field>
            {type !== "plot" && (
              <>
                <Field label="Floor" htmlFor="floor" error={err("floor")}>
                  <input id="floor" type="number" {...register("floor", asNumber)} className={adminInput} />
                </Field>
                <Field label="Total floors" htmlFor="total_floors" error={err("total_floors")}>
                  <input id="total_floors" type="number" min={0} {...register("total_floors", asNumber)} className={adminInput} />
                </Field>
                <Field label="Furnishing" htmlFor="furnishing">
                  <select id="furnishing" {...register("furnishing")} className={adminInput}>
                    <option value="">Not specified</option>
                    <option value="unfurnished">Unfurnished</option>
                    <option value="semi_furnished">Semi-furnished</option>
                    <option value="fully_furnished">Fully furnished</option>
                  </select>
                </Field>
              </>
            )}
            <Field label="Facing" htmlFor="facing">
              <select id="facing" {...register("facing")} className={adminInput}>
                <option value="">Not specified</option>
                {["north", "south", "east", "west", "north_east", "north_west", "south_east", "south_west"].map((f) => (
                  <option key={f} value={f}>
                    {f.replace("_", "-").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Possession" htmlFor="possession">
              <select id="possession" {...register("possession")} className={adminInput}>
                <option value="">Not specified</option>
                <option value="ready_to_move">Ready to move</option>
                <option value="under_construction">Under construction</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* ---------- Amenities ---------- */}
        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {[...new Set([...AMENITY_SUGGESTIONS, ...amenities])].map((name) => {
              const on = amenities.includes(name)
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => toggleAmenity(name)}
                  aria-pressed={on}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-colors",
                    on ? "border-gold bg-gold text-ink" : "border-input text-cream/75 hover:border-gold/50",
                  )}
                >
                  {name}
                </button>
              )
            })}
          </div>
          <div className="flex max-w-sm gap-2">
            <input
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  if (customAmenity.trim()) toggleAmenity(customAmenity.trim())
                  setCustomAmenity("")
                }
              }}
              placeholder="Add another amenity"
              aria-label="Add another amenity"
              className={adminInput}
            />
            <Button
              type="button"
              variant="gold"
              onClick={() => {
                if (customAmenity.trim()) toggleAmenity(customAmenity.trim())
                setCustomAmenity("")
              }}
            >
              <PlusIcon aria-hidden="true" /> Add
            </Button>
          </div>
        </Section>

        {/* ---------- Photos ---------- */}
        <Section title="Photos">
          <Controller
            control={control}
            name="images"
            render={({ field }) => (
              <ImageManager propertyId={initial.id} value={field.value} onChange={(imgs) => field.onChange(imgs)} error={err("images")} />
            )}
          />
        </Section>

        {/* ---------- Video ---------- */}
        <Section title="Video">
          <VideoField
            propertyId={initial.id}
            url={watch("video_url") ?? ""}
            path={(watch("video_path") as string | null) ?? null}
            onUrlChange={(v) => setValue("video_url", v, { shouldDirty: true, shouldValidate: true })}
            onPathChange={(p) => setValue("video_path", p, { shouldDirty: true })}
            error={err("video_url")}
          />
        </Section>
      </div>

      {/* ---------- Publish sidebar ---------- */}
      <aside className="xl:order-last">
        <div className="space-y-5 xl:sticky xl:top-8">
          <AdminCard className="space-y-5">
            <h2 className="font-heading text-2xl text-cream">Publish</h2>
            <Field label="Visibility" htmlFor="status">
              <select id="status" {...register("status")} className={adminInput}>
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </select>
            </Field>
            <label className="flex items-center justify-between gap-3 text-sm text-cream/85">
              Feature on homepage
              <Controller
                control={control}
                name="is_featured"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </label>
            <Button type="submit" size="lg" className="w-full" disabled={saving}>
              {saving ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <SaveIcon aria-hidden="true" />}
              {saving ? "Saving…" : "Save"}
            </Button>
            {isDirty && <p className="text-center text-xs text-gold">You have unsaved changes</p>}
            {!isNew && (
              <Link
                href={`/properties/${watch("slug")}`}
                target="_blank"
                className="flex items-center justify-center gap-2 text-xs text-taupe hover:text-cream"
              >
                <ExternalLinkIcon className="size-3.5" aria-hidden="true" /> View on website
              </Link>
            )}
          </AdminCard>
          <Button type="button" variant="ghost" className="w-full text-taupe" asChild>
            <Link href="/admin/properties">
              <XIcon aria-hidden="true" /> Back to list
            </Link>
          </Button>
        </div>
      </aside>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <AdminCard className="space-y-4">
      <h2 className="font-heading text-2xl text-cream">{title}</h2>
      {children}
    </AdminCard>
  )
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={adminLabel}>
        {label}
      </label>
      {children}
      {error ? <FieldError message={error} /> : hint ? <p className="mt-1.5 text-xs text-taupe">{hint}</p> : null}
    </div>
  )
}
