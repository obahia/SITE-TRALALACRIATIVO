# Lançamento: catálogo, ocasiões, orçamentos e envio CTT

Ordem importa: base de dados → edge functions → frontend.

## 1. Base de dados (Supabase → SQL Editor)

Colar e correr `supabase/migrations/020-catalogo-ocasioes-orcamentos-envios.sql`.

Cria:
- colunas novas em `products` (`occasions`, `min_quantity`, `is_featured`, `sort_order`, `sale_mode`, `price_note`)
- os 26 produtos do catálogo "Papelaria Festas" com fotos em `/assets/produtos/`
- a tabela `quote_requests` (pedidos de orçamento) com RLS
- colunas de envio em `orders` (`shipping_method`, `shipping_amount`, `customer_phone`, `customer_name`)

É idempotente: correr duas vezes não duplica produtos.

## 2. Edge functions

```
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
```

Secrets opcionais (Dashboard → Edge Functions → Secrets):
- `SHIPPING_CTT_PRICE` (padrão 4.9)
- `SHIPPING_FREE_FROM` (padrão 60)
- `SITE_URL` (padrão https://tralalacriativo.pt)

No Stripe (Developers → Webhooks), o endpoint do `stripe-webhook` deve escutar `checkout.session.completed` e `checkout.session.expired` (este último cancela encomendas abandonadas).

Se mudar os portes, atualizar também `SHIPPING` em `src/data/occasions.js` (é o texto mostrado no site).

## 3. Autenticação (Supabase → Authentication)

- **URL Configuration**: Site URL `https://tralalacriativo.pt`; Redirect URLs com `https://tralalacriativo.pt/**` e `https://www.tralalacriativo.pt/**`. Sem isto, os links de confirmação e de recuperação de palavra-passe vão para o sítio errado.
- **SMTP próprio** (Settings → Auth → SMTP), por exemplo Resend ou o email do domínio. O SMTP de origem do Supabase só envia para membros da equipa do projeto e no máximo 2 emails por hora: os clientes não recebem o email de confirmação e não conseguem entrar.
- **Email templates**: traduzir "Confirm signup" e "Reset password" para português.

## 4. Frontend

Deploy normal (Vercel). As imagens novas estão em `public/assets/produtos/`.

## 5. A confirmar com a Tralalá

- Quantidades mínimas por produto (valores sugeridos na migração; editáveis em Admin → Produtos).
- Fotos próprias para o Kit Premium e o Kit Completo (hoje usam a mesma foto).
- Produtos antigos sem foto (canecas, sweatshirts, capas) e os depoimentos fictícios em `TestimonialCarousel` (já não aparecem na página inicial).
- Texto de trocas, devoluções e privacidade em `/informacoes`.
- Envio para Açores e Madeira (o checkout aceita moradas em Portugal com o mesmo preço).
