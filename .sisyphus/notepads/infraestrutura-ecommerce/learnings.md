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

## Task 4: Frontend Filter - useProducts & useProduct Hooks

### Key Learnings

1. **Defense-in-Depth Security Pattern**
   - RLS policies (Task 1) enforce is_active = true at database level for anonymous users
   - Frontend hooks add .eq('is_active', true) filter as additional layer
   - Both layers work together: DB prevents unauthorized access, frontend prevents accidental queries
   - Admin page (src/pages/admin/Products.jsx) fetches directly without using hooks - sees all products

2. **Hook Filter Placement**
   - In useProducts: Add .eq('is_active', true) after .select('*') and before .order()
   - In useProduct: Add .eq('is_active', true) after .select('*') and before .eq('id', id)
   - Order matters: filters are applied left-to-right in Supabase query chain
   - Multiple .eq() calls are combined with AND logic

3. **Hook Interface Preservation**
   - Filter is internal implementation detail - does NOT change hook params or return values
   - useProducts(options) still accepts same options (limit, orderBy, ascending)
   - useProduct(id) still accepts same id parameter
   - Return objects unchanged: { products, loading, error } and { product, loading, error }

4. **Query Chain Pattern**
   - Pattern: select ? filter ? order ? limit
   - Filters applied left-to-right in Supabase query chain
   - Multiple .eq() calls combined with AND logic

### Verification Checklist
- ? useProducts hook includes .eq('is_active', true) after .select('*')
- ? useProduct hook includes .eq('is_active', true) after .select('*')
- ? Hook interfaces unchanged (same params, same return)
- ? Build passes: 
pm run build
- ? Commit: ix(products): filtrar produtos ativos e permitir acesso an�nimo

### Integration Points
- Frontend hooks now filter active products for all public pages
- Admin page still sees all products (uses direct Supabase query, not hooks)
- RLS policies provide database-level enforcement
- Combined approach ensures no inactive products leak to frontend

