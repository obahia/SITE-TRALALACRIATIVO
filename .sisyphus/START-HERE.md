# 🚀 TASK 1 — READY TO EXECUTE

## What's Been Prepared

All SQL migrations, verification scripts, and documentation are ready. You just need to:

1. **Execute SQL** in Supabase dashboard (copy-paste, click Run)
2. **Verify** in Supabase Table Editor (quick visual check)
3. **Run script** locally (`npm run verify-schema`)
4. **Commit** to git

## 📋 STEP-BY-STEP EXECUTION

### Step 1: Open Supabase SQL Editor (2 min)
```
1. Go to: https://supabase.com/dashboard
2. Select: Tralalá Criativo project
3. Click: SQL Editor (left sidebar)
4. Click: New Query button
```

### Step 2: Copy & Paste SQL (1 min)
```
1. Open: .sisyphus/migrations/001-schema-redesign.sql
2. Copy: ALL content (140 lines)
3. Paste: Into Supabase SQL Editor
4. Click: Run button
5. Wait: < 5 seconds for completion
6. Check: ✅ Success message (no errors)
```

### Step 3: Verify in Dashboard (3 min)
Check these tables in Supabase Table Editor:

**products table**
- [ ] New column `category` exists
- [ ] All rows have a category value (canecas, camisetas, azulejos, kits, tote_bags)

**testimonials table**
- [ ] Table exists
- [ ] 5 rows visible
- [ ] Columns: id, name, message, rating, avatar_url, created_at

**shipping_costs table**
- [ ] Table exists
- [ ] 5 rows visible (one per category)
- [ ] Prices: canecas 4.50, camisetas 3.50, azulejos 5.00, kits 6.00, tote_bags 3.50

**profiles table**
- [ ] New columns exist: phone, street, city, postal_code, country
- [ ] country column has default value 'PT'

### Step 4: Run Verification Script (1 min)
```bash
npm run verify-schema
```

Expected output:
```
✅ PASS: All X sampled products have category values
✅ PASS: Found 5 testimonials with valid data
✅ PASS: All 5 categories present with valid costs
✅ PASS: All address columns exist
✅ PASS: RLS policies allow authenticated reads
✅ All verification tests PASSED
```

### Step 5: Commit to Git (1 min)
```bash
git add .sisyphus/migrations/001-schema-redesign.sql
git add scripts/verify-schema.js
git add package.json
git commit -m "chore(db): add category, testimonials, shipping_costs schema + profiles address fields"
```

## ⏱️ Total Time: ~10 minutes

## 📚 Documentation Available

If you need more details:
- **Quick Reference**: `.sisyphus/QUICK-REFERENCE.md`
- **Execution Guide**: `.sisyphus/TASK-1-EXECUTION.md`
- **Comprehensive Guide**: `.sisyphus/MIGRATION_GUIDE.md`
- **Full Summary**: `.sisyphus/TASK-1-SUMMARY.md`
- **Checklist**: `.sisyphus/TASK-1-CHECKLIST.md`

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Column already exists" | Migration already applied; skip to Step 4 |
| "Constraint violation" | Check product titles; some may need manual category assignment |
| "Permission denied" | Ensure logged in as project owner in Supabase |
| verify-schema fails | Check .env has correct Supabase credentials |

## ✅ Success Criteria

- [ ] SQL executes without errors
- [ ] All 4 tables/columns exist in Supabase
- [ ] `npm run verify-schema` shows all ✅ PASS
- [ ] Changes committed to git

---

**Status**: ✅ READY TO EXECUTE
**Prepared**: 2026-04-27
**Estimated Time**: 5-10 minutes
**Difficulty**: Easy (copy-paste + verification)
