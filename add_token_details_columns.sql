-- Migration to add token details columns to contracts table
-- Run this in Supabase SQL editor

ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS token_name TEXT,
ADD COLUMN IF NOT EXISTS token_symbol TEXT,
ADD COLUMN IF NOT EXISTS total_supply TEXT,
ADD COLUMN IF NOT EXISTS nav TEXT;

-- Add comments for clarity
COMMENT ON COLUMN contracts.token_name IS 'The name of the token (e.g., Manhattan Prime Real Estate)';
COMMENT ON COLUMN contracts.token_symbol IS 'The symbol of the token (e.g., MPRE)';
COMMENT ON COLUMN contracts.total_supply IS 'The total supply of tokens';
COMMENT ON COLUMN contracts.nav IS 'The Net Asset Value in smallest currency unit (e.g., cents for USD)';