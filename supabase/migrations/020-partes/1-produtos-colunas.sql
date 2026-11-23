-- Migração 020, parte 1 de 6. Depende de: nenhuma.
-- Correr no Supabase > SQL Editor. Pode repetir-se sem duplicar nada.

-- ---------------------------------------------------------------------
-- 1. PRODUTOS: novas colunas
-- ---------------------------------------------------------------------
ALTER TABLE products ADD COLUMN IF NOT EXISTS occasions    text[]  NOT NULL DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS min_quantity integer NOT NULL DEFAULT 1;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured  boolean NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sort_order   integer NOT NULL DEFAULT 100;
-- 'cart'  = compra online normal
-- 'quote' = preço variável, o botão leva ao pedido de orçamento
ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_mode    text    NOT NULL DEFAULT 'cart';
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_note   text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_min_quantity_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_min_quantity_check CHECK (min_quantity >= 1);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_sale_mode_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_sale_mode_check CHECK (sale_mode IN ('cart', 'quote'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_occasions ON products USING gin (occasions);

-- Presentes personalizados que já existiam -> ocasião "individuais"
UPDATE products
SET occasions = ARRAY['individuais']
WHERE category IN ('Canecas', 'Azulejos', 'Camisetas', 'Acessórios', 'Kits')
  AND occasions = '{}';
