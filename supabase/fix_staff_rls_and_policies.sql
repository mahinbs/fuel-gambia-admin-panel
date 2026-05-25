-- ============================================================
-- SQL MIGRATION: FIX STAFF RLS AND POLICIES
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create RLS policies for the staff table (which was lacking policies)
DROP POLICY IF EXISTS "Staff view own record" ON public.staff;
CREATE POLICY "Staff view own record" ON public.staff
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "Station admins manage staff" ON public.staff;
CREATE POLICY "Station admins manage staff" ON public.staff
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- 2. Create RLS policies for profiles to let station admins insert, update, and delete profiles with role = 'ATTENDANT'
DROP POLICY IF EXISTS "Station admins manage attendant profiles" ON public.profiles;
CREATE POLICY "Station admins manage attendant profiles" ON public.profiles
    FOR ALL USING (
        get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH')
        AND role = 'ATTENDANT'
    );
