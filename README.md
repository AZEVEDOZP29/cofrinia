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

Crie um projeto no Supabase e, para desenvolvimento local, preencha `.env.local` com a URL e uma chave pública do projeto:

```dotenv
VITE_SUPABASE_URL=https://SEU-PROJECT-REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Também é aceita a chave legada em `VITE_SUPABASE_ANON_KEY`. Chaves `service_role`, senha do banco e access token nunca podem usar o prefixo `VITE_`, pois tudo que começa com esse prefixo é incorporado ao JavaScript público.

As migrações ficam em `supabase/migrations` e são aplicadas pela ação **Configurar Supabase**. O workflow também define no Supabase Auth:

- Site URL: `https://azevedozp29.github.io/cofrinia/`;
- redirects de produção em `https://azevedozp29.github.io/cofrinia/**`;
- redirects locais em `http://localhost:5173/**` e `http://127.0.0.1:5173/**`.

### Configuração do GitHub Actions

Em **Settings → Secrets and variables → Actions**, cadastre:

| Tipo | Nome | Uso |
| --- | --- | --- |
| Variable | `SUPABASE_PROJECT_REF` | Identificador do projeto, que aparece antes de `.supabase.co` |
| Secret | `SUPABASE_ACCESS_TOKEN` | Token pessoal usado pelo CLI e pela Management API |
| Secret | `SUPABASE_DB_URL` | URI completa do Shared Session Pooler, usada pelo CLI para aplicar migrações por IPv4 |

`SUPABASE_PROJECT_ID` também é aceito como nome alternativo para o project ref. Com os três valores acima, o deploy do Pages deriva a URL do projeto e obtém a chave pública pela Management API sem escrevê-la nos logs.

Obtenha `SUPABASE_DB_URL` no botão **Connect** do projeto no Supabase, escolhendo **Shared Pooler → Session mode**. A URI precisa apontar para `*.pooler.supabase.com` na porta `5432`, no formato:

```text
postgresql://postgres.PROJECT_REF:SENHA@REGIAO.pooler.supabase.com:5432/postgres
```

Salve a URI completa como secret, nunca como variable. Substitua o marcador pela senha real do banco e aplique URL encoding caso ela contenha caracteres reservados. O workflow rejeita o Transaction Pooler da porta `6543` e não escreve a URI nos logs.

Como alternativa, o build aceita diretamente `VITE_SUPABASE_URL` e uma destas chaves, como variable ou secret: `VITE_SUPABASE_PUBLISHABLE_KEY` ou `VITE_SUPABASE_ANON_KEY`. A chave publishable/anon é pública por definição; o workflow ainda a mascara para evitar cópias acidentais dos logs. Nunca cadastre uma chave `service_role` nesses nomes.

Depois de salvar a configuração, execute **Actions → Configurar Supabase → Run workflow**. O workflow valida as migrações com `db push --dry-run`, aplica o schema, atualiza os redirects e inicia a publicação do Pages. Um push em `SAAS-FINANCE` que altere `supabase/config.toml` ou `supabase/migrations/**` também executa o processo de forma serializada.

Se o SQL inicial já tiver sido aplicado manualmente sem registro no histórico de migrações, o dry-run interromperá a publicação. Nesse caso, compare o schema remoto com a migração antes de marcar qualquer versão como aplicada; não ignore a divergência nem reaplique `CREATE TYPE`/`CREATE TABLE` às cegas.

A migração cria perfis, contas, categorias, movimentações e assinaturas, com valores em centavos, Row Level Security em todas as tabelas e teste de 72 horas iniciado no servidor. O cliente tem acesso somente leitura à assinatura; futuras confirmações de pagamento devem ocorrer em uma função segura por webhook.

O site publicado fica em <https://azevedozp29.github.io/cofrinia/>. O workflow de Pages falha de forma explícita se não conseguir resolver a URL e uma chave pública do Supabase, evitando publicar acidentalmente uma versão em modo local.

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
