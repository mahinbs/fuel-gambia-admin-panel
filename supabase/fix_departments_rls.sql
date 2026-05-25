-- SQL Migration: Fix RLS Policies for public.departments table
-- Run this in your Supabase SQL Editor

-- 1. Ensure Row Level Security is enabled
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 2. Allow all authenticated users to view departments
DROP POLICY IF EXISTS "Anyone view departments" ON public.departments;
CREATE POLICY "Anyone view departments" ON public.departments
    FOR SELECT TO authenticated USING (true);

-- 3. Allow all authenticated users to insert new departments
DROP POLICY IF EXISTS "Authenticated users insert departments" ON public.departments;
CREATE POLICY "Authenticated users insert departments" ON public.departments
    FOR INSERT TO authenticated WITH CHECK (true);

-- 4a. Restrict update on departments to Super Admins and Government Admins
DROP POLICY IF EXISTS "Admins update departments" ON public.departments;
CREATE POLICY "Admins update departments" ON public.departments
    FOR UPDATE TO authenticated 
    USING (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN'));

-- 4b. Restrict delete on departments to Super Admins and Government Admins
DROP POLICY IF EXISTS "Admins delete departments" ON public.departments;
CREATE POLICY "Admins delete departments" ON public.departments
    FOR DELETE TO authenticated 
    USING (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN'));
