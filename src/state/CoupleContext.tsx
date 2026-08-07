import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  Availability,
  Challenge,
  CoupleDoc,
  DeviceSettings,
  GaugeKey,
  LetterCondition,
  MoodKey,
  PartnerProfile,
  PartnerSlot,
  PinguMood,
  Species,
  ThemeMode,
} from '../types';
import { KEYS, readJSON, removeKey, writeJSON } from '../lib/persist';
import {
  createBroadcastTransport,
  createCompositeTransport,
  mergeDoc,
  type SyncTransport,
} from '../lib/sync';
import {
  claimRemote,
  cloudEnabled,
  createRemote,
  createSupabaseTransport,
  makeSecret,
} from '../lib/cloud';
import { makeLoveCode, uid } from '../lib/id';
import { setHapticsEnabled, vibrate } from '../lib/haptics';
import { SCHEMA, createDoc, demoSeed } from '../data/seed';
import { speciesOption } from '../data/companions';
import { shopItem } from '../data/shop';
import { weatherFor } from '../data/cities';
import { dateKeyIn, hourIn } from '../utils/time';

/* --- Reglages appareil --------------------------------------------------- */

const defaultSettings: DeviceSettings = {
  schema: SCHEMA,
  slot: 'one',
  theme: 'auto',
  notifications: false,
  haptics: true,
  demoPartner: true,
  onboarded: false,
};

interface Session {
  loveCode: string;
  slot: PartnerSlot;
  /** Secret partage, present uniquement quand Supabase est configure. */
  secret?: string;
}

/* --- Parametres d'inscription -------------------------------------------- */

export interface SignupInput {
  myName: string;
  myEmoji: string;
  myCity: string;
  myTimeZone: string;
  partnerName: string;
  partnerEmoji: string;
  partnerCity: string;
  partnerTimeZone: string;
  since: string;
  withDemoContent: boolean;
}

export interface JoinInput {
  loveCode: string;
  myName: string;
  myEmoji: string;
  myCity: string;
  myTimeZone: string;
}

export type JoinResult = { ok: true } | { ok: false; reason: 'not-found' | 'full' | 'offline' };

/* --- API exposee --------------------------------------------------------- */

interface CoupleApi {
  ready: boolean;
  doc: CoupleDoc | null;
  settings: DeviceSettings;

  /* derives (valables uniquement quand doc existe) */
  mySlot: PartnerSlot;
  theirSlot: PartnerSlot;
  me: PartnerProfile | null;
  them: PartnerProfile | null;
  mood: PinguMood;
  isNight: boolean;
  superHappy: boolean;
  toast: string | null;

  /* cycle de vie */
  signup: (input: SignupInput) => string;
  join: (input: JoinInput) => Promise<JoinResult>;
  /** Vrai quand un serveur de synchronisation est configure. */
  cloud: boolean;
  leave: () => void;
  hardReset: () => void;

  /* reglages */
  patchSettings: (patch: Partial<DeviceSettings>) => void;
  setTheme: (mode: ThemeMode) => void;

  /* compagnon */
  vote: (species: Species) => void;
  adopt: (name: string) => void;
  restartVote: () => void;
  care: (gauge: GaugeKey) => void;
  feedTreat: (itemId: string) => void;
  buy: (itemId: string) => boolean;
  toggleEquipped: (itemId: string) => void;
  togglePlaced: (itemId: string) => void;
  flashMood: (mood: PinguMood, message: string, duration?: number) => void;

  /* rituels */
  sendNote: (text: string, moment: 'morning' | 'evening', audio?: string) => void;
  markNotesRead: (moment: 'morning' | 'evening') => void;
  publishPolaroid: (url: string, caption: string) => void;
  setMood: (mood: MoodKey, note?: string) => void;
  sendThought: () => void;
  seeThoughts: () => void;

  /* agenda */
  addKeyDate: (entry: Omit<import('../types').KeyDate, 'id'>) => void;
  removeKeyDate: (id: string) => void;
  toggleReminder: (id: string) => void;
  setReunion: (iso: string | null) => void;
  addBucket: (label: string) => void;
  toggleBucket: (id: string, photo?: string) => void;
  removeBucket: (id: string) => void;
  addTripDoc: (doc: Omit<import('../types').TripDoc, 'id'>) => void;
  removeTripDoc: (id: string) => void;
  markMilestoneSeen: (id: string) => void;

