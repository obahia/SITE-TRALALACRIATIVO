# Infraestrutura E-commerce Tralalá Criativo

## TL;DR

> **Quick Summary**: Corrigir toda a infraestrutura backend do site Tralalá Criativo para que funcione como loja real — Stripe webhook, RLS policies, upload de imagens, moeda correta (EUR), e deploy da Edge Function.
> 
> **Deliverables**:
> - Stripe webhook handler (Edge Function) para confirmar pagamentos
> - Todas as RLS policies corrigidas (products, cart_items, order_items)
> - Trigger automático de criação de perfil no signup
> - Upload de imagens via Supabase Storage para personalização
> - Moeda corrigida para EUR em toda a stack
> - Edge Function verificada/deployed
> - Testes automatizados para fluxos críticos
> - Página de sucesso com verificação real de pagamento
> - .env removido do git e .gitignore atualizado
> 
> **Estimated Effort**: Large
> **Parallel Execution**: YES - 4 waves
> **Critical Path**: Task 1 (SQL/RLS) → Task 4 (Webhook) → Task 8 (Testes) → F1-F4

---

## Context

### Original Request
Revisar o projeto e deixar o backend e infraestrutura funcional para um site de vendas — configuração do Stripe, backoffice, tudo que envolve infraestrutura.

### Interview Summary
**Key Discussions**:
- **Moeda**: EUR (Euro) — site em Portugal
- **Supabase**: Tabelas já existem, mas RLS policies podem estar incompletas
- **Edge Function**: Pode não estar deployed — verificar
- **Emails**: NÃO necessário para lançamento
- **Upload de imagens**: SIM, essencial (produtos personalizados)
- **Stripe**: Modo PRODUÇÃO (live keys)
- **Testes**: SIM, incluir testes automatizados
- **Domínio**: Vercel default por agora

### Research Findings
- **SEM webhook Stripe**: Pedidos ficam "pendente" eternamente após pagamento
- **Moeda errada**: Edge Function cobra em BRL, frontend mostra EUR
- **RLS quebrado**: Produtos invisíveis para anônimos, cart_items sem policies, order_items sem INSERT
- **Sem trigger de perfil**: Signup não cria row em profiles
- **Sem Storage bucket**: Upload de imagem na personalização não funciona
- **.env com chaves no repo**: Risco de segurança

---

## Work Objectives

### Core Objective
Tornar a infraestrutura backend do Tralalá Criativo funcional e segura para processar vendas reais com Stripe em EUR.

### Concrete Deliverables
- Edge Function `stripe-webhook` para processar pagamentos confirmados
- Edge Function `create-checkout-session` corrigida (EUR) e deployed
- SQL migration com todas as RLS policies corrigidas
- Trigger `handle_new_user` para criar perfil automático
- Supabase Storage bucket + upload funcional na personalização
- Página `/sucesso` com verificação real do pagamento
- `.gitignore` atualizado, `.env` removido do histórico
- Suite de testes para checkout, carrinho, auth e admin

### Definition of Done
- [ ] `npm run build` passa sem erros
- [ ] `npm test` passa com todos os testes
- [ ] Stripe test checkout completa ciclo: cart → checkout → webhook → status "pago"
- [ ] Visitante anônimo consegue ver produtos
- [ ] Upload de imagem na personalização funciona
- [ ] Admin consegue ver e gerir pedidos/produtos/utilizadores

### Must Have
- Webhook do Stripe funcional
- RLS policies corretas para TODAS as tabelas
- Moeda EUR em toda a stack
- Upload de imagens funcional
- Página de sucesso com verificação de pagamento
- Segurança: .env fora do git

### Must NOT Have (Guardrails)
- NÃO adicionar sistema de emails/notificações
- NÃO mudar o design/UI do frontend (apenas corrigir infraestrutura)
- NÃO adicionar features novas (3D, busca avançada, etc.)
- NÃO over-engineer — manter simplicidade do stack atual
- NÃO adicionar comentários desnecessários ou JSDoc excessivo
- NÃO criar abstrações que não existiam (manter padrão do código existente)
- NÃO mudar estrutura de pastas — seguir convenções já existentes

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** - ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (vitest + testing-library configurados)
- **Automated tests**: YES (Tests-after)
- **Framework**: vitest

### QA Policy
Every task MUST include agent-executed QA scenarios.
Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright - Navigate, interact, assert DOM, screenshot
- **API/Backend**: Use Bash (curl) - Send requests, assert status + response fields
- **Edge Functions**: Use Bash (curl to Supabase function URL)
- **Database**: Use Bash (node script or Supabase CLI)

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Foundation — SQL + Config fixes):
├── Task 1: SQL migration — RLS policies + trigger de perfil [quick]
├── Task 2: Corrigir moeda para EUR na Edge Function [quick]
├── Task 3: Segurança — .gitignore + remover .env do git [quick]

