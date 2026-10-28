"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ExternalLinkIcon, PhoneIcon, SearchIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { deleteEnquiries, setEnquiryStatus } from "@/actions/admin/content"
import { WhatsAppIcon } from "@/components/shared/brand-icons"
import { toPhone, waLink } from "@/lib/contacts"
import { cn } from "@/lib/utils"
import { ConfirmButton } from "./confirm-button"
import { AdminCard, adminInput } from "./ui"

type Enquiry = {
  id: string
  name: string
  phone: string
  message: string | null
  status: "new" | "contacted" | "closed"
  source_url: string | null
  created_at: string
  property: { title: string; slug: string } | null
}

const tabs = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
] as const

const statusStyle = {
  new: "border-gold/60 bg-gold/15 text-gold",
  contacted: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  closed: "border-white/15 bg-white/5 text-cream/60",
}

/** Enquiries inbox: filter by status, search, update status, reply on WhatsApp or by phone. */
export function EnquiriesTable({ rows }: { rows: Enquiry[] }) {
  const router = useRouter()
  const params = useSearchParams()
  const [pending, start] = useTransition()
  const [tab, setTab] = useState<string>(params.get("status") ?? "")
  const [query, setQuery] = useState("")

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      (r) =>
        (!tab || r.status === tab) &&
        (!q || [r.name, r.phone, r.message, r.property?.title].some((v) => v?.toLowerCase().includes(q))),
    )
  }, [rows, tab, query])

  const counts = useMemo(() => {
    const c: Record<string, number> = { "": rows.length, new: 0, contacted: 0, closed: 0 }
    for (const r of rows) c[r.status]++
    return c
  }, [rows])

  const run = (task: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    start(async () => {
      const result = await task()
      if (result.ok) {
        toast.success(success)
        router.refresh()
      } else toast.error(result.error ?? "Something went wrong")
    })

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Filter by status" className="flex overflow-hidden rounded-xs border border-input">
          {tabs.map((t) => (
            <button
              key={t.value}
              role="tab"
              aria-selected={tab === t.value}
              onClick={() => setTab(t.value)}
              className={cn("px-3 py-2 text-sm", tab === t.value ? "bg-gold font-semibold text-ink" : "text-cream/75 hover:text-cream")}
            >
              {t.label} <span className="ml-1 text-xs opacity-70">{counts[t.value]}</span>
            </button>
          ))}
        </div>
        <div className="relative min-w-52 flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-taupe" aria-hidden="true" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, phone, message" aria-label="Search enquiries" className={cn(adminInput, "pl-9")} />
        </div>
      </div>

      {!visible.length ? (
        <AdminCard className="py-16 text-center text-sm text-taupe">No enquiries here yet.</AdminCard>
      ) : (
        <ul className="space-y-3">
          {visible.map((e) => {
            const phone = toPhone(e.phone)
            const greeting = `Hi ${e.name.split(" ")[0]}, this is Gupta Properties regarding your enquiry${e.property ? ` about "${e.property.title}"` : ""}.`
            return (
              <li key={e.id}>
                <AdminCard className={cn("space-y-3", e.status === "new" && "border-gold/40")}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-cream">{e.name}</p>
                      <p className="text-sm text-taupe tabular-nums">{phone?.display ?? e.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <time className="text-xs text-taupe" dateTime={e.created_at}>
                        {new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      </time>
                      <select
                        value={e.status}
                        disabled={pending}
                        onChange={(ev) => run(() => setEnquiryStatus(e.id, ev.target.value as Enquiry["status"]), "Status updated")}
                        aria-label={`Status for ${e.name}`}
                        className={cn("h-8 rounded-xs border px-2 text-xs capitalize", statusStyle[e.status])}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-sm text-cream/85">
                    {e.property ? (
                      <a href={`/properties/${e.property.slug}`} target="_blank" className="inline-flex items-center gap-1 text-gold hover:text-gold-light">
                        {e.property.title} <ExternalLinkIcon className="size-3" aria-hidden="true" />
                      </a>
                    ) : (
                      <span className="text-taupe">General enquiry</span>
                    )}
                  </p>
                  {e.message && <p className="rounded-xs bg-ink/60 p-3 text-sm whitespace-pre-line text-cream/85">{e.message}</p>}

                  <div className="flex flex-wrap gap-2">
                    {phone && (
                      <>
                        <a
                          href={waLink(phone, greeting)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => e.status === "new" && run(() => setEnquiryStatus(e.id, "contacted"), "Marked as contacted")}
                          className="inline-flex h-8 items-center gap-1.5 rounded-xs bg-gold px-3 text-xs font-semibold text-ink hover:bg-gold-light"
                        >
                          <WhatsAppIcon className="size-3.5" /> WhatsApp
                        </a>
                        <a href={`tel:${phone.tel}`} className="inline-flex h-8 items-center gap-1.5 rounded-xs border border-gold/50 px-3 text-xs font-semibold text-gold hover:bg-gold/10">
                          <PhoneIcon className="size-3.5" aria-hidden="true" /> Call
                        </a>
                      </>
                    )}
                    <ConfirmButton
                      size="sm"
                      variant="ghost"
                      className="ml-auto h-8 text-taupe hover:text-destructive"
                      title="Delete this enquiry?"
                      description="It will be removed permanently."
                      confirmLabel="Delete"
                      destructive
                      onConfirm={() => run(() => deleteEnquiries([e.id]), "Enquiry deleted")}
                    >
                      <Trash2Icon aria-hidden="true" /> Delete
                    </ConfirmButton>
                  </div>
                </AdminCard>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
