import type { CoupleDoc } from '../types';

/**
 * Couche de synchronisation.
 *
 * Le document du couple est diffuse sur un canal nomme d'apres le Code
 * d'Amour : tous les onglets — et donc les deux « telephones » ouverts sur le
 * meme navigateur — recoivent la mise a jour immediatement. La resolution de
 * conflit est un dernier-ecrivain-gagne sur `rev`, ce qui suffit pour un
 * document edite par deux personnes.
 *
 * `SyncTransport` est volontairement minimal : brancher un vrai serveur temps
 * reel (WebSocket, Supabase Realtime, Firebase) revient a fournir une autre
 * implementation de cette interface a `createSync`.
 */
export interface SyncTransport {
  publish: (doc: CoupleDoc) => void;
  subscribe: (handler: (doc: CoupleDoc) => void) => () => void;
  close: () => void;
}

function channelName(loveCode: string) {
  return `cocon:${loveCode}`;
}

/** Diffusion entre onglets du meme navigateur. */
export function createBroadcastTransport(loveCode: string): SyncTransport {
  const handlers = new Set<(doc: CoupleDoc) => void>();
  let channel: BroadcastChannel | null = null;

  if (typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel(channelName(loveCode));
    channel.onmessage = (event: MessageEvent<CoupleDoc>) => {
      if (!event.data || typeof event.data.rev !== 'number') return;
      handlers.forEach((handler) => handler(event.data));
    };
  }

  // Repli pour les navigateurs sans BroadcastChannel : l'evenement `storage`
  // se declenche dans les autres onglets a chaque ecriture.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== `cocon.doc.${loveCode}` || !event.newValue) return;
    try {
      const doc = JSON.parse(event.newValue) as CoupleDoc;
      if (typeof doc?.rev === 'number') handlers.forEach((handler) => handler(doc));
    } catch {
      /* valeur illisible : on ignore */
    }
  };
  window.addEventListener('storage', onStorage);

  return {
    publish(doc) {
      channel?.postMessage(doc);
    },
    subscribe(handler) {
      handlers.add(handler);
      return () => handlers.delete(handler);
    },
    close() {
      handlers.clear();
      window.removeEventListener('storage', onStorage);
      channel?.close();
    },
  };
}

/** Garde la revision la plus recente entre le document local et le distant. */
export function mergeDoc(local: CoupleDoc, incoming: CoupleDoc): CoupleDoc {
  if (incoming.loveCode !== local.loveCode) return local;
  if (incoming.rev > local.rev) return incoming;
  if (incoming.rev === local.rev && incoming.updatedAt > local.updatedAt) return incoming;
  return local;
}

/**
 * Combine plusieurs transports : le document part sur tous, et une mise a jour
 * recue par n'importe lequel remonte a l'application.
 *
 * En pratique : BroadcastChannel pour les onglets du meme navigateur (instantane,
 * fonctionne hors-ligne) + Supabase pour les deux telephones distants.
 */
export function createCompositeTransport(transports: SyncTransport[]): SyncTransport {
  return {
    publish(doc) {
      transports.forEach((transport) => transport.publish(doc));
    },
    subscribe(handler) {
      const unsubscribes = transports.map((transport) => transport.subscribe(handler));
      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    },
    close() {
      transports.forEach((transport) => transport.close());
    },
  };
}
