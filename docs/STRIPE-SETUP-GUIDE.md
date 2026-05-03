# Guia de Configuração — Stripe, Supabase e Vercel (Produção)

Este guia detalha os passos necessários para configurar o ambiente de produção do Tralalá Criativo, garantindo que os pagamentos e a infraestrutura funcionam corretamente.

## Parte 1 — Ativar Stripe para Produção

1. Aceda ao [Dashboard da Stripe](https://dashboard.stripe.com/account/onboarding) e complete o processo de ativação da conta.
2. Em **Settings > Business > Public details**, defina o nome público como "Tralalá Criativo".
3. Em **Settings > Branding**, configure o logótipo e as cores da marca para o checkout.
4. Em **Settings > Payments > Payment methods**, ative os métodos de pagamento: **Cards**, **MB WAY** e **Multibanco**.
5. No topo do Dashboard, certifique-se de que o interruptor **Test Mode** está desativado para operar em **Live Mode**.

## Parte 2 — Obter Chaves de Produção

1. Vá a **Developers > API Keys** (garanta que o toggle Live está ativo).
2. Copie a **Publishable key** (`pk_live_...`).
3. Copie a **Secret key** (`sk_live_...`).
4. Configuração das chaves:
   - `pk_live`: Coloque no ficheiro `.env` local ou no Vercel como `VITE_STRIPE_PUBLISHABLE_KEY`.
   - `sk_live`: Configure como um segredo no Supabase (ver Parte 5).

## Parte 3 — Configurar Webhook

1. Vá a **Developers > Webhooks** e clique em **Add endpoint**.
2. **Endpoint URL**: `https://riioszwtwjbestbxbzxu.supabase.co/functions/v1/stripe-webhook`
3. **Select events**: Selecione apenas `checkout.session.completed`.
4. Após criar, copie o **Signing secret** (`whsec_...`). Este será usado como `STRIPE_WEBHOOK_SECRET` no Supabase.

## Parte 4 — Testar Webhook

1. No Dashboard da Stripe, utilize a opção de enviar um webhook de teste para o endpoint configurado.
2. Verifique se recebe uma resposta `200 OK`.
3. Se falhar, verifique os logs das Edge Functions no painel do Supabase para diagnosticar o erro.

## Parte 5 — Configuração do Supabase

1. Aceda a **Edge Functions > Secrets** no dashboard do Supabase e adicione:
   - `STRIPE_SECRET_KEY`: A sua `sk_live_...`.
   - `STRIPE_WEBHOOK_SECRET`: O segredo `whsec_...` obtido na Parte 3.
   - `SUPABASE_SERVICE_ROLE_KEY`: A chave service_role do seu projeto.
2. Realize o deploy das funções via CLI:
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy stripe-webhook
   ```

## Parte 6 — Configuração do Vercel

1. Nas definições do projeto no Vercel, adicione as seguintes **Environment Variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_STRIPE_PUBLISHABLE_KEY` (a chave `pk_live_...`)
2. Execute um novo Deploy para aplicar as variáveis.

## Parte 7 — Executar SQL Migrations

No **SQL Editor** do Supabase, execute os seguintes ficheiros por ordem:
1. `001-fix-rls-and-profiles.sql`: Corrige permissões e estrutura de perfis.
2. `002-storage-bucket.sql`: Cria o bucket `customization-images`.
3. `003-add-stripe-session-id.sql`: Adiciona o campo de controlo de pagamentos.
4. Verifique no **Table Editor** se as tabelas foram atualizadas corretamente.

## Resolução de Problemas (Troubleshooting)

- **Webhook 401**: Verifique se o `STRIPE_WEBHOOK_SECRET` no Supabase coincide com o Signing Secret do dashboard da Stripe.
- **Produtos não aparecem**: Certifique-se de que executou a migration `001` e que as políticas RLS permitem a leitura.
- **Falha no Checkout**: Verifique se a `STRIPE_SECRET_KEY` está corretamente configurada nos segredos das Edge Functions.
- **Upload de imagens não funciona**: Confirme se o bucket `customization-images` existe e se as políticas de storage foram aplicadas (migration `002`).
- **Estado do pagamento não atualiza**: Verifique os logs do webhook na Stripe e no Supabase para confirmar se o evento `checkout.session.completed` foi processado com sucesso.
