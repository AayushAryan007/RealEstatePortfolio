-- =============================================================================
-- Gupta Properties: initial schema
--
-- Run once in Supabase → SQL Editor (paste the whole file, then Run).
-- Access model (Row Level Security):
--   • Visitors (anon) can read published content and submit enquiries.
--   • Admins (emails in admin_allowlist) can read and write everything.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.property_type as enum ('apartment', 'plot', 'commercial');
create type public.property_purpose as enum ('sale', 'rent');
create type public.area_unit as enum ('sqft', 'sqyd', 'acre');
create type public.furnishing as enum ('unfurnished', 'semi_furnished', 'fully_furnished');
create type public.facing as enum (
  'north', 'south', 'east', 'west', 'north_east', 'north_west', 'south_east', 'south_west'
);
create type public.possession as enum ('ready_to_move', 'under_construction');
create type public.availability as enum ('available', 'sold', 'rented');
create type public.publish_status as enum ('draft', 'published');
create type public.enquiry_status as enum ('new', 'contacted', 'closed');

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------

-- Keeps updated_at current on every row update.
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admins
-- -----------------------------------------------------------------------------

-- Emails allowed to become admins. Sign-ups are disabled in Supabase Auth, so
-- accounts are created by hand in the dashboard; this list decides which of
-- those accounts get admin rights.
create table public.admin_allowlist (
  email text primary key
);

insert into public.admin_allowlist (email) values
  ('unitedestates.ncr@gmail.com'),
  ('aayusharyan1210@gmail.com');

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- True when the current request belongs to an admin. SECURITY DEFINER lets
-- policies call it without granting read access on the admins table itself.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

-- When an allowlisted email gets an account, register it as an admin.
create function public.register_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.admin_allowlist where lower(email) = lower(new.email)) then
    insert into public.admins (user_id, email)
    values (new.id, lower(new.email))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.register_admin();

-- Backfill: accounts created before this script ran.
insert into public.admins (user_id, email)
select u.id, lower(u.email)
from auth.users u
join public.admin_allowlist a on lower(a.email) = lower(u.email)
on conflict (user_id) do nothing;

-- -----------------------------------------------------------------------------
-- Localities (areas served; also powers /areas/[slug] pages)
-- -----------------------------------------------------------------------------
create table public.localities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  intro text check (char_length(intro) <= 1200),
  image_path text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Properties
-- -----------------------------------------------------------------------------
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),

  title text not null check (char_length(title) between 5 and 140),
  short_description text check (char_length(short_description) <= 300),
  description text, -- sanitised HTML from the admin editor

  price bigint check (price is null or price >= 0), -- rupees (total, or per month for rentals)
  price_on_request boolean not null default false,

  purpose public.property_purpose not null default 'sale',
  type public.property_type not null default 'apartment',

  locality_id uuid references public.localities (id) on delete set null,
  address text check (char_length(address) <= 300),
  lat double precision check (lat between -90 and 90),
  lng double precision check (lng between -180 and 180),

  bhk smallint check (bhk between 0 and 20),
  bathrooms smallint check (bathrooms between 0 and 20),
  area numeric(12, 2) check (area > 0),
  area_unit public.area_unit not null default 'sqft',
  floor smallint,
  total_floors smallint,
  furnishing public.furnishing,
  facing public.facing,
  possession public.possession,
  availability public.availability not null default 'available',
  amenities text[] not null default '{}',

  video_url text check (char_length(video_url) <= 500), -- YouTube link
  video_path text,                                     -- uploaded file in storage

  is_featured boolean not null default false,
  featured_order int not null default 0,
  status public.publish_status not null default 'draft',
  is_sample boolean not null default false,

  published_at timestamptz,
  deleted_at timestamptz, -- set = in Trash; purged after 30 days
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint price_present check (price_on_request or price is not null)
);

create index properties_public_idx on public.properties (status, deleted_at, created_at desc);
create index properties_locality_idx on public.properties (locality_id);
create index properties_filter_idx on public.properties (type, purpose, price);
create index properties_featured_idx on public.properties (is_featured, featured_order) where is_featured;

