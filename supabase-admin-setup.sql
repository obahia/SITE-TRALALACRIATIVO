-- =============================================
-- CONFIGURAÇÃO DO ADMIN NO SUPABASE
-- Execute este código no SQL Editor do Supabase
-- =============================================

-- 1. Criar tabela de admin_users
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email TEXT
);

-- 2. Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS (apenas admins podem ver/inserir)
-- Qualquer um logado pode verificar se é admin (necessário para o frontend)
CREATE POLICY "Anyone can check if admin" 
ON admin_users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- 4. Criar trigger para automáticamente adicionar email
CREATE OR REPLACE FUNCTION set_admin_email()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email := (
        SELECT email FROM auth.users WHERE id = NEW.id
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Inserir seu usuário como admin
-- Substitua o ID abaixo pelo ID do usuário que você criou no auth
-- Para encontrar o ID, vá em Authentication > Users e clique no usuário

-- =============================================
-- INSTRUÇÕES PARA ADICIONAR O ADMIN:
-- =============================================
-- 1. Vá para Authentication > Users no Supabase
-- 2. Encontre o usuário admintralala@gmail.com
-- 3. Copie o ID do usuário
-- 4. Execute o INSERT abaixo com o ID correto:

-- INSERT INTO admin_users (id, email) VALUES ('SEU_USER_ID_AQUI', 'admintralala@gmail.com');

-- =============================================
-- Verificar se funcionou:
-- SELECT * FROM admin_users;