- Cria��o de guia de setup Stripe em PT-PT para facilitar o handover e deploy em produ��o.
- Refor�o da necessidade de sincronizar segredos entre Stripe e Supabase Edge Functions.


 # #   T a s k   8 :   I n t e g r a r   U p l o a d   d e   I m a g e m   n a   P � g i n a   d e   P r o d u t o 
 
 # # #   F r o n t e n d   U p l o a d   I n t e g r a t i o n   P a t t e r n s 
 
 1 .   * * I m p o r t   O r g a n i z a t i o n * * 
       -   I m p o r t   u p l o a d C u s t o m i z a t i o n I m a g e   f r o m   ' . . / s e r v i c e s / s t o r a g e ' 
       -   I m p o r t   u s e A u t h   f r o m   ' . . / c o n t e x t / A u t h C o n t e x t '   f o r   u s e r   a u t h e n t i c a t i o n 
       -   I m p o r t   L o g i n M o d a l   f r o m   ' . . / c o m p o n e n t s / L o g i n M o d a l '   f o r   u n a u t h e n t i c a t e d   u s e r s 
       -   A l l   i m p o r t s   g r o u p e d   l o g i c a l l y   a t   t o p   o f   f i l e 
 
 2 .   * * S t a t e   M a n a g e m e n t * * 
       -   A d d   u p l o a d i n g   s t a t e :   c o n s t   [ u p l o a d i n g ,   s e t U p l o a d i n g ]   =   u s e S t a t e ( f a l s e ) 
       -   E x t r a c t   u s e r   a n d   s e t I s L o g i n M o d a l O p e n   f r o m   u s e A u t h   h o o k 
       -   u p l o a d e d I m a g e   s t a t e   n o w   s t o r e s   S u p a b a s e   p u b l i c   U R L   ( n o t   d a t a   U R L ) 
 
 3 .   * * U p l o a d   H a n d l e r   P a t t e r n * * 
       -   C o n v e r t   h a n d l e I m a g e U p l o a d   t o   a s y n c   f u n c t i o n 
       -   V a l i d a t e   f i l e   s i z e   b e f o r e   u p l o a d :   i f   ( f i l e . s i z e   >   5   *   1 0 2 4   *   1 0 2 4 ) 
       -   C h e c k   a u t h e n t i c a t i o n :   i f   ( ! u s e r )   {   s e t I s L o g i n M o d a l O p e n ( t r u e ) ;   r e t u r n ;   } 
       -   S h o w   l o a d i n g   s t a t e   d u r i n g   u p l o a d :   s e t U p l o a d i n g ( t r u e / f a l s e ) 
       -   U p l o a d   v i a   u p l o a d C u s t o m i z a t i o n I m a g e ( f i l e ,   u s e r . i d ) 
       -   H a n d l e   e r r o r s   w i t h   u s e r - f r i e n d l y   a l e r t :   ' E r r o   a o   e n v i a r   i m a g e m :   '   +   e r r o r . m e s s a g e 
       -   S e t   u p l o a d e d I m a g e   t o   d a t a . p u b l i c U r l   o n   s u c c e s s 
 
 4 .   * * U I   L o a d i n g   S t a t e * * 
       -   S h o w   L o a d e r 2   s p i n n e r   w h e n   u p l o a d i n g   i s   t r u e 
       -   L o a d i n g   s t a t e   r e p l a c e s   u p l o a d   a r e a   c o n t e n t   ( n o t   o v e r l a y e d ) 
       -   M e s s a g e :   ' A   e n v i a r   i m a g e m . . . '   i n   g r a y   t e x t 
       -   P r e v e n t   c l i c k s   d u r i n g   u p l o a d   ( u p l o a d i n g   c h e c k   b e f o r e   t r i g g e r F i l e I n p u t ) 
 
 5 .   * * L o g i n   M o d a l   I n t e g r a t i o n * * 
       -   A d d   L o g i n M o d a l   c o m p o n e n t   a t   e n d   o f   J S X   ( b e f o r e   c l o s i n g   m o t i o n . d i v ) 
       -   P a s s   i s L o g i n M o d a l O p e n   a n d   s e t I s L o g i n M o d a l O p e n   a s   p r o p s 
       -   M o d a l   a u t o m a t i c a l l y   h a n d l e s   l o g i n / r e g i s t e r   f l o w 
       -   U s e r   c a n   u p l o a d   a f t e r   s u c c e s s f u l   a u t h e n t i c a t i o n 
 
 6 .   * * E r r o r   H a n d l i n g   S t r a t e g y * * 
       -   F i l e   s i z e   v a l i d a t i o n :   a l e r t   w i t h   P o r t u g u e s e   m e s s a g e 
       -   A u t h e n t i c a t i o n   c h e c k :   o p e n   m o d a l   i n s t e a d   o f   g e n e r i c   a l e r t 
       -   U p l o a d   e r r o r s :   s h o w   e r r o r . m e s s a g e   f r o m   S u p a b a s e   ( d e s c r i p t i v e ) 
       -   R e s e t   u p l o a d i n g   s t a t e   i n   f i n a l l y   b l o c k   ( n o t   i m p l e m e n t e d   -   h a n d l e d   i n   i f / e l s e ) 
 
 # # #   I n t e g r a t i o n   P o i n t s 
 
 -   * * S t o r a g e   S e r v i c e * * :   u p l o a d C u s t o m i z a t i o n I m a g e ( f i l e ,   u s e r I d )   r e t u r n s   {   d a t a :   {   p u b l i c U r l   } ,   e r r o r   } 
 -   * * A u t h C o n t e x t * * :   P r o v i d e s   u s e r   o b j e c t   w i t h   i d ,   a n d   m o d a l   s t a t e   m a n a g e m e n t 
 -   * * L o g i n M o d a l * * :   H a n d l e s   a u t h e n t i c a t i o n   f l o w   w h e n   u s e r   c l i c k s   u p l o a d   w i t h o u t   l o g i n 
 -   * * C a r t * * :   u p l o a d e d I m a g e   ( S u p a b a s e   U R L )   s t o r e d   i n   c u s t o m i z a t i o n   o b j e c t   w h e n   a d d i n g   t o   c a r t 
 
 # # #   K e y   D e c i s i o n s 
 
 1 .   * * L o g i n   M o d a l   v s   A l e r t * * :   U s e   s e t I s L o g i n M o d a l O p e n ( t r u e )   i n s t e a d   o f   a l e r t   -   b e t t e r   U X 
 2 .   * * F i l e   S i z e   L i m i t * * :   5 M B   c l i e n t - s i d e   v a l i d a t i o n   b e f o r e   u p l o a d   -   p r e v e n t s   u n n e c e s s a r y   A P I   c a l l s 
 3 .   * * L o a d i n g   S t a t e * * :   S h o w   s p i n n e r   i n   u p l o a d   a r e a   ( n o t   s e p a r a t e   o v e r l a y )   -   c l e a r e r   f e e d b a c k 
 4 .   * * E r r o r   M e s s a g e s * * :   U s e   e r r o r . m e s s a g e   f r o m   S u p a b a s e   -   m o r e   d e s c r i p t i v e   t h a n   g e n e r i c   e r r o r 
 5 .   * * S t a t e   C l e a n u p * * :   D o n ' t   a u t o - c l e a r   u p l o a d e d I m a g e   o n   e r r o r   -   u s e r   c a n   r e t r y   w i t h o u t   r e - s e l e c t i n g   f i l e 
 
 # # #   V e r i f i c a t i o n   C h e c k l i s t 
 -   '  I m p o r t s :   u p l o a d C u s t o m i z a t i o n I m a g e ,   u s e A u t h ,   L o g i n M o d a l 
 -   '  S t a t e :   u p l o a d i n g   s t a t e   a d d e d 
 -   '  H a n d l e r :   a s y n c   h a n d l e I m a g e U p l o a d   w i t h   v a l i d a t i o n ,   a u t h   c h e c k ,   u p l o a d 
 -   '  U I :   L o a d i n g   s p i n n e r   s h o w s   d u r i n g   u p l o a d 
 -   '  M o d a l :   L o g i n M o d a l   c o m p o n e n t   a d d e d   t o   J S X 
 -   '  B u i l d :   n p m   r u n   b u i l d   p a s s e s 
 -   '  C o m m i t :   f e a t ( u p l o a d ) :   i n t e g r a r   u p l o a d   d e   i m a g e m   n a   p e r s o n a l i z a � � o   d o   p r o d u t o 
  
 