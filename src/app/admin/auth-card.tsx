import { LogoEmblem } from "@/components/shared/logo"

/** Centered card used by the login / password pages. */
export function AuthCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(ellipse_at_top,rgb(201_164_92/0.12),transparent_60%)] px-4 py-16">
      <div className="w-full max-w-sm">
        <LogoEmblem className="mx-auto h-32" />
        <div className="mt-8 rounded-md border border-gold/20 bg-card p-7 shadow-2xl">
          <h1 className="text-center font-heading text-3xl text-cream">{title}</h1>
          {description && <p className="mt-2 text-center text-sm text-taupe">{description}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>
    </main>
  )
}

export const authInputClass =
  "h-11 w-full rounded-xs border border-input bg-ink/60 px-3 text-sm text-cream placeholder:text-taupe/60 focus-visible:border-gold"
