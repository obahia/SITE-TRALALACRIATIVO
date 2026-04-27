# QUICK REFERENCE — Task 1 Execution

## 🎯 What to Do (5 minutes)

### 1. Execute SQL Migration
```
1. Go to: https://supabase.com/dashboard
2. Select: Tralalá Criativo project
3. Click: SQL Editor → New Query
4. Copy: .sisyphus/migrations/001-schema-redesign.sql (entire file)
5. Paste into SQL Editor
6. Click: Run
7. Wait for ✅ success
```

### 2. Verify in Dashboard
- **products**: Check `category` column exists, all rows populated
- **testimonials**: Check 5 rows exist
- **shipping_costs**: Check 5 rows with prices
- **profiles**: Check address columns exist

### 3. Run Verification Script
```bash
npm run verify-schema
```

### 4. Commit
```bash
git add .sisyphus/migrations/001-schema-redesign.sql scripts/verify-schema.js package.json
git commit -m "chore(db): add category, testimonials, shipping_costs schema + profiles address fields"
```

## 📊 What Gets Created

| Table | Columns | Rows | Purpose |
|-------|---------|------|---------|
| products | category (new) | existing | Filter products by type |
| testimonials | id, name, message, rating, avatar_url, created_at | 5 | Customer reviews carousel |
| shipping_costs | id, category, cost | 5 | Fixed shipping per category |
| profiles | phone, street, city, postal_code, country (new) | existing | User address for shipping |

## ✅ Success Criteria

- [ ] SQL runs without errors
- [ ] All 4 tables/columns exist in Supabase
- [ ] `npm run verify-schema` shows all ✅ PASS
- [ ] Changes committed to git

## 🚨 If Something Goes Wrong

| Problem | Solution |
|---------|----------|
| "Column already exists" | Check Supabase Table Editor; if column exists, migration already applied |
| "Constraint violation" | Some products may have invalid categories; manually fix, then re-run |
| "Permission denied" | Ensure logged in as project owner in Supabase dashboard |
| verify-schema fails | Check .env has correct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY |

## 📁 Files Created

```
.sisyphus/
├── migrations/
│   └── 001-schema-redesign.sql          ← SQL migration (140 lines)
├── TASK-1-EXECUTION.md                  ← Step-by-step guide
├── MIGRATION_GUIDE.md                   ← Comprehensive guide
├── TASK-1-SUMMARY.md                    ← This summary
└── evidence/
    └── task-1-qa-template.md            ← QA templates

scripts/
└── verify-schema.js                     ← Verification script

package.json                             ← Added verify-schema script
```

## 🔗 Next Tasks

After Task 1 completes:
- **Task 2**: Vitest + Testing Library setup
- **Task 3**: Auth — "Esqueci a Senha"
- **Task 4**: Visual consistency pass
- **Wave 2**: Tasks 5-9 (can run in parallel)

---

**Estimated Time**: 5-10 minutes
**Difficulty**: Easy (copy-paste SQL, run verification)
**Risk**: Low (idempotent migration, no breaking changes)
