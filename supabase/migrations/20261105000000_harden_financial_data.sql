-- Completa usuários anteriores à migração inicial e reforça a integridade do núcleo financeiro.

insert into public.profiles (id, name)
select
  users.id,
  coalesce(
    nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
    nullif(split_part(coalesce(users.email, ''), '@', 1), ''),
    ''
  )
from auth.users as users
on conflict (id) do nothing;

insert into public.subscriptions (user_id)
select users.id
from auth.users as users
on conflict (user_id) do nothing;

insert into public.categories (user_id, name, type, color)
select users.id, defaults.name, defaults.type, defaults.color
from auth.users as users
cross join (
  values
    ('Salário', 'income'::public.transaction_type, '#10b981'),
    ('Renda extra', 'income'::public.transaction_type, '#34d399'),
    ('Alimentação', 'expense'::public.transaction_type, '#f59e0b'),
    ('Moradia', 'expense'::public.transaction_type, '#6366f1'),
    ('Transporte', 'expense'::public.transaction_type, '#3b82f6'),
    ('Saúde', 'expense'::public.transaction_type, '#ef4444'),
    ('Lazer', 'expense'::public.transaction_type, '#a855f7'),
    ('Contas domésticas', 'expense'::public.transaction_type, '#14b8a6'),
    ('Compras', 'expense'::public.transaction_type, '#ec4899'),
    ('Outros', 'expense'::public.transaction_type, '#64748b')
) as defaults(name, type, color)
on conflict (user_id, name, type) do nothing;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      ''
    )
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.categories (user_id, name, type, color) values
    (new.id, 'Salário', 'income'::public.transaction_type, '#10b981'),
    (new.id, 'Renda extra', 'income'::public.transaction_type, '#34d399'),
    (new.id, 'Alimentação', 'expense'::public.transaction_type, '#f59e0b'),
    (new.id, 'Moradia', 'expense'::public.transaction_type, '#6366f1'),
    (new.id, 'Transporte', 'expense'::public.transaction_type, '#3b82f6'),
    (new.id, 'Saúde', 'expense'::public.transaction_type, '#ef4444'),
    (new.id, 'Lazer', 'expense'::public.transaction_type, '#a855f7'),
    (new.id, 'Contas domésticas', 'expense'::public.transaction_type, '#14b8a6'),
    (new.id, 'Compras', 'expense'::public.transaction_type, '#ec4899'),
    (new.id, 'Outros', 'expense'::public.transaction_type, '#64748b')
  on conflict (user_id, name, type) do nothing;

  return new;
end;
$$;

-- Funções de trigger não precisam ser chamadas diretamente pela API.
revoke all privileges on function public.set_updated_at() from public, anon, authenticated;
revoke all privileges on function public.handle_new_user() from public, anon, authenticated;

-- O cliente anônimo não acessa dados financeiros. O autenticado recebe apenas o necessário.
revoke all privileges on table
  public.profiles,
  public.accounts,
  public.categories,
  public.transactions,
  public.subscriptions
from public, anon, authenticated;

grant usage on schema public to authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.accounts, public.categories, public.transactions to authenticated;
grant select on table public.subscriptions to authenticated;

-- Mantém todos os valores convertidos pelo cliente dentro da faixa inteira segura do JavaScript.
alter table public.profiles
  add constraint profiles_monthly_income_safe_integer
  check (monthly_income_cents <= 9007199254740991);

alter table public.accounts
  add constraint accounts_initial_balance_safe_integer
  check (initial_balance_cents between -9007199254740991 and 9007199254740991);

alter table public.transactions
  add constraint transactions_amount_safe_integer
  check (amount_cents <= 9007199254740991);

-- As chaves compostas impedem que operações administrativas/importações liguem dados de usuários
-- diferentes ou usem uma categoria com tipo divergente da movimentação.
alter table public.accounts
  add constraint accounts_user_id_id_key unique (user_id, id);

alter table public.categories
  add constraint categories_user_id_id_type_key unique (user_id, id, type);

alter table public.transactions
  add constraint transactions_user_account_fkey
  foreign key (user_id, account_id)
  references public.accounts (user_id, id)
  on delete restrict;

alter table public.transactions
  add constraint transactions_user_category_type_fkey
  foreign key (user_id, category_id, type)
  references public.categories (user_id, id, type)
  on delete restrict;
