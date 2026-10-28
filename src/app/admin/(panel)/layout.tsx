import { Suspense } from "react"

import { AdminNav } from "@/components/admin/admin-nav"

/** Signed-in admin chrome. Access is enforced by the proxy, requireAdmin() and RLS. */
export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh">
      {/* The nav highlights the current page, which is request data. */}
      <Suspense fallback={<div className="fixed inset-y-0 left-0 hidden w-60 border-r border-gold/10 bg-ink-raised/60 lg:block" />}>
        <AdminNav />
      </Suspense>
      <main className="px-4 py-8 sm:px-8 lg:ml-60 lg:px-10 lg:py-10">{children}</main>
    </div>
  )
}
