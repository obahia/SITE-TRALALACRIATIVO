-- Migração 020, parte 4 de 6. Depende de: nenhuma.
-- Correr no Supabase > SQL Editor. Pode repetir-se sem duplicar nada.

-- ---------------------------------------------------------------------
-- 4. ENCOMENDAS: envio CTT / levantamento
-- ---------------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   text;
