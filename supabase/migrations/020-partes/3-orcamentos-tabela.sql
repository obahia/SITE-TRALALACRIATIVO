-- Migração 020, parte 3 de 6. Depende de: nenhuma.
-- Correr no Supabase > SQL Editor. Pode repetir-se sem duplicar nada.

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
