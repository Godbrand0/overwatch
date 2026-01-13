-- Migration to support multiple legal document hashes
-- This script updates the contracts table to store multiple legal document hashes

-- Add a new column to store multiple legal document hashes as JSON array
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS legal_doc_hashes JSONB;

-- Migrate existing single legal_doc_hash to the new array format
UPDATE contracts 
SET legal_doc_hashes = JSONB_BUILD_ARRAY(legal_doc_hash)
WHERE legal_doc_hash IS NOT NULL AND legal_doc_hashes IS NULL;

-- Optionally, you can drop the old column after migration if you no longer need it
-- ALTER TABLE contracts DROP COLUMN IF EXISTS legal_doc_hash;

-- Add index for better query performance on the new column
CREATE INDEX IF NOT EXISTS idx_contracts_legal_doc_hashes ON contracts USING GIN(legal_doc_hashes);

-- Add comment to document the new column
COMMENT ON COLUMN contracts.legal_doc_hashes IS 'JSON array containing hashes of all legal documents associated with the contract';