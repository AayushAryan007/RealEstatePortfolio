import { SearchIcon } from "lucide-react"

const budgets = [
  { label: "Any budget", value: "" },
  { label: "Under ₹50 L", value: "0-5000000" },
  { label: "₹50 L – ₹1 Cr", value: "5000000-10000000" },
  { label: "₹1 Cr – ₹2 Cr", value: "10000000-20000000" },
  { label: "₹2 Cr – ₹5 Cr", value: "20000000-50000000" },
  { label: "Above ₹5 Cr", value: "50000000-" },
]

const types = [
  { label: "All types", value: "" },
  { label: "Apartments & Flats", value: "apartment" },
  { label: "Plots", value: "plot" },
  { label: "Commercial", value: "commercial" },
]

const purposes = [
  { label: "Buy or Rent", value: "" },
  { label: "Buy", value: "sale" },
  { label: "Rent", value: "rent" },
]

/**
 * Property search bar. A plain GET form to /properties, so it works even
 * before JavaScript loads; the listing page reads the same URL parameters.
 * Native <select>s keep it light and fully accessible on phones.
 */
export function HeroSearch({ localities }: { localities: { name: string; slug: string }[] }) {
  return (
    <form
      action="/properties"
      method="get"
      role="search"
      aria-label="Search properties"
      className="grid gap-px overflow-hidden rounded-md border border-gold/30 bg-gold/15 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[repeat(4,1fr)_auto]"
    >
      <SearchField label="Location" name="locality">
        <option value="">All locations</option>
        {localities.map((l) => (
          <option key={l.slug} value={l.slug}>
            {l.name}
          </option>
        ))}
      </SearchField>
      <SearchField label="Property type" name="type">
        {types.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </SearchField>
      <SearchField label="Looking to" name="purpose">
        {purposes.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </SearchField>
      <SearchField label="Budget" name="budget">
        {budgets.map((b) => (
          <option key={b.value} value={b.value}>
            {b.label}
          </option>
        ))}
      </SearchField>
      <button
        type="submit"
        className="group relative flex items-center justify-center gap-2 overflow-hidden bg-gold px-8 py-5 text-[0.78rem] font-semibold tracking-[0.2em] text-ink uppercase transition-colors duration-300 hover:bg-gold-light sm:col-span-2 lg:col-span-1"
      >
        <SearchIcon className="size-4" aria-hidden="true" />
        Search
      </button>
    </form>
  )
}

function SearchField({ label, name, children }: { label: string; name: string; children: React.ReactNode }) {
  const id = `search-${name}`
  return (
    <div className="relative bg-ink/85 px-5 py-4 transition-colors focus-within:bg-ink-raised">
      <label htmlFor={id} className="block text-[0.65rem] font-semibold tracking-[0.24em] text-gold uppercase">
        {label}
      </label>
      <select
        id={id}
        name={name}
        defaultValue=""
        className="mt-1.5 w-full cursor-pointer appearance-none bg-transparent pr-6 text-[0.95rem] text-cream outline-none [&>option]:bg-ink-raised"
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-5 bottom-5 size-3 text-gold"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="m2.5 4.5 3.5 3.5 3.5-3.5" />
      </svg>
    </div>
  )
}
