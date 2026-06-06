-- ─────────────────────────────────────────────────────────────────
-- Brand Assets: Public Storage Bucket for Logo & Brand Media
-- Run this in your Supabase SQL editor to set up the storage bucket.
-- ─────────────────────────────────────────────────────────────────

-- 1. Create a public bucket for brand assets (logo, favicon, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'brand-assets',
  'brand-assets',
  true,         -- public: anyone can read the logo URL
  5242880,      -- 5 MB max per file
  ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif'];

-- 2. Allow public read (SELECT) for everyone
CREATE POLICY "Public can view brand assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'brand-assets');

-- 3. Only SUPER_ADMIN can upload / update / delete brand assets
CREATE POLICY "Super admin can upload brand assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'brand-assets'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Super admin can update brand assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'brand-assets'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "Super admin can delete brand assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'brand-assets'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- ─────────────────────────────────────────────────────────────────
-- Also ensure system_settings row exists for upsert to work
-- ─────────────────────────────────────────────────────────────────
INSERT INTO public.system_settings (id, app_display_name, primary_color_hex)
VALUES ('00000000-0000-0000-0000-000000000000', 'Fuel Gambia', '#0a192f')
ON CONFLICT (id) DO NOTHING;
