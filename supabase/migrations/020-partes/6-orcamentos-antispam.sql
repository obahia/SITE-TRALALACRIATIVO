-- Migração 020, parte 6 de 6. Depende de: parte 3.
-- Correr no Supabase > SQL Editor. Pode repetir-se sem duplicar nada.

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
