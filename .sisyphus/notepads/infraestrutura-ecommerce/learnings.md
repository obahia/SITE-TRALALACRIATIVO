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

## Task 3: Security — .gitignore + Remove .env from Git

### Key Learnings

1. **.env File Management**
   - `.env` should NEVER be committed to git (contains real API keys)
   - `.env` must be listed in `.gitignore` (line 14 in this project)
   - `.env.example` should contain only placeholders (no real values)
   - Local `.env` file is never tracked by git (safe for development)

2. **Environment Variables in Vite**
   - Variables prefixed with `VITE_` are exposed to frontend (safe for public keys)
   - Supabase anon key is safe to expose (read-only, scoped by RLS)
   - Stripe publishable key is safe to expose (public key for frontend)
   - Stripe secret key must NEVER be in `.env` (goes in Supabase Edge Function secrets)

3. **Dynamic URL Construction**
   - Success/cancel URLs for Stripe should be constructed dynamically
   - Use `window.location.origin` to build URLs (works in dev and production)
   - Pattern: `${window.location.origin}/sucesso` instead of hardcoded `http://localhost:5173/sucesso`
   - This eliminates need for VITE_SUCCESS_URL and VITE_CANCEL_URL in `.env`

4. **Git Operations with Ignored Files**
   - `git add .env` fails if `.env` is in `.gitignore` (expected behavior)
   - Use `git add -f .env` only if you intentionally want to track an ignored file (rare)
   - `git ls-files .env` returns empty if file is not tracked (correct state)
   - `git log -- .env` returns empty if file was never committed (correct state)

### Implementation Pattern
```
.gitignore:
  .env                    # Local environment variables (never commit)
  .env.local              # Local overrides
  .env.*.local            # Environment-specific overrides

.env.example:
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
  VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key

.env (local, never committed):
  VITE_SUPABASE_URL=https://actual-url.supabase.co
  VITE_SUPABASE_ANON_KEY=actual-key-here
  VITE_STRIPE_PUBLISHABLE_KEY=pk_test_actual_key
```

### Verification Checklist
- ✅ `.env` listed in `.gitignore`
- ✅ `.env` not tracked by git (`git ls-files .env` returns empty)
- ✅ `.env.example` contains only placeholders
- ✅ Removed unnecessary hardcoded URLs from `.env`
- ✅ Dynamic URL construction used in CartContext
- ✅ Commit created: `chore(security): remover .env do git e atualizar .gitignore`


## Task 5: Supabase Storage Bucket + Upload Service

### Storage Service Patterns

1. **Service File Structure**
   - Import supabase client from './supabase'
   - Define bucket name as constant: `const BUCKET_NAME = 'customization-images'`
   - Export async functions for upload, get, delete operations
   - Return consistent response format: `{ data, error }`

2. **Upload Function Design**
   - Accept `file` and `userId` parameters for user isolation
   - Validate inputs before upload (if !file || !userId)
   - Construct path with userId: `/-`
   - Return both storage path and public URL in success response
   - Use `Date.now()` for timestamp to avoid filename collisions

3. **Path Structure Pattern**
   - Format: `customization-images/{userId}/{timestamp}-{filename}`
   - userId ensures user folder isolation (compatible with RLS policies)
   - Timestamp prevents filename collisions
   - Original filename preserved for user clarity

4. **Public URL Generation**
   - Use `supabase.storage.from(bucket).getPublicUrl(path)`
   - Returns `{ data: { publicUrl } }` - no error handling needed
   - Public URLs work even for private buckets (RLS still enforced on access)

5. **Delete Operation**
   - Use `supabase.storage.from(bucket).remove([path])`
   - Pass path as array (even for single file)
   - Compatible with RLS DELETE policies

### Storage Migration Patterns

1. **Bucket Creation SQL**
   - Use `INSERT INTO storage.buckets (id, name, public)`
   - Set `public: false` for authenticated-only access
   - Use `ON CONFLICT (id) DO NOTHING` to make migration idempotent

2. **Storage Policy Structure**
   - Policies apply to `storage.objects` table (not storage.buckets)
   - Always use `DROP POLICY IF EXISTS` before `CREATE POLICY`
   - Use `TO authenticated` to restrict to logged-in users
   - Use `bucket_id = 'bucket-name'` to scope policy to specific bucket

3. **Path-based User Isolation**
   - Use `storage.foldername(name)` to extract folder path components
   - First folder is userId: `(storage.foldername(name))[1] = auth.uid()::text`
   - Cast `auth.uid()` to text for string comparison
   - This pattern enforces user folder isolation in RLS policies

