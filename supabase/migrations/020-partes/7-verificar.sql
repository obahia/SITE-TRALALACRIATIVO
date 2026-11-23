-- Migração 020, verificação (só leitura). Correr no fim.
-- Cada linha deve mostrar "ok = true".

SELECT 'colunas novas em products' AS verificacao,
       count(*) = 6 AS ok
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
  AND column_name IN ('occasions','min_quantity','is_featured','sort_order','sale_mode','price_note')

UNION ALL
SELECT 'produtos do catálogo (26)',
       count(DISTINCT name) = 26
FROM products
WHERE name IN (
    'Caixinha Simples',
    'Caixinha 3D',
    'Caixinha Luxo',
    'Sacolinha',
    'Caixa Cineminha + Copos',
    'Tubete Simples',
    'Tubete 3D',
    'Cone Personalizado',
    'Caixa Padrinhos',
    'Caixa Play-Doh',
    'Kit Pintura',
    'Jogo do Galo',
    'Copo Personalizado',
    'Porta-chaves em MDF',
    'Íman em MDF',
    'Moldura com Foto em MDF',
    'Centro de Mesa',
    'Topo de Bolo Simples',
    'Topo de Docinho',
    'Nome em MDF',
    'Display em PVC',
    'Placard de Eventos',
    'Convite Impresso',
    'Cartão Personalizado',
    'Rótulo de Garrafa de Água',
    'Adesivo Redondo'
  )

UNION ALL
SELECT 'tabela quote_requests com RLS',
       coalesce(bool_and(relrowsecurity), false)
FROM pg_class WHERE oid = to_regclass('public.quote_requests')

UNION ALL
SELECT 'colunas de envio em orders',
       count(*) = 4
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
  AND column_name IN ('shipping_method','shipping_amount','customer_phone','customer_name')

UNION ALL
SELECT 'clientes já não inserem encomendas',
       count(*) = 0
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('orders','order_items')
  AND cmd IN ('INSERT','ALL')
  AND NOT ('service_role' = ANY (roles))

UNION ALL
SELECT 'trigger anti-spam nos orçamentos',
       count(*) = 1
FROM pg_trigger
WHERE tgname = 'trg_limit_quote_requests'
  AND tgrelid = to_regclass('public.quote_requests')
  AND NOT tgisinternal;
