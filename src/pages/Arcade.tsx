import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, TrophyIcon } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { useCouple } from '../state/CoupleContext';
import { gameCategories, games } from '../data/games';
import { relativeFrom } from '../utils/time';

export function Arcade() {
  const { doc, mySlot, them } = useCouple();

  const totalPlays = Object.values(doc.scores).reduce((sum, score) => sum + score.plays, 0);
  const totalWins = Object.values(doc.scores).reduce((sum, score) => sum + score.wins, 0);
  const waiting = doc.challenges.filter((item) => item.status === 'open' && item.turn === mySlot);

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <section className="rounded-4xl border border-ice bg-night p-5 text-paper shadow-lift">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-paper/70">L’Arcade du Couple</p>
        <h1 className="mt-1 font-display text-xl font-semibold">15 mini-jeux à deux</h1>
        <p className="mt-1 text-[11px] leading-snug text-paper/70">
          Chaque victoire rapporte des pièces pour la boutique de votre mascotte.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat value={doc.coins} label="pièces" />
          <Stat value={totalWins} label="victoires" />
          <Stat value={totalPlays} label="parties" />
        </div>
      </section>

      {waiting.length > 0 && (
        <SectionCard title="À toi de jouer" subtitle={`${them.name} attend ton tour`}>
          <ul className="space-y-2">
            {waiting.map((challenge) => {
              const meta = games.find((game) => game.id === challenge.game);
              if (!meta) return null;
              return (
                <li key={challenge.id}>
                  <Link
                    to={`/arcade/${meta.id}`}
                    className="flex items-center gap-3 rounded-3xl border border-coral/40 bg-blush/40 px-3 py-2.5">
                    <span className="text-xl" aria-hidden="true">
                      {meta.emoji}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-semibold text-ink">{meta.title}</span>
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <ClockIcon size={11} aria-hidden="true" />
                        {relativeFrom(challenge.updatedAt)}
                      </span>
                    </span>
                    <span className="rounded-full bg-coral px-2.5 py-1 text-[10px] font-semibold text-paper">
                      Jouer
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </SectionCard>
      )}

      {gameCategories.map((category) => (
        <SectionCard
          key={category.id}
          title={`${category.emoji} ${category.label}`}
          subtitle={`${games.filter((game) => game.category === category.id).length} jeux`}>
          <ul className="grid gap-2">
            {games
              .filter((game) => game.category === category.id)
              .map((game) => {
                const score = doc.scores[game.id];
                return (
                  <motion.li key={game.id} whileTap={{ scale: 0.98 }}>
                    <Link
                      to={`/arcade/${game.id}`}
                      className="flex items-center gap-3 rounded-3xl border border-ice bg-frost px-3 py-3">
                      <span
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-xl"
                        aria-hidden="true">
                        {game.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-ink">{game.title}</span>
                          {game.async && (
                            <span className="shrink-0 rounded-full bg-mint/25 px-1.5 py-0.5 text-[9px] font-semibold text-ink">
                              à deux
                            </span>
                          )}
                        </span>
                        <span className="block truncate text-[11px] text-muted">{game.tagline}</span>
                        {score && (
                          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-mint">
                            <TrophyIcon size={10} aria-hidden="true" />
                            {score.wins}/{score.plays}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 rounded-full bg-sun/25 px-2 py-1 text-[10px] font-semibold text-ink">
                        🪙 {game.reward}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
          </ul>
        </SectionCard>
      ))}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-paper/12 py-3 text-center">
      <p className="font-display text-2xl font-semibold tabular-nums">{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-paper/70">{label}</p>
    </div>
  );
}
