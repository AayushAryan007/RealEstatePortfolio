"use client"

import { useMemo, useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowDownUpIcon, CopyIcon, ExternalLinkIcon, EyeIcon, EyeOffIcon, MoreHorizontalIcon, PencilIcon, SearchIcon, StarIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { duplicateProperty, setFeatured, setStatus, trashProperties } from "@/actions/admin/properties"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { AdminPropertyRow } from "@/lib/data/admin"
import { formatPrice, propertyTypeLabel } from "@/lib/format"
import { mediaUrl } from "@/lib/media"
import { cn } from "@/lib/utils"
import { ConfirmButton } from "./confirm-button"
import { adminInput } from "./ui"

type SortKey = "updated" | "title" | "price"

/** Searchable, filterable list of properties with bulk actions. Filtering happens in the browser (the list is small). */
export function PropertiesTable({ rows }: { rows: AdminPropertyRow[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, start] = useTransition()
  const [query, setQuery] = useState("")
  const [status, setStatusFilter] = useState(params.get("status") ?? "")
  const [type, setType] = useState("")
  const [featuredOnly, setFeaturedOnly] = useState(params.get("featured") === "1")
  const [sort, setSort] = useState<SortKey>("updated")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = rows.filter(
      (r) =>
        (!q || r.title.toLowerCase().includes(q) || r.locality?.name.toLowerCase().includes(q)) &&
        (!status || r.status === status) &&
        (!type || r.type === type) &&
        (!featuredOnly || r.is_featured),
    )
    return list.sort((a, b) =>
      sort === "title" ? a.title.localeCompare(b.title) : sort === "price" ? (b.price ?? 0) - (a.price ?? 0) : b.updated_at.localeCompare(a.updated_at),
    )
  }, [rows, query, status, type, featuredOnly, sort])

  const allSelected = visible.length > 0 && visible.every((r) => selected.has(r.id))
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const run = (task: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const result = await task()
      if (result.ok) {
        toast.success(success)
        setSelected(new Set())
        router.refresh()
      } else toast.error(result.error ?? "Something went wrong")
    })

  const ids = [...selected]

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative min-w-52 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-taupe" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or area" aria-label="Search properties" className={cn(adminInput, "pl-9")} />
        </div>
        <select value={status} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status" className={cn(adminInput, "w-auto")}>
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by type" className={cn(adminInput, "w-auto")}>
          <option value="">All types</option>
          <option value="apartment">Apartments</option>
          <option value="plot">Plots</option>
          <option value="commercial">Commercial</option>
        </select>
        <button
          type="button"
          onClick={() => setFeaturedOnly((f) => !f)}
          aria-pressed={featuredOnly}
          className={cn("flex h-10 items-center gap-2 rounded-xs border px-3 text-sm", featuredOnly ? "border-gold bg-gold/15 text-gold" : "border-input text-cream/75")}
        >
          <StarIcon className="size-4" aria-hidden="true" /> Featured
        </button>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Sort" className={cn(adminInput, "w-auto")}>
          <option value="updated">Recently updated</option>
          <option value="title">Title A–Z</option>
          <option value="price">Price high–low</option>
        </select>
      </div>

      {selected.size > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xs border border-gold/30 bg-gold/5 px-3 py-2 text-sm">
          <span className="mr-2 text-cream">{selected.size} selected</span>
          <Button size="sm" variant="gold" disabled={pending} onClick={() => run(() => setStatus(ids, "published"), "Published")}>
            <EyeIcon aria-hidden="true" /> Publish
          </Button>
          <Button size="sm" variant="gold" disabled={pending} onClick={() => run(() => setStatus(ids, "draft"), "Moved to drafts")}>
            <EyeOffIcon aria-hidden="true" /> Unpublish
          </Button>
          <ConfirmButton
            size="sm"
            variant="destructive"
            disabled={pending}
            title={`Move ${selected.size} propert${selected.size === 1 ? "y" : "ies"} to Trash?`}
            description="They'll disappear from the website. You can restore them from Trash for 30 days."
            confirmLabel="Move to Trash"
            destructive
            onConfirm={() => run(() => trashProperties(ids), "Moved to Trash")}
          >
            <Trash2Icon aria-hidden="true" /> Delete
          </ConfirmButton>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-xs text-taupe hover:text-cream">
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-gold/12">
        <table className="w-full min-w-[46rem] text-sm">
          <thead className="bg-ink-raised/70 text-left text-xs tracking-wide text-taupe">
            <tr>
              <th className="w-10 p-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={() => setSelected(allSelected ? new Set() : new Set(visible.map((r) => r.id)))}
                  aria-label="Select all"
                />
              </th>
              <th className="p-3 font-medium">Property</th>
              <th className="p-3 font-medium">
                <button type="button" onClick={() => setSort("price")} className="inline-flex items-center gap-1 hover:text-cream">
                  Price <ArrowDownUpIcon className="size-3" aria-hidden="true" />
                </button>
              </th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Featured</th>
              <th className="w-12 p-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/8">
            {visible.map((row) => (
              <tr key={row.id} className={cn("transition-colors hover:bg-white/[0.02]", selected.has(row.id) && "bg-gold/5")}>
                <td className="p-3">
                  <Checkbox checked={selected.has(row.id)} onCheckedChange={() => toggle(row.id)} aria-label={`Select ${row.title}`} />
                </td>
                <td className="p-3">
                  <Link href={`/admin/properties/${row.id}`} className="flex items-center gap-3">
                    <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xs bg-ink-raised">
                      {row.thumb && <Image src={mediaUrl(row.thumb)!} alt="" fill sizes="64px" className="object-cover" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-cream hover:text-gold">{row.title}</span>
                      <span className="block text-xs text-taupe">
                        {propertyTypeLabel[row.type]} · {row.locality?.name ?? "No area"} · {row.purpose === "rent" ? "Rent" : "Sale"}
                        {row.is_sample && <span className="ml-2 rounded-xs border border-gold/30 px-1 text-[0.6rem] text-gold uppercase">Sample</span>}
                      </span>
                    </span>
                  </Link>
                </td>
                <td className="p-3 whitespace-nowrap text-cream/90">{formatPrice(row.price, row.purpose, row.price_on_request)}</td>
                <td className="p-3">
                  <span
                    className={cn(
                      "inline-block rounded-xs px-2 py-0.5 text-xs",
                      row.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-cream/70",
                    )}
                  >
                    {row.status === "published" ? "Live" : "Draft"}
                  </span>
                  {row.availability !== "available" && (
                    <span className="ml-1.5 inline-block rounded-xs bg-gold/15 px-2 py-0.5 text-xs text-gold capitalize">{row.availability}</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setFeatured(row.id, !row.is_featured), row.is_featured ? "Removed from homepage" : "Featured on homepage")}
                    aria-pressed={row.is_featured}
                    aria-label={row.is_featured ? `Unfeature ${row.title}` : `Feature ${row.title}`}
                    className="grid size-8 place-items-center rounded-xs hover:bg-white/5"
                  >
                    <StarIcon className={cn("size-4", row.is_featured ? "fill-gold text-gold" : "text-taupe")} />
                  </button>
                </td>
                <td className="p-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="grid size-8 place-items-center rounded-xs text-taupe hover:bg-white/5 hover:text-cream" aria-label={`Actions for ${row.title}`}>
                      <MoreHorizontalIcon className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="border-gold/15 bg-ink">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/properties/${row.id}`}>
                          <PencilIcon /> Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`/properties/${row.slug}`} target="_blank" rel="noreferrer">
                          <ExternalLinkIcon /> View on site
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() =>
                          start(async () => {
                            const result = await duplicateProperty(row.id)
                            if (result.ok) {
                              toast.success("Duplicated as a draft")
                              router.push(`/admin/properties/${result.id}`)
                            } else toast.error(result.error)
                          })
                        }
                      >
                        <CopyIcon /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onSelect={() => {
                          if (window.confirm(`Move "${row.title}" to Trash?`)) run(() => trashProperties([row.id]), "Moved to Trash")
                        }}
                      >
                        <Trash2Icon /> Move to Trash
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && <p className="p-10 text-center text-sm text-taupe">No properties match these filters.</p>}
      </div>
      <p className="mt-3 text-xs text-taupe">
        Showing {visible.length} of {rows.length}
      </p>
    </div>
  )
}
