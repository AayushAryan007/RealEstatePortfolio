import { cn } from "@/lib/utils"

/** Page title row used across admin screens. */
export function AdminHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-heading text-4xl text-cream">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-taupe">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

export function AdminCard({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("rounded-md border border-gold/12 bg-card p-5 sm:p-6", className)} {...props} />
}

export function AdminSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="h-10 w-56 animate-pulse rounded-xs bg-card" />
      <div className="h-4 w-80 animate-pulse rounded-xs bg-card" />
      <div className="mt-8 h-72 animate-pulse rounded-md bg-card" />
    </div>
  )
}

export const adminInput =
  "h-10 w-full rounded-xs border border-input bg-ink/60 px-3 text-sm text-cream placeholder:text-taupe/60 focus-visible:border-gold disabled:opacity-60"

export const adminLabel = "mb-1.5 block text-xs font-medium text-cream/80"

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 text-xs text-destructive" role="alert">
      {message}
    </p>
  )
}
