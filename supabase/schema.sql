-- ============================================================
-- FUEL GAMBIA — COMPLETE SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES TABLE (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email TEXT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'SUPER_ADMIN',
        'GOVERNMENT_ADMIN',
        'STATION_HQ',
        'STATION_BRANCH',
        'BENEFICIARY',
        'CUSTOMER',
        'ATTENDANT'
    )),
    phone_number TEXT UNIQUE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    kyc_status TEXT DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    company_name TEXT,
    department_name TEXT,
    station_name TEXT,
    kyc_document_1_url TEXT,
    kyc_document_2_url TEXT,
    kyc_document_3_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. COMPANIES (Super Admin onboarding)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    contact_email TEXT,
    contact_phone TEXT,
    address TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
    onboarded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. DEPARTMENTS (Government — beneficiary grouping)
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    company_id UUID REFERENCES companies(id),
    monthly_budget NUMERIC DEFAULT 0,
    used_budget NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 4. STATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    station_code TEXT UNIQUE,
    location TEXT,
    address TEXT,
    company_id UUID REFERENCES companies(id),
    hq_id UUID REFERENCES profiles(id),       -- HQ admin assigned
    branch_manager_id UUID REFERENCES profiles(id),
    fuel_types TEXT[] DEFAULT '{}',
    petrol_stock NUMERIC DEFAULT 0,
    diesel_stock NUMERIC DEFAULT 0,
    low_stock_threshold NUMERIC DEFAULT 1000,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
    latitude NUMERIC,
    longitude NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. PUMPS TABLE (individual pumps within a station)
-- ============================================================
CREATE TABLE IF NOT EXISTS pumps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    pump_label TEXT NOT NULL,              -- e.g. 'FRONT', 'BACK', 'PUMP_1'
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. STAFF TABLE (HQ + Branch managed staff)
-- ============================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    station_id UUID REFERENCES stations(id),
    employee_id TEXT UNIQUE,
    position TEXT,                          -- 'SUPERVISOR', 'BRANCH_MANAGER', etc.
    hire_date DATE,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'TERMINATED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. ATTENDANTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendants (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    station_id UUID REFERENCES stations(id),
    employee_id TEXT UNIQUE,
    device_id TEXT,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. SHIFTS TABLE (Branch Admin shift management)
-- ============================================================
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_type TEXT NOT NULL CHECK (shift_type IN ('MORNING', 'AFTERNOON', 'NIGHT')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id),  -- Supervisor/Branch Admin
    notes TEXT,
    status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. PUMP ASSIGNMENTS (which attendant on which pump per shift)
-- ============================================================
CREATE TABLE IF NOT EXISTS pump_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    pump_id UUID NOT NULL REFERENCES pumps(id),
    attendant_id UUID NOT NULL REFERENCES attendants(id),
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    released_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================
-- 10. METER READINGS (opening/closing per shift per pump)
-- ============================================================
CREATE TABLE IF NOT EXISTS meter_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    pump_id UUID NOT NULL REFERENCES pumps(id),
    attendant_id UUID NOT NULL REFERENCES attendants(id),
    reading_type TEXT NOT NULL CHECK (reading_type IN ('OPENING', 'CLOSING')),
    petrol_reading NUMERIC DEFAULT 0,
    diesel_reading NUMERIC DEFAULT 0,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- ============================================================
