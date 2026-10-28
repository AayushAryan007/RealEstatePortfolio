import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { Building2Icon, EyeIcon, FileClockIcon, InboxIcon, PlusIcon, SparklesIcon, TagIcon } from "lucide-react"

import { RemoveSamplesButton } from "@/components/admin/remove-samples-button"
import { AdminCard, AdminHeader, AdminSkeleton } from "@/components/admin/ui"
import { Button } from "@/components/ui/button"
import { getDashboardStats } from "@/lib/data/admin"

export const metadata: Metadata = { title: "Dashboard" }

export default function DashboardPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Dashboard />
    </Suspense>
  )
}

async function Dashboard() {
  const stats = await getDashboardStats()
  const cards = [
    { label: "Live listings", value: stats.published, Icon: EyeIcon, href: "/admin/properties?status=published" },
    { label: "Drafts", value: stats.drafts, Icon: FileClockIcon, href: "/admin/properties?status=draft" },
    { label: "Sold / rented", value: stats.closed, Icon: TagIcon, href: "/admin/properties" },
    { label: "Featured", value: stats.featured, Icon: SparklesIcon, href: "/admin/properties?featured=1" },
    { label: "New enquiries", value: stats.newEnquiries, Icon: InboxIcon, href: "/admin/enquiries?status=new", highlight: stats.newEnquiries > 0 },
    { label: "Enquiries this month", value: stats.monthEnquiries, Icon: InboxIcon, href: "/admin/enquiries" },
  ]

  return (
    <>
      <AdminHeader
        title="Dashboard"
        description={`${stats.total} properties in total`}
        actions={
          <Button asChild>
            <Link href="/admin/properties/new">
              <PlusIcon aria-hidden="true" /> Add property
            </Link>
          </Button>
        }
      />

      {stats.samples > 0 && (
        <AdminCard className="mb-6 flex flex-col gap-4 border-gold/40 bg-gold/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-gold">Sample content is still live</p>
            <p className="mt-1 text-sm text-cream/80">
              {stats.samples} sample listing{stats.samples === 1 ? "" : "s"} and the sample testimonials are visible on the website. Remove them before
              sharing the site publicly.
            </p>
          </div>
          <RemoveSamplesButton />
        </AdminCard>
      )}

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map(({ label, value, Icon, href, highlight }) => (
          <li key={label}>
            <Link
              href={href}
              className={`block rounded-md border p-5 transition-colors hover:border-gold/50 ${highlight ? "border-gold/60 bg-gold/5" : "border-gold/12 bg-card"}`}
            >
              <Icon className="size-5 text-gold" strokeWidth={1.5} aria-hidden="true" />
              <p className="mt-4 font-heading text-4xl text-cream tabular-nums">{value}</p>
              <p className="mt-1 text-xs tracking-wide text-taupe">{label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <AdminCard className="mt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-2xl text-cream">Latest enquiries</h2>
          <Link href="/admin/enquiries" className="text-sm text-gold hover:text-gold-light">
            View all →
          </Link>
        </div>
        {stats.recent.length ? (
          <ul className="divide-y divide-gold/10">
            {stats.recent.map((e) => {
              const property = e.property as unknown as { title: string } | null
              return (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium text-cream">
                      {e.name} <span className="text-taupe">· {e.phone}</span>
                    </p>
                    <p className="truncate text-xs text-taupe">{property?.title ?? "General enquiry"}</p>
                  </div>
                  <span className="text-xs text-taupe">
                    {new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="flex items-center gap-2 text-sm text-taupe">
            <Building2Icon className="size-4 text-gold" aria-hidden="true" /> No enquiries yet.
          </p>
        )}
      </AdminCard>
    </>
  )
}
