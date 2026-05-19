# 🚀 Guia Completo de Setup para Produção

## 1️⃣ Preparação do Stripe

### Passo 1: Ativar Stripe
1. Aceda a [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete o formulário de onboarding (informações da empresa)
3. Ative a conta (verifique email)

### Passo 2: Configurar Métodos de Pagamento
1. Vá a **Settings > Payments > Payment methods**
2. Ative:
   - ✅ Cards (Visa, Mastercard, Amex)
   - ✅ MB WAY (Portugal)
   - ✅ Multibanco (Portugal)

### Passo 3: Obter Chaves de Produção
1. Vá a **Developers > API Keys**
2. **Certifique-se que o toggle "Live" está ativo** (não Test)
3. Copie:
   - **Publishable key** → `pk_live_...`
   - **Secret key** → `sk_live_...` (guarde em local seguro)

### Passo 4: Configurar Webhook
1. Vá a **Developers > Webhooks**
2. Clique **+ Add endpoint**
3. URL do endpoint:
   ```
   https://[seu-supabase-url].supabase.co/functions/v1/stripe-webhook
   ```
4. Selecione eventos:
   - ✅ `checkout.session.completed`
5. Copie o **Signing secret** → `whsec_...`

---

## 2️⃣ Configuração do Supabase

### Passo 1: Variáveis de Ambiente (Edge Functions)
1. Vá a **Edge Functions > Secrets**
2. Clique **+ New secret** e adicione:

```
STRIPE_SECRET_KEY
sk_live_[seu-valor-aqui]

STRIPE_WEBHOOK_SECRET
whsec_[seu-valor-aqui]

SUPABASE_SERVICE_ROLE_KEY
[copiar de Settings > API > service_role secret]
```

### Passo 2: Deploy das Edge Functions
Execute na linha de comando:
```bash
# Instale o Supabase CLI (se não tiver)
npm install -g supabase

# Login
supabase login

# Deploy
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

### Passo 3: Ativar Row Level Security (RLS)
No **SQL Editor**, execute:

```sql
-- Tabelas de usuário
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Tabelas públicas
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### Passo 4: Criar Políticas de RLS
No **SQL Editor**, execute:

```sql
-- Profiles: Usuários veem seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Orders: Usuários veem seus próprios pedidos
CREATE POLICY "Users can view own orders" ON orders FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert orders" ON orders FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Order items: Privadas
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT 
USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Cart items: Privadas por usuário
CREATE POLICY "Users can view own cart" ON cart_items FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can manage own cart" ON cart_items FOR ALL 
USING (user_id = auth.uid());

-- Products: Leitura pública
CREATE POLICY "Products are public" ON products FOR SELECT 
USING (true);

-- Service role pode fazer tudo (para Edge Functions)
-- Já é habilitado por padrão
```

### Passo 5: Configurar Storage (Imagens de Customização)
1. Vá a **Storage > Buckets**
2. Crie bucket chamado `customization-images`
3. Vá a **Policies** e configure:
```sql
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'customization-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own uploads" ON storage.objects FOR SELECT 
USING (bucket_id = 'customization-images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE 
USING (bucket_id = 'customization-images' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 3️⃣ Configuração da Hospedagem (Vercel)

### Passo 1: Importar Repositório
1. Vá a [Vercel Dashboard](https://vercel.com)
2. Clique **Add New > Project**
3. Selecione seu repositório GitHub
4. Configure o root directory (se necessário)

### Passo 2: Variáveis de Ambiente
Em **Project Settings > Environment Variables**, adicione:

```
VITE_SUPABASE_URL
https://[seu-projeto].supabase.co

VITE_SUPABASE_ANON_KEY
sb_anon_[seu-valor]

VITE_STRIPE_PUBLISHABLE_KEY
pk_live_[seu-valor]
```

### Passo 3: Deploy
1. Clique **Deploy**
2. Aguarde conclusão (2-5 minutos)
3. Teste a URL fornecida

---

## 4️⃣ Configurar Domínio

### Opção A: Domínio Existente
1. Em Vercel > Project > Domains
2. Clique **Add** e escreva seu domínio
3. Copie os registros DNS
4. No seu registador (ex: Godaddy, Namecheap), adicione os registos
5. Aguarde propagação (até 48 horas)

### Opção B: Comprar Domínio em Vercel
1. Em Vercel > Project > Domains
2. Clique **Add** e procure domínios
3. Complete a compra diretamente

---

## 5️⃣ HTTPS & Certificados

✅ **Vercel ativa automaticamente HTTPS com Let's Encrypt**
- Sem ação necessária
- Renovação automática

---

## 6️⃣ Testes Finais

### Checklist de Testes
```bash
# 1. Build localmente
npm run build

# 2. Testar build localmente
npm run preview

# 3. Verificar console (F12) sem erros
# 4. Testar fluxo completo:
#    - Registar conta
#    - Adicionar itens ao carrinho
#    - Fazer checkout
#    - Verificar pedido em Supabase

# 5. Testar webhook (Stripe Dashboard > Webhooks > Test endpoint)
# 6. Monitorar logs (Supabase > Edge Functions > Logs)
```

---

## 7️⃣ Monitoramento Pós-Launch

### Supabase
- **Database** > Ver estatísticas
- **Edge Functions** > Logs de erros
- **Storage** > Uso de armazenamento

### Stripe
- **Payments** > Transações
- **Webhooks** > Eventos processados
- **Logs** > Verificar erros

### Vercel
- **Analytics** > Performance
- **Deployments** > Histórico
- **Monitoring** > Erros de runtime

---

## 🆘 Troubleshooting

### Webhook retorna 401
```
→ Verificar STRIPE_WEBHOOK_SECRET em Supabase Edge Function Secrets
→ Confirmar que é igual ao webhook signing secret no Stripe Dashboard
```

### Checkout falha com erro de pagamento
```
→ Verificar STRIPE_SECRET_KEY em Supabase
→ Confirmar que está em modo LIVE (não test)
→ Verificar logs em Supabase > Edge Functions
```

### Imagens não carregam
```
→ Verificar que bucket 'customization-images' existe em Storage
→ Confirmar que RLS policies estão corretas
→ Testar upload manualmente em Supabase Dashboard
```

### RLS bloqueia acesso legítimo
```
→ Verificar que policies usam auth.uid() corretamente
→ Confirmar que usuário está autenticado (não anônimo)
→ Testar policy diretamente em Table Editor do Supabase
```

---

## 📞 Recursos Úteis

- [Stripe API Docs](https://stripe.com/docs/api)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [React Docs](https://react.dev)

---

**Data de Configuração:** [Insira a data]
**Versão do Projeto:** 1.0.0
**Próxima Revisão:** [Insira prazo]
