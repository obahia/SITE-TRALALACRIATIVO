-- Migration: Create testimonials, shipping_costs tables + profiles address fields
-- Date: 2026-04-27
-- Purpose: Foundation for Tralalá Criativo redesign
-- 
-- NOTE: products.category already exists with values: 'Azulejos', 'Camisetas', 'Canecas', 'Acessórios'
-- This migration only covers the REMAINING schema changes.
-- Execute via Supabase Dashboard SQL Editor: https://supabase.com/dashboard/project/riioszwtwjbestbxbzxu/sql

-- ============================================================================
-- 1. Create testimonials table
-- ============================================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anyone to read testimonials (public data)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on testimonials') THEN
    CREATE POLICY "Allow public read on testimonials"
      ON testimonials FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- 2. Create shipping_costs table
-- ============================================================================
CREATE TABLE IF NOT EXISTS shipping_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL UNIQUE,
  cost NUMERIC(10, 2) NOT NULL CHECK (cost > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on shipping_costs
ALTER TABLE shipping_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow anyone to read shipping costs (public data)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on shipping_costs') THEN
    CREATE POLICY "Allow public read on shipping_costs"
      ON shipping_costs FOR SELECT
      USING (true);
  END IF;
END $$;

-- Seed shipping costs (matching actual product categories)
INSERT INTO shipping_costs (category, cost) VALUES
  ('Canecas', 4.50),
  ('Camisetas', 3.50),
  ('Azulejos', 5.00),
  ('Acessórios', 3.50)
ON CONFLICT (category) DO NOTHING;

-- ============================================================================
-- 3. Add address fields to profiles table (idempotent)
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'street') THEN
    ALTER TABLE profiles ADD COLUMN street TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE profiles ADD COLUMN city TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'postal_code') THEN
    ALTER TABLE profiles ADD COLUMN postal_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'country') THEN
    ALTER TABLE profiles ADD COLUMN country TEXT DEFAULT 'PT';
  END IF;
END $$;

-- ============================================================================
-- 4. Seed testimonials with realistic Portuguese customer data
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
    'Presente perfeito para oferecer no Natal. Entrega rápida e bem apresentado.',
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
-- 5. Add RLS policy for profiles address update (users can update their own)
-- ============================================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile address') THEN
    CREATE POLICY "Users can update own profile address"
      ON profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- ============================================================================
-- End of migration
-- ============================================================================
