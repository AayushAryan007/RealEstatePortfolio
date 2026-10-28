"use client"

import { useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { SearchIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { PropertyFilters } from "@/lib/data/properties"
import { filtersToQuery } from "@/lib/filters"
import { cn } from "@/lib/utils"

const salePrices = [
  ["2500000", "₹25 L"],
  ["5000000", "₹50 L"],
  ["7500000", "₹75 L"],
  ["10000000", "₹1 Cr"],
  ["15000000", "₹1.5 Cr"],
  ["20000000", "₹2 Cr"],
  ["30000000", "₹3 Cr"],
  ["50000000", "₹5 Cr"],
] as const

const rentPrices = [
  ["10000", "₹10,000"],
  ["20000", "₹20,000"],
  ["30000", "₹30,000"],
  ["50000", "₹50,000"],
  ["75000", "₹75,000"],
  ["100000", "₹1,00,000"],
] as const

type FilterFormProps = {
  filters: PropertyFilters
  localities: { name: string; slug: string }[]
  /** Called after navigating (e.g. to close the mobile sheet). */
  onApplied?: () => void
  idPrefix: string
}

/**
 * Listing filters. A GET form so it works without JavaScript; with JS,
 * every change updates the URL instantly (filters are shareable links).
 */
export function FilterForm({ filters, localities, onApplied, idPrefix }: FilterFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [pending, startTransition] = useTransition()
  const prices = filters.purpose === "rent" ? rentPrices : salePrices

  const apply = () => {
    const form = formRef.current
    if (!form) return
    const data = new FormData(form)
    const value = (key: string) => (data.get(key) as string) || undefined
    const query = filtersToQuery({
      q: value("q"),
      type: value("type") as PropertyFilters["type"],
      purpose: value("purpose") as PropertyFilters["purpose"],
      locality: value("locality"),
      min: value("min") ? Number(value("min")) : undefined,
      max: value("max") ? Number(value("max")) : undefined,
      bhk: value("bhk") ? Number(value("bhk")) : undefined,
      sort: filters.sort,
    })
    startTransition(() => router.push(`/properties${query}`, { scroll: false }))
    onApplied?.()
  }

  const id = (name: string) => `${idPrefix}-${name}`

  return (
    <form
      ref={formRef}
      action="/properties"
      method="get"
      role="search"
      aria-label="Filter properties"
      onSubmit={(event) => {
        event.preventDefault()
        apply()
      }}
      onChange={(event) => {
        // Text search waits for Enter / the button; everything else applies instantly.
        if ((event.target as HTMLElement).getAttribute("name") !== "q") apply()
      }}
      className={cn("space-y-7 transition-opacity", pending && "opacity-60")}
      aria-busy={pending}
    >
      <Field label="Search" htmlFor={id("q")}>
        <div className="relative">
          <input
            id={id("q")}
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Title, society or sector"
            className="h-11 w-full rounded-xs border border-input bg-ink/60 pr-10 pl-3 text-sm text-cream placeholder:text-taupe/70 focus-visible:border-gold"
          />
          <button type="submit" aria-label="Search" className="absolute inset-y-0 right-0 grid w-10 place-items-center text-gold">
            <SearchIcon className="size-4" />
          </button>
        </div>
      </Field>

      <Field label="Looking to">
        <Segmented
          name="purpose"
          value={filters.purpose ?? ""}
          options={[
            ["", "Any"],
            ["sale", "Buy"],
            ["rent", "Rent"],
          ]}
          idPrefix={id("purpose")}
        />
      </Field>

      <Field label="Property type" htmlFor={id("type")}>
        <NativeSelect id={id("type")} name="type" defaultValue={filters.type ?? ""}>
          <option value="">All types</option>
          <option value="apartment">Apartments & Flats</option>
          <option value="plot">Plots</option>
          <option value="commercial">Commercial</option>
        </NativeSelect>
      </Field>

      <Field label="Location" htmlFor={id("locality")}>
        <NativeSelect id={id("locality")} name="locality" defaultValue={filters.locality ?? ""}>
          <option value="">All locations</option>
          {localities.map((l) => (
            <option key={l.slug} value={l.slug}>
              {l.name}
            </option>
          ))}
        </NativeSelect>
      </Field>

      <Field label={filters.purpose === "rent" ? "Monthly rent" : "Budget"}>
        <div className="grid grid-cols-2 gap-2">
          <NativeSelect aria-label="Minimum price" name="min" defaultValue={filters.min?.toString() ?? ""}>
            <option value="">Min</option>
            {prices.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect aria-label="Maximum price" name="max" defaultValue={filters.max?.toString() ?? ""}>
            <option value="">Max</option>
            {prices.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </Field>

      <Field label="Bedrooms">
        <Segmented
          name="bhk"
          value={filters.bhk?.toString() ?? ""}
          options={[
            ["", "Any"],
            ["1", "1"],
            ["2", "2"],
            ["3", "3"],
            ["4", "4+"],
          ]}
          idPrefix={id("bhk")}
        />
      </Field>

      <div className="flex gap-2 pt-1">
        <Button type="submit" className="flex-1">
          Apply filters
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-taupe hover:text-cream"
          onClick={() => {
            startTransition(() => router.push("/properties", { scroll: false }))
            onApplied?.()
          }}
        >
          <XIcon aria-hidden="true" /> Clear
        </Button>
      </div>
    </form>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) {
  const Label = htmlFor ? "label" : "p"
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-2.5 block text-[0.65rem] font-semibold tracking-[0.24em] text-gold uppercase">
        {label}
      </Label>
      {children}
    </div>
  )
}

function NativeSelect({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          "h-11 w-full cursor-pointer appearance-none rounded-xs border border-input bg-ink/60 pr-8 pl-3 text-sm text-cream focus-visible:border-gold [&>option]:bg-ink-raised",
          className,
        )}
      />
      <svg aria-hidden="true" viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
      </svg>
    </div>
  )
}

/** Radio buttons styled as a segmented control (keyboard-accessible). */
function Segmented({
  name,
  value,
  options,
  idPrefix,
}: {
  name: string
  value: string
  options: readonly (readonly [string, string])[]
  idPrefix: string
}) {
  return (
    <div role="radiogroup" className="flex overflow-hidden rounded-xs border border-input">
      {options.map(([optionValue, label]) => {
        const optionId = `${idPrefix}-${optionValue || "any"}`
        return (
          <div key={optionValue} className="flex-1 border-l border-input first:border-l-0">
            <input
              type="radio"
              id={optionId}
              name={name}
              value={optionValue}
              defaultChecked={value === optionValue}
              className="peer sr-only"
            />
            <label
              htmlFor={optionId}
              className="block cursor-pointer py-2.5 text-center text-sm text-cream/75 transition-colors peer-checked:bg-gold peer-checked:font-semibold peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-gold hover:text-cream"
            >
              {label}
            </label>
          </div>
        )
      })}
    </div>
  )
}
