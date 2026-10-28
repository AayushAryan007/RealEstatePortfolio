-- =============================================================================
-- Gupta Properties: starter content
--
-- Run once after the init migration (Supabase → SQL Editor → paste → Run).
-- Sample listings and testimonials are flagged is_sample = true so the admin
-- panel can remove them all in one click before launch.
-- Sample photos live in /public/media/samples (paths starting with "/").
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Localities
-- -----------------------------------------------------------------------------
insert into public.localities (name, slug, intro, image_path, sort_order) values
  ('Indirapuram', 'indirapuram',
   'One of Ghaziabad''s most sought-after addresses: wide roads, established societies, top schools and quick access to Delhi via NH-24 and the Blue Line metro.',
   '/media/samples/sunken-living.webp', 1),
  ('Vasundhara', 'vasundhara',
   'A calm, green and well-planned neighbourhood minutes from Noida and East Delhi, popular with families looking for value and space.',
   '/media/samples/classic-living.webp', 2),
  ('Noida', 'noida',
   'A planned city of high-rise living, corporate hubs and expressway connectivity, with options from compact flats to premium penthouses.',
   '/media/samples/villa-living.webp', 3),
  ('Ghaziabad', 'ghaziabad',
   'A fast-growing city with excellent rail, road and metro links, offering residential plots, independent floors and commercial spaces.',
   '/media/samples/walnut-hallway.webp', 4)
on conflict (slug) do nothing;

-- -----------------------------------------------------------------------------
-- Site settings (editable later from the admin panel)
-- -----------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('hero', jsonb_build_object(
    'eyebrow', 'Gupta Properties · Delhi NCR',
    'title', 'Find an address worthy of your trust',
    'subtitle', 'Handpicked apartments, plots, commercial spaces and rentals across Noida, Vasundhara, Indirapuram and Ghaziabad.'
  )),
  ('about', jsonb_build_object(
    'years', 15,
    'title', 'A family name the NCR has trusted for years',
    'body', 'Gupta Properties began with a simple promise: treat every client like family. Today we help buyers, investors and tenants find homes, plots and commercial spaces across Noida and Ghaziabad, with honest advice, verified listings and support long after the keys change hands.'
  )),
  ('stats', jsonb_build_array(
    jsonb_build_object('label', 'Years of experience', 'value', 15, 'suffix', '+'),
    jsonb_build_object('label', 'Properties sold', 'value', 500, 'suffix', '+'),
    jsonb_build_object('label', 'Happy families', 'value', 1200, 'suffix', '+'),
    jsonb_build_object('label', 'Localities covered', 'value', 4, 'suffix', '')
  )),
  ('contact', jsonb_build_object(
    'phone', '+91 70111 91639',
    'whatsapp', '917011191639',
    'email', 'guptapropertynct@gmail.com',
    'address', 'Office address coming soon, Ghaziabad, Uttar Pradesh',
    'hours', 'Mon – Sun, 10:00 am – 7:00 pm'
  )),
  ('socials', jsonb_build_object(
    'instagram', '', 'facebook', '', 'youtube', '', 'linkedin', ''
  ))
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Sample testimonials
-- -----------------------------------------------------------------------------
insert into public.testimonials (name, location, quote, rating, sort_order, is_sample) values
  ('Rohit & Neha Sharma', 'Indirapuram',
   'From the first site visit to registry, everything was transparent. They found us a 3 BHK that ticked every box and negotiated a price we did not think was possible.',
   5, 1, true),
  ('Vikram Malhotra', 'Noida',
   'I have bought two investment flats through Gupta Properties. Honest advice, verified paperwork and they still help me find tenants every year.',
   5, 2, true),
  ('Anjali Verma', 'Vasundhara',
   'As an NRI I was worried about buying remotely. Video walkthroughs, regular updates and zero surprises. Highly recommended.',
   5, 3, true),
  ('Sanjay Gupta', 'Ghaziabad',
   'We needed a commercial space quickly. They shortlisted three great options in two days and handled everything end to end.',
   5, 4, true);