Wave 2 (Core Backend — Edge Functions + Storage):
├── Task 4: Criar Edge Function stripe-webhook (depends: 2) [deep]
├── Task 5: Supabase Storage bucket + upload de imagens (depends: 1) [unspecified-high]
├── Task 6: Corrigir página /sucesso com verificação de pagamento (depends: 1) [quick]

Wave 3 (Integration — Frontend fixes):
├── Task 7: Corrigir useProducts para mostrar produtos a anônimos (depends: 1) [quick]
├── Task 8: Integrar upload de imagem no ProdutoDetalhe (depends: 5) [unspecified-high]
├── Task 9: Deploy checklist — verificar/deploy Edge Functions (depends: 2, 4) [quick]

Wave 4 (Tests):
├── Task 10: Testes — checkout flow, carrinho, auth (depends: 1-9) [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: Task 1 → Task 4 → Task 10 → F1-F4 → user okay
Parallel Speedup: ~60% faster than sequential
Max Concurrent: 3 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 4, 5, 6, 7 |
| 2 | — | 4, 9 |
| 3 | — | — |
| 4 | 2 | 9, 10 |
| 5 | 1 | 8 |
| 6 | 1 | 10 |
| 7 | 1 | 10 |
| 8 | 5 | 10 |
| 9 | 2, 4 | 10 |
| 10 | 1-9 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: **3** — T1 → `quick`, T2 → `quick`, T3 → `quick`
- **Wave 2**: **3** — T4 → `deep`, T5 → `unspecified-high`, T6 → `quick`
- **Wave 3**: **3** — T7 → `quick`, T8 → `unspecified-high`, T9 → `quick`
- **Wave 4**: **1** — T10 → `unspecified-high`
- **FINAL**: **4** — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`

---

## TODOs

- [x] 1. Corrigir RLS Policies + Trigger de Perfil (SQL Migration)

  **What to do**:
  - Criar ficheiro `supabase/migrations/001-fix-rls-and-profiles.sql` com TODAS as correções SQL
  - **RLS products**: Alterar policy SELECT para permitir `anon` ver produtos ativos: `CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (is_active = true);` (sem restrição `TO authenticated`)
  - **RLS cart_items**: Criar policies completas — SELECT/INSERT/UPDATE/DELETE para `auth.uid() = user_id`
  - **RLS order_items**: Adicionar policy INSERT: `WITH CHECK (order_id IN (SELECT id FROM orders WHERE user_id = auth.uid()))`
  - **Trigger handle_new_user**: Criar function + trigger que ao INSERT em `auth.users` cria row em `profiles` com `id`, `email`, `first_name`, `last_name` (extraídos de `raw_user_meta_data`)
  - Incluir instrução clara no topo do ficheiro: "Execute este SQL no Supabase SQL Editor"

  **Must NOT do**:
  - NÃO apagar policies existentes que funcionam — usar `DROP POLICY IF EXISTS` antes de recriar
  - NÃO alterar schema de tabelas (colunas já existem)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3)
  - **Blocks**: Tasks 4, 5, 6, 7
  - **Blocked By**: None

  **References**:
  - `supabase-fixes.sql` — Policies RLS existentes (padrão a seguir, mas incompletas)
  - `supabase-admin-setup.sql` — Setup da tabela admin_users
  - `SUPABASE_RLS_GUIDE.md` — Guide de referência RLS
  - `src/context/CartContext.jsx:26-29` — Query cart_items com `user_id` (confirma coluna usada)
  - `src/context/CartContext.jsx:254-280` — INSERT em order_items (campos: order_id, product_id, name, price, quantity, customization)
  - `src/context/AuthContext.jsx:34-48` — signUp com metadata: first_name, last_name, full_name

  **Acceptance Criteria**:
  - [ ] Ficheiro SQL criado em `supabase/migrations/001-fix-rls-and-profiles.sql`
  - [ ] SQL é válido e executável (sem erros de syntax)

  ```
  Scenario: Verificar SQL syntax
    Tool: Bash
    Steps:
      1. Read the SQL file and check it contains: CREATE POLICY for cart_items (SELECT, INSERT, UPDATE, DELETE), CREATE POLICY for order_items INSERT, CREATE FUNCTION handle_new_user, CREATE TRIGGER on_auth_user_created
      2. Verify policies for products use USING (is_active = true) without TO authenticated restriction for public SELECT
    Expected Result: All required statements present
    Evidence: .sisyphus/evidence/task-1-sql-validation.txt

  Scenario: Verificar que políticas anon existem
    Tool: Bash
    Steps:
      1. grep the SQL file for "anon" or absence of "TO authenticated" on the products SELECT policy
    Expected Result: Products SELECT policy is accessible to anonymous users
    Evidence: .sisyphus/evidence/task-1-anon-policy.txt
  ```

  **Commit**: YES
  - Message: `fix(db): corrigir RLS policies e adicionar trigger de perfil`
  - Files: `supabase/migrations/001-fix-rls-and-profiles.sql`

- [x] 2. Corrigir Moeda para EUR na Edge Function

  **What to do**:
  - Em `supabase/functions/create-checkout-session/index.ts`, alterar `currency: 'brl'` para `currency: 'eur'`
  - Verificar que `unit_amount` usa `Math.round(item.price * 100)` (cents de euro) — já está correto
  - Adicionar `locale: 'pt'` ao `stripe.checkout.sessions.create()` para UI em português
  - Alterar `payment_method_types: ['card']` para `payment_method_types: ['card', 'multibanco']` — métodos comuns em Portugal (MB WAY requer setup adicional no Stripe Dashboard, documentado na Task 9)

  **Must NOT do**:
  - NÃO mudar a lógica da Edge Function
  - NÃO alterar CORS headers ou validação

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3)
  - **Blocks**: Tasks 4, 9
  - **Blocked By**: None

  **References**:
  - `supabase/functions/create-checkout-session/index.ts:39` — Linha com `currency: 'brl'` a corrigir
  - `src/constants.js:3-4` — `CURRENCY: 'EUR'` confirma que frontend usa EUR
  - Stripe docs: https://stripe.com/docs/api/checkout/sessions/create — locale parameter

  **Acceptance Criteria**:
  - [ ] `currency` alterado para `'eur'` no ficheiro
  - [ ] `locale: 'pt'` adicionado

  ```
  Scenario: Verificar moeda corrigida
    Tool: Bash
    Steps:
      1. grep create-checkout-session/index.ts for "currency"
      2. Assert it shows 'eur' not 'brl'
    Expected Result: currency: 'eur'
    Evidence: .sisyphus/evidence/task-2-currency-check.txt

  Scenario: Verificar que BRL não existe mais
    Tool: Bash
    Steps:
      1. grep -r "brl" supabase/functions/
    Expected Result: No matches found
    Evidence: .sisyphus/evidence/task-2-no-brl.txt
  ```

  **Commit**: YES
  - Message: `fix(stripe): corrigir moeda para EUR na edge function`
  - Files: `supabase/functions/create-checkout-session/index.ts`

- [x] 3. Segurança — .gitignore + Remover .env do Git

  **What to do**:
  - Verificar `.gitignore` — garantir que `.env` está listado (NÃO `.env.example`)
  - Se `.env` está tracked: `git rm --cached .env` para remover do tracking sem apagar o ficheiro
  - Remover `VITE_SUCCESS_URL` e `VITE_CANCEL_URL` do `.env` (não são usados — o código constrói as URLs dinamicamente com `window.location.origin`)
  - Verificar que `.env.example` NÃO contém valores reais (já está ok)

  **Must NOT do**:
  - NÃO apagar o ficheiro `.env` local
  - NÃO alterar `.env.example`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`git-master`]

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2)
  - **Blocks**: None
  - **Blocked By**: None

  **References**:
  - `.env` — Contém chaves reais (Supabase URL, anon key, Stripe publishable key)
  - `.env.example` — Template sem valores reais (está ok)
  - `.gitignore` — Verificar se .env está listado
  - `src/context/CartContext.jsx:288-289` — URLs construídas com `window.location.origin` (confirma que VITE_SUCCESS_URL e VITE_CANCEL_URL são desnecessárias)

  **Acceptance Criteria**:
  - [ ] `.env` no .gitignore
  - [ ] `.env` não tracked por git (`git ls-files .env` retorna vazio)

  ```
  Scenario: .env não tracked
    Tool: Bash
    Steps:
      1. Run `git ls-files .env`
    Expected Result: Empty output (file not tracked)
    Evidence: .sisyphus/evidence/task-3-env-not-tracked.txt

  Scenario: .gitignore contém .env
    Tool: Bash
    Steps:
      1. grep ".env" .gitignore
    Expected Result: ".env" line present (but NOT ".env.example")
    Evidence: .sisyphus/evidence/task-3-gitignore.txt
  ```

  **Commit**: YES
  - Message: `chore(security): remover .env do git e atualizar .gitignore`
  - Files: `.gitignore`

- [x] 4. Criar Edge Function stripe-webhook

  **What to do**:
  - Criar `supabase/functions/stripe-webhook/index.ts`
  - Handler para evento `checkout.session.completed`:
    - Extrair `orderId` dos `metadata` da session
    - Atualizar `orders.status` para `'pago'` no Supabase
    - Guardar `stripe_session_id` na order (adicionar coluna se necessário — incluir ALTER TABLE no SQL do Task 1, ou criar migration separada)
  - Verificar assinatura do webhook com `stripe.webhooks.constructEvent()` usando `STRIPE_WEBHOOK_SECRET`
  - CORS headers para Stripe (POST only)
  - Usar Supabase service role key (não anon key) para bypass RLS ao atualizar orders
  - Atualizar `.env.example` para incluir `STRIPE_WEBHOOK_SECRET`

  **Must NOT do**:
  - NÃO processar refunds (fora do scope)
  - NÃO enviar emails
  - NÃO lidar com eventos além de `checkout.session.completed`

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 5, 6)
  - **Blocks**: Tasks 9, 10
  - **Blocked By**: Task 2

  **References**:
  - `supabase/functions/create-checkout-session/index.ts` — Padrão de Edge Function existente (CORS, Deno.serve, Stripe import)
  - `supabase/functions/create-checkout-session/index.ts:54` — `metadata: { orderId: String(orderId) }` — como o orderId é passado ao Stripe
  - `src/context/CartContext.jsx:254-291` — Fluxo de checkout que cria order e chama edge function
  - Stripe webhook docs: https://stripe.com/docs/webhooks
  - Stripe Deno: `import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'`

  **Acceptance Criteria**:
  - [ ] Ficheiro `supabase/functions/stripe-webhook/index.ts` criado
  - [ ] Verifica assinatura do webhook
  - [ ] Atualiza order status para 'pago' com orderId dos metadata
  - [ ] Usa service role key para bypass RLS

  ```
  Scenario: Webhook handler estrutura válida
    Tool: Bash
    Steps:
      1. Read stripe-webhook/index.ts
      2. Verify it imports Stripe, uses Deno.serve, handles POST
      3. Verify it calls stripe.webhooks.constructEvent
      4. Verify it updates orders table with status 'pago'
      5. Verify it reads orderId from session.metadata
    Expected Result: All structural elements present
    Evidence: .sisyphus/evidence/task-4-webhook-structure.txt

  Scenario: Webhook rejeita requests sem assinatura
    Tool: Bash
    Steps:
      1. Read the code and verify that missing/invalid signature returns 400/401
    Expected Result: Error handling for invalid signatures exists
    Evidence: .sisyphus/evidence/task-4-webhook-security.txt
  ```

  **Commit**: YES
  - Message: `feat(stripe): adicionar webhook handler para confirmar pagamentos`
  - Files: `supabase/functions/stripe-webhook/index.ts`, `.env.example`

- [x] 5. Supabase Storage Bucket + Upload Service

  **What to do**:
  - Criar instruções SQL para criar bucket `customization-images` no Supabase Storage (ou documentar passo manual no Dashboard)
  - Criar `src/services/storage.js` com funções:
    - `uploadCustomizationImage(file, userId)` — upload para `customization-images/{userId}/{timestamp}-{filename}`
    - `getImageUrl(path)` — retorna public URL do ficheiro
    - `deleteImage(path)` — remove ficheiro
  - Policies de Storage: authenticated users podem upload para seu próprio path, admins veem tudo
  - Seguir padrão de `src/services/supabase.js` (export simples, import do supabase client)

  **Must NOT do**:
  - NÃO criar UI de upload (Task 8 faz isso)
  - NÃO over-engineer (sem compressão, sem thumbnails)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 6)
  - **Blocks**: Task 8
  - **Blocked By**: Task 1

  **References**:
  - `src/services/supabase.js` — Padrão de service file (import client, export functions)
  - `src/pages/produtodetalhe.jsx` — Página que usará o upload (ver como customization é passada ao cart)
  - `SUPABASE_RLS_GUIDE.md:56-63` — Exemplo de Storage policy
  - Supabase Storage docs: https://supabase.com/docs/guides/storage

  **Acceptance Criteria**:
  - [ ] `src/services/storage.js` criado com uploadCustomizationImage, getImageUrl, deleteImage
  - [ ] SQL/instruções para criar bucket documentadas
  - [ ] Funções usam o supabase client de `src/services/supabase.js`

  ```
  Scenario: Service file exporta funções corretas
    Tool: Bash
    Steps:
      1. Read src/services/storage.js
      2. Verify exports: uploadCustomizationImage, getImageUrl, deleteImage
      3. Verify it imports supabase from './supabase'
    Expected Result: All 3 functions exported, uses existing supabase client
    Evidence: .sisyphus/evidence/task-5-storage-service.txt

  Scenario: Upload path inclui userId
    Tool: Bash
    Steps:
      1. grep storage.js for userId in the upload path
    Expected Result: Path template includes userId for isolation
    Evidence: .sisyphus/evidence/task-5-upload-path.txt
  ```

  **Commit**: YES
  - Message: `feat(storage): adicionar serviço de upload de imagens para personalização`
  - Files: `src/services/storage.js`, `supabase/migrations/002-storage-bucket.sql`

