# Learnings - Infraestrutura E-commerce

## Conventions & Patterns

## Task 1: Fix RLS Policies + Profile Trigger

### RLS Policy Patterns
- **Anonymous Access**: Use `USING (condition)` WITHOUT `TO authenticated` to allow anon users (e.g., products)
- **User Isolation**: Use `USING (auth.uid() = user_id)` for SELECT/UPDATE/DELETE
- **Insert Validation**: Use `WITH CHECK (condition)` for INSERT policies
- **Cross-table Validation**: Use subqueries in WITH CHECK for order_items (validate order ownership)

### Trigger Implementation
- **Function**: Use `SECURITY DEFINER` to allow trigger to insert into profiles table
- **Metadata Extraction**: Use `NEW.raw_user_meta_data->>'field_name'` to extract JSON fields
- **Trigger Timing**: Use `AFTER INSERT ON auth.users` to ensure user exists before profile creation

### Migration Structure
- Always use `DROP POLICY IF EXISTS` before `CREATE POLICY` to avoid conflicts
- Always use `DROP FUNCTION IF EXISTS` before `CREATE FUNCTION`
- Always use `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`
- Include instruction comment at top: "Execute este SQL no Supabase SQL Editor"

### Integration Points
- CartContext queries cart_items with `.eq('user_id', user.id)` - compatible with RLS
- CartContext inserts order_items with order_id - compatible with RLS policy that validates order ownership
- AuthContext sends first_name, last_name in signup metadata - compatible with trigger extraction

### Key Decisions
1. Products policy allows anonymous access (no TO authenticated) for public product listing
2. cart_items has 4 separate policies (SELECT, INSERT, UPDATE, DELETE) for granular control
3. order_items only has INSERT policy (users create items during checkout, don't update/delete)
4. Trigger uses SECURITY DEFINER to bypass RLS when creating profiles for new users

## Task 2: Stripe Currency & Payment Methods Fix

### Key Learnings

1. **Currency Configuration in Stripe Edge Function**
   - Currency must be set in `price_data` object, not at session level
   - EUR requires 2 decimal places (cents) - `unit_amount: Math.round(item.price * 100)` is correct
   - Frontend constants (src/constants.js) define CURRENCY: 'EUR' - Edge Function must match

2. **Locale & Payment Methods**
   - `locale: 'pt'` enables Portuguese UI in Stripe Checkout
   - `payment_method_types: ['card', 'multibanco']` enables both card and Multibanco (Portuguese payment method)
   - Multibanco requires Stripe Dashboard configuration (not code-level)

3. **Edge Function Structure**
   - CORS headers must remain unchanged for frontend integration
   - Validation logic (price > 0, quantity > 0) is critical before Stripe call
   - Metadata (orderId) is preserved for order tracking

### Implementation Pattern
```typescript
// Correct pattern for EUR + Portuguese checkout
const line_items = cartItems.map(item => ({
  price_data: {
    currency: 'eur',  // Set at price_data level
    product_data: { name: item.name, images: [...] },
    unit_amount: Math.round(item.price * 100),  // EUR cents
  },
  quantity: item.quantity,
}))

const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card', 'multibanco'],
  line_items,
  mode: 'payment',
  locale: 'pt',  // Portuguese interface
  success_url, cancel_url,
  metadata: { orderId },
})
```

### Verification Checklist
- ✅ Currency matches frontend constants
- ✅ Locale set to Portuguese
- ✅ Payment methods include Multibanco
- ✅ Unit amount calculation correct for EUR cents
- ✅ CORS headers preserved
- ✅ Validation logic intact

