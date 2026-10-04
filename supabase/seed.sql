-- =============================================================================
-- LOCAL DEVELOPMENT SEED DATA. Runs on `pnpm db:reset`. Never run in production.
--
-- Demo accounts (password for all: password123):
--   admin@example.com   platform admin (can open /admin)
--   owner@example.com   owner of "Acme Inc"
--   member@example.com  member of "Acme Inc"
-- =============================================================================

do $$
declare
  v_users constant jsonb := '[
    {"id": "00000000-0000-4000-8000-000000000001", "email": "admin@example.com",  "name": "Ada Admin"},
    {"id": "00000000-0000-4000-8000-000000000002", "email": "owner@example.com",  "name": "Olivia Owner"},
    {"id": "00000000-0000-4000-8000-000000000003", "email": "member@example.com", "name": "Max Member"}
  ]';
  v_user jsonb;
begin
  for v_user in select * from jsonb_array_elements(v_users) loop
    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change, email_change_token_new
    ) values (
      '00000000-0000-0000-0000-000000000000',
      (v_user ->> 'id')::uuid,
      'authenticated',
      'authenticated',
      v_user ->> 'email',
      extensions.crypt('password123', extensions.gen_salt('bf')),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('full_name', v_user ->> 'name'),
      now(),
      now(),
      '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(),
      (v_user ->> 'id')::uuid,
      v_user ->> 'id',
      'email',
      jsonb_build_object('sub', v_user ->> 'id', 'email', v_user ->> 'email', 'email_verified', true),
      now(),
      now(),
      now()
    );
  end loop;
end;
$$;

-- The on_auth_user_created trigger already created profiles + personal teams.

update public.profiles set is_platform_admin = true where email = 'admin@example.com';

insert into public.teams (id, name, slug, created_by)
values ('00000000-0000-4000-8000-0000000000a1', 'Acme Inc', 'acme', '00000000-0000-4000-8000-000000000002');

insert into public.team_members (team_id, user_id, role) values
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000002', 'owner'),
  ('00000000-0000-4000-8000-0000000000a1', '00000000-0000-4000-8000-000000000003', 'member');
