# Learnings — Redesign Tralalá Criativo

## Conventions & Patterns

_(Agents will append findings here after each task)_

## Task 1: Supabase Schema Changes

### Key Findings
- **Migration Strategy**: SQL migrations are executed via Supabase SQL Editor (dashboard), not via CLI
- **RLS Pattern**: All new tables (testimonials, shipping_costs) have RLS enabled with authenticated read policies
- **Category Constraint**: CHECK constraint on products.category ensures only valid values (canecas, camisetas, azulejos, kits, tote_bags)
- **Profiles Trigger**: Existing profiles table has trigger on auth.users insert; new address columns don't break this
- **Shipping Logic**: Fixed costs per category (not per item) — sum unique categories in cart

### Successful Patterns
1. **Idempotent Migrations**: Use `IF NOT EXISTS` / `IF EXISTS` for safety
2. **RLS for New Tables**: Always enable RLS and create read policies for authenticated users
3. **Seed Data in Migration**: Include INSERT statements in migration for initial data
4. **Address Fields**: All nullable except country (default 'PT')

### Schema Structure
- **products.category**: TEXT NOT NULL, CHECK constraint, auto-populated from title/description
- **testimonials**: id (uuid PK), name, message, rating (1-5), avatar_url (nullable), created_at
- **shipping_costs**: id (uuid PK), category (unique), cost (numeric), created_at, updated_at
- **profiles address fields**: phone, street, city, postal_code, country (default 'PT')

### Verification Approach
- Created `scripts/verify-schema.js` for automated testing
- Added `npm run verify-schema` script to package.json
- Tests: category population, testimonials seed, shipping costs, address columns, RLS policies

### CRITICAL UPDATE (2026-04-27): Actual Schema Discovery

- **products.category ALREADY EXISTS** ✅ — no DDL needed for this
- **Actual categories**: 'Azulejos', 'Camisetas', 'Canecas', 'Acessórios' (capitalized Portuguese!)
- **Column is `name` NOT `title`** — products use `name` field
- **10 products total**: 2 Azulejos, 1 Camiseta, 1 Caneca, 6 Acessórios
- **profiles columns**: id, first_name, last_name, email, stripe_customer_id (NO address fields yet)
- **testimonials table**: DOES NOT EXIST yet
- **shipping_costs table**: DOES NOT EXIST yet

### DDL Blocker

- The anon key (`VITE_SUPABASE_ANON_KEY`) CANNOT execute DDL (CREATE TABLE, ALTER TABLE)
- Need either: service_role key, database password, or Supabase Dashboard SQL Editor
- Updated migration at `.sisyphus/migrations/001-schema-redesign.sql` to only include remaining changes
- **RLS policies changed**: Use `USING (true)` for public read (testimonials/shipping visible without login)

### Unblocked by Discovery

- **Task 7 (filters)**: UNBLOCKED — category already exists in products!
- **Task 5, 6**: Were never blocked (pure UI)
- **Tasks 8, 9**: Frontend can be built with graceful fallbacks

### Next Steps
- Execute migration via Supabase Dashboard: https://supabase.com/dashboard/project/riioszwtwjbestbxbzxu/sql
- Run `node --env-file=.env scripts/verify-schema.js` after migration
- Frontend code uses graceful fallbacks when tables don't exist

## Task 2: Vitest + Testing Library Setup

### Key Findings
- **Vitest Configuration**: Simple setup with jsdom environment works out of the box
- **No Path Aliases Yet**: vite.config.js doesn't define resolve.alias, so vitest.config.js kept minimal
- **Setup File Pattern**: @testing-library/jest-dom must be imported in setup file for matchers like toBeInTheDocument()
- **Globals Pattern**: Vitest globals: true allows using describe/it/expect without imports

### Successful Patterns
1. **Minimal vitest.config.js**: Only needs environment, globals, and setupFiles
2. **Smoke Test Structure**: Simple component render + assertion validates entire setup
3. **Test Scripts**: Both "test" (run once) and "test:watch" (watch mode) are useful

