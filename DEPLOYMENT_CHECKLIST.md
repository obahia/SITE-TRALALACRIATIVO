# 📋 Checklist de Deployment para Produção

## ✅ Pré-requisitos

- [ ] Conta Stripe Live ativada (não em modo de teste)
- [ ] Projeto Supabase configurado com banco de dados PostgreSQL
- [ ] Conta Vercel/hospedagem pronta
- [ ] Domínio DNS apontado para hospedagem

---

## 🔐 Configuração de Segurança

### Stripe
- [ ] Ativar Live Mode no Stripe Dashboard
- [ ] Copiar `pk_live_...` (chave pública)
- [ ] Copiar `sk_live_...` (chave secreta)
- [ ] Copiar webhook signing secret `whsec_...`
- [ ] Configurar webhook endpoint: `https://seu-supabase.supabase.co/functions/v1/stripe-webhook`

### Supabase
- [ ] Ativar Row Level Security (RLS) em todas as tabelas sensíveis
- [ ] Criar políticas RLS:
  - [ ] Tabela `profiles` - usuários só veem seu próprio perfil
  - [ ] Tabela `orders` - usuários só veem seus próprios pedidos
  - [ ] Tabela `products` - públicas (leitura)
  - [ ] Tabela `cart_items` - privadas por usuário
- [ ] Configurar secrets nas Edge Functions:
  - [ ] `STRIPE_SECRET_KEY=sk_live_...`
  - [ ] `STRIPE_WEBHOOK_SECRET=whsec_...`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY=...`

---

## 🚀 Configuração de Hospedagem (Vercel)

### Variáveis de Ambiente
Configure no Vercel > Settings > Environment Variables:
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY` (pk_live_...)

### Build & Deploy
- [ ] Verificar que o Build Command é: `npm run build`
- [ ] Verificar que Output Directory é: `dist`
- [ ] Testar deploy em staging primeiro

---

## 📧 Configuração de E-mails

### Supabase Auth
- [ ] Configurar remetente de email (Auth > Email Templates)
- [ ] Testar email de confirmação de conta
- [ ] Testar email de reset de password

### Edge Functions
- [ ] Testar webhook de Stripe (enviar pedido de teste)
- [ ] Verificar logs em Supabase > Edge Functions

---

## 🧪 Testes Pré-Launch

### Autenticação
- [ ] Registrar nova conta
- [ ] Fazer login
- [ ] Fazer logout
- [ ] Reset de password
- [ ] Login com Google (se configurado)

### Carrinho & Checkout
- [ ] Adicionar produtos ao carrinho
- [ ] Editar quantidade
- [ ] Remover itens
- [ ] Iniciar checkout
- [ ] Completar pagamento com cartão de teste
- [ ] Verificar pedido criado em `orders`
- [ ] Verificar status "pago" atualizado

### Admin
- [ ] Login como admin
- [ ] Aceder ao painel (/admin)
- [ ] Criar novo produto
- [ ] Editar produto existente
- [ ] Deletar produto
- [ ] Ver lista de pedidos
- [ ] Ver lista de usuários

### Performance
- [ ] Executar: `npm run build`
- [ ] Verificar tamanho do bundle em `dist/`
- [ ] Testar em rede lenta (DevTools > Throttling)
- [ ] Verificar Lighthouse Score > 80

---

## 🔒 Segurança Final

- [ ] Remover console.logs de produção
- [ ] Verificar que nenhum secret está em `.env.example`
- [ ] Confirmar HTTPS ativado
- [ ] Testar que RLS bloqueia acessos não autorizados
- [ ] Verificar headers de segurança no response

---

## 🌐 DNS & Domínio

- [ ] Apontar domínio para hospedagem
- [ ] Aguardar propagação DNS (até 48h)
- [ ] Ativar SSL/HTTPS automático
- [ ] Testar acesso via domínio

---

## 📱 Responsividade & UX

- [ ] Testar em móbil (iOS & Android)
- [ ] Testar em tablet
- [ ] Testar em desktop
- [ ] Verificar navegação fluida
- [ ] Testar formulários de entrada

---

## 🆘 Monitoramento Pós-Launch

Após o launch, monitorar:
- [ ] Erros na console (Vercel Logs)
- [ ] Webhook failures (Stripe Dashboard)
- [ ] Edge Function logs (Supabase)
- [ ] Uptime/Performance (Vercel Analytics)
- [ ] User feedback

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| Webhook 401 | Verificar `STRIPE_WEBHOOK_SECRET` em Supabase |
| Checkout falha | Verificar `STRIPE_SECRET_KEY` em Supabase |
| Imagens não carregam | Verificar bucket `customization-images` existe |
| Permissões negadas | Verificar RLS policies |
| Deploy falha | Verificar variáveis de ambiente em Vercel |

---

## 📞 Suporte

Documentação completa:
- Stripe: https://stripe.com/docs
- Supabase: https://supabase.com/docs
- Vercel: https://vercel.com/docs
- React: https://react.dev
