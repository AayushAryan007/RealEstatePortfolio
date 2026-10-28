/**
 * Database types matching supabase/migrations.
 * Hand-written for now; can be regenerated with
 * `npx supabase gen types typescript --project-id <id> > src/types/database.ts`.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type PropertyType = "apartment" | "plot" | "commercial"
export type PropertyPurpose = "sale" | "rent"
export type AreaUnit = "sqft" | "sqyd" | "acre"
export type Furnishing = "unfurnished" | "semi_furnished" | "fully_furnished"
export type Facing =
  | "north"
  | "south"
  | "east"
  | "west"
  | "north_east"
  | "north_west"
  | "south_east"
  | "south_west"
export type Possession = "ready_to_move" | "under_construction"
export type Availability = "available" | "sold" | "rented"
export type PublishStatus = "draft" | "published"
export type EnquiryStatus = "new" | "contacted" | "closed"

/** Builds the Row / Insert / Update trio Supabase expects for a table. */
type Table<Row, Required extends keyof Row> = {
  Row: Row
  Insert: Partial<Row> & Pick<Row, Required>
  Update: Partial<Row>
  Relationships: []
}

export type LocalityRow = {
  id: string
  name: string
  slug: string
  intro: string | null
  image_path: string | null
  sort_order: number
  created_at: string
}

export type PropertyRow = {
  id: string
  slug: string
  title: string
  short_description: string | null
  description: string | null
  price: number | null
  price_on_request: boolean
  purpose: PropertyPurpose
  type: PropertyType
  locality_id: string | null
  address: string | null
  lat: number | null
  lng: number | null
  bhk: number | null
  bathrooms: number | null
  area: number | null
  area_unit: AreaUnit
  floor: number | null
  total_floors: number | null
  furnishing: Furnishing | null
  facing: Facing | null
  possession: Possession | null
  availability: Availability
  amenities: string[]
  video_url: string | null
  video_path: string | null
  is_featured: boolean
  featured_order: number
  status: PublishStatus
  is_sample: boolean
  published_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type PropertyImageRow = {
  id: string
  property_id: string
  path_full: string
  path_thumb: string
  width: number
  height: number
  alt: string | null
  sort_order: number
  is_cover: boolean
  created_at: string
}

export type EnquiryRow = {
  id: string
  property_id: string | null
  name: string
  phone: string
  message: string | null
  source_url: string | null
  status: EnquiryStatus
  created_at: string
}

export type TestimonialRow = {
  id: string
  name: string
  location: string | null
  quote: string
  rating: number
  sort_order: number
  is_published: boolean
  is_sample: boolean
  created_at: string
}

export type SiteSettingRow = {
  key: string
  value: Json
  updated_at: string
}

export type AdminRow = {
  user_id: string
  email: string
  created_at: string
}

export type Database = {
  public: {
    Tables: {
      admins: Table<AdminRow, "user_id" | "email">
      localities: Table<LocalityRow, "name" | "slug">
      properties: Table<PropertyRow, "slug" | "title">
      property_images: Table<PropertyImageRow, "property_id" | "path_full" | "path_thumb" | "width" | "height">
      enquiries: Table<EnquiryRow, "name" | "phone">
      testimonials: Table<TestimonialRow, "name" | "quote">
      site_settings: Table<SiteSettingRow, "key" | "value">
    }
    Views: Record<never, never>
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean }
    }
    Enums: {
      property_type: PropertyType
      property_purpose: PropertyPurpose
      area_unit: AreaUnit
      furnishing: Furnishing
      facing: Facing
      possession: Possession
      availability: Availability
      publish_status: PublishStatus
      enquiry_status: EnquiryStatus
    }
    CompositeTypes: Record<never, never>
  }
}
