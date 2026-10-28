import type { Facing, Furnishing, Possession } from "@/types/database"

export const furnishingLabel: Record<Furnishing, string> = {
  unfurnished: "Unfurnished",
  semi_furnished: "Semi-furnished",
  fully_furnished: "Fully furnished",
}

export const facingLabel: Record<Facing, string> = {
  north: "North",
  south: "South",
  east: "East",
  west: "West",
  north_east: "North-East",
  north_west: "North-West",
  south_east: "South-East",
  south_west: "South-West",
}

export const possessionLabel: Record<Possession, string> = {
  ready_to_move: "Ready to move",
  under_construction: "Under construction",
}
