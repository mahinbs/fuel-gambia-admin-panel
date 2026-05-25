-- ============================================================
-- SQL MIGRATION: FIX MOBILE TRANSACTIONS & MANAGER SIGNUP
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Ensure all metadata and status columns exist on the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS station_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_document_1_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_document_2_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS kyc_document_3_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS government_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- 2. Explicitly drop the profiles_role_check constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check CASCADE;

-- 3. Dynamically find and drop any other check constraints on profiles.role to prevent conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT constraint_name
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'profiles' AND column_name = 'role'
    LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name) || ' CASCADE;';
    END LOOP;
END;
$$;

-- 4. Add the updated check constraint to support STATION_BRANCH and all other roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (
    'SUPER_ADMIN',
    'GOVERNMENT_ADMIN',
    'STATION_HQ',
    'STATION_BRANCH',
    'BENEFICIARY',
    'CUSTOMER',
    'ATTENDANT'
));

-- 5. Create or replace the handle_new_user function with defensive type-casting and error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_is_verified BOOLEAN;
    v_dept_id UUID;
BEGIN
    -- Determine role with fallback
    v_role := COALESCE(new.raw_user_meta_data->>'role', 'CUSTOMER');
    
    -- Determine verification status defensively
    IF v_role = 'SUPER_ADMIN' THEN
        v_is_verified := TRUE;
    ELSE
        BEGIN
            v_is_verified := COALESCE((new.raw_user_meta_data->>'is_verified')::boolean, FALSE);
        EXCEPTION WHEN OTHERS THEN
            v_is_verified := FALSE;
        END;
    END IF;

    -- Determine department_id defensively (handle empty/invalid UUID strings safely)
    v_dept_id := NULL;
    IF new.raw_user_meta_data->>'department_id' IS NOT NULL AND new.raw_user_meta_data->>'department_id' <> '' THEN
        BEGIN
            v_dept_id := (new.raw_user_meta_data->>'department_id')::uuid;
        EXCEPTION WHEN OTHERS THEN
            v_dept_id := NULL;
        END;
    END IF;

    -- Insert or update profile
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
        v_role,
        new.raw_user_meta_data->>'phone_number',
        CASE 
            WHEN v_role = 'SUPER_ADMIN' THEN 'APPROVED'
            ELSE 'PENDING'
        END,
        new.raw_user_meta_data->>'company_name',
        new.raw_user_meta_data->>'department_name',
        new.raw_user_meta_data->>'station_name',
        new.raw_user_meta_data->>'kyc_document_1_url',
        new.raw_user_meta_data->>'kyc_document_2_url',
        new.raw_user_meta_data->>'kyc_document_3_url',
        v_is_verified,
        new.raw_user_meta_data->>'government_id',
        v_dept_id
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

-- Recreate trigger if it was dropped/missing
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Transaction Policies for mobile app user & attendant workflows
-- Allow users (beneficiaries/customers) to insert pending transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id AND status = 'PENDING');

-- Allow users to view and update their own pending transactions (e.g. to CANCELLED)
DROP POLICY IF EXISTS "Users can update own pending transactions" ON public.transactions;
CREATE POLICY "Users can update own pending transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id AND status = 'PENDING')
    WITH CHECK (auth.uid() = user_id AND status IN ('PENDING', 'CANCELLED'));

-- Allow attendants to view pending transactions for QR scanning
DROP POLICY IF EXISTS "Attendants view pending transactions" ON public.transactions;
CREATE POLICY "Attendants view pending transactions" ON public.transactions
    FOR SELECT USING (get_user_role() = 'ATTENDANT' AND status = 'PENDING');

-- Allow attendants to update pending transactions when dispensing fuel
DROP POLICY IF EXISTS "Attendants update pending transactions" ON public.transactions;
CREATE POLICY "Attendants update pending transactions" ON public.transactions
    FOR UPDATE USING (get_user_role() = 'ATTENDANT' AND status = 'PENDING')
    WITH CHECK (status IN ('SUCCESS', 'CANCELLED'));

-- 7. Database trigger to handle atomic deductions on successful transaction completion
CREATE OR REPLACE FUNCTION public.handle_transaction_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger when status transitions from PENDING to SUCCESS
  IF OLD.status = 'PENDING' AND NEW.status = 'SUCCESS' THEN
    -- A. Deduct liters from beneficiary's remaining balance if SUBSIDY mode
    IF NEW.mode = 'SUBSIDY' THEN
      UPDATE public.beneficiaries
      SET remaining_balance = GREATEST(0, remaining_balance - NEW.liters),
          updated_at = NOW()
      WHERE id = NEW.user_id;
    END IF;

    -- B. Deduct stock from station's stock
    IF NEW.station_id IS NOT NULL THEN
      IF NEW.fuel_type = 'PETROL' THEN
        UPDATE public.stations
        SET petrol_stock = GREATEST(0, petrol_stock - NEW.liters),
            updated_at = NOW()
        WHERE id = NEW.station_id;
      ELSIF NEW.fuel_type = 'DIESEL' THEN
        UPDATE public.stations
        SET diesel_stock = GREATEST(0, diesel_stock - NEW.liters),
            updated_at = NOW()
        WHERE id = NEW.station_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_transaction_completion ON public.transactions;
CREATE TRIGGER trg_transaction_completion
  AFTER UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.handle_transaction_completion();
