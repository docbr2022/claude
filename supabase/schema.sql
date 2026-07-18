-- ============================================================
-- Projeto Zero — Schema do banco de dados (Supabase / Postgres)
--
-- Como usar:
-- 1. Crie um projeto em https://supabase.com
-- 2. Abra o SQL Editor do projeto
-- 3. Cole todo este arquivo e execute (Run)
-- 4. Copie a "Project URL" e a "anon public key" para o .env do
--    frontend, e a "service_role key" para as variáveis de
--    ambiente das Netlify Functions (NUNCA no frontend)
-- ============================================================

-- ---------- EXTENSÕES ----------
create extension if not exists "pgcrypto";

-- ---------- PROFILES ----------
-- Um perfil por usuário autenticado (criado automaticamente no signup)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  company_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuários veem o próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuários atualizam o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Usuários criam o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cria o perfil automaticamente quando um usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- CRM: PIPELINE STAGES ----------
create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  position int not null default 0,
  color text not null default '#3563f5',
  created_at timestamptz not null default now()
);

alter table public.pipeline_stages enable row level security;

create policy "Dono gerencia seus estágios"
  on public.pipeline_stages for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- CRM: LEADS ----------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  stage_id uuid references public.pipeline_stages (id) on delete set null,
  name text not null,
  email text,
  phone text,
  company text,
  source text,
  value numeric(12, 2) default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "Dono gerencia seus leads"
  on public.leads for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index if not exists leads_owner_idx on public.leads (owner_id);
create index if not exists leads_stage_idx on public.leads (stage_id);

-- ---------- CRM: ATIVIDADES DO LEAD ----------
create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  type text not null default 'note',
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.lead_activities enable row level security;

create policy "Dono gerencia atividades dos seus leads"
  on public.lead_activities for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- CAMPANHAS (Google / Meta Ads) ----------
create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform text not null default 'google' check (platform in ('google', 'meta')),
  objective text,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  budget numeric(12, 2),
  created_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

create policy "Dono gerencia suas campanhas"
  on public.campaigns for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- COPIES GERADAS PARA CAMPANHAS ----------
create table if not exists public.campaign_copies (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.campaigns (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  platform text not null default 'google' check (platform in ('google', 'meta')),
  headline text,
  primary_text text,
  description text,
  call_to_action text,
  created_at timestamptz not null default now()
);

alter table public.campaign_copies enable row level security;

create policy "Dono gerencia suas copies"
  on public.campaign_copies for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- BRIEFINGS ----------
create table if not exists public.briefings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  raw_content text not null,
  summary text,
  target_audience text,
  tone text,
  created_at timestamptz not null default now()
);

alter table public.briefings enable row level security;

create policy "Dono gerencia seus briefings"
  on public.briefings for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- PROMPTS GERADOS (imagem/vídeo) A PARTIR DE BRIEFINGS ----------
create table if not exists public.generated_prompts (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid references public.briefings (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  kind text not null default 'image' check (kind in ('image', 'video')),
  prompt_text text not null,
  created_at timestamptz not null default now()
);

alter table public.generated_prompts enable row level security;

create policy "Dono gerencia seus prompts"
  on public.generated_prompts for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- IMAGENS GERADAS ----------
create table if not exists public.generated_images (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null,
  image_url text not null,
  provider text not null default 'openai',
  created_at timestamptz not null default now()
);

alter table public.generated_images enable row level security;

create policy "Dono gerencia suas imagens"
  on public.generated_images for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- LANDING PAGES ----------
create table if not exists public.landing_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, slug)
);

alter table public.landing_pages enable row level security;

create policy "Dono gerencia suas landing pages"
  on public.landing_pages for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- WHATSAPP: CONVERSAS ----------
create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  contact_name text,
  contact_phone text not null,
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.whatsapp_conversations enable row level security;

create policy "Dono gerencia suas conversas"
  on public.whatsapp_conversations for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- ---------- WHATSAPP: MENSAGENS ----------
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.whatsapp_conversations (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  content text,
  media_url text,
  status text not null default 'sent' check (status in ('queued', 'sent', 'delivered', 'read', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.whatsapp_messages enable row level security;

create policy "Dono gerencia suas mensagens"
  on public.whatsapp_messages for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create index if not exists whatsapp_messages_conv_idx on public.whatsapp_messages (conversation_id);

-- ---------- ESTÁGIOS PADRÃO DO PIPELINE PARA NOVOS USUÁRIOS ----------
create or replace function public.create_default_pipeline_stages()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.pipeline_stages (owner_id, name, position, color) values
    (new.id, 'Novo Lead', 0, '#8fb1fd'),
    (new.id, 'Contato Feito', 1, '#5a89fa'),
    (new.id, 'Proposta Enviada', 2, '#3563f5'),
    (new.id, 'Negociação', 3, '#2444e8'),
    (new.id, 'Fechado', 4, '#1e34d1');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_pipeline on auth.users;
create trigger on_auth_user_created_pipeline
  after insert on auth.users
  for each row execute procedure public.create_default_pipeline_stages();

-- ---------- CHAVES DE INTEGRAÇÃO (IA / WhatsApp) ----------
-- Guarda as chaves de API do usuário (Anthropic, OpenAI, WhatsApp) criptografadas
-- (AES-256-GCM, feito nas Netlify Functions antes de gravar aqui).
--
-- IMPORTANTE: propositalmente NÃO existe nenhuma policy de RLS liberando
-- select/insert/update/delete para o role "authenticated". Isso significa que
-- o valor criptografado nunca pode ser lido diretamente pelo navegador (nem
-- pelo próprio dono da chave via supabase-js) — só é acessível através das
-- Netlify Functions, que usam a service_role key (que ignora RLS) e exigem
-- login válido antes de qualquer leitura/escrita/descriptografia.
create table if not exists public.integration_keys (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (
    provider in (
      'anthropic',
      'openai',
      'whatsapp_access_token',
      'whatsapp_phone_number_id',
      'whatsapp_verify_token'
    )
  ),
  encrypted_value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, provider)
);

alter table public.integration_keys enable row level security;
-- Sem policies aqui de propósito — veja o comentário acima.
