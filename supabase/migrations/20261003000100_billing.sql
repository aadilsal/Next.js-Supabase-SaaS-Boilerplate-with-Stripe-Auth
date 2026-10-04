-- =============================================================================
-- Billing: a local copy of Stripe state, written ONLY by the Stripe webhook
-- (service role). Team members can read their own team's billing rows.
-- See docs/architecture.md §7.
-- =============================================================================

create table public.billing_customers (
  team_id            uuid primary key references public.teams (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at         timestamptz not null default now()
);

create table public.subscriptions (
  id                   text primary key,             -- Stripe subscription id (sub_...)
  team_id              uuid not null references public.teams (id) on delete cascade,
  status               text not null,                -- active, trialing, past_due, canceled, ...
  price_id             text not null,
  interval             text,                         -- month | year
  current_period_end   timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create index subscriptions_team_id_idx on public.subscriptions (team_id);

create table public.purchases (
  id           text primary key,                     -- Stripe Checkout Session id (cs_...)
  team_id      uuid not null references public.teams (id) on delete cascade,
  price_id     text not null,
  amount_total bigint,
  currency     text,
  status       text not null,                        -- paid | refunded
  created_at   timestamptz not null default now()
);
create index purchases_team_id_idx on public.purchases (team_id);

-- Webhook idempotency: an event id is inserted before it is processed.
create table public.stripe_events (
  id           text primary key,                     -- Stripe event id (evt_...)
  type         text not null,
  processed_at timestamptz not null default now()
);

create trigger subscriptions_set_updated_at before update on public.subscriptions
  for each row execute function public.set_updated_at();

alter table public.billing_customers enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.purchases         enable row level security;
alter table public.stripe_events     enable row level security;

create policy "billing_customers: members can read"
  on public.billing_customers for select to authenticated
  using (public.is_team_member(team_id));

create policy "subscriptions: members can read"
  on public.subscriptions for select to authenticated
  using (public.is_team_member(team_id));

create policy "purchases: members can read"
  on public.purchases for select to authenticated
  using (public.is_team_member(team_id));

-- No write policies and no grants: only the service role (webhook) writes here.
revoke insert, update, delete on public.billing_customers from authenticated, anon;
revoke insert, update, delete on public.subscriptions     from authenticated, anon;
revoke insert, update, delete on public.purchases         from authenticated, anon;
revoke all on public.stripe_events from authenticated, anon;
