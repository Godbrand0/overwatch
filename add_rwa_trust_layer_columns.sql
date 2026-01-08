-- Migration to add RWA Trust Layer columns to contracts table
-- Run this in Supabase SQL editor

ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS is_anchored BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS anchor_tx_hash TEXT,
ADD COLUMN IF NOT EXISTS rwa_type TEXT,
ADD COLUMN IF NOT EXISTS legal_right TEXT,
ADD COLUMN IF NOT EXISTS jurisdiction TEXT,
ADD COLUMN IF NOT EXISTS custodian TEXT,
ADD COLUMN IF NOT EXISTS offchain_asset_id TEXT,
ADD COLUMN IF NOT EXISTS legal_doc_hash TEXT,
ADD COLUMN IF NOT EXISTS appraiser_id TEXT;

-- Add comments for clarity
COMMENT ON COLUMN contracts.is_anchored IS 'Whether the contract has been anchored on the RWAAnchor smart contract';
COMMENT ON COLUMN contracts.anchor_tx_hash IS 'The transaction hash of the RWA anchoring';
COMMENT ON COLUMN contracts.rwa_type IS 'The category of the RWA (e.g., Real Estate, Treasury)';
COMMENT ON COLUMN contracts.legal_right IS 'The legal right represented by the token (e.g., Equity, Debt)';
COMMENT ON COLUMN contracts.jurisdiction IS 'The legal jurisdiction of the asset';
COMMENT ON COLUMN contracts.custodian IS 'The custodian wallet address or entity';
COMMENT ON COLUMN contracts.offchain_asset_id IS 'Identifier in the off-chain registry';
COMMENT ON COLUMN contracts.legal_doc_hash IS 'Hash of the legal documentation';
COMMENT ON COLUMN contracts.appraiser_id IS 'Identity of the appraiser';
