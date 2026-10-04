-- =============================================================================
-- Product catalog (synced from Stripe) + audit logs + application logs.
-- See docs/architecture.md §6, §7 and §15.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Product catalog. A public copy of Stripe Products and Prices, written ONLY
-- by the Stripe webhook / `pnpm stripe:sync` (service role). Anyone can read it
-- so the pricing page can show live prices.
-- src/config/billing.ts still decides what each price UNLOCKS.
-- -----------------------------------------------------------------------------
create table public.products (
  id          text primary key,                      -- Stripe product id (prod_...)
  active      boolean not null default true,
  name        text not null,
  description text,
  metadata    jsonb not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.prices (
  id                text primary key,                -- Stripe price id (price_...)
  product_id        text not null references public.products (id) on delete cascade,
  active            boolean not null default true,
  currency          text not null,
  unit_amount       bigint,                          -- minor units (cents); null for custom pricing
  type              text not null check (type in ('one_time', 'recurring')),
  interval          text check (interval in ('day', 'week', 'month', 'year')),
  interval_count    integer,
  trial_period_days integer,
  metadata          jsonb not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index prices_product_id_idx on public.prices (product_id);

create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger prices_set_updated_at before update on public.prices
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;
alter table public.prices   enable row level security;

create policy "products: public catalog"
  on public.products for select to anon, authenticated
  using (true);

create policy "prices: public catalog"
  on public.prices for select to anon, authenticated
  using (true);

revoke insert, update, delete on public.products from authenticated, anon;
revoke insert, update, delete on public.prices   from authenticated, anon;

-- -----------------------------------------------------------------------------
-- Audit log: who did what, when, to which team. Append-only.
--
-- No foreign keys on purpose: entries must outlive deleted users and teams.
-- Written only by server code (service role) via recordAuditEvent(), so users
-- can never forge, edit or delete entries.
-- -----------------------------------------------------------------------------
create table public.audit_logs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  team_id     uuid,                                   -- null for account-level events
  actor_id    uuid,                                   -- null for system / webhook / anonymous
  actor_email text,
  action      text not null check (action ~ '^[a-z_]+\.[a-z_]+$'),  -- e.g. team.member_invited
  target_type text,
  target_id   text,
  metadata    jsonb not null default '{}',
  ip_address  text,
  user_agent  text
);
create index audit_logs_team_created_idx   on public.audit_logs (team_id, created_at desc);
create index audit_logs_actor_created_idx  on public.audit_logs (actor_id, created_at desc);
create index audit_logs_action_created_idx on public.audit_logs (action, created_at desc);
create index audit_logs_created_idx        on public.audit_logs (created_at desc);

-- Entries can be deleted by the retention job, but never changed.
create or replace function public.prevent_audit_log_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'AUDIT_LOGS_ARE_APPEND_ONLY' using errcode = 'P0001';
end;
$$;

create trigger audit_logs_append_only
  before update on public.audit_logs
  for each row execute function public.prevent_audit_log_update();

alter table public.audit_logs enable row level security;

create policy "audit_logs: team owners/admins and the actor can read"
  on public.audit_logs for select to authenticated
  using (
    actor_id = (select auth.uid())
    or (team_id is not null and public.has_team_role(team_id, array['owner', 'admin']::public.team_role[]))
  );

revoke insert, update, delete on public.audit_logs from authenticated, anon;

-- -----------------------------------------------------------------------------
-- Application logs: warnings and errors from src/lib/logger.ts.
-- Service role only (platform admins read them at /admin/logs).
-- -----------------------------------------------------------------------------
create table public.app_logs (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  level       text not null check (level in ('debug', 'info', 'warn', 'error')),
  event       text not null,                          -- e.g. stripe.webhook_failed
  message     text,
  context     jsonb not null default '{}',
  error       jsonb,                                  -- { name, message, stack }
  user_id     uuid,
  team_id     uuid,
  environment text
);
create index app_logs_created_idx       on public.app_logs (created_at desc);
create index app_logs_level_created_idx on public.app_logs (level, created_at desc);
create index app_logs_event_created_idx on public.app_logs (event, created_at desc);

alter table public.app_logs enable row level security;
revoke all on public.app_logs from authenticated, anon;

-- -----------------------------------------------------------------------------
-- Retention. Call from a scheduled job, e.g. with pg_cron:
--   select cron.schedule('purge-logs', '0 3 * * *', $$select public.purge_old_logs(365, 30)$$);
-- -----------------------------------------------------------------------------
create or replace function public.purge_old_logs(
  p_audit_log_days integer default 365,
  p_app_log_days   integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_audit_deleted bigint;
  v_app_deleted   bigint;
begin
  delete from public.audit_logs where created_at < now() - make_interval(days => p_audit_log_days);
  get diagnostics v_audit_deleted = row_count;

  delete from public.app_logs where created_at < now() - make_interval(days => p_app_log_days);
  get diagnostics v_app_deleted = row_count;

  return jsonb_build_object('audit_logs', v_audit_deleted, 'app_logs', v_app_deleted);
end;
$$;

revoke execute on function public.purge_old_logs(integer, integer) from public, anon, authenticated;