- [x] 6. Corrigir Página /sucesso com Verificação de Pagamento

  **What to do**:
  - Em `src/pages/sucesso.jsx`, adicionar verificação do status do pedido:
    - Ao carregar, consultar `orders` com o `orderId` da URL
    - Se status é `'pago'` → mostrar confirmação
    - Se status é `'pendente'` → mostrar "A verificar pagamento..." com polling (re-check a cada 3s, max 30s)
    - Se orderId inválido ou pedido não pertence ao user → redirect para `/`
  - Limpar carrinho APENAS quando status confirmado como 'pago'

  **Must NOT do**:
  - NÃO mudar o design visual da página (manter ícones, layout, cores)
  - NÃO adicionar mais de 30s de polling

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with Tasks 4, 5)
  - **Blocks**: Task 10
  - **Blocked By**: Task 1

  **References**:
  - `src/pages/sucesso.jsx` — Página atual (limpa carrinho sem verificação)
  - `src/services/supabase.js` — Client para consultar orders
  - `src/context/CartContext.jsx:221-228` — clearCart function
  - `src/context/AuthContext.jsx:7` — useAuth para obter user

  **Acceptance Criteria**:
  - [ ] Página consulta status do pedido antes de confirmar
  - [ ] clearCart só é chamado quando status === 'pago'
  - [ ] Redireciona para `/` se orderId inválido

  ```
  Scenario: Sucesso verifica pagamento
    Tool: Bash
    Steps:
      1. Read src/pages/sucesso.jsx
      2. Verify it queries supabase orders table with orderId
      3. Verify clearCart is conditional on payment status
      4. Verify redirect logic for invalid orders
    Expected Result: All verification logic present
    Evidence: .sisyphus/evidence/task-6-sucesso-verification.txt

  Scenario: Polling existe para status pendente
    Tool: Bash
    Steps:
      1. grep sucesso.jsx for "setInterval" or "setTimeout" or polling logic
    Expected Result: Polling mechanism exists with timeout
    Evidence: .sisyphus/evidence/task-6-polling.txt
  ```

  **Commit**: YES
  - Message: `fix(checkout): verificar pagamento na página de sucesso`
  - Files: `src/pages/sucesso.jsx`

