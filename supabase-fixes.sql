-- =============================================
-- CORREÇÕES DO BANCO DE DADOS
-- Execute este código no SQL Editor do Supabase
-- =============================================

-- =============================================
-- 1. ADICIONAR COLUNA is_active NA TABELA products
-- =============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- =============================================
-- 2. ATUALIZAR PRODUTOS EXISTENTES PARA is_active = true
-- =============================================
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- =============================================
-- 3. CORRIGIR RLS NA TABELA profiles (para admin ver clientes)
-- =============================================

-- Primeiro, verificar se RLS está habilitado
-- Se estiver, adicionar política para admins verem todos os perfis

-- Habilitar RLS se não estiver
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Políticas existentes (manter as que já existem)
-- Criar política para usuários verem próprio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Criar política para admins verem todos os perfis
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Política para users atualizarem próprio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- =============================================
-- 4. CORRIGIR RLS NA TABELA orders
-- =============================================
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus próprios pedidos
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT 
USING (auth.uid() = user_id);

-- Política para admins verem todos os pedidos
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- Política para criar pedidos
DROP POLICY IF EXISTS "Users can create orders" ON orders;
CREATE POLICY "Users can create orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Política para admins atualizarem pedidos
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
TO authenticated
USING (
  auth.uid() IN (SELECT id FROM admin_users)
);

-- =============================================
-- 5. CORRIGIR RLS NA TABELA order_items
-- =============================================
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem seus itens
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
ON order_items FOR SELECT
TO authenticated
USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
  OR auth.uid() IN (SELECT id FROM admin_users)
);

-- =============================================
-- 6. CORRIGIR RLS NA TABELA products
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Política para todos verem produtos ativos
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
TO authenticated
USING (is_active = true OR auth.uid() IN (SELECT id FROM admin_users));

-- Política para admins gerenciarem produtos
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
ON products FOR ALL
TO authenticated
USING (auth.uid() IN (SELECT id FROM admin_users))
WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));

-- =============================================
-- VERIFICAÇÃO
-- =============================================
SELECT 
  'Tabela profiles' as tabela,
  (SELECT COUNT(*) FROM profiles) as total_registos
UNION ALL
SELECT 
  'Tabela products' as tabela,
  (SELECT COUNT(*) FROM products) as total_registos
UNION ALL
SELECT 
  'Tabela orders' as tabela,
  (SELECT COUNT(*) FROM orders) as total_registos
UNION ALL
SELECT 
  'Admin users' as tabela,
  (SELECT COUNT(*) FROM admin_users) as total_registos;
