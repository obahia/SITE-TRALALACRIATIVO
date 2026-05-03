-- Migration 005: Add tracking columns to orders table
-- Allows admin to set tracking codes for shipments (CTT, DPD, etc.)

ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_code TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_url TEXT DEFAULT NULL;

-- Index for looking up orders by tracking code
CREATE INDEX IF NOT EXISTS idx_orders_tracking_code ON orders (tracking_code) WHERE tracking_code IS NOT NULL;

COMMENT ON COLUMN orders.tracking_code IS 'Shipping carrier tracking code (e.g. CTT, DPD)';
COMMENT ON COLUMN orders.tracking_url IS 'Full tracking URL for the shipment';
