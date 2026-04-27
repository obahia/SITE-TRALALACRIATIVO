# Redesign Completo — Tralalá Criativo

## TL;DR

> **Quick Summary**: Redesign completo do e-commerce Tralalá Criativo, mantendo a identidade visual (cores/fonte Fredoka) mas adicionando funcionalidades críticas: login com "esqueci senha", filtros de produtos por categoria, carrossel de feedbacks, página de perfil com endereço de envio, portes fixos por categoria, mapa da loja, e melhorias no header/footer/navegação.
> 
> **Deliverables**:
> - Login modal refinado com "Esqueci a senha"
> - Página de produtos com filtros por categoria + busca
> - Carrossel de testemunhos dinâmicos na Home
> - Página de perfil (dados, endereço, histórico, alterar senha)
> - Sistema de portes fixos por categoria integrado ao checkout
> - Mapa Google Maps + contactos na Sobre e Footer
> - Header melhorado (mobile drawer, indicador ativo, cores unificadas)
> - Footer completo (telefone, Instagram, contactos)
> - Setup de Vitest + Testing Library
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 (DB) → Task 3 (Auth) → Task 8 (Perfil) → Task 11 (Checkout+Envio) → Task 13 (Testes) → Final

---

## Context

### Original Request
O utilizador quer "repaginar todo o site" — simplificar o login, adicionar filtros de produtos, carrossel de feedbacks de clientes, página de perfil com endereço para envio por CTT, mapa da loja, número de telefone, e melhorias gerais de UX seguindo padrões de sites e-commerce modernos.

### Interview Summary
**Key Discussions**:
- **Login**: A aba "Entrar" já pede só email+senha. A aba "Registar" mantém nome/sobrenome. Falta: "Esqueci a senha".
- **Produtos**: Sem filtros/busca atualmente. Adicionar coluna `category` no Supabase. Categorias: Canecas, Camisetas, Azulejos, Kits, Tote Bags.
- **Feedbacks**: Dinâmicos via Supabase (nova tabela `testimonials`).
- **Perfil**: Nova página `/perfil` com dados pessoais, endereço de envio, histórico de encomendas, alterar senha.
- **Envio CTT**: API real descartada (sem peso/dimensões no BD, sem endpoint de cálculo simples). Solução: portes fixos por categoria.
- **Mapa**: Google Maps embed. Endereço: Av. Marquês de Pombal, 226 - Leiria.
- **Contactos**: Tel. 961 073 787, Instagram tralalacriativo.pt. Mostrar no Footer + Sobre.
- **Visual**: Manter e refinar (mesmas cores brand-blue/pink/purple, fonte Fredoka, melhorar consistência).
- **Testes**: Configurar Vitest + Testing Library para lógica crítica.

**Research Findings**:
- CTT ecommerce API não tem endpoint de "calcular portes" — precisa de peso/dimensões. Portes fixos confirmados.
- Stack: React 19 + Vite 7 + TailwindCSS 4 + Supabase + Stripe + Framer Motion.
- Sem framework de testes atualmente.

---

## Work Objectives

### Core Objective
Modernizar o site Tralalá Criativo adicionando funcionalidades essenciais de e-commerce (perfil, envio, filtros, feedbacks) enquanto se refina a experiência visual e de navegação existente.

### Concrete Deliverables
- `src/components/LoginModal.jsx` — refinado com "Esqueci a senha"
- `src/pages/produtos.jsx` — com filtros por categoria e barra de busca
- `src/pages/home.jsx` — com carrossel de feedbacks
- `src/pages/perfil.jsx` — nova página de perfil completa
- `src/components/Header.jsx` — mobile drawer, indicador ativo, cores unificadas
- `src/components/Footer.jsx` — completo com contactos, mapa, redes sociais
- `src/pages/Sobre.jsx` — com Google Maps embed e contactos
- `src/context/CartContext.jsx` — com cálculo de portes fixos
- Supabase: tabelas `testimonials`, `shipping_costs`, coluna `category` em `products`, campos de endereço em `profiles`
- `vitest.config.js` + testes para auth, cart, checkout

### Definition of Done
- [ ] `npm run build` completa sem erros
- [ ] Todas as páginas renderizam corretamente em desktop e mobile
- [ ] Login/Registro/Esqueci senha funcionam via Supabase Auth
- [ ] Filtros de categoria funcionam na página de produtos
- [ ] Carrossel de feedbacks exibe dados do Supabase
- [ ] Perfil permite editar dados, endereço, ver histórico, alterar senha
- [ ] Portes fixos aparecem no carrinho e são incluídos no checkout Stripe
- [ ] Mapa Google Maps aparece na página Sobre
- [ ] Footer mostra telefone, Instagram, endereço
- [ ] Vitest roda e testes passam

### Must Have
- "Esqueci a senha" funcional no modal de login
- Filtros por categoria na página de produtos
- Carrossel de feedbacks na Home
- Página de perfil com endereço de envio
- Portes fixos por categoria visíveis no carrinho
- Google Maps embed na Sobre
- Telefone + Instagram no Footer
- Header com indicador de página ativa
- Menu mobile melhorado (drawer animado)
- Setup Vitest + testes básicos

### Must NOT Have (Guardrails)
- NÃO mudar paleta de cores (brand-blue, brand-pink, brand-purple) nem fonte (Fredoka)
- NÃO integrar API real dos CTT (usar portes fixos)
- NÃO criar painel administrativo
- NÃO adicionar visualização 3D (está nos próximos passos do README mas fora do escopo)
- NÃO implementar sistema de reviews por produto (só carrossel de testemunhos gerais)
- NÃO adicionar newsletter/email marketing
- NÃO over-engineer: sem abstrações desnecessárias, sem camadas extras
- NÃO usar `as any` ou `@ts-ignore`
- NÃO adicionar console.log em código de produção
- NÃO comentários óbvios ou JSDoc excessivo

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: NO (will be set up in Task 1)
- **Automated tests**: Tests-after (add tests for critical logic after implementation)
- **Framework**: Vitest + @testing-library/react
- **Test scope**: Auth context, Cart context (add/remove/shipping calc), checkout flow logic

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) — Test Supabase queries if applicable
- **Logic**: Use Bash (node/vitest) — Run unit tests

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — DB + Infra + Config):
├── Task 1: Supabase schema changes (category, testimonials, shipping_costs, profiles address) [quick]
├── Task 2: Vitest + Testing Library setup [quick]
├── Task 3: Auth — "Esqueci a senha" no LoginModal + resetPassword no AuthContext [quick]
└── Task 4: Visual consistency pass — unificar hover colors, espaçamentos base [quick]

Wave 2 (Core Features — MAX PARALLEL):
├── Task 5: Header redesign — mobile drawer, active indicator, hover unificado (depends: 4) [visual-engineering]
├── Task 6: Footer redesign — contactos, telefone, Instagram, endereço (depends: 4) [visual-engineering]
├── Task 7: Produtos — filtros por categoria + barra de busca (depends: 1) [unspecified-high]
├── Task 8: Página de Perfil — dados, endereço, alterar senha (depends: 1, 3) [unspecified-high]
└── Task 9: Carrossel de feedbacks na Home (depends: 1) [visual-engineering]

Wave 3 (Integration + Polish):
├── Task 10: Sobre page — Google Maps embed + contactos + mapa (depends: 6) [quick]
├── Task 11: Checkout + Envio — portes fixos no carrinho + Stripe (depends: 1, 8) [deep]
├── Task 12: Histórico de encomendas no Perfil (depends: 8) [unspecified-high]
└── Task 13: Testes unitários — auth, cart, shipping (depends: 2, 3, 11) [unspecified-high]

