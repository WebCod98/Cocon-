import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { Companion } from '../../components/Companion';
import { useCouple } from '../../state/CoupleContext';
import { speciesOption } from '../../data/companions';
import { vibrate } from '../../lib/haptics';
import type { GameProps } from './types';

const DURATION = 10;
const GOAL = 100;

type Phase = 'ready' | 'running' | 'over';

/** Course de 10 secondes : plus vous tapez, plus votre mascotte avance. */
export default function TapTap({ meta, onFinish, earned }: GameProps) {
  const { doc, me, them } = useCouple();
  const [phase, setPhase] = useState<Phase>('ready');
  const [left, setLeft] = useState(DURATION);
  const [taps, setTaps] = useState(0);
  const [rival, setRival] = useState(0);
  const rivalSpeed = useRef(0);

  const species = doc.companion?.species ?? 'penguin';
  const name = doc.companion?.name ?? speciesOption(species).name;

  const myProgress = Math.min(100, (taps / GOAL) * 100);
  const rivalProgress = Math.min(100, (rival / GOAL) * 100);
  const won = taps > rival;

  useEffect(() => {
    if (phase !== 'running') return undefined;
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      setLeft(Math.max(0, DURATION - elapsed));
      // Le rival tape à un rythme irrégulier, entre 5 et 9 fois par seconde.
      setRival((current) => current + rivalSpeed.current / 10 + Math.random() * 0.3);
      if (elapsed >= DURATION) {
        window.clearInterval(timer);
        setPhase('over');
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'over') return;
    onFinish({ won: taps > rival, score: taps });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    rivalSpeed.current = 5 + Math.random() * 4;
    setTaps(0);
    setRival(0);
    setLeft(DURATION);
    setPhase('running');
  };

  const tap = () => {
    if (phase !== 'running') return;
    setTaps((value) => value + 1);
    vibrate('tap');
  };

  return (
    <GameShell
      meta={meta}
      rule={`Dix secondes pour faire courir ${name} plus vite que ${them.name}.`}
      onRestart={phase !== 'ready' ? start : undefined}>
      {phase === 'over' && (
        <GameResult
          won={won}
          title={won ? `${name} a gagné la course !` : `${them.name} vous a devancés`}
          detail={`${taps} taps contre ${Math.round(rival)}.`}
          coins={earned} />
      )}

      <SectionCard
        title="La piste"
        subtitle={phase === 'running' ? `${left.toFixed(1)} s restantes` : 'Deux couloirs, une seule mascotte'}>
        <Lane
          label={`${me.emoji} Toi`}
          progress={myProgress}
          count={taps}
          highlight>
          <Companion species={species} mood={phase === 'running' ? 'super' : 'happy'} name={name} className="h-full w-full" />
        </Lane>
        <Lane label={`${them.emoji} ${them.name}`} progress={rivalProgress} count={Math.round(rival)}>
          <Companion species={species} mood={phase === 'running' ? 'super' : 'happy'} name={name} className="h-full w-full" />
        </Lane>

        {phase === 'ready' ? (
          <button
            type="button"
            onClick={start}
            className="mt-4 w-full rounded-full bg-coral py-4 text-base font-semibold text-paper">
            Départ !
          </button>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={tap}
            disabled={phase === 'over'}
            className="mt-4 h-32 w-full rounded-4xl bg-night text-2xl font-semibold text-paper disabled:opacity-50">
            {phase === 'running' ? `TAP ! (${taps})` : `Terminé — ${taps} taps`}
          </motion.button>
        )}
      </SectionCard>
    </GameShell>
  );
}

function Lane({
  label,
  progress,
  count,
  highlight,
  children,
}: {
  label: string;
  progress: number;
  count: number;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{count}</span>
      </div>
      <div
        className={`relative h-14 overflow-hidden rounded-2xl border ${
          highlight ? 'border-coral/40 bg-blush/30' : 'border-ice bg-frost'
        }`}>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">
          🏁
        </span>
        <motion.div
          className="absolute top-1/2 h-12 w-12 -translate-y-1/2"
          animate={{ left: `calc(${Math.min(88, progress)}% )` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
