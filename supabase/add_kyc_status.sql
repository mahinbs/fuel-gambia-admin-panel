-- DDL Migration: Add KYC status, details, and document uploads to profiles

-- 1. Add kyc_status column with Check constraint if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Add is_verified column to track email verification (especially first-time attendants)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 2. Add extra details columns for organization-based registration
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS department_name TEXT,
ADD COLUMN IF NOT EXISTS station_name TEXT;

-- 3. Add document URL columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS kyc_document_1_url TEXT,
ADD COLUMN IF NOT EXISTS kyc_document_2_url TEXT,
ADD COLUMN IF NOT EXISTS kyc_document_3_url TEXT;

-- 4. Set existing users to APPROVED so they aren't locked out
UPDATE profiles SET kyc_status = 'APPROVED' WHERE kyc_status IS NULL;
UPDATE profiles SET kyc_status = 'APPROVED' WHERE role = 'SUPER_ADMIN';
UPDATE profiles SET is_verified = TRUE WHERE role = 'SUPER_ADMIN';

-- 5. Update handle_new_user trigger function to copy metadata and set statuses
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    name, 
    role, 
    phone_number, 
    kyc_status, 
    company_name, 
    department_name, 
    station_name,
    kyc_document_1_url,
    kyc_document_2_url,
    kyc_document_3_url,
    is_verified
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER'),
    new.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER') = 'SUPER_ADMIN' THEN 'APPROVED'
      ELSE 'PENDING'
    END,
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'department_name',
    new.raw_user_meta_data->>'station_name',
    new.raw_user_meta_data->>'kyc_document_1_url',
    new.raw_user_meta_data->>'kyc_document_2_url',
    new.raw_user_meta_data->>'kyc_document_3_url',
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER') = 'SUPER_ADMIN' THEN TRUE
      ELSE COALESCE((new.raw_user_meta_data->>'is_verified')::boolean, FALSE)
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone_number = EXCLUDED.phone_number,
    company_name = EXCLUDED.company_name,
    department_name = EXCLUDED.department_name,
    station_name = EXCLUDED.station_name,
    kyc_document_1_url = EXCLUDED.kyc_document_1_url,
    kyc_document_2_url = EXCLUDED.kyc_document_2_url,
    kyc_document_3_url = EXCLUDED.kyc_document_3_url,
    is_verified = EXCLUDED.is_verified;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create Storage bucket for KYC Documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket (making uploads open and public select allowed)
DROP POLICY IF EXISTS "Public Select Access" ON storage.objects;
CREATE POLICY "Public Select Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'kyc-documents');

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'kyc-documents');

DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
CREATE POLICY "Allow public updates" ON storage.objects
    FOR UPDATE WITH CHECK (bucket_id = 'kyc-documents');

