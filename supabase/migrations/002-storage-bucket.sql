-- =============================================
-- MIGRATION: Storage Bucket for Customization Images
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. CREATE STORAGE BUCKET
-- =============================================
-- Create the customization-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('customization-images', 'customization-images', false)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. STORAGE POLICIES FOR customization-images BUCKET
-- =============================================

-- =============================================
-- 2.1 INSERT Policy - Authenticated users can upload to their own folder
-- =============================================
DROP POLICY IF EXISTS "Authenticated users can upload to own folder" ON storage.objects;
CREATE POLICY "Authenticated users can upload to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customization-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- 2.2 SELECT Policy - Users can view their own images
-- =============================================
DROP POLICY IF EXISTS "Users can view own images" ON storage.objects;
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'customization-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- 2.3 SELECT Policy - Admins can view all images
-- =============================================
DROP POLICY IF EXISTS "Admins can view all customization images" ON storage.objects;
CREATE POLICY "Admins can view all customization images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'customization-images'
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =============================================
-- 2.4 DELETE Policy - Users can delete their own images
-- =============================================
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'customization-images' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =============================================
-- INSTRUCTIONS FOR EXECUTION
-- =============================================
-- 1. Copy this entire SQL script
-- 2. Go to Supabase Dashboard > SQL Editor
-- 3. Paste and run the script
-- 4. Verify bucket exists: Storage > Buckets > customization-images
-- 5. Verify policies exist: Storage > Policies > storage.objects
