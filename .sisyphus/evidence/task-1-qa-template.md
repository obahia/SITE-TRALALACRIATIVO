# Task 1 QA Evidence Template

## Scenario 1: Verify products have category column
**Status**: [PENDING - Awaiting manual SQL execution]
**Tool**: Bash (curl via Supabase REST API)
**Evidence File**: task-1-products-category.txt

### Steps:
1. Execute SQL migration in Supabase SQL Editor
2. Run: `npm run verify-schema`
3. Verify output shows: "✅ PASS: All X sampled products have category values"

### Expected Result:
- All products have a valid category value
- Sample output shows categories like: canecas, camisetas, azulejos, kits, tote_bags

---

## Scenario 2: Verify testimonials table exists and has seed data
**Status**: [PENDING - Awaiting manual SQL execution]
**Tool**: Bash (node script querying Supabase)
**Evidence File**: task-1-testimonials-seed.txt

### Steps:
1. Execute SQL migration
2. Run: `npm run verify-schema`
3. Verify output shows: "✅ PASS: Found 5 testimonials with valid data"

### Expected Result:
- 5 testimonials returned with valid data
- Each has: name, message, rating (1-5), created_at
- Sample: "Maria Silva" - Rating: 5⭐

---

## Scenario 3: Verify shipping_costs table with category prices
**Status**: [PENDING - Awaiting manual SQL execution]
**Tool**: Bash (node script)
**Evidence File**: task-1-shipping-costs.txt

### Steps:
1. Execute SQL migration
2. Run: `npm run verify-schema`
3. Verify output shows: "✅ PASS: All 5 categories present with valid costs"

### Expected Result:
- 5 categories with valid prices:
  - canecas: €4.50
  - camisetas: €3.50
  - azulejos: €5.00
  - kits: €6.00
  - tote_bags: €3.50

---

## Scenario 4: Verify profiles table has address fields
**Status**: [PENDING - Awaiting manual SQL execution]
**Tool**: Bash (node script)
**Evidence File**: task-1-profiles-address.txt

### Steps:
1. Execute SQL migration
2. Run: `npm run verify-schema`
3. Verify output shows: "✅ PASS: All address columns exist"

### Expected Result:
- Columns exist: phone, street, city, postal_code, country
- country has default value 'PT'

---

## Summary
All QA scenarios are ready to execute after manual SQL migration in Supabase dashboard.
See `.sisyphus/TASK-1-EXECUTION.md` for step-by-step instructions.
