-- =============================================================================
-- Profiles, teams, memberships and invitations.
--
-- Security model (see docs/architecture.md §5–§6):
--   * The team is the tenant. Every business table carries a team_id.
--   * RLS is the security boundary. App code checks roles only to show nicer errors.
--   * Writes that must be atomic (create team, accept invite) go through
--     SECURITY DEFINER functions with search_path locked to ''.
-- =============================================================================

create extension if not exists citext with schema extensions;
create extension if not exists pgcrypto with schema extensions;

create type public.team_role as enum ('owner', 'admin', 'member');

-- -----------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- Tables
-- -----------------------------------------------------------------------------
create table public.profiles (
  id                    uuid primary key references auth.users (id) on delete cascade,
  email                 text not null,
  full_name             text check (char_length(full_name) <= 100),
  avatar_url            text check (char_length(avatar_url) <= 2048),
  is_platform_admin     boolean not null default false,
  welcome_email_sent_at timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
comment on column public.profiles.is_platform_admin is
  'Grants access to /admin. Users can never set this themselves (no column UPDATE grant).';

create table public.teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 1 and 64),
  slug        text not null unique
              check (slug ~ '^[a-z0-9]([a-z0-9-]{0,46}[a-z0-9])?$'),
  is_personal boolean not null default false,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.team_members (
  team_id    uuid not null references public.teams (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       public.team_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (team_id, user_id)
);
create index team_members_user_id_idx on public.team_members (user_id);

create table public.invitations (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams (id) on delete cascade,
  email       extensions.citext not null,
  role        public.team_role not null default 'member' check (role <> 'owner'),
  token_hash  text not null unique,
  invited_by  uuid references public.profiles (id) on delete set null,
  expires_at  timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);
-- Only one open invitation per email per team.
create unique index invitations_open_unique
  on public.invitations (team_id, email) where accepted_at is null;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger teams_set_updated_at before update on public.teams
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- RLS helper functions.
-- SECURITY DEFINER so policies on team_members don't recurse into themselves.
-- -----------------------------------------------------------------------------
create or replace function public.is_team_member(p_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_team_role(p_team_id uuid, p_roles public.team_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = (select auth.uid())
      and role = any (p_roles)
  );
$$;

-- True when the current user shares at least one team with p_user_id
-- (lets member lists show teammates' names and avatars).
create or replace function public.shares_team_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.team_members mine
    join public.team_members theirs on theirs.team_id = mine.team_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = p_user_id
  );
$$;

-- Turns any string into a valid, unused team slug.
create or replace function public.generate_team_slug(p_base text)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_base text;
  v_slug text;
begin
  v_base := lower(coalesce(p_base, ''));
  v_base := regexp_replace(v_base, '[^a-z0-9]+', '-', 'g');
  v_base := trim(both '-' from left(v_base, 40));
  if v_base = '' then
    v_base := 'team';
  end if;

  v_slug := v_base;
  while exists (select 1 from public.teams where slug = v_slug) loop
    v_slug := v_base || '-' || substr(md5(random()::text), 1, 6);
  end loop;
  return v_slug;
end;
$$;

-- -----------------------------------------------------------------------------
-- Membership rules enforced in the database (not just in app code):
--   1. A team always keeps at least one owner.
--   2. Only owners can grant, change or remove the owner role.
-- -----------------------------------------------------------------------------
create or replace function public.enforce_team_member_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := (select auth.uid());
  v_team_id uuid := coalesce(new.team_id, old.team_id);
begin
  -- Cascading deletes (team or user deleted) are always allowed.
  if tg_op = 'DELETE' and (
       not exists (select 1 from public.teams where id = old.team_id)
    or not exists (select 1 from public.profiles where id = old.user_id)
  ) then
    return old;
  end if;

  -- Rule 2: touching the owner role requires being an owner.
  -- v_actor is null for service-role/system calls, which are trusted.
  if v_actor is not null
     and (old.role = 'owner' or (tg_op = 'UPDATE' and new.role = 'owner'))
     and not public.has_team_role(v_team_id, array['owner']::public.team_role[])
  then
    raise exception 'ONLY_OWNER_CAN_MANAGE_OWNERS' using errcode = 'P0001';
  end if;

  -- Rule 1: never remove or demote the last owner.
  if old.role = 'owner'
     and (tg_op = 'DELETE' or new.role <> 'owner')
     and not exists (
       select 1 from public.team_members
       where team_id = old.team_id and role = 'owner' and user_id <> old.user_id
     )
  then
    raise exception 'TEAM_NEEDS_AN_OWNER' using errcode = 'P0001';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger team_members_enforce_rules
  before update or delete on public.team_members
  for each row execute function public.enforce_team_member_rules();

-- -----------------------------------------------------------------------------
-- New user bootstrap: profile + personal team + owner membership.
-- Runs in the same transaction as the auth.users insert.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
  v_team_id uuid;
begin
  v_name := coalesce(
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'name', '')
  );

  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    v_name,
    new.raw_user_meta_data ->> 'avatar_url'
  );

  insert into public.teams (name, slug, is_personal, created_by)
  values (
    'Personal',
    public.generate_team_slug(coalesce(v_name, split_part(new.email, '@', 1))),
    true,
    new.id
  )
  returning id into v_team_id;

  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep profiles.email in sync when a user changes their email.
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email_change();