- [x] 7. Corrigir useProducts para Anônimos

  **What to do**:
  - Verificar `src/hooks/useProducts.js` — o código atual consulta `products` sem filtro de `is_active`
  - Adicionar `.eq('is_active', true)` ao query para que apenas produtos ativos apareçam no frontend
  - O fix principal é na RLS (Task 1) mas o frontend também deve filtrar
  - Nota: A RLS policy da Task 1 já permite anon ver produtos — este task garante que o frontend também filtra corretamente

  **Must NOT do**:
  - NÃO mudar a interface do hook (mesmos parâmetros, mesmo retorno)
  - NÃO adicionar cache ou otimizações

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 8, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Task 1

  **References**:
  - `src/hooks/useProducts.js:15-18` — Query atual sem filtro is_active
  - `src/pages/produtos.jsx` — Usa useProducts hook
  - `src/pages/admin/Products.jsx:41-54` — Admin fetch sem filtro is_active (correto — admin vê tudo)

  **Acceptance Criteria**:
  - [ ] useProducts filtra `is_active = true` por default
  - [ ] useProduct (single) também filtra `is_active = true`

  ```
  Scenario: Query filtra produtos ativos
    Tool: Bash
    Steps:
      1. Read src/hooks/useProducts.js
      2. Verify .eq('is_active', true) present in both useProducts and useProduct
    Expected Result: Both hooks filter by is_active
    Evidence: .sisyphus/evidence/task-7-active-filter.txt
  ```

  **Commit**: YES (groups with Task 8)
  - Message: `fix(products): filtrar produtos ativos e permitir acesso anônimo`
  - Files: `src/hooks/useProducts.js`

