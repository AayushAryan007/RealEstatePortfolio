"use client"

import { HeartIcon } from "lucide-react"

import { useFavorites } from "@/hooks/use-favorites"
import { cn } from "@/lib/utils"

export function FavoriteButton({ id, title, className }: { id: string; title: string; className?: string }) {
  const { isSaved, toggle } = useFavorites()
  const saved = isSaved(id)

  return (
    <button
      type="button"
      onClick={(event) => {
        // The button sits on top of a card link: don't navigate.
        event.preventDefault()
        event.stopPropagation()
        toggle(id)
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from saved` : `Save ${title}`}
      className={cn(
        "grid size-10 place-items-center rounded-full border border-cream/15 bg-ink/60 text-cream backdrop-blur-md transition-[color,background-color,transform] duration-300 hover:scale-110 hover:text-gold active:scale-95",
        saved && "border-gold/50 text-gold",
        className,
      )}
    >
      <HeartIcon className={cn("size-[18px] transition-transform", saved && "fill-gold")} strokeWidth={1.5} />
    </button>
  )
}