4. **Policy Types for Storage**
   - **INSERT**: Control who can upload (WITH CHECK clause)
   - **SELECT**: Control who can view/download (USING clause)
   - **DELETE**: Control who can remove files (USING clause)
   - **UPDATE**: Not typically used for storage objects

5. **Admin Access Pattern**
   - Create separate SELECT policy for admins
   - Use `EXISTS` subquery to check `profiles.role = 'admin'`
   - Allows admins to bypass user isolation for viewing files

### Integration Points

- **Frontend Upload Flow** (Task 8 will implement):
  - Get authenticated user's ID from AuthContext
  - Pass file and userId to uploadCustomizationImage()
  - Store returned path in customization data
  - Display publicUrl in preview

- **RLS Enforcement**:
  - Storage policies check folder path matches auth.uid()
  - Users can only upload/view/delete files in their own folder
  - Admins can view all files but still respect bucket-level permissions

### Key Decisions

1. **Private Bucket**: Set `public: false` to enforce authentication (even though publicUrl works, RLS still applies)
2. **Timestamp in Filename**: Prevents collisions if user uploads same filename multiple times
3. **No File Validation**: Deferred to frontend (Task 8) - keeps storage service simple
4. **No Compression/Thumbnails**: Out of scope for MVP - can be added later via Edge Functions
5. **Admin View-Only**: Admins can SELECT all images but cannot delete user files (separate policy would be needed)

### Verification Checklist

- ? `src/services/storage.js` created with 3 exported functions
- ? Upload path uses userId: `/-`
- ? Bucket name: `customization-images`
- ? Migration SQL created with bucket + 4 RLS policies
- ? Policies use `storage.foldername(name)` for path-based isolation
- ? Evidence file created: `.sisyphus/evidence/task-5-storage-service-qa.txt`
- ? Commit: `feat(storage): adicionar servi�o de upload de imagens para personaliza��o`
## Task 6: Corrigir Página /sucesso com Verificação de Pagamento

### Key Learnings

1. **Payment Verification Flow**
   - Extract orderId from URL: const orderId = searchParams.get('orderId')
   - Query order status: supabase.from('orders').select('status, user_id').eq('id', orderId).single()
   - Verify order belongs to user: order.user_id === user.id
   - Redirect if invalid: navigate('/') for missing orderId, order not found, or wrong user

2. **Polling Implementation**
   - Interval: 3000ms (3 seconds) for status checks
   - Timeout: 30000ms (30 seconds) maximum polling duration
   - Pattern: setInterval(() => checkOrderStatus(), 3000) with setTimeout for timeout
   - Cleanup: Always clear both interval and timeout on unmount

3. **Cart Clearing Logic**
   - Only call clearCart() when status === 'pago'
   - Do NOT clear cart on 'pendente' status
   - Do NOT clear cart if order validation fails
   - clearCart() is async - use await to ensure completion

4. **UI States**
   - Loading: Blue Loader icon, "A Verificar Pagamento" heading, no buttons
   - Timeout: Yellow ShoppingBag icon, "A Verificar Pagamento" heading, with buttons
   - Success: Green CheckCircle icon, "Pagamento Confirmado!" heading, with buttons
   - All states preserve original design (icons, layout, colors, Tailwind classes)

5. **Security Considerations**
   - Always verify order.user_id === user.id before showing order details
   - Redirect to home page for unauthorized access attempts
   - Use .single() to ensure exactly one order is returned
   - Handle both error and null cases in query response

6. **useEffect Dependencies**
   - Include: [orderId, user, navigate, clearCart]
   - These dependencies ensure polling restarts if orderId or user changes
   - Cleanup function clears intervals/timeouts to prevent memory leaks

### Verification Checklist
- ✅ Query logic: supabase.from('orders').select('status, user_id').eq('id', orderId).single()
- ✅ Polling interval: 3000ms
- ✅ Polling timeout: 30000ms
- ✅ clearCart() only when status === 'pago'
- ✅ Redirect for invalid orderId or wrong user
- ✅ 3 UI states: loading, timeout, success
- ✅ Cleanup: intervals and timeouts cleared on unmount
- ✅ Design preserved: Same icons, layout, colors
- ✅ Imports: useAuth, useNavigate, supabase, Loader icon
- ✅ Dependencies: [orderId, user, navigate, clearCart]

### Commit Message
fix(checkout): verificar pagamento na página de sucesso