-- -----------------------------------------------------------------------------
-- Sample properties
-- -----------------------------------------------------------------------------
insert into public.properties (
  slug, title, short_description, description, price, purpose, type, locality_id, address,
  lat, lng, bhk, bathrooms, area, area_unit, floor, total_floors, furnishing, facing,
  possession, availability, amenities, is_featured, featured_order, status, is_sample
)
select
  v.slug, v.title, v.short_description, v.description, v.price,
  v.purpose::public.property_purpose, v.type::public.property_type,
  (select id from public.localities where slug = v.locality), v.address,
  v.lat, v.lng, v.bhk, v.bathrooms, v.area, v.area_unit::public.area_unit, v.floor, v.total_floors,
  v.furnishing::public.furnishing, v.facing::public.facing, v.possession::public.possession,
  v.availability::public.availability, v.amenities, v.is_featured, v.featured_order,
  'published', true
from (values
  ('3-bhk-luxury-apartment-indirapuram', '3 BHK Luxury Apartment in Indirapuram',
   'A light-filled corner apartment with a sunken lounge, Italian marble and park-facing balconies.',
   '<p>Spread across 1,850 sq ft, this corner residence pairs warm wood finishes with Italian marble flooring and a sunken living lounge. Three generous bedrooms with attached baths, a modular kitchen and two balconies overlooking the central park.</p><p>Located in a gated society with clubhouse, pool and 24×7 security, five minutes from NH-24.</p>',
   14500000, 'sale', 'apartment', 'indirapuram', 'Shakti Khand, Indirapuram, Ghaziabad',
   28.6417, 77.3713, 3, 3, 1850, 'sqft', 9, 18, 'semi_furnished', 'east', 'ready_to_move', 'available',
   array['Lift', 'Power backup', 'Covered parking', '24×7 security', 'Club house', 'Swimming pool', 'Gym', 'Park'],
   true, 1),
  ('4-bhk-penthouse-noida', '4 BHK Penthouse with Private Terrace, Noida',
   'A double-height penthouse with a private terrace, skyline views and designer interiors.',
   '<p>An exclusive penthouse with double-height living, a private landscaped terrace and floor-to-ceiling glazing. Fully furnished with designer lighting, a chef''s kitchen and four en-suite bedrooms.</p>',
   32000000, 'sale', 'apartment', 'noida', 'Sector 150, Noida',
   28.4089, 77.4826, 4, 4, 3400, 'sqft', 24, 24, 'fully_furnished', 'north_east', 'ready_to_move', 'available',
   array['Lift', 'Power backup', 'Covered parking', '24×7 security', 'Club house', 'Swimming pool', 'Gym', 'Gated community'],
   true, 2),
  ('premium-office-floor-indirapuram', 'Premium Office Floor on NH-24, Indirapuram',
   'Grade-A office floor with high-street frontage, dedicated parking and full power backup.',
   '<p>A fully fitted Grade-A office floor with reception, eight cabins, a 40-seat open workspace, conference room and pantry. Excellent visibility from NH-24 with ample client parking.</p>',
   21000000, 'sale', 'commercial', 'indirapuram', 'NH-24, Indirapuram, Ghaziabad',
   28.6382, 77.3651, null, 2, 2400, 'sqft', 3, 6, 'fully_furnished', 'west', 'ready_to_move', 'available',
   array['Lift', 'Power backup', 'Covered parking', '24×7 security', 'Visitor parking'],
   true, 3),
  ('3-bhk-furnished-apartment-for-rent-noida', '3 BHK Furnished Apartment for Rent, Noida',
   'Move-in ready with premium furniture, appliances and a quiet, green-facing view.',
   '<p>A beautifully furnished three-bedroom home with wardrobes, ACs in every room, a fully equipped kitchen and washing machine. Ideal for families and corporate leases.</p>',
   42000, 'rent', 'apartment', 'noida', 'Sector 137, Noida',
   28.5089, 77.4089, 3, 3, 1650, 'sqft', 12, 22, 'fully_furnished', 'north', 'ready_to_move', 'available',
   array['Lift', 'Power backup', 'Covered parking', '24×7 security', 'Gym', 'Piped gas'],
   true, 4),
  ('200-sq-yd-residential-plot-ghaziabad', '200 Sq Yd Residential Plot, Ghaziabad',
   'North-facing plot in a developed, gated township with wide roads and all approvals.',
   '<p>A clear-title, north-facing 200 sq yd plot in a developed gated township. Roads, sewage, electricity and water connections in place, ready for immediate construction.</p>',
   11000000, 'sale', 'plot', 'ghaziabad', 'Raj Nagar Extension, Ghaziabad',
   28.6990, 77.4290, null, null, 200, 'sqyd', null, null, null, 'north', 'ready_to_move', 'available',
   array['Gated community', '24×7 security', 'Park'],
   true, 5),
  ('2-bhk-modern-flat-vasundhara', '2 BHK Modern Flat in Vasundhara',
   'An efficient, well-ventilated home in an established society close to schools and markets.',
   '<p>A thoughtfully planned two-bedroom flat with a spacious living area, modular kitchen and covered parking, in one of Vasundhara''s most established societies.</p>',
   7800000, 'sale', 'apartment', 'vasundhara', 'Sector 4, Vasundhara, Ghaziabad',
   28.6600, 77.3700, 2, 2, 1150, 'sqft', 5, 12, 'semi_furnished', 'east', 'ready_to_move', 'available',
   array['Lift', 'Power backup', 'Covered parking', 'Park'],
   true, 6),
  ('2-bhk-semi-furnished-flat-for-rent-vasundhara', '2 BHK Semi-Furnished Flat for Rent, Vasundhara',
   'A bright, family-friendly home with wardrobes, modular kitchen and covered parking.',
   '<p>Semi-furnished two-bedroom home with wardrobes, fans and lights, modular kitchen and one covered parking. Walking distance to schools and the local market.</p>',
   22000, 'rent', 'apartment', 'vasundhara', 'Sector 13, Vasundhara, Ghaziabad',
   28.6553, 77.3741, 2, 2, 1050, 'sqft', 3, 10, 'semi_furnished', 'south', 'ready_to_move', 'available',
   array['Lift', 'Power backup', 'Covered parking'],
   false, 0),
  ('3-bhk-corner-apartment-indirapuram', '3 BHK Corner Apartment, Indirapuram',
   'A recently sold corner home in a prime Indirapuram society.',
   '<p>A spacious corner apartment with cross-ventilation and park views, recently sold through Gupta Properties.</p>',
   12500000, 'sale', 'apartment', 'indirapuram', 'Niti Khand, Indirapuram, Ghaziabad',
   28.6448, 77.3605, 3, 3, 1700, 'sqft', 7, 14, 'semi_furnished', 'north_east', 'ready_to_move', 'sold',
   array['Lift', 'Power backup', 'Covered parking', '24×7 security', 'Park'],
   false, 0)
) as v(
  slug, title, short_description, description, price, purpose, type, locality, address,
  lat, lng, bhk, bathrooms, area, area_unit, floor, total_floors, furnishing, facing,
  possession, availability, amenities, is_featured, featured_order
)
on conflict (slug) do nothing;

