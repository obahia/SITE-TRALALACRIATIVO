# 🎨 SITE-TRALALA - E-commerce de Personalizados

Este é o projeto **Tralalá Criativo**, um e-commerce moderno e fluido especializado em produtos personalizados (canecas, camisetas, azulejos, etc.), construído com as tecnologias mais recentes do mercado.

## 🚀 Tecnologias
- **Frontend:** React 19 + Vite 7 + TailwindCSS 4
- **Animações:** Framer Motion (Otimizado para baixa memória)
- **Backend/DB:** Supabase (Auth, Postgres, Edge Functions)
- **Pagamentos:** Stripe (Checkout Session)
- **Deployment:** Vercel

## 📦 Como Rodar Localmente
1. Clone o repositório.
2. Instale as dependências: `npm install`
3. Crie um arquivo `.env` baseado no [.env.example](.env.example).
4. Inicie o servidor: `npm run dev`

---

## 🌍 Deployment na Vercel

Para colocar o site online na Vercel, segue estes passos:

1. **Importar o Projeto:** Liga o teu GitHub à Vercel e seleciona este repositório.
2. **Configuração do Framework:** A Vercel deteta automaticamente que é um projeto **Vite**.
3. **Environment Variables (CRÍTICO):** No painel da Vercel, adiciona as seguintes chaves:
   - `VITE_SUPABASE_URL`: O URL do teu projeto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: A chave anónima do Supabase.
   - `VITE_STRIPE_PUBLISHABLE_KEY`: A tua chave pública do Stripe (começa com `pk_...`).
   - `VITE_SUCCESS_URL`: O URL de retorno após sucesso (ex: `https://teu-site.vercel.app/sucesso`).
   - `VITE_CANCEL_URL`: O URL de retorno após cancelamento (ex: `https://teu-site.vercel.app/cancelado`).

## 🛠️ Configuração do Supabase (Edge Functions)
Para que o checkout funcione, não te esqueças de configurar a secret key no Supabase:
```bash
# Se tiveres a CLI do Supabase
supabase secrets set STRIPE_SECRET_KEY=sk_test_...

# OU diretamente no Dashboard do Supabase em Edge Functions -> Secrets
```

## 📄 Estrutura de Pastas
- `/src/components`: UI Components (Header, Footer, Cart, Login Modal).
- `/src/context`: Gestão de Estado (Auth, Carrinho).
- `/src/pages`: Páginas da aplicação.
- `/src/services`: Clientes Supabase e Stripe.
- `/supabase/functions`: Lógica de backend para o Stripe.
