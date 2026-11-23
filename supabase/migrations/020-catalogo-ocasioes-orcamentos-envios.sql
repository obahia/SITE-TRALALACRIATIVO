-- =====================================================================
-- MIGRATION 020: Catálogo de papelaria de festa, ocasiões, pedidos de
-- orçamento e envio CTT.
--
-- Como aplicar: Supabase Dashboard > SQL Editor > colar tudo > Run.
-- É idempotente: pode correr mais de uma vez sem duplicar produtos.
-- =====================================================================

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

-- ---------------------------------------------------------------------
-- 2. PRODUTOS: catálogo "Papelaria Festas" (Tabela Papelaria.pdf)
--    Imagens em /public/assets/produtos (servidas pelo próprio site).
--    min_quantity: valores sugeridos, confirmar com a Tralalá.
-- ---------------------------------------------------------------------
WITH novos (name, description, price, category, image_url, occasions, min_quantity, is_featured, sort_order, sale_mode, price_note, customization_options) AS (
  VALUES
  ('Caixinha Simples', 'Caixinha de lembrança personalizada com o tema, nome e idade. Ideal para doces e pequenos mimos.', 2.00, 'Caixinhas e embalagens', '/assets/produtos/caixinha-simples.webp', ARRAY['festas-infantis','batizado','casamento','empresas'], 10, true, 10, 'cart', NULL, NULL::jsonb),
  ('Caixinha 3D', 'Caixinha com elemento em relevo 3D no topo, personalizada com o tema da festa.', 2.30, 'Caixinhas e embalagens', '/assets/produtos/caixinha-3d.webp', ARRAY['festas-infantis','batizado'], 10, true, 11, 'cart', NULL, NULL),
  ('Caixinha Luxo', 'Caixinha com laço e aplicações em camadas. Acabamento mais elaborado para mesas de destaque.', 2.80, 'Caixinhas e embalagens', '/assets/produtos/caixinha-luxo.webp', ARRAY['festas-infantis','batizado','casamento'], 10, true, 12, 'cart', NULL, NULL),
  ('Sacolinha', 'Sacolinha personalizada com alças, para levar as lembranças da festa.', 2.50, 'Caixinhas e embalagens', '/assets/produtos/sacolinha.webp', ARRAY['festas-infantis','batizado','empresas'], 10, false, 13, 'cart', NULL, NULL),
  ('Caixa Cineminha + Copos', 'Caixa cineminha personalizada com copos para pipocas e sumo. Perfeita para sessões de cinema em festa.', 8.00, 'Caixinhas e embalagens', '/assets/produtos/caixa-cineminha.webp', ARRAY['festas-infantis'], 5, true, 14, 'cart', NULL, NULL),
  ('Tubete Simples', 'Tubete personalizado para confeitos e pequenos doces.', 1.50, 'Caixinhas e embalagens', '/assets/produtos/tubete-simples.webp', ARRAY['festas-infantis','batizado','casamento','empresas'], 10, false, 15, 'cart', NULL, NULL),
  ('Tubete 3D', 'Tubete com aplicação 3D no topo, com o personagem ou tema da festa.', 1.80, 'Caixinhas e embalagens', '/assets/produtos/tubete-3d.webp', ARRAY['festas-infantis','batizado'], 10, true, 16, 'cart', NULL, NULL),
  ('Cone Personalizado', 'Cone em papel para pétalas, arroz ou doces. Muito usado em casamentos e batizados.', 0.60, 'Caixinhas e embalagens', '/assets/produtos/cone-personalizado.webp', ARRAY['casamento','batizado'], 20, false, 17, 'cart', NULL, NULL),
  ('Caixa Padrinhos', 'Caixa em madeira para o convite aos padrinhos, com embalagem e laço incluídos. O preço final depende do tamanho e do modelo.', 30.00, 'Caixinhas e embalagens', '/assets/produtos/caixa-padrinhos.webp', ARRAY['batizado','casamento'], 1, true, 18, 'quote', 'A partir de 30 €', NULL),
  ('Caixa Play-Doh', 'Caixa personalizada com plasticinas, uma lembrança para brincar depois da festa.', 3.80, 'Lembrancinhas', '/assets/produtos/caixa-playdoh.webp', ARRAY['festas-infantis'], 10, false, 20, 'cart', NULL, NULL),
  ('Kit Pintura', 'Kit de pintura personalizado com desenhos do tema e lápis. Entretém as crianças durante a festa.', 3.00, 'Lembrancinhas', '/assets/produtos/kit-pintura.webp', ARRAY['festas-infantis'], 10, false, 21, 'cart', NULL, NULL),
  ('Jogo do Galo', 'Jogo do galo personalizado com peças do tema. Lembrança para brincar em casa.', 2.50, 'Lembrancinhas', '/assets/produtos/jogo-da-velha.webp', ARRAY['festas-infantis'], 10, false, 22, 'cart', NULL, NULL),
  ('Copo Personalizado', 'Copo reutilizável com nome e tema da festa.', 2.40, 'Lembrancinhas', '/assets/produtos/copo-personalizado.webp', ARRAY['festas-infantis','empresas'], 10, false, 23, 'cart', NULL, NULL),
  ('Porta-chaves em MDF', 'Porta-chaves em MDF gravado com nome, data ou logótipo.', 1.50, 'Lembrancinhas', '/assets/produtos/porta-chave-mdf.webp', ARRAY['casamento','batizado','empresas','individuais'], 10, false, 24, 'cart', NULL, NULL),
  ('Íman em MDF', 'Íman em MDF gravado, lembrança clássica de casamento e batizado.', 2.00, 'Lembrancinhas', '/assets/produtos/iman-mdf.webp', ARRAY['casamento','batizado','empresas'], 10, true, 25, 'cart', NULL, NULL),
  ('Moldura com Foto em MDF', 'Moldura em MDF com fotografia impressa. Lembrança afetiva para a família.', 2.80, 'Lembrancinhas', '/assets/produtos/moldura-mdf.webp', ARRAY['batizado','casamento','individuais'], 1, false, 26, 'cart', NULL, NULL),
  ('Centro de Mesa', 'Centro de mesa personalizado com o tema, nome e idade.', 3.80, 'Decoração de mesa', '/assets/produtos/centro-de-mesa.webp', ARRAY['festas-infantis','batizado','casamento'], 1, false, 30, 'cart', NULL, NULL),
  ('Topo de Bolo Simples', 'Topo de bolo em papel com nome, idade e tema.', 6.50, 'Decoração de mesa', '/assets/produtos/topo-bolo-simples.webp', ARRAY['festas-infantis','batizado','casamento'], 1, true, 31, 'cart', NULL, NULL),
  ('Topo de Docinho', 'Topos personalizados para docinhos e cupcakes.', 0.50, 'Decoração de mesa', '/assets/produtos/topo-docinho.webp', ARRAY['festas-infantis','batizado','casamento'], 20, false, 32, 'cart', NULL, NULL),
  ('Nome em MDF', 'Letras em MDF (20 × 15 cm) para decorar a mesa ou o quarto. Preço por letra: escolha a quantidade igual ao número de letras.', 6.00, 'Decoração de mesa', '/assets/produtos/nome-mdf.webp', ARRAY['festas-infantis','batizado','individuais'], 1, false, 33, 'cart', 'Preço por letra', NULL),
  ('Display em PVC', 'Figura recortada em PVC com o personagem ou a fotografia que escolher. Escolha a altura.', 22.00, 'Decoração de mesa', '/assets/produtos/display-pvc.webp', ARRAY['festas-infantis','batizado','casamento'], 1, true, 34, 'cart', 'Desde 22 €',
     '[{"label":"Até 50 cm","price":22.00,"allows_text":true,"allows_image":true},{"label":"Até 70 cm","price":27.00,"allows_text":true,"allows_image":true},{"label":"Até 100 cm","price":32.00,"allows_text":true,"allows_image":true}]'::jsonb),
  ('Placard de Eventos', 'Placard de 1 m × 80 cm para boas-vindas, plano de mesas ou menu.', 40.00, 'Decoração de mesa', '/assets/produtos/placard-eventos.webp', ARRAY['casamento','batizado','empresas'], 1, false, 35, 'cart', NULL, NULL),
  ('Convite Impresso', 'Convite impresso com criação da arte incluída. O valor depende do tamanho, do modelo e da quantidade.', 0, 'Papelaria', '/assets/produtos/convite-impresso.webp', ARRAY['casamento','batizado','festas-infantis','empresas'], 1, true, 40, 'quote', 'Sob orçamento', NULL),
  ('Cartão Personalizado', 'Cartão de agradecimento ou de mesa, personalizado com nomes e data.', 0.80, 'Papelaria', '/assets/produtos/cartao-personalizado.webp', ARRAY['casamento','batizado','empresas','individuais'], 10, false, 41, 'cart', NULL, NULL),
  ('Rótulo de Garrafa de Água', 'Rótulo 20 × 5 cm para garrafas de água, com o tema do evento.', 0.55, 'Papelaria', '/assets/produtos/rotulo-garrafa.webp', ARRAY['festas-infantis','batizado','casamento','empresas'], 10, false, 42, 'cart', NULL, NULL),
  ('Adesivo Redondo', 'Autocolantes redondos personalizados para fechar saquinhos e caixas.', 0.18, 'Papelaria', '/assets/produtos/adesivo-redondo.webp', ARRAY['festas-infantis','batizado','casamento','empresas'], 20, false, 43, 'cart', NULL, NULL)
)
INSERT INTO products (name, description, price, category, image_url, occasions, min_quantity, is_featured, sort_order, sale_mode, price_note, customization_options, is_active)
SELECT n.name, n.description, n.price, n.category, n.image_url, n.occasions, n.min_quantity, n.is_featured, n.sort_order, n.sale_mode, n.price_note,
       COALESCE(n.customization_options,
         jsonb_build_array(jsonb_build_object(
           'label', 'Personalizado com o tema da festa',
           'price', n.price,
           'allows_text', true,
           'allows_image', true))),
       true
