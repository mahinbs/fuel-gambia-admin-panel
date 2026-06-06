-- 1. system_settings
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_display_name TEXT DEFAULT 'Fuel Gambia',
    primary_color_hex TEXT DEFAULT '#0a192f',
    logo_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one row exists for settings
INSERT INTO system_settings (id) VALUES ('00000000-0000-0000-0000-000000000000') ON CONFLICT DO NOTHING;

-- 2. companies updates
ALTER TABLE companies RENAME COLUMN registration_number TO institution_code;
ALTER TABLE companies ADD COLUMN onboarding_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE companies ADD COLUMN license_duration_months INTEGER DEFAULT 12;
ALTER TABLE companies ADD COLUMN license_expiration_date DATE;

-- 3. license_renewals
CREATE TABLE IF NOT EXISTS license_renewals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    renewed_by UUID REFERENCES profiles(id),
    previous_start_date DATE,
    previous_end_date DATE,
    new_start_date DATE,
    new_end_date DATE,
    renewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. profiles archive flag
ALTER TABLE profiles ADD COLUMN is_archived BOOLEAN DEFAULT FALSE;

-- Optional policies for system_settings and license_renewals
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view system settings" ON system_settings FOR SELECT USING (TRUE);
CREATE POLICY "Super admin can update settings" ON system_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);

ALTER TABLE license_renewals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view license renewals" ON license_renewals FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('SUPER_ADMIN', 'GOVERNMENT_ADMIN'))
);
CREATE POLICY "Super admin can manage license renewals" ON license_renewals FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
);