- [x] 8. Integrar Upload de Imagem no ProdutoDetalhe

  **What to do**:
  - Em `src/pages/produtodetalhe.jsx`, integrar o serviço de upload da Task 5
  - Quando utilizador seleciona opção de personalização com `allows_image: true`:
    - Mostrar input de ficheiro (aceitar image/*)
    - Ao selecionar ficheiro, chamar `uploadCustomizationImage(file, user.id)` do `src/services/storage.js`
    - Mostrar preview da imagem uploaded
    - Guardar a URL pública no objecto `customization.uploadedImage`
  - Se user não está logado e tenta upload → abrir LoginModal
  - Mostrar loading state durante upload

  **Must NOT do**:
  - NÃO mudar o design geral da página
  - NÃO adicionar crop/resize no frontend
  - NÃO aceitar ficheiros > 5MB (validar antes de upload)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 9)
  - **Blocks**: Task 10
  - **Blocked By**: Task 5

  **References**:
  - `src/pages/produtodetalhe.jsx` — Página de detalhe do produto (ver como customization funciona)
  - `src/services/storage.js` — Serviço de upload criado na Task 5
  - `src/context/AuthContext.jsx` — useAuth para verificar login
  - `src/components/CartSideBar.jsx:84-87` — Como uploadedImage é exibida no carrinho (badge "Imagem Anexada")
  - `src/pages/admin/Products.jsx:406-414` — Checkbox `allows_image` nas opções de customização

  **Acceptance Criteria**:
  - [ ] Input de ficheiro aparece para opções com `allows_image: true`
  - [ ] Upload chama `uploadCustomizationImage` do storage service
  - [ ] Preview da imagem após upload
  - [ ] URL guardada em `customization.uploadedImage`
  - [ ] Validação de tamanho (max 5MB)
  - [ ] LoginModal abre se user não logado

  ```
  Scenario: Upload integrado na personalização
    Tool: Bash
    Steps:
      1. Read src/pages/produtodetalhe.jsx
      2. Verify import of uploadCustomizationImage from services/storage
      3. Verify file input rendered conditionally on allows_image
      4. Verify uploaded URL stored in customization.uploadedImage
      5. Verify 5MB size validation
    Expected Result: All upload integration elements present
    Evidence: .sisyphus/evidence/task-8-upload-integration.txt

  Scenario: Upload requer login
    Tool: Bash
    Steps:
      1. grep produtodetalhe.jsx for LoginModal or setIsLoginModalOpen related to upload
    Expected Result: Login check before upload
    Evidence: .sisyphus/evidence/task-8-login-check.txt
  ```

  **Commit**: YES
  - Message: `feat(upload): integrar upload de imagem na personalização do produto`
  - Files: `src/pages/produtodetalhe.jsx`

- [x] 9. Guia Completo de Configuração Stripe + Deploy Checklist

  **What to do**:
  - Criar `docs/STRIPE-SETUP-GUIDE.md` com guia completo passo-a-passo:

    **Parte 1 — Ativar Stripe para Produção:**
    1. Ir a https://dashboard.stripe.com/account/onboarding — completar ativação (dados da empresa, conta bancária, documento de identidade)
    2. Ir a Settings > Business > Public details — preencher nome "Tralalá Criativo", descrição, website URL
    3. Ir a Settings > Branding — upload do logo, cores da marca para o checkout hosted
    4. Ir a Settings > Payments > Payment methods — ativar: Cards, MB WAY, Multibanco (métodos comuns em Portugal)
    5. Verificar que o modo "Test" vs "Live" está visível no toggle do Dashboard

    **Parte 2 — Obter Chaves de Produção:**
    1. Ir a Developers > API Keys (com toggle em **Live**)
    2. Copiar `Publishable key` (começa com `pk_live_...`)
    3. Copiar `Secret key` (começa com `sk_live_...`) — NÃO partilhar, guardar em segredo
    4. Onde colocar cada chave:
       - `pk_live_...` → `.env` como `VITE_STRIPE_PUBLISHABLE_KEY`
       - `sk_live_...` → Supabase Dashboard > Edge Functions > Secrets como `STRIPE_SECRET_KEY`

    **Parte 3 — Configurar Webhook:**
    1. Ir a Developers > Webhooks > Add endpoint
    2. **Endpoint URL**: `https://{supabase-project-ref}.supabase.co/functions/v1/stripe-webhook`
       - O project-ref é o valor em `VITE_SUPABASE_URL` entre `https://` e `.supabase.co` (no caso deste projeto: `riioszwtwjbestbxbzxu`)
       - URL completa: `https://riioszwtwjbestbxbzxu.supabase.co/functions/v1/stripe-webhook`
    3. **Events to send**: Selecionar APENAS `checkout.session.completed`
    4. Clicar "Add endpoint"
    5. Na página do endpoint criado, clicar "Reveal" no **Signing secret** (começa com `whsec_...`)
    6. Copiar este signing secret → Supabase Dashboard > Edge Functions > Secrets como `STRIPE_WEBHOOK_SECRET`

    **Parte 4 — Testar Webhook (antes de ir live):**
    1. No Stripe Dashboard > Webhooks > clicar no endpoint
    2. Clicar "Send test webhook" > selecionar `checkout.session.completed` > Send
    3. Verificar que o status mostra 200 OK
    4. Se falhar: verificar nos logs do Supabase (Dashboard > Edge Functions > Logs)

    **Parte 5 — Configuração do Supabase:**
    1. Ir a Supabase Dashboard > Edge Functions > Secrets
    2. Adicionar 3 secrets:
       - `STRIPE_SECRET_KEY` = `sk_live_...`
       - `STRIPE_WEBHOOK_SECRET` = `whsec_...`
       - `SUPABASE_SERVICE_ROLE_KEY` = (copiar de Settings > API > service_role key)
    3. Deploy Edge Functions:
       - `supabase functions deploy create-checkout-session`
       - `supabase functions deploy stripe-webhook`
       - Ou via Supabase Dashboard > Edge Functions se não tiver CLI

    **Parte 6 — Configuração do Vercel:**
    1. Ir a Vercel Dashboard > Project > Settings > Environment Variables
    2. Adicionar:
       - `VITE_SUPABASE_URL` = URL do Supabase
       - `VITE_SUPABASE_ANON_KEY` = anon key do Supabase
       - `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
    3. Redeploy: Settings > Deployments > Redeploy

    **Parte 7 — Executar SQL Migrations:**
    1. Ir a Supabase Dashboard > SQL Editor
    2. Colar e executar `supabase/migrations/001-fix-rls-and-profiles.sql`
    3. Colar e executar `supabase/migrations/002-storage-bucket.sql`
    4. Verificar: ir a Table Editor e confirmar que as tabelas e policies existem

    **Troubleshooting:**
    - "Webhook retorna 401": Verificar que `STRIPE_WEBHOOK_SECRET` está correto nos Secrets
    - "Produtos não aparecem": Verificar RLS policy — executar migration 001
    - "Checkout falha": Verificar `STRIPE_SECRET_KEY` nos Secrets e que Edge Function está deployed
    - "Upload não funciona": Verificar que bucket `customization-images` existe e policies estão criadas
    - "Pagamento não atualiza status": Verificar webhook nos logs do Stripe e do Supabase

  **Must NOT do**:
  - NÃO incluir chaves reais no ficheiro
  - NÃO executar deploy automaticamente

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with Tasks 7, 8)
  - **Blocks**: Task 10
  - **Blocked By**: Tasks 2, 4

  **References**:
  - `supabase/functions/create-checkout-session/index.ts` — Edge function existente
  - `supabase/functions/stripe-webhook/index.ts` — Nova edge function (Task 4)
  - `.env.example` — Template de variáveis
  - `.env` — Contém o project-ref do Supabase (riioszwtwjbestbxbzxu)
  - `vercel.json` — Config Vercel existente
  - Stripe Dashboard docs: https://stripe.com/docs/dashboard
  - Stripe webhook docs: https://stripe.com/docs/webhooks/quickstart
  - Supabase Edge Functions docs: https://supabase.com/docs/guides/functions

  **Acceptance Criteria**:
  - [ ] `docs/STRIPE-SETUP-GUIDE.md` criado com todas as 7 partes
  - [ ] Inclui URLs específicas do projeto (project-ref correto)
  - [ ] Inclui troubleshooting section com 5+ problemas comuns
  - [ ] NÃO contém chaves reais

  ```
  Scenario: Guia completo
    Tool: Bash
    Steps:
      1. Read docs/STRIPE-SETUP-GUIDE.md
      2. Verify it covers: account activation, API keys, webhook setup, webhook testing, Supabase secrets, Vercel env vars, SQL migrations
      3. Verify troubleshooting section exists with at least 5 entries
      4. Verify no real API keys present (no pk_live_, sk_live_, whsec_ actual values)
    Expected Result: All 7 sections documented, no real keys, troubleshooting present
    Evidence: .sisyphus/evidence/task-9-stripe-guide.txt

  Scenario: URLs do projeto corretas
    Tool: Bash
    Steps:
      1. grep docs/STRIPE-SETUP-GUIDE.md for supabase.co
      2. Verify project-ref matches riioszwtwjbestbxbzxu
    Expected Result: Correct Supabase project URL referenced
    Evidence: .sisyphus/evidence/task-9-urls.txt
  ```

  **Commit**: YES
  - Message: `docs: adicionar guia completo de configuração Stripe e deploy`
  - Files: `docs/STRIPE-SETUP-GUIDE.md`

- [ ] 10. Testes Automatizados — Checkout, Carrinho, Auth, Admin

  **What to do**:
  - Criar testes com vitest + testing-library para:
    - **Cart**: `src/__tests__/CartContext.test.jsx` — addToCart, removeFromCart, updateQuantity, clearCart, cartTotal calculation
    - **Auth**: `src/__tests__/AuthContext.test.jsx` — signIn, signUp, logout, state management
    - **Sucesso page**: `src/__tests__/sucesso.test.jsx` — verifica polling de status, redirect para orderId inválido
    - **Storage service**: `src/__tests__/storage.test.js` — uploadCustomizationImage, getImageUrl, deleteImage (mock supabase)
    - **useProducts hook**: `src/__tests__/useProducts.test.js` — filtra is_active, retorna loading/error states
  - Usar mocks para Supabase e Stripe (NÃO chamadas reais)
  - Seguir padrão de testes existente em `src/__tests__/` e `src/test/`

  **Must NOT do**:
  - NÃO fazer chamadas reais ao Supabase ou Stripe nos testes
  - NÃO testar UI visual (apenas lógica e integração)
  - NÃO criar testes para admin pages (fora do scope de infraestrutura)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential — depends on all previous)
  - **Blocks**: F1-F4
  - **Blocked By**: Tasks 1-9

  **References**:
  - `vitest.config.js` — Config de testes existente
  - `src/test/` — Setup de testes existente
  - `src/__tests__/` — Testes existentes (seguir padrão)
  - `src/context/CartContext.jsx` — Lógica do carrinho a testar
  - `src/context/AuthContext.jsx` — Lógica de auth a testar
  - `src/pages/sucesso.jsx` — Página de sucesso corrigida (Task 6)
  - `src/services/storage.js` — Storage service (Task 5)
  - `src/hooks/useProducts.js` — Hook corrigido (Task 7)
  - `package.json:12` — Script `test: vitest run`

  **Acceptance Criteria**:
  - [ ] `npm test` passa com 0 falhas
  - [ ] Pelo menos 5 test files criados
  - [ ] Cart tests cobrem: add, remove, update quantity, clear, total
  - [ ] Supabase e Stripe devidamente mockados

  ```
  Scenario: Todos os testes passam
    Tool: Bash
    Steps:
      1. Run `npm test`
      2. Assert exit code 0
      3. Assert output shows all tests passing
    Expected Result: 0 failures, all test suites pass
    Evidence: .sisyphus/evidence/task-10-test-results.txt

  Scenario: Testes não fazem chamadas externas
    Tool: Bash
    Steps:
      1. grep -r "supabase.co" src/__tests__/
      2. grep -r "stripe.com" src/__tests__/
    Expected Result: No real URLs in test files (only mocks)
    Evidence: .sisyphus/evidence/task-10-no-external-calls.txt
  ```

  **Commit**: YES
  - Message: `test: adicionar testes para checkout, carrinho, auth e storage`
  - Files: `src/__tests__/*.test.{jsx,js}`

---

## Final Verification Wave

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run linter + `npm test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)
  Start from clean state. Test full checkout flow: browse products → add to cart → checkout → Stripe → success page. Test admin panel. Test upload de imagem. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff. Verify 1:1 — everything in spec was built, nothing beyond spec. Check "Must NOT do" compliance. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1**: `fix(db): corrigir RLS policies e adicionar trigger de perfil` — SQL files
- **Wave 1**: `fix(stripe): corrigir moeda para EUR na edge function` — supabase/functions/
- **Wave 1**: `chore(security): remover .env do git e atualizar .gitignore` — .gitignore
- **Wave 2**: `feat(stripe): adicionar webhook handler para confirmar pagamentos` — supabase/functions/
- **Wave 2**: `feat(storage): adicionar upload de imagens para personalização` — src/, supabase/
- **Wave 3**: `fix(products): permitir anônimos verem produtos` — src/hooks/
- **Wave 3**: `feat(upload): integrar upload no detalhe do produto` — src/pages/
- **Wave 4**: `test: adicionar testes para checkout, carrinho e auth` — src/__tests__/

---

## Success Criteria

### Verification Commands
```bash
npm run build  # Expected: Build succeeds
npm test       # Expected: All tests pass
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] Stripe webhook processes payment and updates order status
- [ ] Anonymous visitors can see products
- [ ] Image upload works in product customization
- [ ] .env not tracked by git