  /* surprises */
  addLetter: (condition: LetterCondition, text: string, audio?: string) => void;
  openLetter: (id: string) => void;
  addCapsule: (title: string, text: string, openAt: number, photo?: string) => void;
  openCapsule: (id: string) => void;

  /* presence & arcade */
  setAvailability: (value: Availability) => void;
  createChallenge: (game: string, payload: Record<string, unknown>, turn?: PartnerSlot) => string;
  updateChallenge: (
    id: string,
    patch: { payload?: Record<string, unknown>; turn?: PartnerSlot; status?: Challenge['status'] }
  ) => void;
  removeChallenge: (id: string) => void;
  /** Ecriture bas niveau — reservee au partenaire de demonstration. */
  applyDoc: (mutate: (current: CoupleDoc) => CoupleDoc) => void;
  recordGame: (gameId: string, result: { won: boolean; score?: number }) => number;
  addCoins: (amount: number, reason?: string) => void;
  pushEvent: (icon: string, text: string) => void;
}

const CoupleContext = createContext<CoupleApi | null>(null);

/* --- Aides --------------------------------------------------------------- */

const clamp = (value: number) => Math.max(0, Math.min(100, value));

const otherSlot = (slot: PartnerSlot): PartnerSlot => (slot === 'one' ? 'two' : 'one');

/** Baisse des jauges depuis le dernier passage : ~72 pts de faim par jour. */
function applyDecay(doc: CoupleDoc, now = Date.now()): CoupleDoc {
  const hours = (now - doc.lastDecayAt) / 3600000;
  if (hours < 0.02) return doc;
  return {
    ...doc,
    lastDecayAt: now,
    gauges: {
      food: clamp(doc.gauges.food - hours * 3),
      love: clamp(doc.gauges.love - hours * 2.5),
      energy: clamp(doc.gauges.energy - hours * 2),
    },
  };
}

/** Purge : Polaroid de plus de 24 h, pensees et evenements trop vieux. */
function pruneDoc(doc: CoupleDoc, now = Date.now()): CoupleDoc {
  const dayAgo = now - 24 * 3600 * 1000;
  const weekAgo = now - 7 * 24 * 3600 * 1000;
  const polaroids = doc.polaroids.filter((item) => item.postedAt > dayAgo);
  const thoughts = doc.thoughts.filter((item) => item.createdAt > dayAgo);
  const feed = doc.feed.filter((item) => item.createdAt > weekAgo).slice(0, 60);
  const notes = doc.notes.slice(0, 60);
  const moods = doc.moods.filter((item) => item.createdAt > weekAgo);
  if (
    polaroids.length === doc.polaroids.length &&
    thoughts.length === doc.thoughts.length &&
    feed.length === doc.feed.length &&
    notes.length === doc.notes.length &&
    moods.length === doc.moods.length
  ) {
    return doc;
  }
  return { ...doc, polaroids, thoughts, feed, notes, moods };
}

/** Ecrit le document, en allegeant les photos si le quota explose. */
function persistDoc(doc: CoupleDoc) {
  const key = KEYS.doc(doc.loveCode);
  if (writeJSON(key, doc)) return doc;

  // Quota depasse : on lache les Polaroid les plus anciens (ils sont ephemeres).
  let trimmed = doc;
  while (trimmed.polaroids.length > 0) {
    trimmed = { ...trimmed, polaroids: trimmed.polaroids.slice(0, -1) };
    if (writeJSON(key, trimmed)) return trimmed;
  }
  writeJSON(key, { ...trimmed, notes: trimmed.notes.slice(0, 10) });
  return trimmed;
}

/* --- Provider ------------------------------------------------------------ */

