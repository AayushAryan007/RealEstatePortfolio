/** Cache tags shared by data readers (cacheTag) and admin writes (updateTag). */
export const tags = {
  properties: "properties",
  property: (slug: string) => `property:${slug}`,
  settings: "settings",
  localities: "localities",
  testimonials: "testimonials",
} as const
