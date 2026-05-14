-- Add shipping address storage and Shippo fields to orders table

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shippo_transaction_id TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS label_url TEXT DEFAULT NULL;

-- tracking_code and tracking_url may already exist from previous work, add if not
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT DEFAULT NULL;