-- -----------------------------------------------------------------------------
-- RPC: create a team and make the caller its owner (atomic).
-- -----------------------------------------------------------------------------
create or replace function public.create_team(p_name text, p_slug text default null)
returns public.teams
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_team public.teams;
begin
  if v_user is null then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  insert into public.teams (name, slug, created_by)
  values (
    trim(p_name),
    coalesce(nullif(trim(p_slug), ''), public.generate_team_slug(p_name)),
    v_user
  )
  returning * into v_team;

  insert into public.team_members (team_id, user_id, role)
  values (v_team.id, v_user, 'owner');

  return v_team;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: look up an invitation by its raw token (for the /invite/[token] page).
-- The invitee isn't a team member yet, so plain RLS would hide it.
-- -----------------------------------------------------------------------------
create or replace function public.get_invitation(p_token text)
returns table (
  team_name    text,
  team_slug    text,
  inviter_name text,
  email        text,
  role         public.team_role,
  status       text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    t.name,
    t.slug,
    coalesce(p.full_name, p.email),
    i.email::text,
    i.role,
    case
      when i.accepted_at is not null then 'accepted'
      when i.expires_at < now() then 'expired'
      else 'pending'
    end
  from public.invitations i
  join public.teams t on t.id = i.team_id
  left join public.profiles p on p.id = i.invited_by
  where i.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex');
$$;

-- -----------------------------------------------------------------------------
-- RPC: accept an invitation. Single use, expires, must match the user's email.
-- Returns the team slug so the app can redirect.
-- -----------------------------------------------------------------------------
create or replace function public.accept_invitation(p_token text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := (select auth.uid());
  v_user_email text;
  v_invitation public.invitations;
begin
  if v_user is null then
    raise exception 'UNAUTHENTICATED' using errcode = 'P0001';
  end if;

  select * into v_invitation
  from public.invitations
  where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  for update;

  if not found then
    raise exception 'INVITATION_NOT_FOUND' using errcode = 'P0001';
  end if;
  if v_invitation.accepted_at is not null then
    raise exception 'INVITATION_ALREADY_USED' using errcode = 'P0001';
  end if;
  if v_invitation.expires_at < now() then
    raise exception 'INVITATION_EXPIRED' using errcode = 'P0001';
  end if;

  select email into v_user_email from auth.users where id = v_user;
  if lower(v_user_email) <> lower(v_invitation.email::text) then
    raise exception 'INVITATION_EMAIL_MISMATCH' using errcode = 'P0001';
  end if;

  insert into public.team_members (team_id, user_id, role)
  values (v_invitation.team_id, v_user, v_invitation.role)
  on conflict (team_id, user_id) do nothing;

  update public.invitations set accepted_at = now() where id = v_invitation.id;

  return (select slug from public.teams where id = v_invitation.team_id);
end;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.teams        enable row level security;
alter table public.team_members enable row level security;
alter table public.invitations  enable row level security;

-- profiles ---------------------------------------------------------------------
create policy "profiles: read self and teammates"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_team_with(id));

create policy "profiles: update self"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Column-level grants: users may only change their name and avatar.
revoke update on public.profiles from authenticated, anon;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- teams ------------------------------------------------------------------------
create policy "teams: members can read"
  on public.teams for select to authenticated
  using (public.is_team_member(id));

create policy "teams: owners and admins can update"
  on public.teams for update to authenticated
  using (public.has_team_role(id, array['owner', 'admin']::public.team_role[]))
  with check (public.has_team_role(id, array['owner', 'admin']::public.team_role[]));

create policy "teams: owners can delete non-personal teams"
  on public.teams for delete to authenticated
  using (not is_personal and public.has_team_role(id, array['owner']::public.team_role[]));

-- Inserts happen only through create_team() / handle_new_user().
revoke insert on public.teams from authenticated, anon;
revoke update on public.teams from authenticated, anon;
grant update (name, slug) on public.teams to authenticated;

-- team_members -----------------------------------------------------------------
create policy "team_members: members can read"
  on public.team_members for select to authenticated
  using (public.is_team_member(team_id));

create policy "team_members: owners and admins can change roles"
  on public.team_members for update to authenticated
  using (public.has_team_role(team_id, array['owner', 'admin']::public.team_role[]))
  with check (public.has_team_role(team_id, array['owner', 'admin']::public.team_role[]));

create policy "team_members: owners/admins remove, anyone can leave"
  on public.team_members for delete to authenticated
  using (
    user_id = (select auth.uid())
    or public.has_team_role(team_id, array['owner', 'admin']::public.team_role[])
  );

-- Inserts happen only through create_team() / accept_invitation().
revoke insert on public.team_members from authenticated, anon;
revoke update on public.team_members from authenticated, anon;
grant update (role) on public.team_members to authenticated;

-- invitations ------------------------------------------------------------------
create policy "invitations: owners and admins can read"
  on public.invitations for select to authenticated
  using (public.has_team_role(team_id, array['owner', 'admin']::public.team_role[]));

create policy "invitations: owners and admins can create"
  on public.invitations for insert to authenticated
  with check (
    public.has_team_role(team_id, array['owner', 'admin']::public.team_role[])
    and invited_by = (select auth.uid())
  );

create policy "invitations: owners and admins can revoke"
  on public.invitations for delete to authenticated
  using (public.has_team_role(team_id, array['owner', 'admin']::public.team_role[]));

revoke update on public.invitations from authenticated, anon;

-- -----------------------------------------------------------------------------
-- Function privileges: nothing is callable by anonymous visitors.
-- -----------------------------------------------------------------------------
revoke execute on function public.create_team(text, text) from public, anon;
revoke execute on function public.accept_invitation(text) from public, anon;
revoke execute on function public.get_invitation(text) from public, anon;
revoke execute on function public.generate_team_slug(text) from public, anon, authenticated;
grant execute on function public.create_team(text, text) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.get_invitation(text) to authenticated;
