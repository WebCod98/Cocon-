import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ShuffleIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { wheelCards, wheelCategories, type WheelCategory } from '../../data/prompts';
import { shuffle } from '../../utils/text';
import { vibrate } from '../../lib/haptics';
import type { GameProps } from './types';

const slice = 360 / wheelCategories.length;

/** Roue à trois secteurs — Douceur, Vérité, Gage — puis tirage d'une carte. */
export default function ActionOuVerite({ meta, onFinish, earned }: GameProps) {
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [category, setCategory] = useState<WheelCategory | null>(null);
  const [card, setCard] = useState<string | null>(null);
  const [doneCount, setDoneCount] = useState(0);

  const gradient = useMemo(
    () =>
      `conic-gradient(${wheelCategories
        .map((item, position) => `${item.color} ${position * slice}deg ${(position + 1) * slice}deg`)
        .join(', ')})`,
    []
  );

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setCard(null);
    setCategory(null);

    const winner = Math.floor(Math.random() * wheelCategories.length);
    setAngle((current) => current + 360 * 5 + (360 - (winner * slice + slice / 2)));

    window.setTimeout(() => {
      const picked = wheelCategories[winner].id;
      setCategory(picked);
      setCard(shuffle(wheelCards[picked], Date.now())[0]);
      setSpinning(false);
      vibrate('success');
    }, 3200);
  };

  const accomplish = () => {
    setDoneCount((value) => value + 1);
    onFinish({ won: true, score: doneCount + 1 });
    setCard(null);
    setCategory(null);
  };

  const meta_ = wheelCategories.find((item) => item.id === category);

  return (
    <GameShell
      meta={meta}
      rule="Faites tourner la roue, puis accomplissez ce qu’elle vous donne. Les pièces tombent quand c’est fait."
      onRestart={doneCount > 0 ? () => setDoneCount(0) : undefined}>
      {doneCount > 0 && !card && (
        <GameResult
          won
          title={`${doneCount} carte${doneCount > 1 ? 's' : ''} accomplie${doneCount > 1 ? 's' : ''}`}
          detail="Relancez la roue autant de fois que vous voulez."
          coins={earned} />
      )}

      <SectionCard title="La roue" subtitle="Douceur · Vérité · Gage">
        <div className="relative mx-auto h-56 w-56">
          <div
            className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-coral"
            aria-hidden="true" />
          <motion.div
            className="h-56 w-56 rounded-full border-4 border-cream shadow-lift"
            style={{ background: gradient }}
            animate={{ rotate: angle }}
            transition={{ duration: 3.2, ease: [0.16, 1, 0.3, 1] }}
            role="img"
            aria-label="Roue Action ou Vérité" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-xl shadow-soft">
              🎡
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
          <ShuffleIcon size={15} aria-hidden="true" />
          {spinning ? 'Elle tourne…' : 'Tourner la roue'}
        </button>

        <div className="mt-3 flex justify-center gap-2">
          {wheelCategories.map((item) => (
            <span
              key={item.id}
              className="flex items-center gap-1.5 rounded-full border border-ice bg-frost px-2.5 py-1 text-[11px] font-semibold text-ink">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
              {item.emoji} {item.label}
            </span>
          ))}
        </div>
      </SectionCard>

      <AnimatePresence>
        {card && meta_ && (
          <motion.section
            initial={{ opacity: 0, y: 16, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-4xl border border-ice bg-cream p-5 shadow-lift">
            <p
              className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold text-ink"
              style={{ backgroundColor: meta_.color }}>
              {meta_.emoji} {meta_.label}
            </p>
            <p className="mt-3 font-display text-[17px] leading-relaxed text-ink">{card}</p>
            <button
              type="button"
              onClick={accomplish}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-paper">
              <CheckIcon size={15} aria-hidden="true" />
              C’est fait
            </button>
          </motion.section>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
