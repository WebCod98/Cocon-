import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { useCouple } from '../../state/CoupleContext';
import { shuffle } from '../../utils/text';
import { hoursLeftFrom } from '../../utils/time';
import { vibrate } from '../../lib/haptics';
import type { GameProps } from './types';

interface Face {
  id: string;
  image?: string;
  emoji?: string;
  caption: string;
}

const fallbacks: Face[] = [
  { id: 'f1', emoji: '✈️', caption: 'Le voyage' },
  { id: 'f2', emoji: '☕', caption: 'Le café du matin' },
  { id: 'f3', emoji: '🌙', caption: 'Les appels de nuit' },
  { id: 'f4', emoji: '🎧', caption: 'Notre playlist' },
  { id: 'f5', emoji: '🧣', caption: 'Ton écharpe' },
  { id: 'f6', emoji: '📮', caption: 'La boîte aux lettres' },
];

interface Card {
  key: string;
  faceId: string;
}

const PAIRS = 6;

/** Memory joué avec vos Polaroid encore en ligne, complétés si besoin. */
export default function Memory({ meta, onFinish, earned }: GameProps) {
  const { doc } = useCouple();
  const [seed, setSeed] = useState(() => Date.now());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);

  const faces = useMemo(() => {
    const photos: Face[] = doc.polaroids
      .filter((item) => !hoursLeftFrom(item.postedAt, 24).expired)
      .slice(0, PAIRS)
      .map((item) => ({ id: item.id, image: item.url, caption: item.caption }));
    return [...photos, ...fallbacks].slice(0, PAIRS);
  }, [doc.polaroids]);

  const cards = useMemo<Card[]>(
    () => shuffle(faces.flatMap((face) => [{ key: `${face.id}-a`, faceId: face.id }, { key: `${face.id}-b`, faceId: face.id }]), seed),
    [faces, seed]
  );

  const complete = found.length === faces.length;

  useEffect(() => {
    if (flipped.length !== 2) return undefined;
    const [first, second] = flipped;
    if (cards[first].faceId === cards[second].faceId) {
      setFound((current) => [...current, cards[first].faceId]);
      setFlipped([]);
      vibrate('success');
      return undefined;
    }
    const id = window.setTimeout(() => setFlipped([]), 850);
    return () => window.clearTimeout(id);
  }, [flipped, cards]);

  useEffect(() => {
    if (!complete) return;
    onFinish({ won: moves <= faces.length * 3, score: moves });
  }, [complete]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (position: number) => {
    if (flipped.length === 2 || flipped.includes(position)) return;
    if (found.includes(cards[position].faceId)) return;
    setFlipped((current) => [...current, position]);
    if (flipped.length === 1) setMoves((value) => value + 1);
  };

  const restart = () => {
    setSeed(Date.now());
    setFlipped([]);
    setFound([]);
    setMoves(0);
  };

  const par = faces.length * 3;

  return (
    <GameShell
      meta={meta}
      rule={`Retrouvez les ${faces.length} paires. En moins de ${par} coups, la partie est gagnée.`}
      onRestart={restart}>
      {complete && (
        <GameResult
          won={moves <= par}
          title={`Terminé en ${moves} coups`}
          detail={moves <= par ? 'Sous le par : les pièces sont à vous.' : `Le par était de ${par} coups.`}
          coins={earned} />
      )}

      <SectionCard title="Les cartes" subtitle={`${found.length}/${faces.length} paires · ${moves} coups`}>
        <div className="grid grid-cols-3 gap-2">
          {cards.map((card, position) => {
            const face = faces.find((item) => item.id === card.faceId)!;
            const shown = flipped.includes(position) || found.includes(card.faceId);
            return (
              <motion.button
                key={card.key}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => flip(position)}
                aria-label={shown ? face.caption : 'Carte face cachée'}
                className={`relative aspect-[3/4] overflow-hidden rounded-2xl border transition-colors ${
                  shown ? 'border-mint/60 bg-cream' : 'border-ice bg-night'
                }`}>
                {shown ? (
                  face.image ? (
                    <img src={face.image} alt="" className="polaroid-filter h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl">{face.emoji}</span>
                  )
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-2xl text-paper/70" aria-hidden="true">
                    💞
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
        <p className="mt-3 text-[11px] leading-snug text-muted">
          Vos Polaroid encore en ligne servent de cartes. Quand ils s’effacent au bout de 24 h, le jeu
          complète avec vos symboles.
        </p>
      </SectionCard>
    </GameShell>
  );
}
