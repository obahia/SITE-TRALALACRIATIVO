# TASK 1: Supabase Schema Migration — EXECUTION INSTRUCTIONS

## 📋 Summary
This task adds the foundation schema for the Tralalá Criativo redesign:
- ✅ Add `category` column to `products` table
- ✅ Create `testimonials` table with 5 seed rows
- ✅ Create `shipping_costs` table with 5 category prices
- ✅ Add address fields to `profiles` table
- ✅ Configure RLS policies for authenticated reads

## 🚀 EXECUTION STEPS

### Step 1: Copy the SQL Migration
The complete SQL migration is in: `.sisyphus/migrations/001-schema-redesign.sql`

### Step 2: Open Supabase SQL Editor
1. Go to: https://supabase.com/dashboard
2. Select project: **Tralalá Criativo**
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query** button

### Step 3: Paste and Execute SQL
1. Copy ALL content from `.sisyphus/migrations/001-schema-redesign.sql`
2. Paste into the SQL Editor
3. Click **Run** button (or Ctrl+Enter)
4. Wait for completion (should be < 5 seconds)
5. Check for ✅ success message (no errors)

### Step 4: Verify in Supabase Dashboard
After SQL executes successfully, verify in the Table Editor:

**Check 1: Products table**
- Click: **products** table
- Verify: New column `category` exists
- Verify: All rows have a category value (canecas, camisetas, azulejos, kits, or tote_bags)

**Check 2: Testimonials table**
- Click: **testimonials** table
- Verify: Table exists with columns: id, name, message, rating, avatar_url, created_at
- Verify: 5 rows of Portuguese customer testimonials are present

**Check 3: Shipping Costs table**
- Click: **shipping_costs** table
- Verify: Table exists with columns: id, category, cost, created_at, updated_at
- Verify: 5 rows with categories and prices:
  - canecas: 4.50
  - camisetas: 3.50
  - azulejos: 5.00
  - kits: 6.00
  - tote_bags: 3.50

**Check 4: Profiles table**
- Click: **profiles** table
- Verify: New columns exist: phone, street, city, postal_code, country
- Verify: country column has default value 'PT'

### Step 5: Run Verification Script
After SQL migration is complete, run the verification script locally:

```bash
npm run verify-schema
```

Expected output:
```
✅ PASS: All 5 sampled products have category values
✅ PASS: Found 5 testimonials with valid data
✅ PASS: All 5 categories present with valid costs
✅ PASS: All address columns exist
✅ PASS: RLS policies allow authenticated reads
✅ All verification tests PASSED
```

## ⚠️ TROUBLESHOOTING

### Error: "Column already exists"
- The migration is idempotent, but if run twice, some statements may fail
- **Solution**: Check the Supabase Table Editor to see if columns already exist
- If they do, the migration is already applied — skip to Step 5

### Error: "Constraint violation" on products.category
- Some products may have invalid category values
- **Solution**: Manually update products with invalid categories first, then re-run migration

### Error: "Permission denied"
- You must be logged in as a project owner/admin
- **Solution**: Ensure you're using your Supabase account (not the anon key)

### Verification script fails
- Ensure `.env` file has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- Run: `npm install` to ensure @supabase/supabase-js is installed
- Run: `npm run verify-schema` again

## 📝 COMMIT INSTRUCTIONS

After successful verification, commit the migration:

```bash
git add .sisyphus/migrations/001-schema-redesign.sql
git add scripts/verify-schema.js
git add package.json
git commit -m "chore(db): add category, testimonials, shipping_costs schema + profiles address fields"
```

## 🔄 ROLLBACK (if needed)

If you need to undo the migration, run this SQL in Supabase SQL Editor:

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

## ✅ ACCEPTANCE CRITERIA

- [ ] SQL migration executes without errors in Supabase SQL Editor
- [ ] products table has category column with all rows populated
- [ ] testimonials table exists with 5 seed rows
- [ ] shipping_costs table exists with 5 rows (one per category)
- [ ] profiles table has phone, street, city, postal_code, country columns
- [ ] RLS policies allow authenticated users to read testimonials/shipping_costs
- [ ] `npm run verify-schema` passes all tests
- [ ] Migration committed to git

## 📚 REFERENCES

- Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor
- Supabase RLS Docs: https://supabase.com/docs/guides/auth/row-level-security
- Migration file: `.sisyphus/migrations/001-schema-redesign.sql`
- Verification script: `scripts/verify-schema.js`
