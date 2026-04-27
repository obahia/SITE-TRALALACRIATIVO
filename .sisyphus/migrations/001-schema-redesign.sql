-- Migration: Add category, testimonials, shipping_costs schema + profiles address fields
-- Date: 2026-04-27
-- Purpose: Foundation for Tralalá Criativo redesign

-- ============================================================================
-- 1. Add category column to products table
-- ============================================================================
ALTER TABLE products ADD COLUMN category TEXT;

-- Add constraint to ensure valid categories
ALTER TABLE products ADD CONSTRAINT valid_category CHECK (
  category IN ('canecas', 'camisetas', 'azulejos', 'kits', 'tote_bags')
);

-- Update existing products with appropriate categories
-- (Assuming product names/descriptions contain category hints)
UPDATE products SET category = 'canecas' WHERE title ILIKE '%caneca%' OR description ILIKE '%caneca%';
UPDATE products SET category = 'camisetas' WHERE title ILIKE '%camiseta%' OR description ILIKE '%camiseta%';
UPDATE products SET category = 'azulejos' WHERE title ILIKE '%azulejo%' OR description ILIKE '%azulejo%';
UPDATE products SET category = 'kits' WHERE title ILIKE '%kit%' OR description ILIKE '%kit%';
UPDATE products SET category = 'tote_bags' WHERE title ILIKE '%tote%' OR title ILIKE '%bag%' OR description ILIKE '%tote%';

-- Set default category for any remaining products (fallback to canecas)
UPDATE products SET category = 'canecas' WHERE category IS NULL;

-- Make category NOT NULL after populating
ALTER TABLE products ALTER COLUMN category SET NOT NULL;

-- ============================================================================
-- 2. Create testimonials table
-- ============================================================================
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read all testimonials
CREATE POLICY "Allow authenticated users to read testimonials"
  ON testimonials FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policy: Only admins can insert/update/delete (for now, restrict to prevent user submissions)
CREATE POLICY "Prevent user inserts on testimonials"
  ON testimonials FOR INSERT
  WITH CHECK (FALSE);

-- ============================================================================
-- 3. Create shipping_costs table
-- ============================================================================
CREATE TABLE shipping_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL UNIQUE CHECK (
    category IN ('canecas', 'camisetas', 'azulejos', 'kits', 'tote_bags')
  ),
  cost NUMERIC(10, 2) NOT NULL CHECK (cost > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on shipping_costs
ALTER TABLE shipping_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow authenticated users to read shipping costs
CREATE POLICY "Allow authenticated users to read shipping costs"
  ON shipping_costs FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policy: Prevent user inserts/updates
CREATE POLICY "Prevent user inserts on shipping costs"
  ON shipping_costs FOR INSERT
  WITH CHECK (FALSE);

-- Seed shipping costs
INSERT INTO shipping_costs (category, cost) VALUES
  ('canecas', 4.50),
  ('camisetas', 3.50),
  ('azulejos', 5.00),
  ('kits', 6.00),
  ('tote_bags', 3.50);

-- ============================================================================
-- 4. Add address fields to profiles table
-- ============================================================================
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN street TEXT;
ALTER TABLE profiles ADD COLUMN city TEXT;
ALTER TABLE profiles ADD COLUMN postal_code TEXT;
ALTER TABLE profiles ADD COLUMN country TEXT DEFAULT 'PT';

-- ============================================================================
-- 5. Seed testimonials with realistic Portuguese customer data
-- ============================================================================
INSERT INTO testimonials (name, message, rating, avatar_url) VALUES
  (
    'Maria Silva',
    'Adorei a qualidade das canecas! Chegaram bem embaladas e o design ficou perfeito. Recomendo muito!',
    5,
    NULL
  ),
  (
    'João Santos',
    'Excelente atendimento e produtos de primeira qualidade. As camisetas são super confortáveis.',
    5,
    NULL
  ),
  (
    'Ana Costa',
    'Os azulejos decorativos transformaram minha cozinha! Muito criativo e bem feito.',
    4,
    NULL
  ),
  (
    'Pedro Oliveira',
    'Kit de presentes perfeito para oferecer. Entrega rápida e bem apresentado.',
    5,
    NULL
  ),
  (
    'Carla Mendes',
    'Tote bag de excelente qualidade. Uso todos os dias e ainda está como nova!',
    4,
    NULL
  );

-- ============================================================================
-- 6. Verify RLS is enabled on all modified tables
-- ============================================================================
-- Note: products table should already have RLS; verify it's enabled
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY; -- Uncomment if needed

-- ============================================================================
-- End of migration
-- ============================================================================
