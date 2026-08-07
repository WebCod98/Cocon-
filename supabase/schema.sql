-- ===========================================================================
--  Cocon — schéma Supabase
--
--  À coller tel quel dans l'éditeur SQL de Supabase, puis « Run ».
--  Le script est idempotent : le relancer ne casse rien.
--
--  Principe de sécurité
--  --------------------
--  La table est fermée : RLS activée, aucune policy, et les droits directs
--  retirés aux rôles anon/authenticated. Personne ne peut donc lire ou écrire
--  la table depuis le navigateur.
--
--  Tout passe par quatre fonctions SECURITY DEFINER :
--
--    cocon_create  crée le couple
--    cocon_claim   échange le code à 6 chiffres contre le secret — UNE SEULE
--                  FOIS, tant que le couple n'est pas encore apparié
--    cocon_pull    lit le document, secret exigé
--    cocon_push    écrit le document, secret exigé
--
--  Autrement dit : le code à 6 chiffres ne sert qu'à l'appairage initial, et
--  devient inutile ensuite. Les données restent protégées par un secret long
--  et aléatoire que seuls les deux téléphones détiennent.
-- ===========================================================================

-- --- La table -------------------------------------------------------------

create table if not exists public.couples (
  love_code   text primary key,
  secret      text        not null,
  paired      boolean     not null default false,
  rev         integer     not null default 0,
  doc         jsonb       not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.couples is
  'Un document par couple. Jamais accessible directement : voir les fonctions cocon_*.';

-- --- Verrouillage ---------------------------------------------------------

alter table public.couples enable row level security;

-- Aucune policy n'est créée : RLS activée sans policy = tout est refusé.
revoke all on table public.couples from anon, authenticated;

-- --- cocon_create ---------------------------------------------------------

create or replace function public.cocon_create(
  p_code   text,
  p_secret text,
  p_doc    jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_code is null or length(p_code) < 4 or p_secret is null or length(p_secret) < 20 then
    return false;
  end if;

  insert into public.couples (love_code, secret, doc, rev)
  values (p_code, p_secret, p_doc, coalesce((p_doc ->> 'rev')::int, 1))
  on conflict (love_code) do nothing;

  return found;
end;
$$;

-- --- cocon_claim ----------------------------------------------------------
--  Échange le code contre le secret. Marque le couple comme apparié dans la
--  même transaction : un code déjà utilisé ne renvoie plus rien.

create or replace function public.cocon_claim(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_secret text;
  v_doc    jsonb;
begin
  select secret, doc
    into v_secret, v_doc
    from public.couples
   where love_code = p_code
     and paired = false
   for update;

  if v_secret is null then
    return null;
  end if;

  update public.couples
     set paired = true,
         updated_at = now()
   where love_code = p_code;

  return jsonb_build_object('secret', v_secret, 'doc', v_doc);
end;
$$;

-- --- cocon_pull -----------------------------------------------------------

create or replace function public.cocon_pull(
  p_code   text,
  p_secret text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_doc jsonb;
begin
  select doc
    into v_doc
    from public.couples
   where love_code = p_code
     and secret = p_secret;

  return v_doc;
end;
$$;

-- --- cocon_push -----------------------------------------------------------
--  Dernier-écrivain-gagne sur le numéro de révision. Si le serveur détient une
--  version plus récente, c'est elle qui est renvoyée : l'appelant se met alors
--  à jour au lieu d'écraser.

create or replace function public.cocon_push(
  p_code   text,
  p_secret text,
  p_doc    jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rev integer;
  v_new integer;
begin
  select rev
    into v_rev
    from public.couples
   where love_code = p_code
     and secret = p_secret
   for update;

  if v_rev is null then
    return null;
  end if;

  v_new := coalesce((p_doc ->> 'rev')::int, 0);

  if v_new >= v_rev then
    update public.couples
       set doc = p_doc,
           rev = v_new,
           paired = true,
           updated_at = now()
     where love_code = p_code;
    return p_doc;
  end if;

  return (select doc from public.couples where love_code = p_code);
end;
$$;

-- --- Droits d'exécution ---------------------------------------------------

grant execute on function public.cocon_create(text, text, jsonb) to anon, authenticated;
grant execute on function public.cocon_claim(text)               to anon, authenticated;
grant execute on function public.cocon_pull(text, text)          to anon, authenticated;
grant execute on function public.cocon_push(text, text, jsonb)   to anon, authenticated;

-- --- Ménage ---------------------------------------------------------------
--  Un couple créé mais jamais apparié au bout de 7 jours est un essai
--  abandonné : on libère le code. À déclencher manuellement, ou via l'extension
--  pg_cron si vous l'activez un jour.

create or replace function public.cocon_cleanup()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from public.couples
   where paired = false
     and created_at < now() - interval '7 days';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
