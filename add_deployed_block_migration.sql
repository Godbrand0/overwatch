-- Migration to add deployed_block_number and deploy_tx_hash columns to existing contracts table
-- Run this in Supabase SQL editor if you have existing data

ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS deployed_block_number BIGINT,
ADD COLUMN IF NOT EXISTS deploy_tx_hash TEXT;

-- Add comments explaining the columns
COMMENT ON COLUMN contracts.deployed_block_number IS 'Block number when the contract was deployed on the blockchain';
COMMENT ON COLUMN contracts.deploy_tx_hash IS 'Transaction hash of the deployment';