export function CoupleProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [doc, setDoc] = useState<CoupleDoc | null>(null);
  const [settings, setSettings] = useState<DeviceSettings>(defaultSettings);
  const [transientMood, setTransientMood] = useState<PinguMood | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  /** Secret du couple : present des que Supabase est configure et appairé. */
  const [secret, setSecret] = useState<string | null>(null);
  const moodTimer = useRef<number | null>(null);
  const transport = useRef<SyncTransport | null>(null);
  const docRef = useRef<CoupleDoc | null>(null);

  docRef.current = doc;

  /* --- Chargement initial ------------------------------------------------ */
  useEffect(() => {
    const storedSettings = readJSON<DeviceSettings>(KEYS.settings);
    const merged = storedSettings?.schema === SCHEMA ? storedSettings : defaultSettings;
    setSettings(merged);
    setHapticsEnabled(merged.haptics);

    const session = readJSON<Session>(KEYS.session);
    if (session?.loveCode) {
      if (session.secret) setSecret(session.secret);
      const stored = readJSON<CoupleDoc>(KEYS.doc(session.loveCode));
      if (stored?.schema === SCHEMA) {
        setDoc(pruneDoc(applyDecay(stored)));
      }
    }
    setReady(true);
  }, []);

  /* --- Canal de synchronisation ----------------------------------------- */
  useEffect(() => {
    if (!doc?.loveCode) return undefined;
    if (transport.current) {
      transport.current.close();
      transport.current = null;
    }
    // Toujours les onglets du meme navigateur ; en plus, le serveur quand il
    // est configure et que l'appairage a fourni le secret.
    const channel = createCompositeTransport(
      secret && cloudEnabled
        ? [createBroadcastTransport(doc.loveCode), createSupabaseTransport(doc, secret)]
        : [createBroadcastTransport(doc.loveCode)]
    );
    transport.current = channel;
    const unsubscribe = channel.subscribe((incoming) => {
      setDoc((current) => {
        if (!current) return current;
        const next = mergeDoc(current, incoming);
        if (next !== current) writeJSON(KEYS.doc(next.loveCode), next);
        return next;
      });
    });
    return () => {
      unsubscribe();
      channel.close();
      transport.current = null;
    };
    // On ne se rebranche que si le couple ou le secret change, pas a chaque
    // revision du document.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc?.loveCode, secret]);

  /* --- Mutation centrale ------------------------------------------------- */
  const update = useCallback((mutate: (current: CoupleDoc) => CoupleDoc) => {
    setDoc((current) => {
      if (!current) return current;
      const mutated = mutate(current);
      if (mutated === current) return current;
      const next: CoupleDoc = { ...mutated, rev: current.rev + 1, updatedAt: Date.now() };
      const saved = persistDoc(next);
      transport.current?.publish(saved);
      return saved;
    });
  }, []);

  const patchSettings = useCallback((patch: Partial<DeviceSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeJSON(KEYS.settings, next);
      if (patch.haptics !== undefined) setHapticsEnabled(patch.haptics);
      return next;
    });
  }, []);

  /* --- Decroissance des jauges ------------------------------------------ */
  useEffect(() => {
    if (!doc) return undefined;
    const id = window.setInterval(() => {
      setDoc((current) => {
        if (!current) return current;
        const decayed = pruneDoc(applyDecay(current));
        if (decayed === current) return current;
        // La decroissance est deterministe : inutile de la diffuser, chaque
        // appareil la calcule. On garde donc la meme revision.
        writeJSON(KEYS.doc(decayed.loveCode), decayed);
        return decayed;
      });
    }, 60000);
    return () => window.clearInterval(id);
  }, [doc?.loveCode]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --- Meteo du jour, rafraichie une fois par session -------------------- */
  useEffect(() => {
    if (!doc) return;
    const stale = (profile: PartnerProfile) => weatherFor(profile.city).label !== profile.weather.label;
    if (!stale(doc.partners.one) && !stale(doc.partners.two)) return;
    update((current) => ({
      ...current,
      partners: {
        one: { ...current.partners.one, weather: weatherFor(current.partners.one.city) },
        two: { ...current.partners.two, weather: weatherFor(current.partners.two.city) },
      },
    }));
  }, [doc?.loveCode]); // eslint-disable-line react-hooks/exhaustive-deps

  /* --- Derives ----------------------------------------------------------- */

  const mySlot = settings.slot;
  const theirSlot = otherSlot(mySlot);
  const me = doc ? doc.partners[mySlot] : null;
  const them = doc ? doc.partners[theirSlot] : null;

  const todayKey = me ? dateKeyIn(me.timeZone) : dateKeyIn('UTC');
  const superHappy = Boolean(
    doc && doc.caredOn.one === todayKey && doc.caredOn.two === todayKey
  );

  const localHour = me ? hourIn(me.timeZone) : new Date().getHours();
  const isNight =
    settings.theme === 'night' ||
    (settings.theme === 'auto' && (localHour >= 21 || localHour < 6));

  const average = doc ? (doc.gauges.food + doc.gauges.love + doc.gauges.energy) / 3 : 100;
  const baseMood: PinguMood = average < 25 || isNight ? 'sleepy' : superHappy ? 'super' : 'happy';
  const mood = transientMood ?? baseMood;

  /* Applique le theme au document HTML. */
  useEffect(() => {
    const root = document.documentElement;
    if (isNight) root.setAttribute('data-theme', 'night');
    else root.removeAttribute('data-theme');
    window.localStorage.setItem(KEYS.theme, isNight ? 'night' : 'day');
    document
      .getElementById('theme-color-meta')
      ?.setAttribute('content', isNight ? '#1A121F' : '#FFF6F8');
  }, [isNight]);

  useEffect(
    () => () => {
      if (moodTimer.current) window.clearTimeout(moodTimer.current);
    },
    []
  );

  const flashMood = useCallback((next: PinguMood, message: string, duration = 3200) => {
    setTransientMood(next);
    setToast(message);
    if (moodTimer.current) window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => {
      setTransientMood(null);
      setToast(null);
    }, duration);
  }, []);

  const pushEvent = useCallback(
    (icon: string, text: string) => {
      update((current) => ({
        ...current,
        feed: [
          { id: uid('ev'), author: mySlot, icon, text, createdAt: Date.now() },
          ...current.feed,
        ].slice(0, 60),
      }));
    },
    [update, mySlot]
  );

  /* --- Cycle de vie ------------------------------------------------------ */

  const signup = useCallback(
    (input: SignupInput) => {
      const loveCode = makeLoveCode();
      let fresh = createDoc({
        loveCode,
        since: input.since,
        myName: input.myName,
        myEmoji: input.myEmoji,
        myCity: input.myCity,
        myTimeZone: input.myTimeZone,
        partnerName: input.partnerName,
        partnerEmoji: input.partnerEmoji,
        partnerCity: input.partnerCity,
        partnerTimeZone: input.partnerTimeZone,
        slot: 'one',
      });
      if (input.withDemoContent) fresh = demoSeed(fresh);

      persistDoc(fresh);

      // Quand un serveur est configure, le couple y est cree immediatement :
      // c'est ce qui permettra a l'autre telephone de le retrouver avec le code.
      const coupleSecret = cloudEnabled ? makeSecret() : undefined;
      writeJSON(KEYS.session, { loveCode, slot: 'one', secret: coupleSecret } satisfies Session);
      if (coupleSecret) {
        setSecret(coupleSecret);
        void createRemote(fresh, coupleSecret);
      }

      patchSettings({ slot: 'one' });
      setDoc(fresh);
      return loveCode;
    },
    [patchSettings]
  );

  const join = useCallback(
    async (input: JoinInput): Promise<JoinResult> => {
      let stored: CoupleDoc | null = null;
      let coupleSecret: string | undefined;

      if (cloudEnabled) {
        // Le code a 6 chiffres est echange contre le secret du couple. Cote
        // serveur l'operation est a usage unique : un code deja consomme ne
        // renvoie plus rien.
        const claimed = await claimRemote(input.loveCode);
        if (claimed.ok) {
          stored = claimed.doc;
          coupleSecret = claimed.secret;
        } else if (claimed.reason === 'offline') {
          return { ok: false, reason: 'offline' };
        }
      }

      // Repli — et seul chemin sans serveur : le couple cree dans un autre
      // onglet du meme navigateur.
      if (!stored) {
        const local = readJSON<CoupleDoc>(KEYS.doc(input.loveCode));
        if (!local || local.schema !== SCHEMA) return { ok: false, reason: 'not-found' };
        if (local.paired) return { ok: false, reason: 'full' };
        stored = local;
      }

      if (stored.schema !== SCHEMA) return { ok: false, reason: 'not-found' };

      const joined: CoupleDoc = {
        ...stored,
        rev: stored.rev + 1,
        updatedAt: Date.now(),
        paired: true,
        partners: {
          ...stored.partners,
          two: {
            slot: 'two',
            name: input.myName,
            emoji: input.myEmoji,
            city: input.myCity,
            timeZone: input.myTimeZone,
            weather: weatherFor(input.myCity),
          },
        },
        feed: [
          {
            id: uid('ev'),
            author: 'two',
            icon: '💞',
            text: `${input.myName} a rejoint votre Cocon`,
            createdAt: Date.now(),
          },
          ...stored.feed,
        ],
      };

      const saved = persistDoc(joined);
      writeJSON(
        KEYS.session,
        { loveCode: input.loveCode, slot: 'two', secret: coupleSecret } satisfies Session
      );
      if (coupleSecret) setSecret(coupleSecret);
      patchSettings({ slot: 'two' });
      setDoc(saved);
      // Le canal n'est pas encore ouvert pour ce couple : la premiere ecriture
      // le remonte, et l'autre onglet la recoit aussi via l'evenement `storage`.
      return { ok: true };
    },
    [patchSettings]
  );

  const leave = useCallback(() => {
    removeKey(KEYS.session);
    setSecret(null);
    setDoc(null);
    patchSettings({ onboarded: false });
  }, [patchSettings]);

  const hardReset = useCallback(() => {
    const current = docRef.current;
    if (current) removeKey(KEYS.doc(current.loveCode));
    removeKey(KEYS.session);
    removeKey(KEYS.settings);
    setSecret(null);
    setDoc(null);
    setSettings(defaultSettings);
  }, []);

  /* --- Compagnon --------------------------------------------------------- */

  const vote = useCallback(
    (species: Species) => {
      vibrate('tap');
      update((current) => ({
        ...current,
        votes: { ...current.votes, [mySlot]: species },
      }));
    },
    [update, mySlot]
  );

  const adopt = useCallback(
    (name: string) => {
      update((current) => {
        const species = current.votes[mySlot];
        if (!species) return current;
        return {
          ...current,
          companion: { species, name: name.trim() || speciesOption(species).name, adoptedAt: new Date().toISOString() },
          feed: [
            {
              id: uid('ev'),
              author: mySlot,
              icon: speciesOption(species).emoji,
              text: `${name} a été adopté·e`,
              createdAt: Date.now(),
            },
            ...current.feed,
          ],
        };
      });
    },
    [update, mySlot]
  );

  const restartVote = useCallback(() => {
    update((current) => ({ ...current, votes: { one: null, two: null }, companion: null }));
  }, [update]);

  const care = useCallback(
    (gauge: GaugeKey) => {
      vibrate('tap');
      const label: Record<GaugeKey, [PinguMood, string]> = {
        food: ['happy', 'Repas servi 🍽️'],
        love: ['love', 'Gros câlin reçu 💗'],
        energy: ['sleepy', 'Petite sieste 😴'],
      };
      update((current) => ({
        ...current,
        gauges: { ...current.gauges, [gauge]: clamp(current.gauges[gauge] + 22) },
        caredOn: { ...current.caredOn, [mySlot]: todayKey },
      }));
      const [nextMood, message] = label[gauge];
      flashMood(nextMood, message);
    },
    [update, mySlot, todayKey, flashMood]
  );

  const feedTreat = useCallback(
    (itemId: string) => {
      const item = shopItem(itemId);
      if (!item?.boost) return;
      vibrate('success');
      update((current) => {
        if (current.coins < item.price) return current;
        const gauges = { ...current.gauges };
        (Object.keys(item.boost ?? {}) as GaugeKey[]).forEach((key) => {
          gauges[key] = clamp(gauges[key] + (item.boost?.[key] ?? 0));
        });
        return {
          ...current,
          coins: current.coins - item.price,
          gauges,
          caredOn: { ...current.caredOn, [mySlot]: todayKey },
        };
      });
      flashMood('happy', `${item.emoji} ${item.label} — un vrai régal !`);
    },
    [update, mySlot, todayKey, flashMood]
  );

  const buy = useCallback(
    (itemId: string) => {
      const item = shopItem(itemId);
      const current = docRef.current;
      if (!item || !current) return false;
      if (current.owned.includes(itemId) || current.coins < item.price) return false;
      vibrate('success');
      update((state) => ({
        ...state,
        coins: state.coins - item.price,
        owned: [...state.owned, itemId],
        equipped: item.kind === 'accessory' ? [...state.equipped, itemId] : state.equipped,
        placed: item.kind === 'furniture' ? [...state.placed, itemId] : state.placed,
        feed: [
          {
            id: uid('ev'),
            author: mySlot,
            icon: item.emoji,
            text: `${item.label} ajouté·e à votre cocon`,
            createdAt: Date.now(),
          },
          ...state.feed,
        ],
      }));
      return true;
    },
    [update, mySlot]
  );

  const toggleEquipped = useCallback(
    (itemId: string) => {
      update((current) => ({
        ...current,
        equipped: current.equipped.includes(itemId)
          ? current.equipped.filter((id) => id !== itemId)
          : [...current.equipped, itemId],
      }));
    },
    [update]
  );

  const togglePlaced = useCallback(
    (itemId: string) => {
      update((current) => ({
        ...current,
        placed: current.placed.includes(itemId)
          ? current.placed.filter((id) => id !== itemId)
          : [...current.placed, itemId],
      }));
    },
    [update]
  );

  /* --- Rituels ----------------------------------------------------------- */

  const sendNote = useCallback(
    (text: string, moment: 'morning' | 'evening', audio?: string) => {
      update((current) => ({
        ...current,
        notes: [
          { id: uid('note'), author: mySlot, moment, text, audio, createdAt: Date.now() },
          ...current.notes,
        ].slice(0, 60),
        gauges: { ...current.gauges, love: clamp(current.gauges.love + 10) },
        caredOn: { ...current.caredOn, [mySlot]: todayKey },
        feed: [
          {
            id: uid('ev'),
            author: mySlot,
            icon: moment === 'morning' ? '☀️' : '🌙',
            text: moment === 'morning' ? 'Mot du matin déposé' : 'Déclaration du soir déposée',
            createdAt: Date.now(),
          },
          ...current.feed,
        ],
      }));
      flashMood('love', 'Message déposé — il part le porter ✉️');
    },
    [update, mySlot, todayKey, flashMood]
  );

  const markNotesRead = useCallback(
    (moment: 'morning' | 'evening') => {
      update((current) => {
        let touched = false;
        const notes = current.notes.map((note) => {
          if (note.author !== theirSlot || note.moment !== moment || note.readAt) return note;
          touched = true;
          return { ...note, readAt: Date.now() };
        });
        return touched ? { ...current, notes } : current;
      });
    },
    [update, theirSlot]
  );

  const publishPolaroid = useCallback(
    (url: string, caption: string) => {
      update((current) => ({
        ...current,
        polaroids: [
          { id: uid('pol'), author: mySlot, caption, url, postedAt: Date.now() },
          ...current.polaroids.filter(
            (item) => !(item.author === mySlot && Date.now() - item.postedAt < 60000)
          ),
        ],
        feed: [
          { id: uid('ev'), author: mySlot, icon: '📸', text: 'Nouveau Polaroid 24 h', createdAt: Date.now() },
          ...current.feed,
        ],
      }));
      flashMood('happy', 'Ton Polaroid est visible 24 h 📸');
    },
    [update, mySlot, flashMood]
  );

  const setMoodEntry = useCallback(
    (moodKey: MoodKey, note?: string) => {
      update((current) => ({
        ...current,
        moods: [
          { id: uid('mood'), author: mySlot, mood: moodKey, note, createdAt: Date.now() },
          ...current.moods.filter(
            (item) => !(item.author === mySlot && Date.now() - item.createdAt < 3600 * 1000)
          ),
        ],
      }));
    },
    [update, mySlot]
  );

  const sendThought = useCallback(() => {
    vibrate('heartbeat');
    update((current) => ({
      ...current,
      thoughts: [
        { id: uid('th'), from: mySlot, createdAt: Date.now(), seen: false },
        ...current.thoughts,
      ].slice(0, 40),
      gauges: { ...current.gauges, love: clamp(current.gauges.love + 8) },
      caredOn: { ...current.caredOn, [mySlot]: todayKey },
    }));
    flashMood('love', 'Pensée envoyée — son téléphone vibre 💞');
  }, [update, mySlot, todayKey, flashMood]);

  const seeThoughts = useCallback(() => {
    update((current) => {
      let touched = false;
      const thoughts = current.thoughts.map((item) => {
        if (item.from === mySlot || item.seen) return item;
        touched = true;
        return { ...item, seen: true };
      });
      return touched ? { ...current, thoughts } : current;
    });
  }, [update, mySlot]);

  /* --- Agenda ------------------------------------------------------------ */

  const addKeyDate = useCallback(
    (entry: Omit<import('../types').KeyDate, 'id'>) => {
      update((current) => ({ ...current, keyDates: [...current.keyDates, { ...entry, id: uid('kd') }] }));
    },
    [update]
  );

  const removeKeyDate = useCallback(
    (id: string) => {
      update((current) => ({ ...current, keyDates: current.keyDates.filter((item) => item.id !== id) }));
    },
    [update]
  );

  const toggleReminder = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        keyDates: current.keyDates.map((item) =>
          item.id === id ? { ...item, reminder: !item.reminder } : item
        ),
      }));
    },
    [update]
  );

  const setReunion = useCallback(
    (iso: string | null) => {
      update((current) => ({ ...current, reunionAt: iso }));
    },
    [update]
  );

  const addBucket = useCallback(
    (label: string) => {
      update((current) => ({
        ...current,
        bucket: [...current.bucket, { id: uid('bk'), label, done: false }],
      }));
    },
    [update]
  );

  const toggleBucket = useCallback(
    (id: string, photo?: string) => {
      update((current) => ({
        ...current,
        bucket: current.bucket.map((item) =>
          item.id === id
            ? {
                ...item,
                done: photo ? true : !item.done,
                photo: photo ?? item.photo,
                doneAt: !item.done || photo ? Date.now() : undefined,
              }
            : item
        ),
      }));
    },
    [update]
  );

  const removeBucket = useCallback(
    (id: string) => {
      update((current) => ({ ...current, bucket: current.bucket.filter((item) => item.id !== id) }));
    },
    [update]
  );

  const addTripDoc = useCallback(
    (entry: Omit<import('../types').TripDoc, 'id'>) => {
      update((current) => ({ ...current, tripDocs: [...current.tripDocs, { ...entry, id: uid('td') }] }));
    },
    [update]
  );

  const removeTripDoc = useCallback(
    (id: string) => {
      update((current) => ({ ...current, tripDocs: current.tripDocs.filter((item) => item.id !== id) }));
    },
    [update]
  );

  const markMilestoneSeen = useCallback(
    (id: string) => {
      update((current) =>
        current.milestonesSeen.includes(id)
          ? current
          : { ...current, milestonesSeen: [...current.milestonesSeen, id] }
      );
    },
    [update]
  );

  /* --- Surprises --------------------------------------------------------- */

  const addLetter = useCallback(
    (condition: LetterCondition, text: string, audio?: string) => {
      update((current) => ({
        ...current,
        letters: [
          { id: uid('lt'), author: mySlot, condition, text, audio, createdAt: Date.now() },
          ...current.letters,
        ],
        feed: [
          { id: uid('ev'), author: mySlot, icon: '🔒', text: 'Une lettre scellée vous attend', createdAt: Date.now() },
          ...current.feed,
        ],
      }));
    },
    [update, mySlot]
  );

  const openLetter = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        letters: current.letters.map((item) =>
          item.id === id && !item.openedAt ? { ...item, openedAt: Date.now() } : item
        ),
      }));
    },
    [update]
  );

  const addCapsule = useCallback(
    (title: string, text: string, openAt: number, photo?: string) => {
      update((current) => ({
        ...current,
        capsules: [
          {
            id: uid('cap'),
            title,
            text,
            photo,
            sealedBy: [mySlot],
            openAt,
            createdAt: Date.now(),
          },
          ...current.capsules,
        ],
      }));
    },
    [update, mySlot]
  );

  const openCapsule = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        capsules: current.capsules.map((item) =>
          item.id === id && Date.now() >= item.openAt && !item.openedAt
            ? { ...item, openedAt: Date.now() }
            : item
        ),
      }));
    },
    [update]
  );

  /* --- Presence & arcade -------------------------------------------------- */

  const setAvailability = useCallback(
    (value: Availability) => {
      update((current) => ({
        ...current,
        availability: { ...current.availability, [mySlot]: value },
      }));
    },
    [update, mySlot]
  );

  const addCoins = useCallback(
    (amount: number, reason?: string) => {
      update((current) => ({
        ...current,
        coins: Math.max(0, current.coins + amount),
        feed: reason
          ? [
              { id: uid('ev'), author: mySlot, icon: '🪙', text: reason, createdAt: Date.now() },
              ...current.feed,
            ]
          : current.feed,
      }));
    },
    [update, mySlot]
  );

  const createChallenge = useCallback(
    (game: string, payload: Record<string, unknown>, turn?: PartnerSlot) => {
      const id = uid('ch');
      const challenge: Challenge = {
        id,
        game,
        from: mySlot,
        turn: turn ?? otherSlot(mySlot),
        status: 'open',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        payload,
      };
      update((current) => ({
        ...current,
        challenges: [challenge, ...current.challenges].slice(0, 30),
      }));
      return id;
    },
    [update, mySlot]
  );

  const updateChallenge = useCallback(
    (
      id: string,
      patch: { payload?: Record<string, unknown>; turn?: PartnerSlot; status?: Challenge['status'] }
    ) => {
      update((current) => ({
        ...current,
        challenges: current.challenges.map((item) =>
          item.id === id
            ? {
                ...item,
                ...patch,
                payload: patch.payload ? { ...item.payload, ...patch.payload } : item.payload,
                updatedAt: Date.now(),
              }
            : item
        ),
      }));
    },
    [update]
  );

  const removeChallenge = useCallback(
    (id: string) => {
      update((current) => ({
        ...current,
        challenges: current.challenges.filter((item) => item.id !== id),
      }));
    },
    [update]
  );

  const recordGame = useCallback(
    (gameId: string, result: { won: boolean; score?: number }) => {
      const reward = result.won ? 1 : 0;
      let earned = 0;
      update((current) => {
        const previous = current.scores[gameId] ?? { plays: 0, wins: 0, best: 0, lastPlayedAt: 0 };
        earned = reward;
        return {
          ...current,
          scores: {
            ...current.scores,
            [gameId]: {
              plays: previous.plays + 1,
              wins: previous.wins + (result.won ? 1 : 0),
              best: Math.max(previous.best, result.score ?? 0),
              lastPlayedAt: Date.now(),
            },
          },
        };
      });
      return earned;
    },
    [update]
  );

  /* --- Valeur du contexte ------------------------------------------------- */

  const value = useMemo<CoupleApi>(
    () => ({
      ready,
      doc,
      settings,
      mySlot,
      theirSlot,
      me,
      them,
      mood,
      isNight,
      superHappy,
      toast,
      signup,
      join,
      cloud: cloudEnabled && Boolean(secret),
      leave,
      hardReset,
      patchSettings,
      setTheme: (theme: ThemeMode) => patchSettings({ theme }),
      vote,
      adopt,
      restartVote,
      care,
      feedTreat,
      buy,
      toggleEquipped,
      togglePlaced,
      flashMood,
      sendNote,
      markNotesRead,
      publishPolaroid,
      setMood: setMoodEntry,
      sendThought,
      seeThoughts,
      addKeyDate,
      removeKeyDate,
      toggleReminder,
      setReunion,
      addBucket,
      toggleBucket,
      removeBucket,
      addTripDoc,
      removeTripDoc,
      markMilestoneSeen,
      addLetter,
      openLetter,
      addCapsule,
      openCapsule,
      setAvailability,
      createChallenge,
      updateChallenge,
      removeChallenge,
      applyDoc: update,
      recordGame,
      addCoins,
      pushEvent,
    }),
    [
      update,
      ready,
      doc,
      settings,
      mySlot,
      theirSlot,
      me,
      them,
      mood,
      isNight,
      superHappy,
      toast,
      signup,
      join,
      secret,
      leave,
      hardReset,
      patchSettings,
      vote,
      adopt,
      restartVote,
      care,
      feedTreat,
      buy,
      toggleEquipped,
      togglePlaced,
      flashMood,
      sendNote,
      markNotesRead,
      publishPolaroid,
      setMoodEntry,
      sendThought,
      seeThoughts,
      addKeyDate,
      removeKeyDate,
      toggleReminder,
      setReunion,
      addBucket,
      toggleBucket,
      removeBucket,
      addTripDoc,
      removeTripDoc,
      markMilestoneSeen,
      addLetter,
      openLetter,
      addCapsule,
      openCapsule,
      setAvailability,
      createChallenge,
      updateChallenge,
      removeChallenge,
      recordGame,
      addCoins,
      pushEvent,
    ]
  );

  return <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>;
}

/* --- Hooks --------------------------------------------------------------- */

export function useSession() {
  const context = useContext(CoupleContext);
  if (!context) throw new Error('useSession doit être utilisé dans un CoupleProvider');
  return context;
}

/** A n'appeler qu'une fois l'inscription terminee : `doc`, `me` et `them` sont garantis. */
export function useCouple() {
  const context = useSession();
  if (!context.doc || !context.me || !context.them) {
    throw new Error('useCouple exige un couple créé — utilisez useSession avant l’onboarding');
  }
  return context as CoupleApi & {
    doc: CoupleDoc;
    me: PartnerProfile;
    them: PartnerProfile;
  };
}
