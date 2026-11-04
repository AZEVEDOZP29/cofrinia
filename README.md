# MeuControle

Aplicativo SaaS de organização financeira pessoal feito com React, TypeScript, Tailwind CSS e Supabase.

## Rodar localmente

Requisitos: Node.js 20.19+ (o ambiente usa Node.js 24) e npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sem as variáveis do Supabase, a interface oferece um modo local claramente identificado. Ele persiste dados no navegador e serve para desenvolver e validar o fluxo financeiro. Cadastro, login, recuperação de senha, isolamento multiusuário e teste gratuito controlado pelo servidor exigem Supabase.

## Configurar Supabase

1. Crie um projeto no Supabase.
2. Execute `supabase/migrations/20261104000000_initial_schema.sql` pelo CLI ou SQL Editor.
3. Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `.env.local`.
4. Cadastre as URLs permitidas de autenticação para o endereço local e o domínio de produção.

A migração cria perfis, contas, categorias, movimentações e assinaturas, com valores em centavos, Row Level Security em todas as tabelas e teste de 72 horas iniciado no servidor. O cliente tem acesso somente leitura à assinatura; futuras confirmações de pagamento devem ocorrer em uma função segura por webhook.

## Validação

```bash
npm test
npm run build
```

## Escopo desta primeira versão

- landing page responsiva;
- cadastro, login e recuperação por Supabase Auth;
- onboarding financeiro;
- contas e categorias personalizadas;
- receitas, despesas e valores previstos com criação, edição e exclusão;
- dashboard com saldo, resultado, comprometimento e gráficos calculados dos lançamentos;
- tema claro/escuro e PWA básica;
- base segura para teste gratuito e assinatura de R$ 19,90.

Gateway de pagamento, cartões parcelados, orçamentos, metas, dívidas e relatórios avançados permanecem nas próximas fases. A tela de plano não simula cobrança nem libera acesso por retorno visual.
