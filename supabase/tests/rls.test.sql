-- =============================================================================
-- Row Level Security tests. Run with: pnpm db:test
--
-- Every policy gets tests for access that should be allowed AND denied.
-- Add tests here in the same PR as any new table or policy.
-- =============================================================================
begin;
create extension if not exists pgtap with schema extensions;
select plan(20);

-- -----------------------------------------------------------------------------
-- Fixtures (as postgres). The signup trigger creates profiles + personal teams.
-- -----------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data, aud, role) values
  ('11111111-1111-4111-8111-111111111111', 'alice@test.com', '{"full_name":"Alice"}', 'authenticated', 'authenticated'),
  ('22222222-2222-4222-8222-222222222222', 'bob@test.com',   '{"full_name":"Bob"}',   'authenticated', 'authenticated'),
  ('33333333-3333-4333-8333-333333333333', 'carol@test.com', '{"full_name":"Carol"}', 'authenticated', 'authenticated');

-- A subscription on Bob's personal team, which Alice must never see.
insert into public.subscriptions (id, team_id, status, price_id)
select 'sub_bob', id, 'active', 'price_x' from public.teams
where created_by = '22222222-2222-4222-8222-222222222222' and is_personal;

select is(
  (select count(*)::int from public.teams where created_by = '11111111-1111-4111-8111-111111111111' and is_personal),
  1, 'signup trigger creates a personal team'
);

-- -----------------------------------------------------------------------------
-- Act as Alice
-- -----------------------------------------------------------------------------
set local role authenticated;
set local request.jwt.claims to '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select is((select count(*)::int from public.teams), 1, 'alice sees only her own team');
select is((select count(*)::int from public.subscriptions), 0, 'alice cannot see another team''s subscription');
select is((select count(*)::int from public.profiles), 1, 'alice sees only her own profile (no shared teams yet)');

select lives_ok(
  $$ update public.profiles set full_name = 'Alice A.' where id = '11111111-1111-4111-8111-111111111111' $$,
  'alice can update her name'
);
select throws_ok(
  $$ update public.profiles set is_platform_admin = true where id = '11111111-1111-4111-8111-111111111111' $$,
  '42501', null, 'alice cannot make herself a platform admin'
);
select throws_ok(
  $$ insert into public.team_members (team_id, user_id, role)
     select id, '11111111-1111-4111-8111-111111111111', 'owner' from public.teams limit 1 $$,
  '42501', null, 'team_members cannot be inserted directly'
);
select throws_ok(
  $$ insert into public.subscriptions (id, team_id, status, price_id)
     select 'sub_fake', id, 'active', 'price_x' from public.teams limit 1 $$,
  '42501', null, 'users cannot grant themselves a subscription'
);
select throws_ok(
  $$ select * from public.stripe_events $$,
  '42501', null, 'stripe_events is service-role only'
);

select lives_ok(
  $$ select public.create_team('Alice Co', 'alice-co') $$,
  'alice can create a team'
);
select is(
  (select role::text from public.team_members tm join public.teams t on t.id = tm.team_id
   where t.slug = 'alice-co' and tm.user_id = '11111111-1111-4111-8111-111111111111'),
  'owner', 'team creator becomes owner'
);

select lives_ok(
  $$ insert into public.invitations (team_id, email, role, token_hash, invited_by)
     select id, 'carol@test.com', 'member',
            encode(extensions.digest('carol-token-0123456789', 'sha256'), 'hex'),
            '11111111-1111-4111-8111-111111111111'
     from public.teams where slug = 'alice-co' $$,
  'owners can create invitations'
);

-- -----------------------------------------------------------------------------
-- Act as Bob (outsider)
-- -----------------------------------------------------------------------------
set local request.jwt.claims to '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

select is((select count(*)::int from public.invitations), 0, 'outsiders cannot see invitations');
select is((select count(*)::int from public.teams where slug = 'alice-co'), 0, 'outsiders cannot see the team');
select throws_ok(
  $$ select public.accept_invitation('carol-token-0123456789') $$,
  'P0001', 'INVITATION_EMAIL_MISMATCH', 'invitation only works for the invited email'
);

-- -----------------------------------------------------------------------------
-- Act as Carol (invitee)
-- -----------------------------------------------------------------------------
set local request.jwt.claims to '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}';

select is(public.accept_invitation('carol-token-0123456789'), 'alice-co', 'invitee can accept');
select throws_ok(
  $$ select public.accept_invitation('carol-token-0123456789') $$,
  'P0001', 'INVITATION_ALREADY_USED', 'invitations are single-use'
);
select is(
  (with updated as (update public.teams set name = 'Hacked' where slug = 'alice-co' returning 1)
   select count(*)::int from updated),
  0, 'members cannot rename the team'
);

-- -----------------------------------------------------------------------------
-- Back to Alice: the last owner cannot leave
-- -----------------------------------------------------------------------------
set local request.jwt.claims to '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

select throws_ok(
  $$ delete from public.team_members
     where user_id = '11111111-1111-4111-8111-111111111111'
       and team_id = (select id from public.teams where slug = 'alice-co') $$,
  'P0001', 'TEAM_NEEDS_AN_OWNER', 'the last owner cannot leave'
);

-- -----------------------------------------------------------------------------
-- Anonymous visitors see nothing
-- -----------------------------------------------------------------------------
reset role;
set local role anon;
set local request.jwt.claims to '{"role":"anon"}';

select is((select count(*)::int from public.teams), 0, 'anonymous users cannot read teams');

select * from finish();
rollback;
