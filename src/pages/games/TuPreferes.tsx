import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { useCouple } from '../../state/CoupleContext';
import { tuPreferes } from '../../data/prompts';
import { shuffle } from '../../utils/text';
import type { PartnerSlot } from '../../types';
import type { GameProps } from './types';

type Side = 'a' | 'b';

interface PrefPayload {
  ids: string[];
  answers: Partial<Record<PartnerSlot, Side[]>>;
}

const ROUND = 6;

/** Dilemmes a departager, puis comparaison des reponses. */
export default function TuPreferes({ meta, onFinish, earned }: GameProps) {
  const { doc, them, mySlot, theirSlot, settings, createChallenge, updateChallenge, removeChallenge } =
    useCouple();
  const [picks, setPicks] = useState<Side[]>([]);
  const scored = useRef(false);

  const challenge = doc.challenges.find((item) => item.game === meta.id && item.status === 'open');
  const payload = challenge?.payload as unknown as PrefPayload | undefined;
  const myAnswers = payload?.answers[mySlot];
  const theirAnswers = payload?.answers[theirSlot];

  const dilemmas = useMemo(() => {
    if (payload) {
      return payload.ids
        .map((id) => tuPreferes.find((item) => item.id === id))
        .filter((item): item is (typeof tuPreferes)[number] => Boolean(item));
    }
    return shuffle(tuPreferes, Date.now()).slice(0, ROUND);
  }, [payload]);

  const both = Boolean(myAnswers && theirAnswers);
  const matches = both ? myAnswers!.filter((value, index) => value === theirAnswers![index]).length : 0;
  const won = matches >= Math.ceil(dilemmas.length / 2);

  useEffect(() => {
    if (!both || scored.current) return;
    scored.current = true;
    onFinish({ won, score: matches });
  }, [both, won, matches, onFinish]);

  const submit = () => {
    const ids = dilemmas.map((item) => item.id);
    if (challenge && payload) {
      updateChallenge(challenge.id, {
        payload: { ...payload, answers: { ...payload.answers, [mySlot]: picks } },
        turn: theirSlot,
      });
      return;
    }
    const id = createChallenge(meta.id, { ids, answers: { [mySlot]: picks } } as unknown as Record<string, unknown>);
    if (settings.demoPartner) {
      window.setTimeout(() => {
        updateChallenge(id, {
          payload: {
            ids,
            answers: {
              [mySlot]: picks,
              [theirSlot]: picks.map((side) => (Math.random() < 0.55 ? side : side === 'a' ? 'b' : 'a')),
            },
          } as unknown as Record<string, unknown>,
          turn: mySlot,
        });
      }, 1600);
    }
  };

  const restart = () => {
    if (challenge) removeChallenge(challenge.id);
    setPicks([]);
    scored.current = false;
  };

  if (both) {
    return (
      <GameShell meta={meta} rule="Vos réponses, face à face — de quoi lancer la discussion." onRestart={restart}>
        <GameResult
          won={won}
          title={`${matches}/${dilemmas.length} en commun`}
          detail={
            won ? 'Vous êtes sur la même longueur d’onde.' : 'Beaucoup de désaccords : parfait pour en parler ce soir.'
          }
          coins={earned} />
        <SectionCard title="Le détail">
          <ul className="space-y-2">
            {dilemmas.map((item, index) => {
              const mine = myAnswers![index];
              const theirs = theirAnswers![index];
              const same = mine === theirs;
              return (
                <li
                  key={item.id}
                  className={`rounded-3xl border p-3 ${same ? 'border-mint/50 bg-mint/15' : 'border-ice bg-frost'}`}>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <Option label={item.a} mine={mine === 'a'} theirs={theirs === 'a'} themName={them.name} />
                    <Option label={item.b} mine={mine === 'b'} theirs={theirs === 'b'} themName={them.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </GameShell>
    );
  }

  if (myAnswers) {
    return (
      <GameShell meta={meta} rule="Vos choix restent cachés jusqu’à la révélation." onRestart={restart}>
        <SectionCard title="C’est envoyé" subtitle={`${them.name} doit encore choisir`}>
          <p className="rounded-2xl bg-frost px-3 py-6 text-center text-sm text-muted">
            Dès que {them.name} aura tranché ses {dilemmas.length} dilemmes, vous verrez qui pense quoi.
          </p>
        </SectionCard>
      </GameShell>
    );
  }

  return (
    <GameShell
      meta={meta}
      rule={`${dilemmas.length} dilemmes. Choisis vite, sans réfléchir — c’est plus drôle.`}
      onRestart={picks.length > 0 ? () => setPicks([]) : undefined}>
      <SectionCard title="À toi de trancher" subtitle={`${picks.filter(Boolean).length}/${dilemmas.length}`}>
        <ul className="space-y-3">
          {dilemmas.map((item, index) => (
            <li key={item.id}>
              <div className="grid grid-cols-2 gap-2">
                {(['a', 'b'] as Side[]).map((side) => {
                  const active = picks[index] === side;
                  return (
                    <motion.button
                      key={side}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      aria-pressed={active}
                      onClick={() =>
                        setPicks((current) => {
                          const next = [...current];
                          next[index] = side;
                          return next;
                        })
                      }
                      className={`min-h-[72px] rounded-3xl border px-3 py-3 text-xs font-semibold leading-snug transition-colors ${
                        active ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-frost text-muted'
                      }`}>
                      {side === 'a' ? item.a : item.b}
                    </motion.button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          disabled={picks.filter(Boolean).length !== dilemmas.length}
          onClick={submit}
          className="mt-4 w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
          Sceller mes choix
        </button>
      </SectionCard>
    </GameShell>
  );
}

function Option({
  label,
  mine,
  theirs,
  themName,
}: {
  label: string;
  mine: boolean;
  theirs: boolean;
  themName: string;
}) {
  return (
    <div
      className={`rounded-2xl border px-2.5 py-2 ${
        mine || theirs ? 'border-coral/40 bg-cream' : 'border-ice bg-cream/50 opacity-60'
      }`}>
      <p className="leading-snug text-ink">{label}</p>
      <p className="mt-1 flex flex-wrap gap-1">
        {mine && <span className="rounded-full bg-coral px-1.5 py-0.5 text-[9px] font-semibold text-paper">Toi</span>}
        {theirs && (
          <span className="rounded-full bg-mint/30 px-1.5 py-0.5 text-[9px] font-semibold text-ink">{themName}</span>
        )}
      </p>
    </div>
  );
}