Wave FINAL (4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA — full site walkthrough (unspecified-high + playwright)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 8 → Task 11 → Task 13 → F1-F4 → user okay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 5 (Wave 2)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 7, 8, 9, 11, 12 |
| 2 | — | 13 |
| 3 | — | 8, 13 |
| 4 | — | 5, 6 |
| 5 | 4 | — |
| 6 | 4 | 10 |
| 7 | 1 | — |
| 8 | 1, 3 | 11, 12 |
| 9 | 1 | — |
| 10 | 6 | — |
| 11 | 1, 8 | 13 |
| 12 | 8 | — |
| 13 | 2, 3, 11 | — |

### Agent Dispatch Summary

- **Wave 1**: **4 tasks** — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 2**: **5 tasks** — T5 → `visual-engineering`, T6 → `visual-engineering`, T7 → `unspecified-high`, T8 → `unspecified-high`, T9 → `visual-engineering`
- **Wave 3**: **4 tasks** — T10 → `quick`, T11 → `deep`, T12 → `unspecified-high`, T13 → `unspecified-high`
- **FINAL**: **4 tasks** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [ ] 1. Supabase Schema Changes — Foundation

  **What to do**:
  - Add `category` column (TEXT) to `products` table. Allowed values: `canecas`, `camisetas`, `azulejos`, `kits`, `tote_bags`
  - Create `testimonials` table: `id` (uuid, PK), `name` (text), `message` (text), `rating` (int, 1-5), `avatar_url` (text, nullable), `created_at` (timestamptz)
  - Create `shipping_costs` table: `id` (uuid, PK), `category` (text, unique), `cost` (numeric). Seed with initial values (e.g., canecas: 4.50€, camisetas: 3.50€, azulejos: 5.00€, kits: 6.00€, tote_bags: 3.50€)
  - Add address fields to `profiles` table: `phone` (text), `street` (text), `city` (text), `postal_code` (text), `country` (text, default 'PT')
  - Seed 4-5 testimonials for initial data
  - Update existing products with appropriate category values
  - Ensure RLS policies allow authenticated users to read testimonials/shipping_costs and update their own profile

  **Must NOT do**:
  - Do NOT create admin-only tables or admin RLS policies
  - Do NOT add weight/dimensions columns (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: SQL schema changes are straightforward, no complex logic
  - **Skills**: []
  - **Skills Evaluated but Omitted**:
    - `playwright`: No UI verification needed for DB changes

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 7, 8, 9, 11, 12
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/services/supabase.js` — Supabase client configuration (connection details)
  - `src/context/CartContext.jsx:229-237` — How `orders` table is used (structure reference for similar tables)

  **API/Type References**:
  - `src/pages/home.jsx:22-24` — How products are queried (`supabase.from('products').select('*')`) — new category column must be compatible
  - `src/context/AuthContext.jsx:34-48` — signUp uses `profiles` implicitly via Supabase trigger — address fields must not break existing flow

  **External References**:
  - Supabase Dashboard SQL Editor for running migrations
  - Supabase RLS docs: https://supabase.com/docs/guides/auth/row-level-security

  **WHY Each Reference Matters**:
  - `supabase.js` — Needed to verify the Supabase project URL and confirm connection
  - `CartContext.jsx` orders insert — Shows the pattern for how tables are used, so new tables follow same conventions
  - `AuthContext.jsx` signUp — The profiles table already has a trigger on auth.users insert; adding columns must not break this

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Verify products have category column
    Tool: Bash (curl via Supabase REST API or supabase CLI)
    Preconditions: Supabase project accessible
    Steps:
      1. Query `supabase.from('products').select('category').limit(1)` in a test script
      2. Verify response includes `category` field
      3. Query products and verify at least one has a non-null category
    Expected Result: All products have a valid category value
    Failure Indicators: `category` field missing or null for all rows
    Evidence: .sisyphus/evidence/task-1-products-category.txt

  Scenario: Verify testimonials table exists and has seed data
    Tool: Bash (node script querying Supabase)
    Preconditions: Supabase accessible
    Steps:
      1. Query `supabase.from('testimonials').select('*')`
      2. Assert response has >= 4 rows
      3. Assert each row has name, message, rating fields
    Expected Result: 4+ testimonials returned with valid data
    Failure Indicators: Empty array or missing fields
    Evidence: .sisyphus/evidence/task-1-testimonials-seed.txt

  Scenario: Verify shipping_costs table with category prices
    Tool: Bash (node script)
    Steps:
      1. Query `supabase.from('shipping_costs').select('*')`
      2. Assert 5 rows (canecas, camisetas, azulejos, kits, tote_bags)
      3. Assert each has a numeric cost > 0
    Expected Result: 5 categories with valid prices
    Evidence: .sisyphus/evidence/task-1-shipping-costs.txt

  Scenario: Verify profiles table has address fields
    Tool: Bash (node script)
    Steps:
      1. Query profiles table schema or attempt to select address fields
      2. Verify columns phone, street, city, postal_code, country exist
    Expected Result: All address columns present
    Evidence: .sisyphus/evidence/task-1-profiles-address.txt
  ```

  **Commit**: YES
  - Message: `chore(db): add category, testimonials, shipping_costs schema + profiles address fields`
  - Pre-commit: Verify queries succeed

- [ ] 2. Vitest + Testing Library Setup

  **What to do**:
  - Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`
  - Create `vitest.config.js` with jsdom environment, path aliases matching vite.config.js
  - Create `src/test/setup.js` with `@testing-library/jest-dom` imports
  - Add `"test": "vitest run"` and `"test:watch": "vitest"` scripts to package.json
  - Create one smoke test `src/__tests__/smoke.test.jsx` that renders `<App />` (or a simple component) to verify setup works
  - Ensure `npm run test` passes

  **Must NOT do**:
  - Do NOT add tests for business logic yet (that's Task 13)
  - Do NOT install Playwright (that's handled by the agent's skill)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Config files and dependency installation, no complex logic
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Task 13
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `vite.config.js` — Must match resolve.alias and plugin config for vitest compatibility
  - `package.json` — Current scripts and dependencies

  **External References**:
  - Vitest docs: https://vitest.dev/guide/
  - Testing Library React: https://testing-library.com/docs/react-testing-library/intro/

  **WHY Each Reference Matters**:
  - `vite.config.js` — Vitest inherits Vite config; aliases must match or tests will fail on imports
  - `package.json` — Must add scripts and devDependencies correctly

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Vitest runs and smoke test passes
    Tool: Bash
    Preconditions: Dependencies installed
    Steps:
      1. Run `npm run test`
      2. Assert exit code 0
      3. Assert output contains "1 passed" or similar
    Expected Result: 1 test passes, exit code 0
    Failure Indicators: Exit code non-zero, "FAIL" in output
    Evidence: .sisyphus/evidence/task-2-vitest-smoke.txt

  Scenario: Vitest config is valid
    Tool: Bash
    Steps:
      1. Run `npx vitest --config vitest.config.js --run`
      2. Verify no config errors in output
    Expected Result: Vitest starts without config errors
    Evidence: .sisyphus/evidence/task-2-vitest-config.txt
  ```

  **Commit**: YES
  - Message: `chore(test): setup vitest + testing library`
  - Files: `vitest.config.js`, `package.json`, `src/test/setup.js`, `src/__tests__/smoke.test.jsx`
  - Pre-commit: `npm run test`

- [ ] 3. Auth — "Esqueci a Senha" no LoginModal

  **What to do**:
  - Add `resetPassword` function to `AuthContext.jsx` using `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })`
  - Export `resetPassword` from AuthContext provider value
  - Add "Esqueci a senha" link below the password field in LoginModal (only visible on "ENTRAR" tab, not "REGISTAR")
  - When clicked: show an inline email input (or reuse the existing email field) + "Enviar link" button
  - On success: show message "Link de recuperação enviado para [email] 📩"
  - On error: show error message
  - Style consistently with existing modal design (brand-blue gradients, rounded-xl inputs)

  **Must NOT do**:
  - Do NOT change the registration flow (name/surname fields stay)
  - Do NOT change the Google OAuth flow
  - Do NOT add a separate page for password reset — keep it in the modal

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Small feature addition to existing component
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Tasks 8, 13
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/components/LoginModal.jsx:1-259` — Full modal component, tabs system (isRegistering state), form handling pattern, error display pattern
  - `src/context/AuthContext.jsx:28-61` — Existing auth functions (signIn, signUp, signInWithGoogle) — follow same pattern for resetPassword

  **API/Type References**:
  - `src/context/AuthContext.jsx:51-61` — signInWithGoogle pattern with `redirectTo: window.location.origin` — use same redirect pattern for reset

  **External References**:
  - Supabase Auth resetPasswordForEmail: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

  **WHY Each Reference Matters**:
  - `LoginModal.jsx` — Must integrate seamlessly with existing tab system and visual style
  - `AuthContext.jsx` auth functions — Follow exact same try/catch/throw pattern for consistency

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: "Esqueci a senha" link appears on login tab
    Tool: Playwright
    Preconditions: Site running on localhost
    Steps:
      1. Navigate to homepage
      2. Click "Entrar" button in header (selector: nav button with text "Entrar")
      3. Verify modal opens with "ENTRAR" tab active
      4. Assert element with text "Esqueci a senha" or "Esqueceu a senha?" is visible below password field
      5. Switch to "REGISTAR" tab
      6. Assert "Esqueci a senha" link is NOT visible
    Expected Result: Link visible only on login tab
    Failure Indicators: Link missing on login tab or appearing on register tab
    Evidence: .sisyphus/evidence/task-3-forgot-password-visible.png

  Scenario: Reset password flow sends email
    Tool: Playwright
    Preconditions: Site running, valid test email available
    Steps:
      1. Open login modal
      2. Click "Esqueci a senha"
      3. Enter email "test@example.com" in the email field
      4. Click "Enviar link" button
      5. Assert success message appears containing "Link de recuperação enviado"
    Expected Result: Success message shown (actual email delivery depends on Supabase config)
    Failure Indicators: Error message, no feedback, or page crash
    Evidence: .sisyphus/evidence/task-3-forgot-password-flow.png

  Scenario: Reset password with empty email shows error
    Tool: Playwright
    Steps:
      1. Open login modal
      2. Click "Esqueci a senha"
      3. Click "Enviar link" without entering email
      4. Assert error message appears
    Expected Result: Validation error shown
    Evidence: .sisyphus/evidence/task-3-forgot-password-error.png
  ```

  **Commit**: YES
  - Message: `feat(auth): add forgot password flow to login modal`
  - Files: `src/components/LoginModal.jsx`, `src/context/AuthContext.jsx`
  - Pre-commit: `npm run build`

- [ ] 4. Visual Consistency Pass — Unify Hover Colors + Spacing

  **What to do**:
  - Replace the gold hover `#e8b65a` in Header.jsx nav links with a brand-consistent color (use `brand-blue` or a soft version like `bg-brand-blue/10 text-brand-blue`)
  - Ensure the shopping cart icon hover matches the same palette
  - Verify `containerClass` padding is consistent across all pages (currently `px-8 md:px-16 lg:px-32` in Header/Footer/Home — ensure Products, Sobre, ProdutoDetalhe match)
  - Check and fix any inconsistent border-radius values (some use `rounded-2xl`, others `rounded-[2rem]` etc.)
  - Ensure all interactive elements have `cursor-pointer` where needed
  - This is a STYLE-ONLY task — no functional changes

  **Must NOT do**:
  - Do NOT change colors in the brand palette (brand-blue stays #0ea5e9, brand-pink stays #ec4899, etc.)
  - Do NOT change the font (Fredoka stays)
  - Do NOT restructure HTML or add/remove components

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: CSS/style-only changes across a few files
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: None

  **References**:

  **Pattern References**:
  - `src/components/Header.jsx:44` — `navLinkStyle` with gold hover `hover:bg-[#e8b65a]` — THIS is the main inconsistency to fix
  - `src/components/Header.jsx:70` — Cart icon hover `group-hover:text-[#e8b65a]` — Also gold, needs unifying
  - `src/index.css:6-35` — Theme definition with brand colors — reference for correct values
  - `src/pages/home.jsx:13` — `containerClass` definition — reference for consistent padding

  **WHY Each Reference Matters**:
  - `Header.jsx:44` — The gold #e8b65a is the main visual inconsistency with the blue/pink palette
  - `index.css` — Source of truth for brand colors to use as replacements

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: No gold (#e8b65a) colors remaining in codebase
    Tool: Bash (grep)
    Steps:
      1. Search entire src/ directory for "#e8b65a" or "e8b65a"
      2. Assert 0 matches found
    Expected Result: Zero occurrences of gold color
    Failure Indicators: Any file still containing #e8b65a
    Evidence: .sisyphus/evidence/task-4-no-gold-color.txt

  Scenario: Nav links hover uses brand color
    Tool: Playwright
    Steps:
      1. Navigate to homepage
      2. Hover over "Produtos" nav link
      3. Screenshot showing hover state uses brand-blue or consistent color
    Expected Result: Hover background/text uses brand palette
    Evidence: .sisyphus/evidence/task-4-hover-consistency.png

  Scenario: Container padding consistent across pages
    Tool: Playwright
    Steps:
      1. Navigate to each page (/, /produtos, /sobre)
      2. Screenshot each at 1440px width
      3. Verify content alignment is consistent (same left/right padding)
    Expected Result: All pages have visually aligned content
    Evidence: .sisyphus/evidence/task-4-padding-consistency.png
  ```

  **Commit**: YES
  - Message: `style: unify hover colors and spacing consistency`
  - Files: `src/components/Header.jsx`, possibly others with inconsistent styles
  - Pre-commit: `npm run build`

- [ ] 5. Header Redesign — Mobile Drawer + Active Page Indicator

  **What to do**:
  - Replace the current mobile dropdown menu with an animated full-screen or side-drawer menu using Framer Motion (AnimatePresence + motion.div sliding from right)
  - Add active page indicator: use `useLocation()` from react-router-dom to highlight the current nav link (e.g., bold text + underline or background highlight with brand-blue)
  - Apply the unified hover colors from Task 4 (if not already applied to mobile menu)
  - Mobile drawer should include: nav links, login/user area, cart button, close button with smooth animation
  - Desktop nav stays mostly the same but with active indicator added
  - Ensure drawer has proper z-index and body scroll lock when open

  **Must NOT do**:
  - Do NOT change the logo or brand name
  - Do NOT add new nav items (Início, Produtos, Sobre Nós stay)
  - Do NOT change the sticky header behavior

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Animation-heavy UI work with Framer Motion, responsive design
  - **Skills**: [`playwright`]
    - `playwright`: For visual QA verification on mobile and desktop viewports

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 6, 7, 8, 9)
  - **Blocks**: None
  - **Blocked By**: Task 4 (visual consistency must be done first)

  **References**:

  **Pattern References**:
  - `src/components/Header.jsx:1-154` — Full header component with current mobile menu (lines 110-146)
  - `src/components/CartSideBar.jsx:34-43` — Framer Motion slide-in animation pattern (use similar for mobile drawer: `initial={{ x: '100%' }}`, `animate={{ x: 0 }}`)
  - `src/components/CartSideBar.jsx:24-31` — Overlay pattern with AnimatePresence

  **API/Type References**:
  - `react-router-dom` `useLocation()` — For active page detection. Compare `location.pathname` with link `to` prop

  **External References**:
  - Framer Motion AnimatePresence: https://www.framer.com/motion/animate-presence/

  **WHY Each Reference Matters**:
  - `Header.jsx` — The component to modify; understand current mobile menu structure (lines 110-146) and desktop nav (lines 60-108)
  - `CartSideBar.jsx` — EXACT animation pattern to replicate (slide from right, overlay behind, AnimatePresence wrapper). Lines 34-43 show the motion.div config

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Mobile drawer opens and closes with animation
    Tool: Playwright
    Preconditions: Site running on localhost
    Steps:
      1. Set viewport to 375x812 (mobile)
      2. Navigate to homepage
      3. Click hamburger menu button
      4. Assert drawer slides in from right (visible, covering screen)
      5. Assert nav links visible: "Início", "Produtos", "Sobre Nós"
      6. Assert close button (X) visible
      7. Click close button
      8. Assert drawer slides out and is hidden
    Expected Result: Smooth slide animation in/out, all links visible
    Failure Indicators: No animation, links missing, drawer doesn't close
    Evidence: .sisyphus/evidence/task-5-mobile-drawer-open.png, .sisyphus/evidence/task-5-mobile-drawer-closed.png

  Scenario: Active page indicator works on desktop
    Tool: Playwright
    Preconditions: Site running, viewport 1440x900
    Steps:
      1. Navigate to /produtos
      2. Assert "Produtos" nav link has active styling (distinct from other links)
      3. Navigate to /sobre
      4. Assert "Sobre Nós" link has active styling, "Produtos" does NOT
      5. Navigate to /
      6. Assert "Início" has active styling
    Expected Result: Only current page link shows active state
    Failure Indicators: No visual difference, wrong link highlighted
    Evidence: .sisyphus/evidence/task-5-active-indicator-produtos.png, .sisyphus/evidence/task-5-active-indicator-sobre.png

  Scenario: Mobile drawer navigation works
    Tool: Playwright
    Preconditions: Mobile viewport
    Steps:
      1. Open mobile drawer
      2. Click "Produtos" link
      3. Assert drawer closes automatically
      4. Assert URL is /produtos
      5. Assert page content shows products
    Expected Result: Navigation works from drawer, drawer closes after click
    Evidence: .sisyphus/evidence/task-5-mobile-nav-works.png
  ```

  **Commit**: YES
  - Message: `feat(header): mobile drawer menu + active page indicator`
  - Files: `src/components/Header.jsx`
  - Pre-commit: `npm run build`

- [ ] 6. Footer Redesign — Contactos Completos

  **What to do**:
  - Expand the current minimal footer to include:
    - **Logo + Brand name** (Tralalá Criativo)
    - **Contactos section**: Telefone 961 073 787 (with tel: link), Email (if available), Instagram link with icon
    - **Endereço**: Av. Marquês de Pombal, 226 - Leiria
    - **Links úteis**: Início, Produtos, Sobre Nós (quick nav)
    - Copyright updated to 2025-2026 or dynamic year
  - Use a multi-column layout on desktop (3 columns: About/Logo, Links, Contactos), single column stacked on mobile
  - Style with current brand palette (brand-blue for headings, gray-400/500 for text)
  - Add Instagram icon (from lucide-react: `Instagram` icon) next to the link

  **Must NOT do**:
  - Do NOT add newsletter signup (out of scope)
  - Do NOT add FAQ/Terms links (pages don't exist yet)
  - Do NOT use external icon libraries beyond lucide-react

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Layout design work with responsive columns
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 7, 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Task 4

  **References**:

  **Pattern References**:
  - `src/components/Footer.jsx:1-22` — Current minimal footer (entire file — simple, needs expansion)
  - `src/components/Header.jsx:43` — `containerClass` for consistent padding

  **External References**:
  - Lucide React icons: `Instagram`, `Phone`, `MapPin` from lucide-react

  **WHY Each Reference Matters**:
  - `Footer.jsx` — The file to completely rewrite; understand current structure to preserve the containerClass pattern
  - `Header.jsx:43` — Use same `containerClass` for padding consistency

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Footer shows all required info
    Tool: Playwright
    Steps:
      1. Navigate to homepage, scroll to bottom
      2. Assert text "961 073 787" is visible in footer
      3. Assert text "Av. Marquês de Pombal" is visible
      4. Assert Instagram link exists and points to correct URL
      5. Assert "Tralalá Criativo" brand name is visible
      6. Assert copyright text is visible
    Expected Result: All contact info present
    Evidence: .sisyphus/evidence/task-6-footer-desktop.png

  Scenario: Footer responsive on mobile
    Tool: Playwright
    Preconditions: Viewport 375x812
    Steps:
      1. Navigate to homepage, scroll to footer
      2. Assert all sections stack vertically
      3. Assert phone number is tappable (wrapped in <a href="tel:...">)
      4. Screenshot mobile footer
    Expected Result: Clean stacked layout, phone link is tappable
    Evidence: .sisyphus/evidence/task-6-footer-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(footer): add contacts, phone, address, instagram`
  - Files: `src/components/Footer.jsx`
  - Pre-commit: `npm run build`

- [ ] 7. Produtos Page — Filtros por Categoria + Busca

  **What to do**:
  - Add category filter bar at the top of the products page: horizontal row of clickable pills/chips for each category (Todos, Canecas, Camisetas, Azulejos, Kits, Tote Bags)
  - "Todos" pill is active by default (shows all products)
  - Add search bar (text input with search icon) above or next to the filter pills
  - Filter logic: combine category filter AND search text (product name/description contains search string)
  - Fetch products from Supabase with category filter (or fetch all and filter client-side — client-side recommended for small catalog)
  - Add stagger animation for product cards appearing (Framer Motion `staggerChildren`)
  - Show "Nenhum produto encontrado" message when filters return empty
  - Show product count: "12 produtos" or "3 resultados para 'caneca'"
  - Category pills should have smooth active state transition (brand-blue bg when selected)

  **Must NOT do**:
  - Do NOT add price range filter (out of scope)
  - Do NOT add sorting (most expensive, cheapest, etc.)
  - Do NOT paginate (keep showing all products)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Involves Supabase query changes, state management, and UI work
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 8, 9)
  - **Blocks**: None
  - **Blocked By**: Task 1 (category column must exist in products table)

  **References**:

  **Pattern References**:
  - `src/pages/produtos.jsx:1-81` — Current products page (entire file): fetch from Supabase, grid layout, loading/empty states
  - `src/components/ProductCard.jsx:1-71` — Card component (receives id, title, description, price, image props — no changes needed to this component)
  - `src/pages/home.jsx:102-108` — FeatureCard grid pattern for responsive layout reference

  **API/Type References**:
  - `src/services/supabase.js` — Supabase client for queries
  - Supabase query: `supabase.from('products').select('*')` already used on line 16-17 of produtos.jsx — extend with `.eq('category', selectedCategory)` if server-side filtering

  **External References**:
  - Framer Motion stagger: https://www.framer.com/motion/stagger/

  **WHY Each Reference Matters**:
  - `produtos.jsx` — The file to modify; lines 12-34 show current fetch pattern, lines 63-75 show grid rendering
  - `ProductCard.jsx` — Understand its props so filter doesn't break card rendering

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Category filter chips render and work
    Tool: Playwright
    Steps:
      1. Navigate to /produtos
      2. Assert filter bar visible with pills: "Todos", "Canecas", "Camisetas", "Azulejos", "Kits", "Tote Bags"
      3. Assert "Todos" pill has active styling (brand-blue bg)
      4. Click "Canecas" pill
      5. Assert only products with category "canecas" are shown
      6. Assert "Canecas" pill now has active styling
      7. Click "Todos" to reset
      8. Assert all products shown again
    Expected Result: Filter works correctly, active state updates
    Failure Indicators: No filtering, wrong products shown, active state stuck
    Evidence: .sisyphus/evidence/task-7-category-filter.png

  Scenario: Search bar filters products
    Tool: Playwright
    Steps:
      1. Navigate to /produtos
      2. Type "caneca" in search bar
      3. Assert only products whose name or description contains "caneca" are shown
      4. Assert product count updates
      5. Clear search bar
      6. Assert all products return
    Expected Result: Search filters in real-time
    Evidence: .sisyphus/evidence/task-7-search-filter.png

  Scenario: Combined filter + search
    Tool: Playwright
    Steps:
      1. Select "Kits" category
      2. Type "natal" in search bar
      3. Assert only kit products containing "natal" shown
      4. If no results, assert "Nenhum produto encontrado" message
    Expected Result: Both filters combine correctly
    Evidence: .sisyphus/evidence/task-7-combined-filter.png

  Scenario: Empty state shows message
    Tool: Playwright
    Steps:
      1. Type "xyznonexistent123" in search bar
      2. Assert "Nenhum produto encontrado" message visible
      3. Assert no product cards rendered
    Expected Result: Empty state message shown
    Evidence: .sisyphus/evidence/task-7-empty-state.png
  ```

  **Commit**: YES
  - Message: `feat(products): category filters + search bar`
  - Files: `src/pages/produtos.jsx`
  - Pre-commit: `npm run build`

- [ ] 8. Página de Perfil — Dados Pessoais + Endereço + Alterar Senha

  **What to do**:
  - Create new file `src/pages/perfil.jsx`
  - Add route `/perfil` in `App.jsx` (inside AnimatedRoutes)
  - Page structure with tabs or sections:
    - **Dados Pessoais**: name (first_name, last_name), email (read-only), phone — editable form, save to `profiles` table
    - **Endereço de Envio**: street, city, postal_code, country — editable form, save to `profiles` table
    - **Alterar Senha**: current password not needed (Supabase uses `updateUser`), new password + confirm password fields — uses `supabase.auth.updateUser({ password: newPassword })`
  - Protect route: redirect to `/` if not logged in (check `user` from AuthContext)
  - Load existing profile data on mount from `profiles` table
  - Show success toast/message on save
  - Add "Perfil" or user icon link in Header (when logged in) that navigates to `/perfil`
  - Style with existing brand design: rounded cards, brand-blue accents, clean inputs

  **Must NOT do**:
  - Do NOT add order history here (that's Task 12)
  - Do NOT add profile picture upload
  - Do NOT create an admin panel

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: New page with multiple forms, Supabase queries, route protection, and header integration
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 9)
  - **Blocks**: Tasks 11, 12
  - **Blocked By**: Task 1 (address fields in profiles), Task 3 (auth context patterns)

  **References**:

  **Pattern References**:
  - `src/pages/Sobre.jsx:1-88` — Page structure pattern with motion wrapper, container class, card layout
  - `src/components/LoginModal.jsx:137-220` — Form input patterns (icon + input with brand styling, submit button)
  - `src/components/Header.jsx:79-105` — User area in header (where to add "Perfil" link for logged-in users)
  - `src/App.jsx:24-31` — Route definition pattern

  **API/Type References**:
  - `src/context/AuthContext.jsx:7-9` — `user` state and `loading` state for route protection
  - `src/components/Header.jsx:18-40` — Pattern for querying `profiles` table (`supabase.from('profiles').select('first_name').eq('id', user.id).single()`) — extend to fetch all profile fields including new address fields
  - Supabase `auth.updateUser`: for password change

  **External References**:
  - Supabase updateUser: https://supabase.com/docs/reference/javascript/auth-updateuser
  - React Router Navigate for redirect: https://reactrouter.com/en/main/components/navigate

  **WHY Each Reference Matters**:
  - `Sobre.jsx` — Copy the motion wrapper + container pattern for consistent page appearance
  - `LoginModal.jsx` form inputs — Reuse exact same input styling (pl-11, rounded-xl, bg-gray-50, border-gray-200)
  - `Header.jsx:79-105` — Must add "Perfil" link/button in the logged-in user area (between name display and logout button)
  - `Header.jsx:18-40` — Shows exactly how to query profiles table — extend this pattern for full profile data

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Profile page loads with user data
    Tool: Playwright
    Preconditions: User logged in
    Steps:
      1. Navigate to /perfil
      2. Assert page title "Perfil" or "Meu Perfil" visible
      3. Assert name fields pre-filled with user's name
      4. Assert email field shows user's email and is read-only
      5. Assert address fields are present (street, city, postal_code)
    Expected Result: Profile page renders with existing data
    Failure Indicators: Empty fields, page crash, redirect when logged in
    Evidence: .sisyphus/evidence/task-8-profile-loaded.png

  Scenario: Profile redirects when not logged in
    Tool: Playwright
    Preconditions: No user logged in (clear session)
    Steps:
      1. Navigate directly to /perfil
      2. Assert redirect to / (homepage)
    Expected Result: User redirected, profile not accessible
    Evidence: .sisyphus/evidence/task-8-profile-redirect.txt

  Scenario: Save address successfully
    Tool: Playwright
    Preconditions: User logged in
    Steps:
      1. Navigate to /perfil
      2. Fill street: "Av. Marquês de Pombal, 226"
      3. Fill city: "Leiria"
      4. Fill postal_code: "2400-000"
      5. Click save button
      6. Assert success message appears
      7. Refresh page
      8. Assert address fields still show saved values
    Expected Result: Address persists after save and page reload
    Evidence: .sisyphus/evidence/task-8-save-address.png

  Scenario: Change password
    Tool: Playwright
    Steps:
      1. Navigate to /perfil
      2. Find "Alterar Senha" section
      3. Enter new password "TestPass123!" in both fields
      4. Click "Alterar Senha" button
      5. Assert success message
    Expected Result: Password change succeeds with feedback
    Evidence: .sisyphus/evidence/task-8-change-password.png

  Scenario: Header shows "Perfil" link when logged in
    Tool: Playwright
    Preconditions: User logged in
    Steps:
      1. Navigate to homepage
      2. Assert header user area includes a link/button to /perfil
      3. Click it
      4. Assert URL is /perfil
    Expected Result: Profile accessible from header
    Evidence: .sisyphus/evidence/task-8-header-profile-link.png
  ```

  **Commit**: YES
  - Message: `feat(profile): user profile page with address management`
  - Files: `src/pages/perfil.jsx`, `src/App.jsx`, `src/components/Header.jsx`
  - Pre-commit: `npm run build`

- [ ] 9. Carrossel de Feedbacks na Home

  **What to do**:
  - Create new component `src/components/TestimonialCarousel.jsx`
  - Fetch testimonials from Supabase `testimonials` table on mount
  - Display as a horizontal auto-scrolling carousel with:
    - Customer name, message, rating (stars), avatar (or initials fallback)
    - Smooth auto-scroll with pause on hover
    - Left/right navigation arrows (like existing product carousel in Home)
    - Responsive: 1 card on mobile, 2-3 on desktop
  - Add the carousel to `home.jsx` between the Features section and the Product carousel (or after the Product carousel, before the CTA)
  - Section heading: "O Que Dizem Os Nossos Clientes" or similar
  - Card style: white bg, rounded-2xl, shadow-sm, with a quote icon or decorative element
  - Rating as filled/unfilled stars using lucide-react `Star` icon

  **Must NOT do**:
  - Do NOT add ability for users to submit reviews (read-only display)
  - Do NOT create a separate page for testimonials
  - Do NOT use external carousel libraries (build with scroll + refs like existing product carousel)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Carousel animation, responsive design, visual polish
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6, 7, 8)
  - **Blocks**: None
  - **Blocked By**: Task 1 (testimonials table must exist with seed data)

  **References**:

  **Pattern References**:
  - `src/pages/home.jsx:110-155` — EXACT carousel pattern to follow: scrollRef, scroll function, ChevronLeft/Right buttons, overflow-x-auto container, snap-x snap-mandatory, scrollbarWidth none. THIS IS THE TEMPLATE.
  - `src/pages/home.jsx:180-188` — FeatureCard component pattern for card styling (white bg, rounded-2rem, shadow-sm, hover effects)
  - `src/pages/home.jsx:19-37` — Supabase fetch pattern (useEffect + async fetchData)

  **API/Type References**:
  - Supabase query: `supabase.from('testimonials').select('*').order('created_at', { ascending: false })`

  **External References**:
  - Lucide React `Star` icon for rating display
  - Lucide React `Quote` icon for decorative element

  **WHY Each Reference Matters**:
  - `home.jsx:110-155` — The product carousel is the EXACT pattern to replicate for testimonials. Same scroll mechanism, same arrow buttons, same snap behavior.
  - `home.jsx:180-188` — FeatureCard shows the standard card styling to match for visual consistency
  - `home.jsx:19-37` — Follow same useEffect fetch pattern for testimonials data

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Testimonials carousel renders with data
    Tool: Playwright
    Steps:
      1. Navigate to homepage
      2. Scroll to testimonials section
      3. Assert section heading contains "Clientes" or "Dizem"
      4. Assert at least 3 testimonial cards visible
      5. Assert each card has: name text, message text, star rating
    Expected Result: Carousel shows testimonials from Supabase
    Failure Indicators: Empty section, loading forever, missing data fields
    Evidence: .sisyphus/evidence/task-9-testimonials-desktop.png

  Scenario: Carousel navigation arrows work
    Tool: Playwright
    Steps:
      1. Navigate to homepage, scroll to testimonials
      2. Note first visible card's content
      3. Click right arrow
      4. Assert scroll position changed (different card now in view or shifted)
      5. Click left arrow
      6. Assert scroll returns
    Expected Result: Arrows scroll the carousel smoothly
    Evidence: .sisyphus/evidence/task-9-carousel-nav.png

  Scenario: Mobile responsive — single card width
    Tool: Playwright
    Preconditions: Viewport 375x812
    Steps:
      1. Navigate to homepage
      2. Scroll to testimonials
      3. Assert cards take full width (one per view on mobile)
      4. Assert swipe/scroll works horizontally
    Expected Result: Responsive single-card layout on mobile
    Evidence: .sisyphus/evidence/task-9-testimonials-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(home): dynamic customer testimonials carousel`
  - Files: `src/components/TestimonialCarousel.jsx`, `src/pages/home.jsx`
  - Pre-commit: `npm run build`

- [ ] 10. Sobre Page — Google Maps Embed + Contactos

  **What to do**:
  - Add a new section to the existing Sobre page (below the current content about Lívia Dutra):
    - **Section heading**: "Onde Estamos" or "Visite-nos"
    - **Google Maps embed**: iframe pointing to "Av. Marquês de Pombal, 226, Leiria, Portugal"
    - **Contact info** beside or below the map:
      - Phone: 961 073 787 (with `<a href="tel:+351961073787">`)
      - Instagram: link with icon
      - Address: full text
    - Responsive: map + info side-by-side on desktop, stacked on mobile
  - Map iframe styling: rounded-2xl, shadow, consistent with page design
  - Match the existing Sobre page card styling (bg-white/60, backdrop-blur, rounded-3rem)

  **Must NOT do**:
  - Do NOT use Google Maps API key (use simple embed iframe, free and no key needed)
  - Do NOT add opening hours (unless user provides them)
  - Do NOT restructure the existing Lívia Dutra content

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Simple section addition with iframe + text, no complex logic
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 11, 12, 13)
  - **Blocks**: None
  - **Blocked By**: Task 6 (Footer must be done first for consistent contact info layout)

  **References**:

  **Pattern References**:
  - `src/pages/Sobre.jsx:1-88` — Full Sobre page: glassmorphism card, flex layout, responsive columns. Add new section BELOW the existing closing `</div>` of the main card (after line 83)
  - `src/components/Footer.jsx` (after Task 6) — Contact info format to match between Footer and Sobre

  **External References**:
  - Google Maps embed URL format: `https://www.google.com/maps/embed?pb=!1m18!...` — use Google Maps "Embed a map" feature for the address

  **WHY Each Reference Matters**:
  - `Sobre.jsx` — Must add BELOW existing content without breaking it. The glassmorphism card pattern on lines 15-83 is the style to replicate for the new section.

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Google Maps iframe loads on Sobre page
    Tool: Playwright
    Steps:
      1. Navigate to /sobre
      2. Scroll below the Lívia Dutra section
      3. Assert an iframe element exists with src containing "google.com/maps"
      4. Assert iframe is visible and has non-zero dimensions
      5. Assert section heading "Onde Estamos" or similar is visible
    Expected Result: Map iframe visible below existing content
    Failure Indicators: No iframe, broken embed, section missing
    Evidence: .sisyphus/evidence/task-10-google-maps.png

  Scenario: Contact info visible on Sobre page
    Tool: Playwright
    Steps:
      1. Navigate to /sobre
      2. Scroll to contact section
      3. Assert "961 073 787" text visible
      4. Assert phone link has href="tel:+351961073787"
      5. Assert Instagram link present
      6. Assert address text "Av. Marquês de Pombal" visible
    Expected Result: All contact details present and linked
    Evidence: .sisyphus/evidence/task-10-contact-info.png

  Scenario: Responsive layout mobile
    Tool: Playwright
    Preconditions: Viewport 375x812
    Steps:
      1. Navigate to /sobre, scroll to map section
      2. Assert map and contact info stack vertically
      3. Assert map takes full width on mobile
    Expected Result: Clean stacked layout
    Evidence: .sisyphus/evidence/task-10-sobre-mobile.png
  ```

  **Commit**: YES
  - Message: `feat(about): google maps embed + contact info`
  - Files: `src/pages/Sobre.jsx`
  - Pre-commit: `npm run build`

- [ ] 11. Checkout + Envio — Portes Fixos por Categoria no Carrinho

  **What to do**:
  - Fetch `shipping_costs` table from Supabase in CartContext (or a new hook/helper)
  - Calculate total shipping cost based on cart items: for each unique category in the cart, add that category's shipping cost ONCE (not per item — per category type). OR alternatively, charge shipping per item (clarify: per category-type is simpler and recommended).
  - **Shipping logic**: Sum unique category shipping costs. Example: if cart has 2 canecas (4.50€ shipping) + 1 camiseta (3.50€ shipping) = 8.00€ total shipping.
  - Display shipping cost in CartSidebar:
    - New line between "Subtotal" and the checkout button: "Envio: X,XX €"
    - New line: "Total: X,XX €" (subtotal + shipping)
  - **Require address**: Before checkout, verify user has an address saved in profile. If not, show message "Adicione um endereço de envio no seu perfil" with link to /perfil.
  - Pass shipping cost to the Stripe checkout Edge Function (include in the `body` payload): `shippingCost: totalShipping`
  - Update Edge Function to include shipping as a line item in Stripe checkout session (or add to total amount)
  - Save shipping cost in `orders` table: add `shipping_cost` field to the order insert

  **Must NOT do**:
  - Do NOT integrate CTT API
  - Do NOT calculate shipping based on weight/dimensions
  - Do NOT add multiple shipping options (standard/express) — single fixed cost per category
  - Do NOT change Stripe redirect URLs or success/cancel pages

  **Recommended Agent Profile**:
  - **Category**: `deep`
    - Reason: Touches multiple files (context, sidebar, Edge Function), involves payment logic that must be correct
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 12, 13)
  - **Blocks**: Task 13
  - **Blocked By**: Task 1 (shipping_costs table), Task 8 (profile with address)

  **References**:

  **Pattern References**:
  - `src/context/CartContext.jsx:204-211` — `cartTotal` and `cartCount` useMemo calculations — add similar `shippingTotal` calculation
  - `src/context/CartContext.jsx:218-282` — `startStripeCheckout` function — must pass shipping cost in body payload (line 258-265)
  - `src/components/CartSideBar.jsx:133-153` — Cart footer with subtotal and checkout button — add shipping line and total line here

  **API/Type References**:
  - `src/context/CartContext.jsx:228-237` — Order insert pattern: `supabase.from('orders').insert({ user_id, total_amount, status })` — add `shipping_cost` field
  - `src/context/CartContext.jsx:258-265` — Edge Function invoke with `body: { orderId, cartItems, successUrl, cancelUrl }` — add `shippingCost` to body
  - Supabase Edge Function: `create-checkout-session` — must be updated to include shipping as Stripe line item

  **External References**:
  - Stripe Checkout Session line items: https://stripe.com/docs/api/checkout/sessions/create#create_checkout_session-line_items

  **WHY Each Reference Matters**:
  - `CartContext.jsx:204-211` — Shows EXACTLY how computed values work (useMemo) — shipping uses same pattern
  - `CartContext.jsx:218-282` — The ENTIRE checkout flow. Shipping must be added at line 234 (order insert) and 258 (Edge Function call)
  - `CartSideBar.jsx:133-153` — Where shipping cost is DISPLAYED to the user. Between subtotal (line 138) and checkout button (line 140)

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Shipping cost appears in cart sidebar
    Tool: Playwright
    Preconditions: User logged in, at least 1 product in cart
    Steps:
      1. Navigate to product detail page
      2. Add a product (e.g., a caneca) to cart
      3. Assert cart sidebar opens
      4. Assert "Envio" line visible with a price (e.g., "4,50 €")
      5. Assert "Total" line visible showing subtotal + envio
      6. Verify total = product price × quantity + shipping
    Expected Result: Shipping cost shown, total includes shipping
    Failure Indicators: No shipping line, total doesn't include shipping, NaN
    Evidence: .sisyphus/evidence/task-11-shipping-in-cart.png

  Scenario: Multiple categories increase shipping
    Tool: Playwright
    Preconditions: User logged in
    Steps:
      1. Add a caneca to cart
      2. Note shipping cost (e.g., 4.50€)
      3. Add a camiseta to cart
      4. Assert shipping cost increased (e.g., 4.50€ + 3.50€ = 8.00€)
    Expected Result: Shipping sums per category
    Evidence: .sisyphus/evidence/task-11-multiple-category-shipping.png

  Scenario: Checkout blocked without address
    Tool: Playwright
    Preconditions: User logged in, profile has NO address saved
    Steps:
      1. Add product to cart
      2. Click "Finalizar Compra"
      3. Assert message appears about needing an address
      4. Assert message includes link to /perfil
    Expected Result: Checkout blocked with helpful message
    Failure Indicators: Checkout proceeds without address, no message shown
    Evidence: .sisyphus/evidence/task-11-no-address-block.png

  Scenario: Checkout proceeds with address and includes shipping
    Tool: Playwright
    Preconditions: User logged in, address saved in profile, product in cart
    Steps:
      1. Click "Finalizar Compra"
      2. Assert redirect to Stripe checkout (URL contains stripe.com) OR loading spinner appears
      3. Verify (via Supabase query or console) that order was created with shipping_cost field
    Expected Result: Checkout initiates successfully with shipping included
    Evidence: .sisyphus/evidence/task-11-checkout-with-shipping.txt
  ```

  **Commit**: YES
  - Message: `feat(checkout): fixed shipping costs per category`
  - Files: `src/context/CartContext.jsx`, `src/components/CartSideBar.jsx`, Supabase Edge Function (if accessible)
  - Pre-commit: `npm run build`

- [ ] 12. Histórico de Encomendas no Perfil

  **What to do**:
  - Add "Encomendas" tab/section to the Profile page (`perfil.jsx`)
  - Query `orders` table with `order_items` for the logged-in user: `supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false })`
  - Display orders as a list/accordion with:
    - Order date (formatted), status badge (pendente/pago/enviado/entregue), total amount
    - Expandable detail: list of items (name, quantity, price), shipping cost
  - Status badges with color coding: pendente (yellow), pago (blue), enviado (orange), entregue (green)
  - Empty state: "Ainda não fizeste nenhuma encomenda" with link to /produtos
  - Show order count in tab label: "Encomendas (3)"

  **Must NOT do**:
  - Do NOT add order cancellation functionality
  - Do NOT add order tracking (no CTT tracking integration)
  - Do NOT add invoice download

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Supabase queries with joins, UI rendering with dynamic data, status logic
  - **Skills**: [`playwright`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 13)
  - **Blocks**: None
  - **Blocked By**: Task 8 (profile page must exist)

  **References**:

  **Pattern References**:
  - `src/pages/perfil.jsx` (created in Task 8) — Add new tab/section to existing profile page
  - `src/context/CartContext.jsx:228-255` — How orders and order_items are created (understand table structure: orders has user_id, total_amount, status; order_items has order_id, product_id, name, price, quantity, customization)
  - `src/components/CartSideBar.jsx:61-129` — Item display pattern (image, name, price, quantity) — similar layout for order items

  **API/Type References**:
  - Orders table structure (from CartContext.jsx:229-237): `{ user_id, total_amount, status }` + timestamps
  - Order items structure (from CartContext.jsx:242-249): `{ order_id, product_id, name, price, quantity, customization }`

  **WHY Each Reference Matters**:
  - `perfil.jsx` (Task 8) — Must integrate into existing page structure without breaking other sections
  - `CartContext.jsx:228-255` — Shows EXACTLY how orders are structured in the DB — query must match these fields
  - `CartSideBar.jsx:61-129` — Visual pattern for displaying items with price/quantity — reuse for order items

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: Order history shows past orders
    Tool: Playwright
    Preconditions: User logged in, has at least 1 previous order in DB
    Steps:
      1. Navigate to /perfil
      2. Click/navigate to "Encomendas" tab/section
      3. Assert at least 1 order card visible
      4. Assert order shows date, status badge, total amount
      5. Click/expand an order
      6. Assert order items visible (name, quantity, price)
    Expected Result: Orders render with complete info
    Failure Indicators: Empty when orders exist, missing fields, expand doesn't work
    Evidence: .sisyphus/evidence/task-12-order-history.png

  Scenario: Empty state for new user
    Tool: Playwright
    Preconditions: User logged in, no orders
    Steps:
      1. Navigate to /perfil → Encomendas
      2. Assert message "Ainda não fizeste nenhuma encomenda" or similar
      3. Assert link to /produtos visible
    Expected Result: Friendly empty state with CTA
    Evidence: .sisyphus/evidence/task-12-empty-orders.png

  Scenario: Status badges have correct colors
    Tool: Playwright
    Preconditions: Orders with different statuses exist
    Steps:
      1. Navigate to /perfil → Encomendas
      2. Assert "pendente" badge has yellow/amber styling
      3. Assert "pago" badge has blue styling
    Expected Result: Color-coded status badges
    Evidence: .sisyphus/evidence/task-12-status-badges.png
  ```

  **Commit**: YES
  - Message: `feat(profile): order history tab`
  - Files: `src/pages/perfil.jsx`
  - Pre-commit: `npm run build`

- [ ] 13. Testes Unitários — Auth, Cart, Shipping

  **What to do**:
  - Create test files:
    - `src/__tests__/auth.test.jsx` — Test AuthContext: signIn calls supabase, signUp calls supabase with metadata, resetPassword calls supabase
    - `src/__tests__/cart.test.jsx` — Test CartContext: addToCart adds item, removeFromCart removes, updateQuantity works, cartTotal calculates correctly, cartCount is correct
    - `src/__tests__/shipping.test.jsx` — Test shipping calculation: single category cost, multiple categories sum, correct total (subtotal + shipping)
  - Mock Supabase client for all tests (don't hit real DB)
  - Mock `useAuth` in cart tests
  - Test happy paths AND error cases (e.g., signIn with wrong credentials throws)
  - Target: 10-15 meaningful tests total across the 3 files

  **Must NOT do**:
  - Do NOT write E2E tests (Playwright QA handles that)
  - Do NOT test UI rendering in unit tests (keep them logic-focused)
  - Do NOT test third-party libraries (Stripe, Supabase internals)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Requires understanding of mocking patterns, context testing, multiple test files
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 10, 11, 12)
  - **Blocks**: None
  - **Blocked By**: Task 2 (Vitest setup), Task 3 (auth changes), Task 11 (shipping logic)

  **References**:

  **Pattern References**:
  - `src/context/AuthContext.jsx:28-61` — Auth functions to test (signIn, signUp, signInWithGoogle, resetPassword)
  - `src/context/CartContext.jsx:99-211` — Cart functions to test (addToCart, removeFromCart, updateQuantity, cartTotal, cartCount)
  - `src/__tests__/smoke.test.jsx` (from Task 2) — Test file structure and imports

  **API/Type References**:
  - Vitest mocking: `vi.mock('../services/supabase')` pattern
  - Testing Library renderHook for context testing

  **External References**:
  - Vitest mocking: https://vitest.dev/guide/mocking.html
  - Testing Library renderHook: https://testing-library.com/docs/react-testing-library/api/#renderhook

  **WHY Each Reference Matters**:
  - `AuthContext.jsx:28-61` — The EXACT functions being tested; understand their signatures and return values
  - `CartContext.jsx:99-211` — The cart logic to test; understand state mutations and Supabase calls to mock

  **Acceptance Criteria**:

  **QA Scenarios (MANDATORY):**

  ```
  Scenario: All tests pass
    Tool: Bash
    Steps:
      1. Run `npx vitest run`
      2. Assert exit code 0
      3. Assert output shows 10+ tests passing
      4. Assert 0 tests failing
    Expected Result: All tests green
    Failure Indicators: Any test failure, exit code non-zero
    Evidence: .sisyphus/evidence/task-13-all-tests-pass.txt

  Scenario: Tests cover auth, cart, and shipping
    Tool: Bash
    Steps:
      1. Run `npx vitest run --reporter=verbose`
      2. Assert output contains test suites for auth, cart, shipping
      3. Assert each suite has at least 3 tests
    Expected Result: 3 test suites, each with 3+ tests
    Evidence: .sisyphus/evidence/task-13-test-coverage.txt
  ```

  **Commit**: YES
  - Message: `test: add unit tests for auth, cart, and shipping logic`
  - Files: `src/__tests__/auth.test.jsx`, `src/__tests__/cart.test.jsx`, `src/__tests__/shipping.test.jsx`
  - Pre-commit: `npx vitest run`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npm run build` + linter + `npx vitest run`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (login → profile → add address → add to cart → checkout with shipping). Test mobile responsiveness. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| After Task(s) | Commit Message | Files |
|--------------|----------------|-------|
| 1 | `chore(db): add category, testimonials, shipping_costs schema + profiles address fields` | SQL migrations / Supabase dashboard |
| 2 | `chore(test): setup vitest + testing library` | `vitest.config.js`, `package.json`, `src/test/setup.js` |
| 3 | `feat(auth): add forgot password flow to login modal` | `LoginModal.jsx`, `AuthContext.jsx` |
| 4 | `style: unify hover colors and spacing consistency` | `Header.jsx`, `index.css` |
| 5 | `feat(header): mobile drawer menu + active page indicator` | `Header.jsx` |
| 6 | `feat(footer): add contacts, phone, address, instagram` | `Footer.jsx` |
| 7 | `feat(products): category filters + search bar` | `produtos.jsx`, `ProductCard.jsx` |
| 8 | `feat(profile): user profile page with address management` | `perfil.jsx`, `App.jsx` |
| 9 | `feat(home): dynamic customer testimonials carousel` | `home.jsx`, new `TestimonialCarousel.jsx` |
| 10 | `feat(about): google maps embed + contact info` | `Sobre.jsx` |
| 11 | `feat(checkout): fixed shipping costs per category` | `CartContext.jsx`, `CartSideBar.jsx` |
| 12 | `feat(profile): order history tab` | `perfil.jsx` |
| 13 | `test: add unit tests for auth, cart, and shipping logic` | `src/__tests__/*.test.jsx` |

---

## Success Criteria

### Verification Commands
```bash
npm run build          # Expected: Build successful, no errors
npx vitest run         # Expected: All tests pass
npm run lint           # Expected: No errors (warnings OK)
```

### Final Checklist
- [ ] All "Must Have" present and functional
- [ ] All "Must NOT Have" absent from codebase
- [ ] All tests pass
- [ ] Site responsive on mobile (375px) and desktop (1440px)
- [ ] Login → Register → Forgot Password flow works
- [ ] Products filter by category + search works
- [ ] Feedback carousel loads from Supabase
- [ ] Profile: edit data, address, view orders, change password
- [ ] Cart shows shipping cost, checkout includes it
- [ ] Google Maps visible on Sobre page
- [ ] Footer has phone, Instagram, address
- [ ] Header has active indicator + mobile drawer