-- Sample photos: (slug, image, width, height, sort order). The first photo is the cover.
insert into public.property_images (property_id, path_full, path_thumb, width, height, alt, sort_order, is_cover)
select
  p.id,
  '/media/samples/' || i.img || '.webp',
  '/media/samples/' || i.img || '-800.webp',
  i.w, i.h, p.title, i.ord, i.ord = 0
from (values
  ('3-bhk-luxury-apartment-indirapuram', 'sunken-living', 720, 1080, 0),
  ('3-bhk-luxury-apartment-indirapuram', 'beige-bedroom', 896, 1344, 1),
  ('3-bhk-luxury-apartment-indirapuram', 'wood-foyer', 735, 919, 2),
  ('4-bhk-penthouse-noida', 'villa-living', 736, 1104, 0),
  ('4-bhk-penthouse-noida', 'walnut-hallway', 1080, 1440, 1),
  ('4-bhk-penthouse-noida', 'beige-bedroom', 896, 1344, 2),
  ('premium-office-floor-indirapuram', 'walnut-hallway', 1080, 1440, 0),
  ('premium-office-floor-indirapuram', 'wood-foyer', 735, 919, 1),
  ('3-bhk-furnished-apartment-for-rent-noida', 'beige-bedroom', 896, 1344, 0),
  ('3-bhk-furnished-apartment-for-rent-noida', 'classic-living', 800, 1200, 1),
  ('200-sq-yd-residential-plot-ghaziabad', 'villa-living', 736, 1104, 0),
  ('2-bhk-modern-flat-vasundhara', 'classic-living', 800, 1200, 0),
  ('2-bhk-modern-flat-vasundhara', 'wood-foyer', 735, 919, 1),
  ('2-bhk-semi-furnished-flat-for-rent-vasundhara', 'wood-foyer', 735, 919, 0),
  ('3-bhk-corner-apartment-indirapuram', 'sunken-living', 720, 1080, 0)
) as i(slug, img, w, h, ord)
join public.properties p on p.slug = i.slug
where not exists (select 1 from public.property_images x where x.property_id = p.id);
