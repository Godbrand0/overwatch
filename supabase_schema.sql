-- Run this in Supabase SQL editor (https://supabase.com/dashboard/project/_/sql)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  github_id TEXT UNIQUE NOT NULL,
  github_username TEXT NOT NULL,
  avatar_url TEXT,
  access_token TEXT, -- Encrypt in production!
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  network TEXT NOT NULL,
  name TEXT NOT NULL,
  abi JSONB NOT NULL,
  source_code TEXT,
  rwa_proof JSONB, -- Stores the RWA Proof Manifest
  deployed_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  UNIQUE(address, network)
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_contracts_user ON contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_contracts_address ON contracts(address);