### Dependencies Installed
- vitest@4.1.5
- @testing-library/react (latest)
- @testing-library/jest-dom (latest)
- @testing-library/user-event (latest)
- jsdom (latest)

### Next Steps
- Task 13 will add business logic tests
- Path aliases should be added to both vite.config.js and vitest.config.js when needed

## Task 4: Unify Hover Colors & Spacing Consistency

### Key Findings
- **Gold Color Removal**: Single occurrence of `#e8b65a` found in Header.jsx (navLinkStyle and cart icon)
- **Container Padding Inconsistency**: Found 3 pages with `px-4` instead of standard `px-8 md:px-16 lg:px-32`
  - Sobre.jsx: Changed from `px-4` to `px-8`
  - produtos.jsx: Changed from `px-4` to `px-8`
  - produtodetalhe.jsx: Changed from `px-4` to `px-8`
- **Border-Radius**: Already consistent across codebase (rounded-full, rounded-xl, rounded-2xl, rounded-lg, rounded-md, custom rounded-[2rem]/rounded-[3rem])
- **Cursor-Pointer**: Added to 8 interactive elements missing the class

### Changes Made
1. **Header.jsx (line 44)**: navLinkStyle hover changed from `hover:bg-[#e8b65a] hover:text-white` to `hover:bg-brand-blue/10 hover:text-brand-blue`
2. **Header.jsx (line 70)**: Cart icon hover changed from `group-hover:text-[#e8b65a]` to `group-hover:text-brand-blue`
3. **Container Padding**: Standardized across Sobre.jsx, produtos.jsx, produtodetalhe.jsx
4. **Cursor-Pointer**: Added to buttons in CartSideBar.jsx (3), Header.jsx (4), home.jsx (2), produtodetalhe.jsx (1)

### Build Status
- ✅ `npm run build` succeeded with no errors
- ✅ Zero occurrences of `#e8b65a` remaining in codebase
- ⚠️ Chunk size warning (567.51 kB) - not critical for this task

