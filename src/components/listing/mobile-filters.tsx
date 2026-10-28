"use client"

import { useState } from "react"
import { SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { PropertyFilters } from "@/lib/data/properties"
import { FilterForm } from "./filter-form"

/** Phone/tablet: filters live in a slide-in sheet behind a "Filters" button. */
export function MobileFilters({
  filters,
  localities,
  activeCount,
}: {
  filters: PropertyFilters
  localities: { name: string; slug: string }[]
  activeCount: number
}) {
  const [open, setOpen] = useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="gold" className="lg:hidden">
          <SlidersHorizontalIcon aria-hidden="true" />
          Filters{activeCount > 0 && <span className="ml-1 rounded-full bg-gold px-1.5 text-xs text-ink">{activeCount}</span>}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto border-gold/15 bg-ink p-6">
        <SheetHeader className="p-0">
          <SheetTitle className="font-heading text-3xl font-medium text-cream">Filters</SheetTitle>
          <SheetDescription className="text-taupe">Narrow down the listings.</SheetDescription>
        </SheetHeader>
        <FilterForm filters={filters} localities={localities} idPrefix="m" onApplied={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
