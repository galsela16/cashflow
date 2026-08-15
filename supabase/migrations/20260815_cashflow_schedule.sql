-- CashflowHQ v2.2.0 — scheduled cashflow fields
-- Run once in the Supabase SQL Editor before deploying the new frontend.

alter table public.transactions
  add column if not exists expected_date date,
  add column if not exists cashflow_status text,
  add column if not exists paid_at date;

alter table public.home_transactions
  add column if not exists expected_date date,
  add column if not exists cashflow_status text,
  add column if not exists paid_at date;

alter table public.event_details
  add column if not exists expected_payment_date date,
  add column if not exists paid_at date;

update public.transactions
set expected_date = coalesce(expected_date, created_at::date),
    cashflow_status = coalesce(cashflow_status, 'paid'),
    paid_at = coalesce(paid_at, created_at::date)
where expected_date is null or cashflow_status is null;

update public.home_transactions
set expected_date = coalesce(expected_date, created_at::date),
    cashflow_status = coalesce(cashflow_status, 'paid'),
    paid_at = coalesce(paid_at, created_at::date)
where expected_date is null or cashflow_status is null;

update public.event_details
set expected_payment_date = coalesce(expected_payment_date, nullif(event_date::text, '')::date, current_date),
    paid_at = case
      when status in ('בוצע תשלום', 'בוצע תשלום + חשבונית מס') then coalesce(paid_at, nullif(event_date::text, '')::date, current_date)
      else paid_at
    end
where expected_payment_date is null;

alter table public.transactions
  alter column expected_date set default current_date,
  alter column expected_date set not null,
  alter column cashflow_status set default 'paid',
  alter column cashflow_status set not null;

alter table public.home_transactions
  alter column expected_date set default current_date,
  alter column expected_date set not null,
  alter column cashflow_status set default 'paid',
  alter column cashflow_status set not null;

alter table public.event_details
  alter column expected_payment_date set default current_date;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'transactions_cashflow_status_check') then
    alter table public.transactions add constraint transactions_cashflow_status_check
      check (cashflow_status in ('expected', 'paid', 'cancelled'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'home_transactions_cashflow_status_check') then
    alter table public.home_transactions add constraint home_transactions_cashflow_status_check
      check (cashflow_status in ('expected', 'paid', 'cancelled'));
  end if;
end $$;

create index if not exists transactions_user_expected_date_idx
  on public.transactions (user_id, expected_date) where cashflow_status = 'expected';

create index if not exists home_transactions_user_expected_date_idx
  on public.home_transactions (user_id, expected_date) where cashflow_status = 'expected';

create index if not exists event_details_user_expected_payment_idx
  on public.event_details (user_id, expected_payment_date);