### Patterns Established
- Brand color palette: brand-blue (#0ea5e9), brand-pink (#ec4899), brand-dark (#0284c7)
- Standard container padding: `px-8 md:px-16 lg:px-32` (mobile-first responsive)
- All interactive elements must have `cursor-pointer` class
- Hover states use brand colors with opacity modifiers (e.g., `hover:bg-brand-blue/10`)
- useLocation from react-router-dom is an effective way to handle active nav states without prop-drilling or separate context.
- Framer Motion side-drawer pattern (AnimatePresence + fixed overlays) works exceptionally well for mobile navigation menus, replacing static dropdowns.
- Document body scroll lock in useEffect with cleanup is critical when overlay sidebars are opened.

## Task 6: Footer Redesign

### Key Findings
- Responsive grid layouts work well for standard footers (`grid-cols-1 md:grid-cols-3`).
- lucide-react icons integrated easily (`Phone`, `Instagram`, `MapPin`).
- React Router `<Link>` should always have block/inline-block sizing (like `w-fit`) so hover area doesn't overextend.
- Brand styles properly reused: `text-brand-blue` for headers, `text-gray-500` for secondary text, and `hover:text-brand-pink` for interactions.

## Products Page Filters & Search (Task 7)

**Implementation Details:**
- Added category filter pills: Todos, Canecas, Camisetas, Azulejos, Acessórios
- Pills use active state styling: `bg-brand-blue text-white` when selected, `bg-gray-100 text-gray-600 hover:bg-brand-blue/10` when inactive
- Search bar with Search icon (lucide-react) positioned above filter pills
- Combined filter logic: category AND search text (case-insensitive, checks name + description)
- Client-side filtering using `Array.filter()` - keeps all products in state, filters on render

**Animation Approach:**
- Stagger animation using Framer Motion variants on grid container
- Container: `staggerChildren: 0.05` in variants
- Each card wrapper: `initial={{ opacity: 0, y: 20 }}` → `animate={{ opacity: 1, y: 0 }}`
- Duration: 0.4s per card, creating smooth cascade effect

**UX Enhancements:**
- Product count displayed: "X produto(s)" (singular/plural handled)
- Empty state shows Package icon + "Nenhum produto encontrado" + hint to adjust filters
- Filter pills have smooth transition-all duration-300
- Search input has focus states: `focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20`

**Key Pattern:**
- Filter logic checks for nullish search query with `!searchQuery ||` to allow empty search
- Description safety check: `p.description && p.description.toLowerCase()...` to avoid null errors
- Conditional rendering: only show grid when `!loading && filteredProducts.length > 0`

**File Modified:** src/pages/produtos.jsx (+94 lines, -18 lines)
**Commit:** feat(products): category filters + search bar (8c87b67)


- TestimonialCarousel implemented reusing home.jsx horizontal scroll pattern. Included hardcoded fallback data for Supabase 'testimonials' table in case it doesn't exist yet.

## Task 8: User Profile Page with Address Management

### Key Findings
- **Route Protection Pattern**: Combine `useAuth` + `useNavigate` + `useEffect` to redirect unauthenticated users
  ```jsx
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate('/'); }, [user, navigate]);
  ```
- **Supabase Profile Loading**: Use `.select('*').eq('id', user.id).single()` to fetch user profile data on mount
- **Supabase Profile Updates**: Use `.update({...}).eq('id', user.id)` for partial updates (personal data, address)
- **Password Change**: Use `supabase.auth.updateUser({ password: newPassword })` (NOT profiles table)
- **Graceful Degradation**: Address fields (phone, street, city, postal_code, country) may not exist in DB yet
  - Handle update errors that mention "column" → show "Funcionalidade em breve disponível" message
  - Personal data fields (first_name, last_name) WILL work since they already exist in profiles table

### Successful Patterns
1. **Form Input Styling**: Reused LoginModal pattern for consistency
   - Input: `w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 outline-none transition-all`
   - Icon positioning: `absolute left-4 top-3.5 text-gray-400`
   - Read-only inputs: `bg-gray-100 cursor-not-allowed` with "Apenas leitura" label

2. **Section Cards**: Consistent layout for profile sections
   - Container: `bg-white rounded-2xl shadow-sm p-6 border border-gray-100`
   - Section header: `text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2`
   - Icon: Lucide-react icon with `text-brand-blue` (User, MapPin, Lock)

3. **Feedback Messages**: Unified message component with type-based styling
   - Success: `bg-green-50 border-green-200 text-green-700`
   - Warning: `bg-yellow-50 border-yellow-200 text-yellow-700`
   - Error: `bg-red-50 border-red-200 text-red-700`
   - Motion entrance: `initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}`

4. **Submit Button States**: Loading state with Loader2 icon
   - Disabled when loading: `disabled:opacity-70 disabled:cursor-not-allowed`
   - Loading indicator: `<Loader2 className="animate-spin" size={20} />`
   - Different gradients for different actions (blue for save, pink for password)

### Header Integration
- **Desktop User Area**: Added Perfil link between user name display and logout button
  - Link uses User icon (lucide-react) already imported
  - Styling: `p-2 text-gray-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-full transition-colors cursor-pointer`
  - Title attribute: "Meu Perfil" for accessibility

- **Mobile User Area**: Added "Meu Perfil" link to drawer nav menu
  - Only shown when user is logged in: `{user && <Link to="/perfil">...}`
  - Uses same getNavLinkStyle function for active state indicator
  - Closes drawer on navigation: `onClick={() => setIsMenuOpen(false)}`

### Password Validation
- Minimum 6 characters check before attempting update
- Password confirmation match validation: `newPassword !== confirmPassword`
- Clear form fields after successful password change
- Error handling for Supabase auth errors

### Page Structure
- Three independent sections (each with own form submit):
  1. **Dados Pessoais**: first_name, last_name, email (read-only)
  2. **Endereço de Envio**: phone, street, city, postal_code, country
  3. **Alterar Senha**: newPassword, confirmPassword

- Each section has its own loading state to prevent blocking other sections
- Message state is shared across all sections (only one message shown at a time)

### File Changes
- **Created**: `src/pages/perfil.jsx` (new profile page component)
- **Modified**: `src/App.jsx` (added `/perfil` route in AnimatedRoutes)
- **Modified**: `src/components/Header.jsx` (added Perfil link for logged-in users - desktop + mobile)

### Build Status
- ✅ `npm run build` succeeded with no errors
- ✅ All interactive elements have `cursor-pointer` class
- ✅ Consistent with established brand color palette

### Patterns Established
- Profile pages should have separate forms for different data sections (not one giant form)
- Route protection should happen early in useEffect to avoid rendering protected content
- Password change is separate from profile data updates (uses auth API, not database)
- Address fields should handle missing columns gracefully for progressive enhancement
- Form submissions should have individual loading states when sections are independent

**Commit:** feat(profile): user profile page with address management (2d90273)

## Task 10: Google Maps Embed + Contact Info (Sobre Page)

### Key Findings
- **Google Maps Embed**: Simple iframe embed without API key works perfectly
  - URL: `https://maps.google.com/maps?q=Av.+Marqués+de+Pombal+226+Leiria+Portugal&output=embed`
  - Attributes: `width="100%"`, `height="300"`, `allowFullScreen=""`, `loading="lazy"`, `referrerPolicy="no-referrer-when-downgrade"`
  - Styling: `border: 0` inline style, `rounded-2xl` class for border-radius, `shadow-lg` for depth

### Implementation Details
- **Section Structure**: New card below existing Lívia Dutra content with matching glassmorphism styling
  - Container: `bg-white/60 backdrop-blur-md rounded-[3rem] p-8 md:p-12 shadow-xl border border-white/50`
  - Decorative blurred circles: `bg-brand-blue/20` and `bg-brand-pink/20` positioned at corners
  - Spacing: `mt-12` between sections for visual separation

- **Responsive Layout**: `grid md:grid-cols-2 gap-8`
  - Desktop: Map on left, contact info on right
  - Mobile: Stacked vertically (single column)
  - Map height: 300px (responsive width with `width="100%"`)

- **Contact Information**: Three items with icon + text layout
  - Phone: `<a href="tel:+351961073787">961 073 787</a>` with Phone icon
  - Instagram: `<a href="https://www.instagram.com/tralalacriativo.pt/" target="_blank" rel="noopener noreferrer">@tralalacriativo.pt</a>` with Instagram icon
  - Address: Static text with MapPin icon
  - All icons: `text-brand-blue` color, `size={24}`, positioned with `flex-shrink-0 mt-1`

- **Typography Pattern**:
  - Section label: `text-sm font-bold text-brand-blue tracking-widest uppercase` with icon
  - Section heading: `text-3xl md:text-4xl font-bold text-gray-800`
  - Contact labels: `text-sm font-bold text-brand-blue tracking-widest uppercase`
  - Contact values: `text-lg text-gray-700 font-semibold` with `hover:text-brand-pink transition-colors`

### Icon Imports
- Added to lucide-react imports: `Phone`, `Instagram`, `MapPin`
- All three icons already used in Footer (Task 6), so pattern is consistent

### Responsive Behavior
- Mobile: Single column, map full width, contact info stacked below
- Desktop (md breakpoint): Two-column grid with map and contact side-by-side
- All text remains readable and interactive elements have proper hover states

### Build Status
- ✅ `npm run build` succeeded with no errors
- ✅ Chunk size warning (589.26 kB) - pre-existing, not caused by this change
- ✅ All interactive elements have `cursor-pointer` class
- ✅ Consistent with established brand color palette and glassmorphism design

### Patterns Established
- Google Maps embeds don't require API keys for simple location displays
- Contact info sections benefit from icon + text layout for visual hierarchy
- Responsive grids with `md:grid-cols-2` work well for map + info layouts
- Decorative background elements (blurred circles) add depth without cluttering content

**File Modified:** src/pages/Sobre.jsx (+90 lines)
**Commit:** feat(about): google maps embed + contact info (89f5b34)

## Task 12: Order History Section (Profile Page)

### Key Findings
- **Orders Table Query**: Use `.from('orders').select('*, order_items(*)')` to fetch orders with related items in one query
  - Filter by user: `.eq('user_id', user.id)`
  - Order by date: `.order('created_at', { ascending: false })` for newest first
  - Graceful error handling: Set empty array `[]` as fallback if query fails

- **Date Formatting**: Portuguese locale formatting with `new Date(dateString).toLocaleDateString('pt-PT')`
  - Returns format: DD/MM/YYYY (e.g., "27/04/2026")
  - No need for external date libraries like date-fns for simple date display

- **Status Badge Component**: Inline component definition for reusability within same file
  - Config object pattern for multiple status types: `{ status: { bg, text, label } }`
  - Status types: pendente (yellow), pago (blue), enviado (orange), entregue (green)
  - Badge styling: `px-3 py-1 rounded-full text-xs font-semibold`

- **Expandable Sections Pattern**:
  - State: `const [expandedOrders, setExpandedOrders] = useState({})` (object keyed by order ID)
  - Toggle function: Spread previous state and invert boolean for specific order ID
  - Conditional rendering: `{expandedOrders[order.id] && <motion.div>...}`
  - Framer Motion collapse: `initial={{ opacity: 0, height: 0 }}` → `animate={{ opacity: 1, height: 'auto' }}`

- **Customization Display**: Check if customization exists, then map over Object.entries()
  ```jsx
  {item.customization && (
    <p className="text-xs text-gray-500 mt-1">
      {Object.entries(item.customization).map(([key, value]) => (
        <span key={key}>{key}: {value}</span>
      ))}
    </p>
  )}
  ```

### Successful Patterns
1. **Empty State Design**: Center-aligned with icon, message, and CTA button
   - Icon: `<Package className="mx-auto text-gray-300 mb-4" size={48} />`
   - Message: `text-gray-500 mb-4`
   - CTA: Link to /produtos with gradient button styling

2. **Order Card Structure**: Two-tier layout for summary + expandable details
   - Summary row: Date + Status Badge + Total Amount + Chevron Icon
   - Click handler on entire summary row for better UX
   - Hover state: `hover:bg-gray-100` for visual feedback
   - Expanded section: Border-top separator, white background, padding

3. **Responsive Layout**:
   - Mobile: Stack date/status and total/chevron vertically with `flex-col`
   - Desktop: Horizontal layout with `md:flex-row md:items-center justify-between`
   - Gap: `gap-3` for breathing room between elements

4. **Loading State**: Centered Loader2 icon with brand color
   - `flex items-center justify-center py-12` for vertical centering
   - `<Loader2 className="animate-spin text-brand-blue" size={32} />`

5. **Section Transition Delay**: Fourth section uses `delay: 0.4` to continue animation cascade
   - First section: delay 0.1 (Dados Pessoais)
   - Second section: delay 0.2 (Endereço)
   - Third section: delay 0.3 (Alterar Senha)
   - Fourth section: delay 0.4 (Histórico de Encomendas)

### Icon Imports
- Added to lucide-react imports: `Package`, `ChevronDown`, `ChevronUp`
- Package icon used for section header and empty state
- Chevron icons indicate expand/collapse state

### Order Display Logic
- **Total calculation**: Already stored in order.total_amount (no need to recalculate)
- **Item pricing**: Show individual price, quantity, and subtotal (quantity × price)
- **Order items**: Loop through order.order_items array (relationship handled by Supabase)
- **Text truncation**: None needed - order details are hidden until expanded

### Build Status
- ✅ `npm run build` succeeded with no errors
- ✅ Chunk size warning (593.08 kB) - pre-existing, not critical
- ✅ All interactive elements have `cursor-pointer` class
- ✅ Consistent with established profile page patterns

### Patterns Established
- Order history sections should separate loading state from empty state from populated state
- Expandable order details improve UX by hiding complexity until needed
- Status badges should use color coding aligned with common e-commerce conventions
- Orders should display newest first (descending created_at sort)
- Customization data stored as JSON can be displayed by mapping over Object.entries()
- Profile page sections follow consistent Motion animation delays (0.1 increments)

**File Modified:** src/pages/perfil.jsx (+168 lines, -2 lines)
**Commit:** feat(profile): order history tab (8470a08)
