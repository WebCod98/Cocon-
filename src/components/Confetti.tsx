import { useEffect, useMemo, useState } from 'react';

const pieces = ['💗', '✨', '💛', '🎉', '💞', '⭐', '🌸'];

interface ConfettiProps {
  /** Change de valeur pour relancer l'animation. */
  trigger: number;
  count?: number;
  duration?: number;
}

/** Pluie de confettis — celebrations d'appairage et de jalons. */
export function Confetti({ trigger, count = 34, duration = 2600 }: ConfettiProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === 0) return undefined;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(id);
  }, [trigger, duration]);

  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        scale: 0.7 + Math.random() * 0.9,
        emoji: pieces[Math.floor(Math.random() * pieces.length)],
      })),
    [count, trigger]
  );

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {drops.map((drop) => (
        <span
          key={drop.id}
          className="absolute top-0 animate-fall-down text-2xl"
          style={{
            left: `${drop.left}%`,
            animationDelay: `${drop.delay}s`,
            transform: `scale(${drop.scale})`,
          }}>
          {drop.emoji}
        </span>
      ))}
    </div>
  );
}
