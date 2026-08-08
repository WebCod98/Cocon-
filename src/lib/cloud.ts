import type { SupabaseClient } from '@supabase/supabase-js';
import type { CoupleDoc } from '../types';
import type { SyncTransport } from './sync';

/* --------------------------------------------------------------------------
 * Couche Supabase.
 *
 * Elle est entierement optionnelle : sans les deux variables d'environnement,
 * `cloudEnabled` vaut false et l'application se rabat sur la synchronisation
 * entre onglets, exactement comme avant.
 *
 * Le client Supabase est charge dynamiquement — il ne pese donc rien dans le
 * bundle initial des installations qui n'utilisent pas le cloud.
 * ------------------------------------------------------------------------ */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const cloudEnabled = Boolean(url && anonKey);

/**
 * Diagnostic de configuration.
 *
 * Les deux variables vont par paire : une adresse sans cle, ou une cle sans
 * adresse, ne permet rien. N'en renseigner qu'une est l'erreur la plus courante
 * — et sans ce diagnostic, l'app repasserait silencieusement en mode local.
 */
export type CloudConfig =
  | { state: 'off' }
  | { state: 'incomplete'; missing: string }
  | { state: 'malformed'; problem: string }
  | { state: 'ready' };

export function cloudConfig(): CloudConfig {
  if (!url && !anonKey) return { state: 'off' };
  if (url && !anonKey) return { state: 'incomplete', missing: 'VITE_SUPABASE_ANON_KEY' };
  if (!url && anonKey) return { state: 'incomplete', missing: 'VITE_SUPABASE_URL' };

  const address = (url as string).trim();
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(address.replace(/\/$/, ''))) {
    return {
      state: 'malformed',
      problem: `VITE_SUPABASE_URL doit ressembler à https://xxxxx.supabase.co — valeur reçue : « ${address.slice(0, 48)} »`,
    };
  }
  if ((anonKey as string).trim().length < 20) {
    return { state: 'malformed', problem: 'VITE_SUPABASE_ANON_KEY semble tronquée.' };
  }
  return { state: 'ready' };
}

let clientPromise: Promise<SupabaseClient | null> | null = null;

function getClient(): Promise<SupabaseClient | null> {
  if (!cloudEnabled) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js')
      .then(({ createClient }) =>
        createClient(url as string, anonKey as string, {
          auth: { persistSession: false, autoRefreshToken: false },
          realtime: { params: { eventsPerSecond: 4 } },
        })
      )
      .catch(() => null);
  }
  return clientPromise;
}

/** Secret long et aleatoire : c'est lui qui protege reellement le document. */
export function makeSecret() {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/* --- Operations ---------------------------------------------------------- */

/**
 * `taken` : les 6 chiffres sont deja pris par un autre couple — il suffit d'en
 * tirer d'autres. `error` : serveur injoignable ou schema SQL absent, et la
 * distinction compte : dans un cas on reessaie, dans l'autre on previent.
 */
export type CreateResult = 'created' | 'taken' | 'error';

export async function createRemote(doc: CoupleDoc, secret: string): Promise<CreateResult> {
  const client = await getClient();
  if (!client) return 'error';
  const { data, error } = await client.rpc('cocon_create', {
    p_code: doc.loveCode,
    p_secret: secret,
    p_doc: doc,
  });
  if (error) return 'error';
  return data === true ? 'created' : 'taken';
}

export type ClaimResult =
  | { ok: true; secret: string; doc: CoupleDoc }
  | { ok: false; reason: 'not-found' | 'offline' };

/**
 * Echange le code a 6 chiffres contre le secret du couple. Cote serveur,
 * l'operation est a usage unique : un code deja utilise ne renvoie plus rien.
 */
export async function claimRemote(loveCode: string): Promise<ClaimResult> {
  const client = await getClient();
  if (!client) return { ok: false, reason: 'offline' };

  const { data, error } = await client.rpc('cocon_claim', { p_code: loveCode });
  if (error) return { ok: false, reason: 'offline' };
  if (!data) return { ok: false, reason: 'not-found' };

  const payload = data as { secret: string; doc: CoupleDoc };
  if (!payload?.secret || !payload?.doc) return { ok: false, reason: 'not-found' };
  return { ok: true, secret: payload.secret, doc: payload.doc };
}

export async function pullRemote(loveCode: string, secret: string): Promise<CoupleDoc | null> {
  const client = await getClient();
  if (!client) return null;
  const { data, error } = await client.rpc('cocon_pull', { p_code: loveCode, p_secret: secret });
  if (error || !data) return null;
  return data as CoupleDoc;
}

/**
 * Ecrit le document. Si le serveur detient une revision plus recente, c'est
 * elle qui revient — l'appelant se met alors a jour au lieu d'ecraser.
 */
export async function pushRemote(doc: CoupleDoc, secret: string): Promise<CoupleDoc | null> {
  const client = await getClient();
  if (!client) return null;
  const { data, error } = await client.rpc('cocon_push', {
    p_code: doc.loveCode,
    p_secret: secret,
    p_doc: doc,
  });
  if (error || !data) return null;
  return data as CoupleDoc;
}

/* --- Transport temps reel ------------------------------------------------ */

/**
 * Diffusion instantanee via Realtime Broadcast, doublee d'une ecriture en base
 * (debattue de 500 ms) pour la durabilite.
 *
 * Le canal porte le nom du secret : il est donc indevinable, ce qui evite
 * d'ouvrir les donnees a quiconque possede la cle publique.
 */
export function createSupabaseTransport(doc: CoupleDoc, secret: string): SyncTransport {
  const handlers = new Set<(incoming: CoupleDoc) => void>();
  let channel: Awaited<ReturnType<typeof getChannel>> | null = null;
  let closed = false;
  let pending: CoupleDoc | null = null;
  let flushTimer: number | null = null;

  async function getChannel() {
    const client = await getClient();
    if (!client) return null;
    const instance = client.channel(`cocon-${secret.slice(0, 32)}`, {
      config: { broadcast: { self: false } },
    });
    instance.on('broadcast', { event: 'doc' }, (message) => {
      const incoming = message.payload as CoupleDoc;
      if (incoming && typeof incoming.rev === 'number') {
        handlers.forEach((handler) => handler(incoming));
      }
    });
    await instance.subscribe();
    return instance;
  }

  const ready = getChannel().then((instance) => {
    if (closed) {
      void instance?.unsubscribe();
      return null;
    }
    channel = instance;
    return instance;
  });

  /** Rattrapage : ce que le/la partenaire a fait pendant notre absence. */
  void pullRemote(doc.loveCode, secret).then((remote) => {
    if (!closed && remote && typeof remote.rev === 'number') {
      handlers.forEach((handler) => handler(remote));
    }
  });

  const flush = () => {
    flushTimer = null;
    const next = pending;
    pending = null;
    if (!next) return;
    void pushRemote(next, secret).then((winner) => {
      // Le serveur avait plus recent : on adopte sa version.
      if (!closed && winner && winner.rev > next.rev) {
        handlers.forEach((handler) => handler(winner));
      }
    });
  };

  return {
    publish(next) {
      void ready.then(() => {
        if (closed) return;
        void channel?.send({ type: 'broadcast', event: 'doc', payload: next });
      });
      pending = next;
      if (flushTimer === null) flushTimer = window.setTimeout(flush, 500);
    },
    subscribe(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close() {
      closed = true;
      handlers.clear();
      if (flushTimer !== null) {
        window.clearTimeout(flushTimer);
        flush();
      }
      void ready.then((instance) => instance?.unsubscribe());
    },
  };
}
