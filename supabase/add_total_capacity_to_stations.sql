-- Migration to add total_capacity to stations table
ALTER TABLE stations ADD COLUMN IF NOT EXISTS total_capacity NUMERIC DEFAULT 0;
