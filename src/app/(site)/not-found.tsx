import Link from "next/link"

import { LogoMark } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <section className="grid min-h-[80dvh] place-items-center px-4 pt-28 text-center">
      <div>
        <LogoMark className="mx-auto h-16 opacity-80" />
        <p className="mt-8 eyebrow">404 · Page not found</p>
        <h1 className="mt-4 text-5xl text-cream sm:text-6xl">This door leads nowhere</h1>
        <p className="mx-auto mt-5 max-w-md text-taupe">
          The page you&apos;re looking for may have moved, or the property is no longer listed.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/properties">Browse properties</Link>
          </Button>
          <Button size="lg" variant="gold" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
