# Projeto Zero

Plataforma de marketing com IA: CRM, gerador de imagens, gerador de landing
pages, conversas de WhatsApp, leitor de briefing (com geração de prompts para
imagem/vídeo) e gerador de copy/campanhas para Google e Meta Ads.

**Stack:** React + Vite + TypeScript + Tailwind CSS (frontend) · Supabase
(banco de dados/autenticação) · Netlify Functions (backend serverless) ·
Google Gemini (textos e imagens) · Meta Cloud API (WhatsApp).

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

> **Já rodou o `schema.sql` antes?** Rodar o arquivo inteiro de novo vai dar
> erro em "create policy" (já existem). Para pegar só a tabela nova de
> Configurações, copie e rode apenas o bloco a partir do comentário
> `-- ---------- CHAVES DE INTEGRAÇÃO` até o final do arquivo.

## 3. Configurar a chave de IA (Google Gemini)

Você tem duas formas de configurar a chave de IA (usada em Leitor de
Briefing, Campanhas & Copy, Gerador de Landing Pages e Gerador de Imagens) e
as do WhatsApp:

### Opção recomendada: tela "Configurações" dentro do app
Depois de logado, acesse **Configurações** no menu lateral e cole cada chave
lá. Elas ficam **criptografadas no banco** (AES-256-GCM) e **ocultas por
padrão** — nem você consegue ver o valor de novo depois de salvar, a menos
que clique no botão de revelar (👁). A tabela nem permite leitura direta pelo
navegador: só as Netlify Functions (com a service_role key) conseguem
descriptografar, e só fazem isso quando você pede.

Para essa tela funcionar, adicione mais uma variável de ambiente na Netlify:

```
SETTINGS_ENCRYPTION_KEY=<gere com: openssl rand -hex 32>
```

Sem essa variável, salvar/revelar chaves pela tela de Configurações não
funciona (as Netlify Functions vão retornar erro pedindo para configurá-la).

### Opção alternativa: variável de ambiente global na Netlify
Se preferir não usar a tela de Configurações (ou quiser uma chave padrão
compartilhada), pode configurar direto como variável de ambiente da Netlify
— o sistema usa como alternativa sempre que o usuário não tiver cadastrado a
própria chave:

- **Google Gemini** — crie uma chave gratuita em
  https://aistudio.google.com/apikey e coloque em `GOOGLE_API_KEY`. É usada
  tanto para texto (`gemini-2.5-flash`) quanto para imagem
  (`gemini-2.5-flash-image`).

## 4. Configurar o WhatsApp (opcional)

O módulo de WhatsApp usa a **Meta Cloud API** oficial. Os 3 valores abaixo
também podem ser cadastrados pela tela de **Configurações** dentro do app
(recomendado) em vez de variável de ambiente:

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