-- 11. BENEFICIARIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS beneficiaries (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    government_id TEXT,
    department_id UUID REFERENCES departments(id),
    verification_status TEXT DEFAULT 'PENDING' CHECK (
        verification_status IN ('PENDING', 'APPROVED', 'REJECTED')
    ),
    monthly_allocation NUMERIC DEFAULT 0,
    remaining_balance NUMERIC DEFAULT 0,
    fuel_type TEXT CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    expiry_date TIMESTAMPTZ,
    rejection_reason TEXT,
    employment_letter_url TEXT,
    government_id_url TEXT,
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. CUSTOMERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    wallet_balance NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED')),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. FUEL POLICIES (Gov Admin + HQ policy management)
-- ============================================================
CREATE TABLE IF NOT EXISTS fuel_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    policy_type TEXT CHECK (policy_type IN (
        'SHORTAGE_THRESHOLD',   -- e.g. 50L max allowed shortage
        'MONTHLY_LIMIT',        -- per beneficiary monthly cap
        'PRICE_REGULATION',     -- regulated price per litre
        'SUBSIDY_RATE',         -- subsidy percentage
        'GENERAL'
    )),
    value NUMERIC,              -- threshold value (e.g. 50 for 50L shortage)
    fuel_type TEXT CHECK (fuel_type IN ('PETROL', 'DIESEL', 'ALL')),
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_to DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 14. COUPON ALLOCATIONS (Gov Admin allocates to beneficiaries)
-- ============================================================
CREATE TABLE IF NOT EXISTS coupon_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
    allocated_by UUID REFERENCES profiles(id),     -- Gov Admin
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    allocated_liters NUMERIC NOT NULL,
    used_liters NUMERIC DEFAULT 0,
    remaining_liters NUMERIC GENERATED ALWAYS AS (allocated_liters - used_liters) STORED,
    price_per_liter NUMERIC NOT NULL,
    total_value NUMERIC GENERATED ALWAYS AS (allocated_liters * price_per_liter) STORED,
    valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 15. COUPONS TABLE (individual QR-linked coupons)
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    allocation_id UUID REFERENCES coupon_allocations(id),
    beneficiary_id UUID REFERENCES profiles(id),
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    amount NUMERIC NOT NULL,
    liters NUMERIC NOT NULL,
    qr_payload TEXT UNIQUE,                -- signed QR string
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'USED', 'EXPIRED', 'CANCELLED')),
    used_at TIMESTAMPTZ,
    used_at_station UUID REFERENCES stations(id),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 16. TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    station_id UUID REFERENCES stations(id),
    attendant_id UUID REFERENCES profiles(id),
    pump_id UUID REFERENCES pumps(id),
    shift_id UUID REFERENCES shifts(id),
    coupon_id UUID REFERENCES coupons(id),
    fuel_type TEXT CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    amount NUMERIC NOT NULL,
    liters NUMERIC NOT NULL,
    price_per_liter NUMERIC,
    mode TEXT NOT NULL CHECK (mode IN ('SUBSIDY', 'PAID', 'CASH')),
    payment_method TEXT CHECK (payment_method IN ('CASH', 'MOBILE_MONEY', 'CARD', 'COUPON', 'WALLET')),
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED')),
    qr_code TEXT,
    reference_number TEXT UNIQUE DEFAULT ('TXN-' || upper(substr(md5(random()::text), 1, 8))),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 17. PAYMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    transaction_id UUID REFERENCES transactions(id),
    amount NUMERIC NOT NULL,
    fuel_type TEXT,
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED')),
    payment_method TEXT CHECK (payment_method IN ('MOBILE_MONEY', 'CARD', 'BANK_TRANSFER', 'CASH')),
    gateway_reference TEXT,
    gateway_response JSONB,
    retry_count INTEGER DEFAULT 0,
    refunded BOOLEAN DEFAULT FALSE,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 18. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN (
        'ALLOCATION_CREATED', 'COUPON_GENERATED', 'VERIFICATION_APPROVED',
        'VERIFICATION_REJECTED', 'LOW_STOCK', 'TRANSACTION_SUCCESS',
        'TRANSACTION_FAILED', 'SHIFT_OPENED', 'DELIVERY_RECEIVED',
        'RECONCILIATION_DUE', 'POLICY_UPDATED', 'GENERAL'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,                -- extra payload (e.g. transaction_id)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 19. FUEL DELIVERIES (Supervisor records tanker deliveries)
-- ============================================================
CREATE TABLE IF NOT EXISTS fuel_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    received_by UUID NOT NULL REFERENCES profiles(id),    -- Supervisor
    delivery_date TIMESTAMPTZ DEFAULT NOW(),
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    ordered_liters NUMERIC NOT NULL,
    delivered_liters NUMERIC NOT NULL,
    variance_liters NUMERIC GENERATED ALWAYS AS (delivered_liters - ordered_liters) STORED,
    delivery_note_number TEXT,
    supplier_name TEXT,
    pre_delivery_stock NUMERIC,
    post_delivery_stock NUMERIC,
    notes TEXT,
    status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 20. STATION ORDERS (HQ orders fuel from supplier)
-- ============================================================
CREATE TABLE IF NOT EXISTS station_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    ordered_by UUID NOT NULL REFERENCES profiles(id),     -- HQ Admin
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    ordered_liters NUMERIC NOT NULL,
    unit_price NUMERIC,
    total_cost NUMERIC GENERATED ALWAYS AS (ordered_liters * unit_price) STORED,
    supplier_name TEXT,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'APPROVED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'
    )),
    delivery_id UUID REFERENCES fuel_deliveries(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 21. RECONCILIATIONS (Monthly balancing by Supervisor/Branch Manager)
-- ============================================================
CREATE TABLE IF NOT EXISTS reconciliations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    reconciled_by UUID NOT NULL REFERENCES profiles(id),  -- Supervisor or Branch Manager
    period_month INTEGER NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    period_year INTEGER NOT NULL,
    fuel_type TEXT NOT NULL CHECK (fuel_type IN ('PETROL', 'DIESEL')),
    opening_stock NUMERIC NOT NULL,
    total_ordered NUMERIC DEFAULT 0,        -- total deliveries received
    total_sold NUMERIC DEFAULT 0,           -- from meter readings
    closing_stock_theoretical NUMERIC GENERATED ALWAYS AS (
        opening_stock + total_ordered - total_sold
    ) STORED,
    closing_stock_physical NUMERIC,         -- actual dip reading
    shortage_liters NUMERIC GENERATED ALWAYS AS (
        (opening_stock + total_ordered - total_sold) - closing_stock_physical
    ) STORED,
    shortage_threshold NUMERIC DEFAULT 50,  -- from policy, default 50L
    shortage_payable BOOLEAN,               -- true if shortage > threshold
    cash_sales NUMERIC DEFAULT 0,
    coupon_sales NUMERIC DEFAULT 0,
    mobile_money_sales NUMERIC DEFAULT 0,
    total_cash_collected NUMERIC DEFAULT 0,
    bank_deposit_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(station_id, period_month, period_year, fuel_type)
);