create trigger properties_touch
  before update on public.properties
  for each row execute function public.touch_updated_at();

-- Stamp published_at the first time a property goes live.
create function public.stamp_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger properties_published_at
  before insert or update of status on public.properties
  for each row execute function public.stamp_published_at();

-- -----------------------------------------------------------------------------
-- Property images (two pre-sized WebP files per photo: 800px and 1920px)
-- -----------------------------------------------------------------------------
create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  path_full text not null,
  path_thumb text not null,
  width int not null check (width > 0),
  height int not null check (height > 0),
  alt text check (char_length(alt) <= 200),
  sort_order int not null default 0,
  is_cover boolean not null default false,
  created_at timestamptz not null default now()
);

create index property_images_property_idx on public.property_images (property_id, sort_order);
-- At most one cover photo per property.
create unique index property_images_one_cover on public.property_images (property_id) where is_cover;

-- -----------------------------------------------------------------------------
-- Enquiries (contact / property forms)
-- -----------------------------------------------------------------------------
create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties (id) on delete set null,
  name text not null check (char_length(name) between 2 and 80),
  phone text not null check (phone ~ '^[0-9+()\- ]{7,20}$'),
  message text check (char_length(message) <= 1000),
  source_url text check (char_length(source_url) <= 500),
  status public.enquiry_status not null default 'new',
  created_at timestamptz not null default now()
);

create index enquiries_status_idx on public.enquiries (status, created_at desc);

-- -----------------------------------------------------------------------------
-- Testimonials
-- -----------------------------------------------------------------------------
create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  location text check (char_length(location) <= 80),
  quote text not null check (char_length(quote) between 10 and 600),
  rating smallint not null default 5 check (rating between 1 and 5),
  sort_order int not null default 0,
  is_published boolean not null default true,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Site settings (editable text blocks: hero, about, stats, contact, socials)
-- -----------------------------------------------------------------------------
create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_touch
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- Row Level Security
-- =============================================================================
alter table public.admin_allowlist enable row level security;
alter table public.admins enable row level security;
alter table public.localities enable row level security;
alter table public.properties enable row level security;
alter table public.property_images enable row level security;
alter table public.enquiries enable row level security;
alter table public.testimonials enable row level security;
alter table public.site_settings enable row level security;

-- admin_allowlist: no policies, so only the SQL editor can change it.

-- admins: a signed-in user can see their own row (used to check admin status).
create policy "admins read own row" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

-- localities
create policy "localities public read" on public.localities
  for select to anon, authenticated
  using (true);
create policy "localities admin write" on public.localities
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- properties: visitors see only published, non-trashed listings.
create policy "properties public read" on public.properties
  for select to anon, authenticated
  using (status = 'published' and deleted_at is null);
create policy "properties admin all" on public.properties
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- property_images: visible when the parent listing is visible.
create policy "images public read" on public.property_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.properties p
      where p.id = property_id and p.status = 'published' and p.deleted_at is null
    )
  );
create policy "images admin all" on public.property_images
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- enquiries: anyone can submit; only admins can read or manage.
create policy "enquiries public insert" on public.enquiries
  for insert to anon, authenticated
  with check (status = 'new');
create policy "enquiries admin read" on public.enquiries
  for select to authenticated
  using ((select public.is_admin()));
create policy "enquiries admin update" on public.enquiries
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
create policy "enquiries admin delete" on public.enquiries
  for delete to authenticated
  using ((select public.is_admin()));

-- testimonials
create policy "testimonials public read" on public.testimonials
  for select to anon, authenticated
  using (is_published);
create policy "testimonials admin all" on public.testimonials
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- site_settings
create policy "settings public read" on public.site_settings
  for select to anon, authenticated
  using (true);
create policy "settings admin all" on public.site_settings
  for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- =============================================================================
-- Storage: one public bucket for photos and videos (50 MB per file)
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  52428800,
  array['image/webp', 'image/jpeg', 'image/png', 'image/avif', 'video/mp4', 'video/webm']
)
on conflict (id) do nothing;

-- Files are served through public URLs; only admins can list, upload, change or delete.
create policy "media admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
