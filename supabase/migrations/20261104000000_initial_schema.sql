-- MeuControle: núcleo financeiro com isolamento por usuário.
create extension if not exists pgcrypto;

create type public.transaction_type as enum ('income', 'expense');
create type public.transaction_status as enum ('paid', 'received', 'planned');
create type public.subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'expired');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  objective text not null default '',
  month_start_day smallint not null default 1 check (month_start_day between 1 and 28),
  monthly_income_cents bigint not null default 0 check (monthly_income_cents >= 0),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  type text not null check (type in ('checking', 'savings', 'cash', 'wallet', 'investment')),
  initial_balance_cents bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60),
  type public.transaction_type not null,
  color text not null default '#64748b' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now(),
  unique (user_id, name, type)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  description text not null check (char_length(description) between 1 and 160),
  amount_cents bigint not null check (amount_cents > 0),
  type public.transaction_type not null,
  status public.transaction_status not null,
  payment_method text not null default 'Outro',
  occurred_at timestamptz not null,
  notes text not null default '',
  idempotency_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  constraint status_matches_type check (
    status = 'planned'
    or (type = 'income' and status = 'received')
    or (type = 'expense' and status = 'paid')
  )
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status public.subscription_status not null default 'trialing',
  trial_started_at timestamptz not null default now(),
  trial_ends_at timestamptz not null default (now() + interval '72 hours'),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_ends_at timestamptz,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions(user_id, occurred_at desc);
create index transactions_account_idx on public.transactions(account_id);
create index transactions_category_idx on public.transactions(category_id);
create index accounts_user_idx on public.accounts(user_id);
create index categories_user_idx on public.categories(user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger accounts_updated_at before update on public.accounts for each row execute function public.set_updated_at();
create trigger transactions_updated_at before update on public.transactions for each row execute function public.set_updated_at();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''));

  insert into public.subscriptions (user_id) values (new.id);

  insert into public.categories (user_id, name, type, color) values
    (new.id, 'Salário', 'income', '#10b981'),
    (new.id, 'Renda extra', 'income', '#34d399'),
    (new.id, 'Alimentação', 'expense', '#f59e0b'),
    (new.id, 'Moradia', 'expense', '#6366f1'),
    (new.id, 'Transporte', 'expense', '#3b82f6'),
    (new.id, 'Saúde', 'expense', '#ef4444'),
    (new.id, 'Lazer', 'expense', '#a855f7'),
    (new.id, 'Contas domésticas', 'expense', '#14b8a6'),
    (new.id, 'Compras', 'expense', '#ec4899'),
    (new.id, 'Outros', 'expense', '#64748b');
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles_select_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "accounts_select_own" on public.accounts for select using (user_id = auth.uid());
create policy "accounts_insert_own" on public.accounts for insert with check (user_id = auth.uid());
create policy "accounts_update_own" on public.accounts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "accounts_delete_own" on public.accounts for delete using (user_id = auth.uid());

create policy "categories_select_own" on public.categories for select using (user_id = auth.uid());
create policy "categories_insert_own" on public.categories for insert with check (user_id = auth.uid());
create policy "categories_update_own" on public.categories for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "categories_delete_own" on public.categories for delete using (user_id = auth.uid());

create policy "transactions_select_own" on public.transactions for select using (user_id = auth.uid());
create policy "transactions_insert_own" on public.transactions for insert with check (
  user_id = auth.uid()
  and exists (select 1 from public.accounts where id = account_id and user_id = auth.uid())
  and exists (select 1 from public.categories where id = category_id and user_id = auth.uid())
);
create policy "transactions_update_own" on public.transactions for update using (user_id = auth.uid()) with check (
  user_id = auth.uid()
  and exists (select 1 from public.accounts where id = account_id and user_id = auth.uid())
  and exists (select 1 from public.categories where id = category_id and user_id = auth.uid())
);
create policy "transactions_delete_own" on public.transactions for delete using (user_id = auth.uid());

-- O cliente pode consultar o estado. Somente funções servidoras/webhooks com service role poderão alterá-lo.
create policy "subscriptions_select_own" on public.subscriptions for select using (user_id = auth.uid());

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.accounts, public.categories, public.transactions to authenticated;
grant select on public.subscriptions to authenticated;
