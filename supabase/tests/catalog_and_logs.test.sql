-- =============================================================================
-- RLS tests for the product catalog, audit logs and app logs.
-- Run with: pnpm db:test
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

-- Fixtures (as postgres)
insert into auth.users (id, email, raw_user_meta_data, aud, role) values
  ('44444444-4444-4444-8444-444444444444', 'dave@test.com', '{"full_name":"Dave"}', 'authenticated', 'authenticated'),
  ('55555555-5555-4555-8555-555555555555', 'erin@test.com', '{"full_name":"Erin"}', 'authenticated', 'authenticated');

insert into public.products (id, name) values ('prod_test', 'Pro');
insert into public.prices (id, product_id, currency, unit_amount, type, interval)
values ('price_test', 'prod_test', 'usd', 1900, 'recurring', 'month');

-- One event on Dave's personal team, one account-level event by Erin.
insert into public.audit_logs (team_id, actor_id, actor_email, action)
select id, '44444444-4444-4444-8444-444444444444', 'dave@test.com', 'team.updated'
from public.teams where created_by = '44444444-4444-4444-8444-444444444444' and is_personal;
insert into public.audit_logs (actor_id, actor_email, action)
values ('55555555-5555-4555-8555-555555555555', 'erin@test.com', 'auth.password_changed');

insert into public.app_logs (level, event, created_at) values
  ('error', 'test.old_failure', now() - interval '40 days'),
  ('error', 'test.recent_failure', now());

select throws_ok(
  $$ update public.audit_logs set action = 'team.deleted' $$,
  'P0001', 'AUDIT_LOGS_ARE_APPEND_ONLY', 'audit logs cannot be edited, even by the service role'
);

-- -----------------------------------------------------------------------------
-- Anonymous visitors: catalog yes, logs no
-- -----------------------------------------------------------------------------
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

select is((select count(*)::int from public.prices), 1, 'anyone can read prices');
select is((select count(*)::int from public.products), 1, 'anyone can read products');
select is((select count(*)::int from public.audit_logs), 0, 'anonymous users see no audit logs');

-- -----------------------------------------------------------------------------
-- Dave: owner of his personal team
-- -----------------------------------------------------------------------------
reset role;
set local role authenticated;
set local request.jwt.claims to '{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated"}';

select is((select count(*)::int from public.audit_logs), 1, 'owners see their team''s audit log');
select throws_ok(
  $$ insert into public.prices (id, product_id, currency, type) values ('price_x', 'prod_test', 'usd', 'one_time') $$,
  '42501', null, 'users cannot write prices'
);
select throws_ok(
  $$ update public.products set name = 'Free stuff' $$,
  '42501', null, 'users cannot change products'
);
select throws_ok(
  $$ insert into public.audit_logs (action) values ('team.deleted') $$,
  '42501', null, 'users cannot forge audit entries'
);
select throws_ok(
  $$ delete from public.audit_logs $$,
  '42501', null, 'users cannot delete audit entries'
);
select throws_ok(
  $$ select * from public.app_logs $$,
  '42501', null, 'app logs are service-role only'
);
select throws_ok(
  $$ select public.purge_old_logs(1, 1) $$,
  '42501', null, 'users cannot purge logs'
);

-- -----------------------------------------------------------------------------
-- Erin: an outsider to Dave's team
-- -----------------------------------------------------------------------------
set local request.jwt.claims to '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}';

select is((select count(*)::int from public.audit_logs), 1, 'users see only their own account-level events');
select is(
  (select action from public.audit_logs limit 1), 'auth.password_changed',
  'and not other teams'' events'
);

-- -----------------------------------------------------------------------------
-- Retention (as postgres)
-- -----------------------------------------------------------------------------
reset role;
select is(
  public.purge_old_logs(365, 30) ->> 'app_logs', '1',
  'purge_old_logs deletes only entries older than the retention window'
);

select * from finish();
rollback;
