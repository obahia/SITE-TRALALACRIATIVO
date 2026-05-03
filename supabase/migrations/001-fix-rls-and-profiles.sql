-- =============================================
-- MIGRATION: Fix RLS Policies + Profile Trigger
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 2. RLS POLICIES FOR products TABLE
-- =============================================
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (is_active = true);

-- =============================================
-- 3. RLS POLICIES FOR cart_items TABLE
-- =============================================
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
CREATE POLICY "Users can view own cart items"
ON cart_items FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
CREATE POLICY "Users can insert own cart items"
ON cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
CREATE POLICY "Users can update own cart items"
ON cart_items FOR UPDATE
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
CREATE POLICY "Users can delete own cart items"
ON cart_items FOR DELETE
USING (auth.uid() = user_id);

-- =============================================
-- 4. RLS POLICIES FOR order_items TABLE
-- =============================================
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;
CREATE POLICY "Users can insert own order items"
ON order_items FOR INSERT
WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()));

-- =============================================
-- 5. CREATE FUNCTION: handle_new_user
-- =============================================
DROP FUNCTION IF EXISTS handle_new_user();
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 6. CREATE TRIGGER: on_auth_user_created
-- =============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();
