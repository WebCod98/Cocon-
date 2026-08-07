import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { useCouple } from '../../state/CoupleContext';
import { quiQuestions } from '../../data/prompts';
import { shuffle } from '../../utils/text';
import type { PartnerSlot } from '../../types';
import type { GameProps } from './types';

interface QuiPayload {
  questions: string[];
  answers: Partial<Record<PartnerSlot, PartnerSlot[]>>;
}

const ROUND = 5;

/**
 * Votes secrets simultanes : chacun designe qui de vous deux correspond a la
 * question, puis les reponses sont revelees en vis-a-vis.
 */
export default function QuiDeNousDeux({ meta, onFinish, earned }: GameProps) {
  const { doc, me, them, mySlot, theirSlot, settings, createChallenge, updateChallenge, removeChallenge } =
    useCouple();
  const [picks, setPicks] = useState<PartnerSlot[]>([]);
  const scored = useRef(false);

  const challenge = doc.challenges.find((item) => item.game === meta.id && item.status === 'open');
  const payload = challenge?.payload as unknown as QuiPayload | undefined;
  const myAnswers = payload?.answers[mySlot];
  const theirAnswers = payload?.answers[theirSlot];

  const questions = useMemo(
    () => payload?.questions ?? shuffle(quiQuestions, Date.now()).slice(0, ROUND),
    [payload]
  );

  const both = Boolean(myAnswers && theirAnswers);
  const matches = both ? myAnswers!.filter((value, index) => value === theirAnswers![index]).length : 0;
  const won = matches >= 3;

  /* Fin de manche : on compte les accords une seule fois. */
  useEffect(() => {
    if (!both || scored.current) return;
    scored.current = true;
    onFinish({ won, score: matches });
  }, [both, won, matches, onFinish]);

  const submit = () => {
    if (picks.length !== questions.length) return;
    if (challenge && payload) {
      updateChallenge(challenge.id, {
        payload: { ...payload, answers: { ...payload.answers, [mySlot]: picks } },
        turn: theirSlot,
      });
    } else {
      const id = createChallenge(meta.id, {
        questions,
        answers: { [mySlot]: picks },
      } as unknown as Record<string, unknown>);
      // En solo, le partenaire de demonstration repond dans la foulee.
      if (settings.demoPartner) {
        window.setTimeout(() => {
          updateChallenge(id, {
            payload: {
              questions,
              answers: {
                [mySlot]: picks,
                [theirSlot]: questions.map(() => (Math.random() < 0.6 ? mySlot : theirSlot)),
              },
            } as unknown as Record<string, unknown>,
            turn: mySlot,
          });
        }, 1600);
      }
    }
  };

  const restart = () => {
    if (challenge) removeChallenge(challenge.id);
    setPicks([]);
    scored.current = false;
  };

  /* --- Révélation croisée --- */
  if (both) {
    return (
      <GameShell meta={meta} rule="Vos deux votes, côte à côte." onRestart={restart}>
        <GameResult
          won={won}
          title={won ? `${matches}/${questions.length} — vous vous connaissez !` : `${matches}/${questions.length} accords`}
          detail={
            won
              ? 'Assez d’accords pour empocher les pièces.'
              : 'Il faut au moins 3 accords sur 5. Relancez une manche.'
          }
          coins={earned} />

        <SectionCard title="Le détail" subtitle="À gauche toi, à droite l’autre">
          <ul className="space-y-2">
            {questions.map((question, index) => {
              const mine = myAnswers![index];
              const theirs = theirAnswers![index];
              const same = mine === theirs;
              return (
                <li
                  key={question}
                  className={`rounded-3xl border p-3 ${same ? 'border-mint/50 bg-mint/15' : 'border-ice bg-frost'}`}>
                  <p className="text-[12px] font-semibold leading-snug text-ink">{question}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="rounded-full bg-cream px-2.5 py-1 font-semibold text-ink">
                      Toi : {doc.partners[mine].name}
                    </span>
                    <span aria-hidden="true">{same ? '💞' : '↔️'}</span>
                    <span className="rounded-full bg-cream px-2.5 py-1 font-semibold text-ink">
                      {them.name} : {doc.partners[theirs].name}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      </GameShell>
    );
  }

  /* --- En attente du/de la partenaire --- */
  if (myAnswers) {
    return (
      <GameShell meta={meta} rule="Vos votes restent secrets jusqu’à la révélation." onRestart={restart}>
        <SectionCard title="C’est envoyé" subtitle={`${them.name} doit encore voter`}>
          <p className="rounded-2xl bg-frost px-3 py-6 text-center text-sm text-muted">
            Tes {questions.length} votes sont scellés. Dès que {them.name} aura répondu de son côté, la
            révélation croisée s’affichera ici.
          </p>
        </SectionCard>
      </GameShell>
    );
  }

  /* --- Phase de vote --- */
  return (
    <GameShell
      meta={meta}
      rule={`${questions.length} questions décalées. Désigne qui de vous deux correspond — sans te concerter.`}
      onRestart={picks.length > 0 ? () => setPicks([]) : undefined}>
      <SectionCard
        title={challenge ? `${them.name} a déjà voté` : 'À toi de voter'}
        subtitle={`${picks.length}/${questions.length} répondues`}>
        <ul className="space-y-3">
          {questions.map((question, index) => (
            <li key={question} className="rounded-3xl border border-ice bg-frost p-3">
              <p className="text-[13px] font-semibold leading-snug text-ink">{question}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([mySlot, theirSlot] as PartnerSlot[]).map((slot) => {
                  const active = picks[index] === slot;
                  const person = slot === mySlot ? me : them;
                  return (
                    <motion.button
                      key={slot}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      aria-pressed={active}
                      onClick={() =>
                        setPicks((current) => {
                          const next = [...current];
                          next[index] = slot;
                          return next;
                        })
                      }
                      className={`rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
                        active ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-cream text-muted'
                      }`}>
                      {person.emoji} {slot === mySlot ? 'Moi' : person.name}
                    </motion.button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={picks.filter(Boolean).length !== questions.length}
          onClick={submit}
          className="mt-4 w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
          Sceller mes votes
        </button>
      </SectionCard>
    </GameShell>
  );
}