-- ============================================================
-- 22. BILLING RECORDS (HQ billing for institutional coupon usage)
-- ============================================================
CREATE TABLE IF NOT EXISTS billing_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES stations(id),
    department_id UUID REFERENCES departments(id),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    total_liters_billed NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN (
        'PENDING', 'INVOICED', 'PAID', 'OVERDUE', 'DISPUTED'
    )),
    invoice_number TEXT UNIQUE,
    generated_by UUID REFERENCES profiles(id),
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 23. AUDIT LOGS (System-wide audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,                   -- e.g. 'VERIFY_BENEFICIARY', 'UPDATE_STOCK'
    entity_type TEXT NOT NULL,              -- e.g. 'beneficiaries', 'stations'
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pump_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fuel_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES
CREATE POLICY "Users view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON profiles
    FOR SELECT USING (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Super admin full access profiles" ON profiles
    FOR ALL USING (get_user_role() = 'SUPER_ADMIN');

-- COMPANIES
CREATE POLICY "Super admin manage companies" ON companies
    FOR ALL USING (get_user_role() = 'SUPER_ADMIN');
CREATE POLICY "Admins view companies" ON companies
    FOR SELECT USING (get_user_role() IN ('GOVERNMENT_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- STATIONS
CREATE POLICY "Anyone view active stations" ON stations
    FOR SELECT USING (status = 'ACTIVE');
CREATE POLICY "Super admin and HQ manage stations" ON stations
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ'));
CREATE POLICY "Branch admin view own station" ON stations
    FOR SELECT USING (
        get_user_role() = 'STATION_BRANCH' AND
        branch_manager_id = auth.uid()
    );

-- PUMPS
CREATE POLICY "Anyone view pumps" ON pumps
    FOR SELECT USING (TRUE);
CREATE POLICY "Station admins manage pumps" ON pumps
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- ATTENDANTS
CREATE POLICY "Attendants view own record" ON attendants
    FOR SELECT USING (id = auth.uid());
CREATE POLICY "Station admins manage attendants" ON attendants
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- SHIFTS
CREATE POLICY "Attendants view their shifts" ON shifts
    FOR SELECT USING (
        get_user_role() = 'ATTENDANT' AND
        EXISTS (SELECT 1 FROM pump_assignments pa WHERE pa.shift_id = shifts.id AND pa.attendant_id = auth.uid())
    );
CREATE POLICY "Station admins manage shifts" ON shifts
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- METER READINGS
CREATE POLICY "Attendants manage own readings" ON meter_readings
    FOR ALL USING (attendant_id = auth.uid());
CREATE POLICY "Admins view all readings" ON meter_readings
    FOR SELECT USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- BENEFICIARIES
CREATE POLICY "Beneficiaries view own record" ON beneficiaries
    FOR SELECT USING (id = auth.uid());
CREATE POLICY "Gov admin manage beneficiaries" ON beneficiaries
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN'));
CREATE POLICY "Beneficiaries update own docs" ON beneficiaries
    FOR UPDATE USING (id = auth.uid());

-- CUSTOMERS
CREATE POLICY "Customers view own record" ON customers
    FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins view customers" ON customers
    FOR SELECT USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- FUEL POLICIES
CREATE POLICY "Anyone view active policies" ON fuel_policies
    FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Gov and Super Admin manage policies" ON fuel_policies
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN'));

-- COUPON ALLOCATIONS
CREATE POLICY "Beneficiaries view own allocations" ON coupon_allocations
    FOR SELECT USING (beneficiary_id = auth.uid());
CREATE POLICY "Gov admin manage allocations" ON coupon_allocations
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN'));

-- COUPONS
CREATE POLICY "Beneficiaries view own coupons" ON coupons
    FOR SELECT USING (beneficiary_id = auth.uid());
CREATE POLICY "Admins view all coupons" ON coupons
    FOR SELECT USING (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));
CREATE POLICY "Gov admin create coupons" ON coupons
    FOR INSERT WITH CHECK (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN'));

-- TRANSACTIONS
CREATE POLICY "Users view own transactions" ON transactions
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Attendants view station transactions" ON transactions
    FOR SELECT USING (
        get_user_role() = 'ATTENDANT' AND
        EXISTS (SELECT 1 FROM attendants a WHERE a.id = auth.uid() AND a.station_id = transactions.station_id)
    );
CREATE POLICY "Attendants create transactions" ON transactions
    FOR INSERT WITH CHECK (get_user_role() = 'ATTENDANT' AND attendant_id = auth.uid());
CREATE POLICY "Admins view all transactions" ON transactions
    FOR SELECT USING (get_user_role() IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- PAYMENTS
CREATE POLICY "Users view own payments" ON payments
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins view all payments" ON payments
    FOR SELECT USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH'));

-- NOTIFICATIONS
CREATE POLICY "Users view own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users mark own as read" ON notifications
    FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System insert notifications" ON notifications
    FOR INSERT WITH CHECK (TRUE);

-- FUEL DELIVERIES
CREATE POLICY "Supervisors manage deliveries" ON fuel_deliveries
    FOR ALL USING (
        received_by = auth.uid() OR
        get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH')
    );

-- STATION ORDERS
CREATE POLICY "HQ manage orders" ON station_orders
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ'));
CREATE POLICY "Branch view own orders" ON station_orders
    FOR SELECT USING (
        get_user_role() = 'STATION_BRANCH' AND
        EXISTS (SELECT 1 FROM stations s WHERE s.id = station_orders.station_id AND s.branch_manager_id = auth.uid())
    );

-- RECONCILIATIONS
CREATE POLICY "Station staff manage reconciliations" ON reconciliations
    FOR ALL USING (
        reconciled_by = auth.uid() OR
        get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ', 'STATION_BRANCH')
    );

-- BILLING RECORDS
CREATE POLICY "HQ manage billing" ON billing_records
    FOR ALL USING (get_user_role() IN ('SUPER_ADMIN', 'STATION_HQ'));
CREATE POLICY "Gov admin view billing" ON billing_records
    FOR SELECT USING (get_user_role() = 'GOVERNMENT_ADMIN');

-- AUDIT LOGS
CREATE POLICY "Super admin view all audit logs" ON audit_logs
    FOR SELECT USING (get_user_role() = 'SUPER_ADMIN');
CREATE POLICY "Users view own audit logs" ON audit_logs
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (TRUE);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-create profile on auth signup
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Auto-set updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_stations_updated_at BEFORE UPDATE ON stations
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_shifts_updated_at BEFORE UPDATE ON shifts
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_reconciliations_updated_at BEFORE UPDATE ON reconciliations
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_fuel_policies_updated_at BEFORE UPDATE ON fuel_policies
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_coupon_allocations_updated_at BEFORE UPDATE ON coupon_allocations
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_billing_updated_at BEFORE UPDATE ON billing_records
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_beneficiaries_updated_at BEFORE UPDATE ON beneficiaries
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
CREATE TRIGGER set_station_orders_updated_at BEFORE UPDATE ON station_orders
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ============================================================
-- RPC FUNCTIONS (Serverless Logic)
-- ============================================================

-- 1. Validate QR coupon and deduct balance atomically
CREATE OR REPLACE FUNCTION validate_and_redeem_coupon(
  p_qr_payload TEXT,
  p_station_id UUID,
  p_attendant_id UUID,
  p_liters NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_allocation coupon_allocations%ROWTYPE;
  v_transaction_id UUID;
BEGIN
  -- Lock the coupon row
  SELECT * INTO v_coupon FROM coupons
    WHERE qr_payload = p_qr_payload AND status = 'ACTIVE'
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired coupon');
  END IF;

  IF v_coupon.expires_at < NOW() THEN
    UPDATE coupons SET status = 'EXPIRED' WHERE id = v_coupon.id;
    RETURN jsonb_build_object('success', false, 'error', 'Coupon has expired');
  END IF;

  IF p_liters > v_coupon.liters THEN
    RETURN jsonb_build_object('success', false, 'error', 'Requested liters exceed coupon value');
  END IF;

  -- Mark coupon as used
  UPDATE coupons
  SET status = 'USED', used_at = NOW(), used_at_station = p_station_id
  WHERE id = v_coupon.id;

  -- Deduct from allocation
  IF v_coupon.allocation_id IS NOT NULL THEN
    UPDATE coupon_allocations
    SET used_liters = used_liters + p_liters
    WHERE id = v_coupon.allocation_id;
  END IF;

  -- Deduct from beneficiary balance
  UPDATE beneficiaries
  SET remaining_balance = GREATEST(0, remaining_balance - p_liters)
  WHERE id = v_coupon.beneficiary_id;

  -- Deduct station stock
  UPDATE stations
  SET petrol_stock = CASE WHEN v_coupon.fuel_type = 'PETROL'
        THEN GREATEST(0, petrol_stock - p_liters) ELSE petrol_stock END,
      diesel_stock = CASE WHEN v_coupon.fuel_type = 'DIESEL'
        THEN GREATEST(0, diesel_stock - p_liters) ELSE diesel_stock END
  WHERE id = p_station_id;

  -- Create transaction record
  INSERT INTO transactions (
    user_id, station_id, attendant_id, coupon_id, fuel_type,
    amount, liters, mode, payment_method, status
  ) VALUES (
    v_coupon.beneficiary_id, p_station_id, p_attendant_id, v_coupon.id,
    v_coupon.fuel_type, v_coupon.amount, p_liters,
    'SUBSIDY', 'COUPON', 'SUCCESS'
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'coupon_id', v_coupon.id,
    'liters', p_liters,
    'fuel_type', v_coupon.fuel_type
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Record cash sale and deduct stock atomically
CREATE OR REPLACE FUNCTION record_cash_sale(
  p_station_id UUID,
  p_attendant_id UUID,
  p_user_id UUID,
  p_fuel_type TEXT,
  p_liters NUMERIC,
  p_amount NUMERIC,
  p_shift_id UUID,
  p_pump_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_transaction_id UUID;
  v_current_stock NUMERIC;
BEGIN
  -- Check stock
  SELECT CASE WHEN p_fuel_type = 'PETROL' THEN petrol_stock ELSE diesel_stock END
  INTO v_current_stock
  FROM stations WHERE id = p_station_id FOR UPDATE;

  IF v_current_stock < p_liters THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient stock');
  END IF;

  -- Deduct station stock
  UPDATE stations
  SET petrol_stock = CASE WHEN p_fuel_type = 'PETROL'
        THEN petrol_stock - p_liters ELSE petrol_stock END,
      diesel_stock = CASE WHEN p_fuel_type = 'DIESEL'
        THEN diesel_stock - p_liters ELSE diesel_stock END
  WHERE id = p_station_id;

  -- Create transaction
  INSERT INTO transactions (
    user_id, station_id, attendant_id, pump_id, shift_id,
    fuel_type, amount, liters, mode, payment_method, status
  ) VALUES (
    p_user_id, p_station_id, p_attendant_id, p_pump_id, p_shift_id,
    p_fuel_type, p_amount, p_liters, 'PAID', 'CASH', 'SUCCESS'
  ) RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'liters', p_liters,
    'amount', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Process fuel delivery and increment stock
CREATE OR REPLACE FUNCTION process_fuel_delivery(
  p_station_id UUID,
  p_received_by UUID,
  p_fuel_type TEXT,
  p_ordered_liters NUMERIC,
  p_delivered_liters NUMERIC,
  p_delivery_note TEXT,
  p_supplier_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_pre_stock NUMERIC;
  v_delivery_id UUID;
BEGIN
  -- Get current stock
  SELECT CASE WHEN p_fuel_type = 'PETROL' THEN petrol_stock ELSE diesel_stock END
  INTO v_pre_stock FROM stations WHERE id = p_station_id;

  -- Update stock
  UPDATE stations
  SET petrol_stock = CASE WHEN p_fuel_type = 'PETROL'
        THEN petrol_stock + p_delivered_liters ELSE petrol_stock END,
      diesel_stock = CASE WHEN p_fuel_type = 'DIESEL'
        THEN diesel_stock + p_delivered_liters ELSE diesel_stock END
  WHERE id = p_station_id;

  -- Record delivery
  INSERT INTO fuel_deliveries (
    station_id, received_by, fuel_type, ordered_liters, delivered_liters,
    delivery_note_number, supplier_name, pre_delivery_stock,
    post_delivery_stock, status
  ) VALUES (
    p_station_id, p_received_by, p_fuel_type, p_ordered_liters, p_delivered_liters,
    p_delivery_note, p_supplier_name, v_pre_stock,
    v_pre_stock + p_delivered_liters, 'COMPLETED'
  ) RETURNING id INTO v_delivery_id;

  RETURN jsonb_build_object(
    'success', true,
    'delivery_id', v_delivery_id,
    'pre_stock', v_pre_stock,
    'post_stock', v_pre_stock + p_delivered_liters
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Dashboard stats per role (avoids N+1)
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_role TEXT, p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  IF p_role = 'SUPER_ADMIN' THEN
    SELECT jsonb_build_object(
      'total_companies', (SELECT COUNT(*) FROM companies),
      'total_stations', (SELECT COUNT(*) FROM stations),
      'total_beneficiaries', (SELECT COUNT(*) FROM profiles WHERE role = 'BENEFICIARY'),
      'total_customers', (SELECT COUNT(*) FROM profiles WHERE role = 'CUSTOMER'),
      'total_attendants', (SELECT COUNT(*) FROM profiles WHERE role = 'ATTENDANT'),
      'pending_verifications', (SELECT COUNT(*) FROM beneficiaries WHERE verification_status = 'PENDING'),
      'total_transactions', (SELECT COUNT(*) FROM transactions WHERE status = 'SUCCESS'),
      'total_subsidy_value', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE mode = 'SUBSIDY' AND status = 'SUCCESS'),
      'total_commercial_revenue', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE mode = 'PAID' AND status = 'SUCCESS'),
      'active_policies', (SELECT COUNT(*) FROM fuel_policies WHERE is_active = TRUE),
      'low_stock_stations', (SELECT COUNT(*) FROM stations WHERE petrol_stock < low_stock_threshold OR diesel_stock < low_stock_threshold)
    ) INTO result;

  ELSIF p_role = 'GOVERNMENT_ADMIN' THEN
    SELECT jsonb_build_object(
      'total_beneficiaries', (SELECT COUNT(*) FROM profiles WHERE role = 'BENEFICIARY'),
      'pending_verifications', (SELECT COUNT(*) FROM beneficiaries WHERE verification_status = 'PENDING'),
      'approved_beneficiaries', (SELECT COUNT(*) FROM beneficiaries WHERE verification_status = 'APPROVED'),
      'total_allocations', (SELECT COUNT(*) FROM coupon_allocations),
      'active_allocations', (SELECT COUNT(*) FROM coupon_allocations WHERE status = 'ACTIVE'),
      'total_allocated_liters', (SELECT COALESCE(SUM(allocated_liters), 0) FROM coupon_allocations),
      'total_used_liters', (SELECT COALESCE(SUM(used_liters), 0) FROM coupon_allocations),
      'active_coupons', (SELECT COUNT(*) FROM coupons WHERE status = 'ACTIVE'),
      'active_policies', (SELECT COUNT(*) FROM fuel_policies WHERE is_active = TRUE)
    ) INTO result;

  ELSIF p_role = 'STATION_HQ' THEN
    SELECT jsonb_build_object(
      'total_stations', (SELECT COUNT(*) FROM stations),
      'active_stations', (SELECT COUNT(*) FROM stations WHERE status = 'ACTIVE'),
      'total_staff', (SELECT COUNT(*) FROM staff),
      'total_attendants', (SELECT COUNT(*) FROM attendants WHERE status = 'ACTIVE'),
      'today_transactions', (SELECT COUNT(*) FROM transactions WHERE created_at >= CURRENT_DATE AND status = 'SUCCESS'),
      'today_revenue', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at >= CURRENT_DATE AND status = 'SUCCESS'),
      'low_stock_stations', (SELECT COUNT(*) FROM stations WHERE petrol_stock < low_stock_threshold OR diesel_stock < low_stock_threshold),
      'pending_orders', (SELECT COUNT(*) FROM station_orders WHERE status IN ('PENDING', 'APPROVED'))
    ) INTO result;

  ELSIF p_role = 'STATION_BRANCH' THEN
    SELECT jsonb_build_object(
      'today_transactions', (SELECT COUNT(*) FROM transactions WHERE created_at >= CURRENT_DATE AND status = 'SUCCESS'),
      'today_revenue', (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at >= CURRENT_DATE AND status = 'SUCCESS'),
      'active_attendants', (SELECT COUNT(*) FROM attendants WHERE status = 'ACTIVE'),
      'open_shifts', (SELECT COUNT(*) FROM shifts WHERE shift_date = CURRENT_DATE AND status = 'OPEN'),
      'petrol_stock', (SELECT COALESCE(SUM(petrol_stock), 0) FROM stations),
      'diesel_stock', (SELECT COALESCE(SUM(diesel_stock), 0) FROM stations),
      'pending_reconciliations', (SELECT COUNT(*) FROM reconciliations WHERE status = 'DRAFT')
    ) INTO result;
  ELSE
    result := '{}'::jsonb;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 5. Monthly reconciliation calculation
CREATE OR REPLACE FUNCTION calculate_reconciliation(
  p_station_id UUID,
  p_period_month INTEGER,
  p_period_year INTEGER,
  p_fuel_type TEXT,
  p_closing_stock_physical NUMERIC,
  p_reconciled_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_opening_stock NUMERIC;
  v_total_ordered NUMERIC;
  v_total_sold NUMERIC;
  v_cash_sales NUMERIC;
  v_coupon_sales NUMERIC;
  v_mobile_sales NUMERIC;
  v_shortage_threshold NUMERIC;
  v_rec_id UUID;
  period_start DATE;
  period_end DATE;
BEGIN
  period_start := make_date(p_period_year, p_period_month, 1);
  period_end := (period_start + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  -- Calculate total deliveries this period
  SELECT COALESCE(SUM(delivered_liters), 0) INTO v_total_ordered
  FROM fuel_deliveries
  WHERE station_id = p_station_id AND fuel_type = p_fuel_type
    AND delivery_date BETWEEN period_start AND period_end;

  -- Calculate total sold from transactions
  SELECT COALESCE(SUM(liters), 0) INTO v_total_sold
  FROM transactions
  WHERE station_id = p_station_id AND fuel_type = p_fuel_type
    AND status = 'SUCCESS' AND created_at BETWEEN period_start AND period_end;

  -- Payment mode breakdowns
  SELECT COALESCE(SUM(amount), 0) INTO v_cash_sales
  FROM transactions
  WHERE station_id = p_station_id AND fuel_type = p_fuel_type
    AND status = 'SUCCESS' AND payment_method = 'CASH'
    AND created_at BETWEEN period_start AND period_end;

  SELECT COALESCE(SUM(amount), 0) INTO v_coupon_sales
  FROM transactions
  WHERE station_id = p_station_id AND fuel_type = p_fuel_type
    AND status = 'SUCCESS' AND payment_method = 'COUPON'
    AND created_at BETWEEN period_start AND period_end;

  SELECT COALESCE(SUM(amount), 0) INTO v_mobile_sales
  FROM transactions
  WHERE station_id = p_station_id AND fuel_type = p_fuel_type
    AND status = 'SUCCESS' AND payment_method = 'MOBILE_MONEY'
    AND created_at BETWEEN period_start AND period_end;

  -- Get shortage threshold from active policy
  SELECT COALESCE(value, 50) INTO v_shortage_threshold
  FROM fuel_policies
  WHERE policy_type = 'SHORTAGE_THRESHOLD' AND is_active = TRUE
  LIMIT 1;

  -- Assume opening stock is from previous month's closing or 0
  v_opening_stock := 0;

  -- Upsert reconciliation record
  INSERT INTO reconciliations (
    station_id, reconciled_by, period_month, period_year, fuel_type,
    opening_stock, total_ordered, total_sold, closing_stock_physical,
    shortage_threshold, cash_sales, coupon_sales, mobile_money_sales,
    status
  ) VALUES (
    p_station_id, p_reconciled_by, p_period_month, p_period_year, p_fuel_type,
    v_opening_stock, v_total_ordered, v_total_sold, p_closing_stock_physical,
    v_shortage_threshold, v_cash_sales, v_coupon_sales, v_mobile_sales,
    'SUBMITTED'
  )
  ON CONFLICT (station_id, period_month, period_year, fuel_type)
  DO UPDATE SET
    closing_stock_physical = p_closing_stock_physical,
    total_ordered = v_total_ordered,
    total_sold = v_total_sold,
    cash_sales = v_cash_sales,
    coupon_sales = v_coupon_sales,
    mobile_money_sales = v_mobile_sales,
    status = 'SUBMITTED',
    updated_at = NOW()
  RETURNING id INTO v_rec_id;

  RETURN jsonb_build_object(
    'success', true,
    'reconciliation_id', v_rec_id,
    'total_ordered', v_total_ordered,
    'total_sold', v_total_sold,
    'theoretical_closing', v_opening_stock + v_total_ordered - v_total_sold,
    'physical_closing', p_closing_stock_physical,
    'shortage', (v_opening_stock + v_total_ordered - v_total_sold) - p_closing_stock_physical,
    'shortage_threshold', v_shortage_threshold,
    'shortage_payable', ((v_opening_stock + v_total_ordered - v_total_sold) - p_closing_stock_physical) > v_shortage_threshold
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_station_id ON transactions(station_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_coupons_beneficiary ON coupons(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_qr ON coupons(qr_payload);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_shifts_station_date ON shifts(station_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_meter_readings_shift ON meter_readings(shift_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_station ON reconciliations(station_id, period_year, period_month);
CREATE INDEX IF NOT EXISTS idx_fuel_deliveries_station ON fuel_deliveries(station_id, delivery_date);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupon_allocations_beneficiary ON coupon_allocations(beneficiary_id, status);

-- ============================================================
-- STORAGE BUCKETS & POLICIES
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Select Access" ON storage.objects;
CREATE POLICY "Public Select Access" ON storage.objects
    FOR SELECT USING (bucket_id = 'kyc-documents');

DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'kyc-documents');

DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
CREATE POLICY "Allow public updates" ON storage.objects
    FOR UPDATE WITH CHECK (bucket_id = 'kyc-documents');