FROM novos n
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.name = n.name);

-- ---------------------------------------------------------------------
-- 3. PEDIDOS DE ORÇAMENTO
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quote_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  user_id         uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  name            text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
  email           text NOT NULL CHECK (char_length(email) BETWEEN 5 AND 200 AND email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone           text CHECK (phone IS NULL OR char_length(phone) <= 30),
  occasion        text NOT NULL CHECK (occasion IN ('casamento','festas-infantis','batizado','empresas','individuais','outro')),
  event_date      date,
  guests          integer CHECK (guests IS NULL OR guests BETWEEN 1 AND 5000),
  theme           text CHECK (theme IS NULL OR char_length(theme) <= 200),
  products        text[] NOT NULL DEFAULT '{}' CHECK (cardinality(products) <= 40),
  kit             text CHECK (kit IS NULL OR char_length(kit) <= 60),
  budget          text CHECK (budget IS NULL OR char_length(budget) <= 60),
  delivery        text CHECK (delivery IS NULL OR delivery IN ('envio-ctt','levantamento-leiria','a-combinar')),
  postal_code     text CHECK (postal_code IS NULL OR char_length(postal_code) <= 12),
  company         text CHECK (company IS NULL OR char_length(company) <= 160),
  vat_number      text CHECK (vat_number IS NULL OR char_length(vat_number) <= 20),
  message         text NOT NULL CHECK (char_length(message) BETWEEN 5 AND 4000),
  status          text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em-analise','respondido','aceite','recusado')),
  admin_notes     text
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_status_created ON quote_requests (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_user ON quote_requests (user_id) WHERE user_id IS NOT NULL;

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode enviar um pedido, mas só no estado inicial.
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
CREATE POLICY "Anyone can create quote requests"
ON quote_requests FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'novo'
  AND admin_notes IS NULL
  AND (user_id IS NULL OR user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view own quote requests" ON quote_requests;
CREATE POLICY "Users can view own quote requests"
ON quote_requests FOR SELECT
TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all quote requests" ON quote_requests;
CREATE POLICY "Admins can view all quote requests"
ON quote_requests FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can update quote requests" ON quote_requests;
CREATE POLICY "Admins can update quote requests"
ON quote_requests FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can delete quote requests" ON quote_requests;
CREATE POLICY "Admins can delete quote requests"
ON quote_requests FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE OR REPLACE FUNCTION set_quote_requests_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_quote_requests_updated_at ON quote_requests;
CREATE TRIGGER trg_quote_requests_updated_at
BEFORE UPDATE ON quote_requests
FOR EACH ROW EXECUTE FUNCTION set_quote_requests_updated_at();

-- O insert é feito sem .select() no frontend (anon não tem SELECT).
GRANT INSERT ON quote_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON quote_requests TO authenticated;

-- ---------------------------------------------------------------------
-- 4. ENCOMENDAS: envio CTT / levantamento
-- ---------------------------------------------------------------------
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_amount numeric(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone  text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name   text;

-- ---------------------------------------------------------------------
-- 5. SEGURANÇA: encomendas só são criadas pela edge function
--    (service_role). As policies antigas deixavam um cliente autenticado
--    inserir uma encomenda já com status 'pago' e qualquer total.
-- ---------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;

-- ---------------------------------------------------------------------
-- 6. ANTI-SPAM nos pedidos de orçamento: máx. 5 por email por hora
--    e 200 por hora no total.
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION limit_quote_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (SELECT count(*) FROM quote_requests
      WHERE lower(email) = lower(NEW.email)
        AND created_at > now() - interval '1 hour') >= 5 THEN
    RAISE EXCEPTION 'Demasiados pedidos com este email. Tente mais tarde.' USING ERRCODE = 'P0001';
  END IF;
  IF (SELECT count(*) FROM quote_requests
      WHERE created_at > now() - interval '1 hour') >= 200 THEN
    RAISE EXCEPTION 'Demasiados pedidos. Tente mais tarde.' USING ERRCODE = 'P0001';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limit_quote_requests ON quote_requests;
CREATE TRIGGER trg_limit_quote_requests
BEFORE INSERT ON quote_requests
FOR EACH ROW EXECUTE FUNCTION limit_quote_requests();

CREATE INDEX IF NOT EXISTS idx_quote_requests_email_created ON quote_requests (lower(email), created_at DESC);
