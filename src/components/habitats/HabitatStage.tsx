import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Companion } from '../Companion';
import { LivingRoom } from './LivingRoom';
import { Garden } from './Garden';
import { IceField } from './IceField';
import { useCouple } from '../../state/CoupleContext';
import { habitats, speciesOption } from '../../data/companions';
import { shopItem } from '../../data/shop';
import { dateKeyIn } from '../../utils/time';

/** L'habitat illustre, ses accessoires interactifs, ses meubles et la mascotte. */
export function HabitatStage() {
  const { doc, me, them, mood, superHappy, care, isNight, toast, settings } = useCouple();
  const [activeSpot, setActiveSpot] = useState<string | null>(null);

  const species = doc.companion?.species ?? 'penguin';
  const name = doc.companion?.name ?? speciesOption(species).name;
  const habitat = habitats[species];
  const Scene = species === 'cat' ? LivingRoom : species === 'dog' ? Garden : IceField;
  const pose = mood === 'sleepy' ? habitat.asleep : habitat.awake;

  const todayKey = dateKeyIn(me.timeZone);
  const myCared = doc.caredOn[settings.slot] === todayKey;
  const theirCared = doc.caredOn[settings.slot === 'one' ? 'two' : 'one'] === todayKey;

  const furniture = doc.placed
    .map((id) => shopItem(id))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => !item.species || item.species === species)
    .slice(0, habitat.decorSlots.length);

  return (
    <section className="overflow-hidden rounded-4xl border border-ice bg-cream shadow-lift">
      <div className="relative h-[300px] w-full">
        <Scene className="absolute inset-0 h-full w-full" />

        {/* Ciel étoilé du Mode Sommeil */}
        {isNight && (
          <div className="pointer-events-none absolute inset-0 bg-night/45" aria-hidden="true">
            {[12, 28, 44, 61, 76, 88, 34, 68].map((left, index) => (
              <span
                key={left}
                className="absolute animate-twinkle text-[10px] text-paper"
                style={{
                  left: `${left}%`,
                  top: `${8 + (index % 4) * 9}%`,
                  animationDelay: `${index * 0.42}s`,
                }}>
                ✦
              </span>
            ))}
          </div>
        )}

        {/* Bandeau d'état */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold shadow-soft ${
              superHappy ? 'bg-sun text-night' : 'bg-cream/90 text-ink'
            }`}>
            {superHappy
              ? '✨ Super Heureux'
              : mood === 'sleepy'
                ? `😴 ${name} dort`
                : `${name} va bien`}
          </span>
          <div className="flex flex-col items-end gap-1 rounded-2xl bg-cream/85 px-2 py-1.5 text-[10px] font-semibold shadow-soft">
            <span className={myCared ? 'text-mint' : 'text-muted'}>
              {myCared ? '✓' : '○'} {me.name}
            </span>
            <span className={theirCared ? 'text-mint' : 'text-muted'}>
              {theirCared ? '✓' : '○'} {them.name}
            </span>
          </div>
        </div>

        {/* Meubles achetés en boutique */}
        {furniture.map((item, index) => (
          <motion.span
            key={item.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: index * 0.08 }}
            className="absolute text-2xl drop-shadow"
            style={{
              left: `${habitat.decorSlots[index].x}%`,
              top: `${habitat.decorSlots[index].y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden="true">
            {item.emoji}
          </motion.span>
        ))}

        {/* Accessoires interactifs de l'habitat */}
        {habitat.spots.map((spot) => (
          <div
            key={spot.id}
            className="absolute"
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }}>
            <button
              type="button"
              onClick={() => {
                care(spot.gauge);
                setActiveSpot(spot.id);
                window.setTimeout(() => setActiveSpot(null), 2400);
              }}
              onMouseEnter={() => setActiveSpot(spot.id)}
              onMouseLeave={() => setActiveSpot((value) => (value === spot.id ? null : value))}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-cream bg-cream/85 text-sm shadow-soft transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral active:scale-95"
              aria-label={`${spot.label} — ${spot.hint}`}>
              <span aria-hidden="true">{spot.emoji}</span>
            </button>
            <AnimatePresence>
              {activeSpot === spot.id && (
                <motion.span
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute left-1/2 top-full mt-1.5 w-max max-w-[140px] -translate-x-1/2 rounded-xl bg-night/85 px-2 py-1 text-center text-[10px] font-semibold leading-tight text-paper">
                  {spot.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* La mascotte */}
        <motion.div
          className="absolute w-[42%]"
          style={{ x: '-50%', y: '-50%' }}
          animate={{
            left: `${pose.x}%`,
            top: `${pose.y}%`,
            scale: pose.scale,
            rotate: pose.rotate ?? 0,
          }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}>
          <Companion
            species={species}
            mood={mood}
            equipped={isNight ? [...doc.equipped, 'beanie'] : doc.equipped}
            name={name}
            className="h-full w-full" />
        </motion.div>

        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute inset-x-4 bottom-3 rounded-2xl bg-night/90 px-3 py-2 text-center text-[12px] font-semibold text-paper">
              {toast}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-ice px-4 py-3">
        <div>
          <p className="font-display text-sm font-semibold text-ink">
            {habitat.name} de {name}
          </p>
          <p className="text-[11px] text-muted">{isNight ? 'Nuit étoilée · tout le monde dort' : habitat.mood}</p>
        </div>
        <span className="rounded-full bg-frost px-2.5 py-1 text-[10px] font-semibold text-muted">
          Touchez un objet
        </span>
      </div>
    </section>
  );
}
