import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { petitBacCategories, petitBacLetters } from '../../data/prompts';
import { normalizeAnswer } from '../../utils/text';
import { vibrate } from '../../lib/haptics';
import type { GameProps } from './types';

const DURATION = 30;
type Phase = 'ready' | 'running' | 'over';

const drawLetter = () => petitBacLetters[Math.floor(Math.random() * petitBacLetters.length)];

/** Quatre mots, une lettre imposée, trente secondes. */
export default function PetitBac({ meta, onFinish, earned }: GameProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [letter, setLetter] = useState(drawLetter);
  const [left, setLeft] = useState(DURATION);
  const [values, setValues] = useState<Record<string, string>>({});
  const firstInput = useRef<HTMLInputElement | null>(null);

  const valid = petitBacCategories.filter((category) => {
    const answer = normalizeAnswer(values[category.id] ?? '');
    return answer.length > 1 && answer.startsWith(normalizeAnswer(letter));
  });

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const remaining = DURATION - (Date.now() - started) / 1000;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        window.clearInterval(timer);
        setPhase('over');
        vibrate('error');
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'over') return;
    onFinish({ won: valid.length >= 3, score: valid.length });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    setLetter(drawLetter());
    setValues({});
    setLeft(DURATION);
    setPhase('running');
    window.setTimeout(() => firstInput.current?.focus(), 60);
  };

  const stop = () => {
    setPhase('over');
  };

  return (
    <GameShell
      meta={meta}
      rule={`Quatre mots commençant par la lettre tirée, en ${DURATION} secondes. Il en faut 3 valides.`}
      onRestart={phase !== 'ready' ? start : undefined}>
      {phase === 'over' && (
        <GameResult
          won={valid.length >= 3}
          title={`${valid.length}/4 mots valides`}
          detail={
            valid.length >= 3
              ? 'Rapide et précis — les pièces sont à vous.'
              : `Les mots devaient commencer par « ${letter} » et faire au moins deux lettres.`
          }
          coins={earned} />
      )}

      <SectionCard
        title="La lettre"
        subtitle={phase === 'running' ? `${left.toFixed(1)} s restantes` : 'Tirée au sort à chaque manche'}>
        <motion.p
          key={letter + phase}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto flex h-24 w-24 items-center justify-center rounded-4xl bg-blush/60 font-display text-5xl font-semibold text-ink">
          {letter}
        </motion.p>

        {phase === 'running' && (
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-ice">
            <motion.div
              className="h-full rounded-full bg-coral"
              animate={{ width: `${(left / DURATION) * 100}%` }}
              transition={{ ease: 'linear', duration: 0.1 }} />
          </div>
        )}

        <div className="mt-4 grid gap-2">
          {petitBacCategories.map((category, index) => {
            const answer = values[category.id] ?? '';
            const ok = valid.some((item) => item.id === category.id);
            return (
              <label key={category.id} className="block">
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {category.emoji} {category.label}
                </span>
                <input
                  ref={index === 0 ? firstInput : undefined}
                  value={answer}
                  disabled={phase !== 'running'}
                  onChange={(event) =>
                    setValues((current) => ({ ...current, [category.id]: event.target.value }))
                  }
                  maxLength={24}
                  placeholder={phase === 'running' ? `Commence par ${letter}…` : '—'}
                  className={`w-full rounded-2xl border px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none disabled:opacity-60 ${
                    phase === 'over' && answer
                      ? ok
                        ? 'border-mint bg-mint/20'
                        : 'border-coral bg-coral/15'
                      : 'border-ice bg-frost focus:border-coral'
                  }`} />
              </label>
            );
          })}
        </div>

        {phase === 'ready' ? (
          <button
            type="button"
            onClick={start}
            className="mt-4 w-full rounded-full bg-coral py-3.5 text-base font-semibold text-paper">
            Tirer une lettre et démarrer
          </button>
        ) : phase === 'running' ? (
          <button
            type="button"
            onClick={stop}
            className="mt-4 w-full rounded-full bg-night py-3 text-sm font-semibold text-paper">
            Stop ! J’ai fini
          </button>
        ) : null}
      </SectionCard>
    </GameShell>
  );
}
