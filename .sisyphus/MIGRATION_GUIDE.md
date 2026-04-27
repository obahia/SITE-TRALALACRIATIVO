# Supabase Schema Migration Guide

## Overview
This document provides step-by-step instructions for applying the schema changes to the Tralalá Criativo Supabase project via the SQL Editor.

## Project Details
- **Supabase URL**: https://riioszwtwjbestbxbzxu.supabase.co
- **Project**: Tralalá Criativo

## Migration Steps

### Step 1: Access Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select the "Tralalá Criativo" project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query" button

### Step 2: Execute Migration SQL
Copy the entire SQL migration from `.sisyphus/migrations/001-schema-redesign.sql` and paste it into the SQL Editor.

The migration includes:
1. **Add `category` column to `products` table**
   - Type: TEXT
   - Constraint: Must be one of (canecas, camisetas, azulejos, kits, tote_bags)
   - Auto-populate existing products based on title/description
   - Make NOT NULL after population

2. **Create `testimonials` table**
   - Columns: id (uuid PK), name (text), message (text), rating (int 1-5), avatar_url (text nullable), created_at (timestamptz)
   - RLS: Allow authenticated users to read
   - Seed: 5 Portuguese customer testimonials

3. **Create `shipping_costs` table**
   - Columns: id (uuid PK), category (text unique), cost (numeric), created_at, updated_at
   - RLS: Allow authenticated users to read
   - Seed: 5 rows with prices:
     - canecas: €4.50
     - camisetas: €3.50
     - azulejos: €5.00
     - kits: €6.00
     - tote_bags: €3.50

4. **Add address fields to `profiles` table**
   - Columns: phone (text), street (text), city (text), postal_code (text), country (text, default 'PT')

### Step 3: Execute the Query
1. Click the "Run" button (or press Ctrl+Enter)
2. Wait for the query to complete (should take < 5 seconds)
3. Check for any error messages in the output panel

### Step 4: Verify Success
After the migration completes, run the verification script:

```bash
npm run verify-schema
```

This will test:
- ✅ Products have category column populated
- ✅ Testimonials table exists with 4+ seed rows
- ✅ Shipping costs table has all 5 categories with valid prices
- ✅ Profiles table has all address columns
- ✅ RLS policies allow authenticated reads

## Troubleshooting

### Error: "Column already exists"
- The migration is idempotent for most operations, but if you run it twice, some ALTER TABLE statements may fail
- Solution: Check if the column already exists in the Supabase dashboard (Table Editor), and skip that step if it does

### Error: "Constraint violation"
- If products already have a category column with invalid values, the CHECK constraint will fail
- Solution: First, manually update any products with invalid categories, then run the migration

### Error: "Permission denied"
- Ensure you're logged in as a project owner/admin in Supabase
- The anon key in .env is for the app; the dashboard uses your account credentials

## Rollback (if needed)

If you need to undo the migration, run:

```sql
-- Drop new tables
DROP TABLE IF EXISTS testimonials CASCADE;
DROP TABLE IF EXISTS shipping_costs CASCADE;

-- Remove category column from products
ALTER TABLE products DROP COLUMN IF EXISTS category CASCADE;

-- Remove address fields from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS phone CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS street CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS city CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS postal_code CASCADE;
ALTER TABLE profiles DROP COLUMN IF EXISTS country CASCADE;
```

## Next Steps

After successful migration:
1. Run `npm run verify-schema` to confirm all changes
2. Commit the migration file: `git add .sisyphus/migrations/001-schema-redesign.sql`
3. Proceed with Task 2 (Vitest setup) and Task 3 (Auth - Forgot Password)
