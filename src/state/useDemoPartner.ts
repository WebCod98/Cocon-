import { useEffect, useRef } from 'react';
import { useSession } from './CoupleContext';
import { uid } from '../lib/id';
import { dateKeyIn } from '../utils/time';
import { notify } from '../lib/notifications';

const replies = [
  'Je viens de lire ton message trois fois. Tu me manques, mais ça va aller.',
  'Tu as une façon de dire les choses qui me remet droit. Merci.',
  'Je garde ton mot pour ce soir, quand la maison sera silencieuse.',
  'Même à cette distance, tu es la première personne à qui je pense.',
];

/**
 * Partenaire de demonstration.
 *
 * L'app se joue a deux : sans serveur, le second telephone doit ouvrir l'app
 * dans un autre onglet du meme navigateur (voir README). Ce module permet
 * d'explorer l'app en solo — le partenaire vote, repond et s'occupe de la
 * mascotte. Il se desactive dans Reglages.
 */
export function useDemoPartner() {
  const { doc, settings, theirSlot, applyDoc } = useSession();
  const timers = useRef<number[]>([]);
  const repliedTo = useRef<string | null>(null);

  const enabled = settings.demoPartner && Boolean(doc);
  const myVote = doc?.votes[settings.slot] ?? null;
  const theirVote = doc?.votes[theirSlot] ?? null;
  const latestMyNote = doc?.notes.find((note) => note.author === settings.slot)?.id ?? null;

  /* Le partenaire se rallie a votre choix de compagnon. */
  useEffect(() => {
    if (!enabled || !myVote || theirVote) return undefined;
    const id = window.setTimeout(() => {
      applyDoc((current) => ({ ...current, votes: { ...current.votes, [theirSlot]: myVote } }));
    }, 2400);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, [enabled, myVote, theirVote, theirSlot, applyDoc]);

  /* Il repond a votre mot, un peu plus tard. */
  useEffect(() => {
    if (!enabled || !latestMyNote || repliedTo.current === latestMyNote) return undefined;
    repliedTo.current = latestMyNote;
    const id = window.setTimeout(() => {
      applyDoc((current) => {
        const source = current.notes.find((note) => note.id === latestMyNote);
        if (!source) return current;
        const text = replies[Math.floor(Math.random() * replies.length)];
        void notify('💌 Un mot doux vous attend', text.slice(0, 90), 'note');
        return {
          ...current,
          notes: [
            {
              id: uid('note'),
              author: theirSlot,
              moment: source.moment,
              text,
              createdAt: Date.now(),
            },
            ...current.notes,
          ].slice(0, 60),
          feed: [
            {
              id: uid('ev'),
              author: theirSlot,
              icon: '💌',
              text: `${current.partners[theirSlot].name} vous a répondu`,
              createdAt: Date.now(),
            },
            ...current.feed,
          ],
        };
      });
    }, 22000);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, [enabled, latestMyNote, theirSlot, applyDoc]);

  /* Il s'occupe de la mascotte une fois par jour, de son cote. */
  useEffect(() => {
    if (!enabled || !doc) return undefined;
    const todayKey = dateKeyIn(doc.partners[theirSlot].timeZone);
    if (doc.caredOn[theirSlot] === todayKey) return undefined;
    const id = window.setTimeout(() => {
      applyDoc((current) => ({
        ...current,
        gauges: {
          food: Math.min(100, current.gauges.food + 18),
          love: Math.min(100, current.gauges.love + 12),
          energy: Math.min(100, current.gauges.energy + 10),
        },
        caredOn: { ...current.caredOn, [theirSlot]: todayKey },
        feed: [
          {
            id: uid('ev'),
            author: theirSlot,
            icon: '🍽️',
            text: `${current.partners[theirSlot].name} s’est occupé·e de la mascotte`,
            createdAt: Date.now(),
          },
          ...current.feed,
        ],
      }));
    }, 9000);
    timers.current.push(id);
    return () => window.clearTimeout(id);
  }, [enabled, doc?.caredOn[theirSlot], theirSlot, applyDoc]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);
}
