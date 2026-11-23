-- Migração 020, parte 5 de 6. Depende de: nenhuma.
-- Correr no Supabase > SQL Editor. Pode repetir-se sem duplicar nada.

-- ---------------------------------------------------------------------
-- 5. SEGURANÇA: encomendas só são criadas pela edge function
--    (service_role). As policies antigas deixavam um cliente autenticado
--    inserir uma encomenda já com status 'pago' e qualquer total.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
