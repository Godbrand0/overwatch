-- Migration to add missing columns to contracts table
-- Run this in Supabase SQL editor (https://supabase.com/dashboard/project/_/sql)

ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS constructor_args JSONB,
ADD COLUMN IF NOT EXISTS test_results JSONB,
ADD COLUMN IF NOT EXISTS rwa_proof JSONB;

-- Add comments for clarity
COMMENT ON COLUMN contracts.constructor_args IS 'Stores constructor arguments used during deployment';
COMMENT ON COLUMN contracts.test_results IS 'Stores Foundry test output';
COMMENT ON COLUMN contracts.rwa_proof IS 'Stores the RWA Proof Manifest';
