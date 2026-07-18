# Projeto Zero

Plataforma de marketing com IA: CRM, gerador de imagens, gerador de landing
pages, conversas de WhatsApp, leitor de briefing (com geração de prompts para
imagem/vídeo) e gerador de copy/campanhas para Google e Meta Ads.

**Stack:** React + Vite + TypeScript + Tailwind CSS (frontend) · Supabase
(banco de dados/autenticação) · Netlify Functions (backend serverless) ·
Anthropic Claude (textos) · OpenAI (imagens) · Meta Cloud API (WhatsApp).

---

## 1. Rodar localmente

```bash
npm install
cp .env.example .env   # depois preencha as chaves, veja o passo 2 e 3
npm run dev
```

Abra http://localhost:5173. Sem as chaves do Supabase configuradas, o app
funciona mas mostra avisos e os módulos que dependem de banco de dados ficam
bloqueados.

## 2. Configurar o Supabase (obrigatório)

1. Crie uma conta gratuita em https://supabase.com e crie um novo projeto.
2. No projeto, vá em **SQL Editor** → **New query**, cole todo o conteúdo do
   arquivo [`supabase/schema.sql`](./supabase/schema.sql) e clique em **Run**.
   Isso cria todas as tabelas, políticas de segurança (RLS) e os gatilhos que
   criam o perfil e o pipeline padrão de cada novo usuário.
3. Em **Project Settings → API**, copie:
   - **Project URL** → vai em `VITE_SUPABASE_URL` e `SUPABASE_URL`
   - **anon public key** → vai em `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → vai em `SUPABASE_SERVICE_ROLE_KEY` (⚠️ nunca
     exponha essa chave no frontend — ela só é usada dentro das Netlify
     Functions)

## 3. Configurar as chaves de IA (opcional, mas necessário para os módulos de IA)

- **Anthropic (Claude)** — usado para: leitor de briefing, gerador de copy e
  gerador de landing pages. Crie uma chave em https://console.anthropic.com
  e coloque em `ANTHROPIC_API_KEY`.
- **OpenAI** — usado para: gerador de imagens (`gpt-image-1`/DALL-E). Crie
  uma chave em https://platform.openai.com e coloque em `OPENAI_API_KEY`.

## 4. Configurar o WhatsApp (opcional)

O módulo de WhatsApp usa a **Meta Cloud API** oficial:

1. Crie um app em https://developers.facebook.com/apps com o produto
   "WhatsApp".
2. Copie o **Temporary/Permanent Access Token** → `WHATSAPP_ACCESS_TOKEN`.
3. Copie o **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`.
4. Invente um token secreto qualquer → `WHATSAPP_VERIFY_TOKEN` (você vai usar
   o mesmo valor ao configurar o webhook no passo 6).
5. Copie o `id` do seu usuário no Supabase (tabela `auth.users`, ou veja em
   **Authentication → Users** no painel do Supabase) → `WHATSAPP_OWNER_USER_ID`.
   É esse usuário que vai "receber" as conversas do número conectado.
6. Depois do deploy na Netlify (passo 5), configure o webhook no painel da
   Meta apontando para:
   `https://SEU-SITE.netlify.app/.netlify/functions/whatsapp-webhook`
   usando o mesmo `WHATSAPP_VERIFY_TOKEN` do passo 4.

Sem essas variáveis, o módulo de WhatsApp continua funcionando para
enviar/receber mensagens dentro do app (salvas no Supabase), só não integra
de fato com o WhatsApp real.

## 5. Publicar na Netlify

### Opção A — Arrastar e soltar (mais simples)
1. Rode `npm install && npm run build` localmente.
2. Acesse https://app.netlify.com/drop e arraste a pasta `dist/` gerada.
3. Depois, em **Site settings → Environment variables**, adicione todas as
   variáveis do arquivo `.env.example` (com seus valores reais) e clique em
   **Trigger deploy** para as Netlify Functions passarem a funcionar
   corretamente.

### Opção B — Conectando um repositório Git à Netlify
1. Suba esta pasta para um repositório Git (GitHub, GitLab etc.) — opcional,
   caso você decida usar controle de versão depois.
2. Em **Add new site → Import an existing project**, selecione o
   repositório. O `netlify.toml` já está configurado com o comando de build
   (`npm run build`), a pasta de publicação (`dist`) e a pasta de funções
   (`netlify/functions`).
3. Adicione as variáveis de ambiente como na Opção A.

### Opção C — Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Estrutura do projeto

```
src/
  components/        Layout do dashboard, rotas protegidas
  contexts/           Autenticação (Supabase Auth)
  lib/                 Clientes Supabase e helper para chamar Netlify Functions
  pages/
    auth/              Login e cadastro
    crm/                Pipeline kanban de leads
    image-generator/   Gerador de imagens com IA
    landing-pages/      Gerador de landing pages
    whatsapp/           Inbox de conversas
    briefing/           Leitor de briefing + geração de prompts
    campaigns/          Gerador de copy para Google/Meta Ads
netlify/functions/     Backend serverless (chamadas de IA, WhatsApp, sempre
                        validando o usuário autenticado antes de tocar no banco)
supabase/schema.sql     Schema completo do banco de dados com RLS
```

## Segurança

- As chaves de IA e a `service_role key` do Supabase **só existem no
  servidor** (Netlify Functions) — nunca são enviadas ao navegador.
- Todas as tabelas têm Row Level Security (RLS): cada usuário só enxerga e
  edita os próprios dados.
- Toda Netlify Function valida o token de sessão do Supabase antes de
  executar qualquer ação.
