-- DDL Migration: Add government_id and department_id to profiles table
-- Run this in your Supabase SQL Editor

-- 1. Add columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS government_id TEXT,
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- 2. Backfill existing data from beneficiaries table
UPDATE public.profiles p
SET 
  government_id = b.government_id,
  department_id = b.department_id
FROM public.beneficiaries b
WHERE p.id = b.id;

-- 3. Update handle_new_user trigger function to copy these fields on insert/update
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
    is_verified,
    government_id,
    department_id
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
    END,
    new.raw_user_meta_data->>'government_id',
    CASE 
      WHEN new.raw_user_meta_data->>'department_id' IS NOT NULL AND new.raw_user_meta_data->>'department_id' <> '' 
      THEN (new.raw_user_meta_data->>'department_id')::uuid
      ELSE NULL
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
    is_verified = EXCLUDED.is_verified,
    government_id = EXCLUDED.government_id,
    department_id = EXCLUDED.department_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
