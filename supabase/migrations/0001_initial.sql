create extension if not exists pgcrypto;

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  color text,
  icon text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.monthly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  living_allowance_fen bigint not null default 0 check (living_allowance_fen >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 80),
  amount_fen bigint not null check (amount_fen > 0),
  frequency text not null check (frequency in ('monthly', 'yearly')),
  next_due_date date not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.bill_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recurring_rule_id uuid not null references public.recurring_rules(id) on delete cascade,
  due_on date not null,
  planned_amount_fen bigint not null check (planned_amount_fen > 0),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'skipped')),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recurring_rule_id, due_on)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete set null,
  bill_occurrence_id uuid unique references public.bill_occurrences(id) on delete set null,
  kind text not null check (kind in ('income', 'expense')),
  source text not null check (source in ('manual', 'fixed_bill', 'import', 'adjustment')),
  amount_fen bigint not null check (amount_fen > 0),
  occurred_on date not null default (timezone('Asia/Shanghai', now()))::date,
  note text,
  external_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index transactions_external_id_unique
  on public.transactions (user_id, source, external_id)
  where external_id is not null;

create index transactions_user_date_idx on public.transactions (user_id, occurred_on desc);
create index bill_occurrences_user_status_idx on public.bill_occurrences (user_id, status, due_on);

create table public.dashboard_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  modules jsonb not null default '[]'::jsonb check (jsonb_typeof(modules) = 'array'),
  updated_at timestamptz not null default now()
);

create table public.month_closures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null check (extract(day from month) = 1),
  status text not null default 'draft' check (status in ('draft', 'finalized')),
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tags_touch_updated_at before update on public.tags
for each row execute function public.touch_updated_at();
create trigger monthly_plans_touch_updated_at before update on public.monthly_plans
for each row execute function public.touch_updated_at();
create trigger recurring_rules_touch_updated_at before update on public.recurring_rules
for each row execute function public.touch_updated_at();
create trigger bill_occurrences_touch_updated_at before update on public.bill_occurrences
for each row execute function public.touch_updated_at();
create trigger transactions_touch_updated_at before update on public.transactions
for each row execute function public.touch_updated_at();
create trigger dashboard_preferences_touch_updated_at before update on public.dashboard_preferences
for each row execute function public.touch_updated_at();
create trigger month_closures_touch_updated_at before update on public.month_closures
for each row execute function public.touch_updated_at();

alter table public.tags enable row level security;
alter table public.monthly_plans enable row level security;
alter table public.recurring_rules enable row level security;
alter table public.bill_occurrences enable row level security;
alter table public.transactions enable row level security;
alter table public.dashboard_preferences enable row level security;
alter table public.month_closures enable row level security;

revoke all on public.tags, public.monthly_plans, public.recurring_rules,
  public.bill_occurrences, public.transactions, public.dashboard_preferences,
  public.month_closures from anon;

grant select, insert, update, delete on public.tags, public.monthly_plans,
  public.recurring_rules, public.bill_occurrences, public.transactions,
  public.dashboard_preferences, public.month_closures to authenticated;

create policy "users manage own tags" on public.tags
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own monthly plans" on public.monthly_plans
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own recurring rules" on public.recurring_rules
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own bill occurrences" on public.bill_occurrences
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own transactions" on public.transactions
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own dashboard preferences" on public.dashboard_preferences
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users manage own month closures" on public.month_closures
for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
