import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckIcon, GamepadIcon, LockIcon } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { Companion } from '../components/Companion';
import { useCouple } from '../state/CoupleContext';
import { shopItems } from '../data/shop';
import { speciesOption } from '../data/companions';
import type { ShopKind } from '../types';

const tabs: { id: ShopKind; label: string; emoji: string; hint: string }[] = [
  { id: 'accessory', label: 'Accessoires', emoji: '🧣', hint: 'Il les porte tout de suite' },
  { id: 'treat', label: 'Friandises', emoji: '🍰', hint: 'Consommées, elles remontent les jauges' },
  { id: 'furniture', label: 'Habitat', emoji: '🪴', hint: 'Posées dans son décor' },
];

export function Shop() {
  const { doc, buy, feedTreat, toggleEquipped, togglePlaced } = useCouple();
  const [tab, setTab] = useState<ShopKind>('accessory');

  const species = doc.companion?.species ?? 'penguin';
  const name = doc.companion?.name ?? speciesOption(species).name;

  const visible = shopItems.filter(
    (item) => item.kind === tab && (!item.species || item.species === species)
  );

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <section className="rounded-4xl border border-ice bg-night p-5 text-paper shadow-lift">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-paper/70">Boutique</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-semibold">Vos pièces</h1>
            <p className="mt-1 text-[11px] text-paper/70">
              Gagnées à l’Arcade, dépensées pour {name}
            </p>
          </div>
          <p className="font-display text-3xl font-semibold tabular-nums">🪙 {doc.coins}</p>
        </div>
        <Link
          to="/arcade"
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-paper/15 py-2.5 text-sm font-semibold text-paper">
          <GamepadIcon size={15} aria-hidden="true" />
          Gagner des pièces à l’Arcade
        </Link>
      </section>

      <div className="grid grid-cols-3 gap-2" role="tablist" aria-label="Rayon">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={`flex flex-col items-center gap-0.5 rounded-2xl border px-2 py-2.5 text-[11px] font-semibold transition-colors ${
              tab === item.id ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-cream text-muted'
            }`}>
            <span className="text-base" aria-hidden="true">
              {item.emoji}
            </span>
            {item.label}
          </button>
        ))}
      </div>

      <SectionCard title={tabs.find((item) => item.id === tab)?.label} subtitle={tabs.find((item) => item.id === tab)?.hint}>
        <ul className="space-y-2">
          {visible.map((item) => {
            const owned = doc.owned.includes(item.id);
            const affordable = doc.coins >= item.price;
            const equipped = doc.equipped.includes(item.id) || doc.placed.includes(item.id);

            return (
              <motion.li
                key={item.id}
                layout
                className="flex items-center gap-3 rounded-3xl border border-ice bg-frost px-3 py-2.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cream text-xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight text-ink">{item.label}</p>
                  <p className="text-[11px] leading-snug text-muted">{item.description}</p>
                  {item.boost && (
                    <p className="mt-0.5 text-[10px] font-semibold text-mint">
                      {Object.entries(item.boost)
                        .map(([key, value]) => `+${value} ${gaugeLabel(key)}`)
                        .join(' · ')}
                    </p>
                  )}
                </div>

                {item.kind === 'treat' ? (
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => feedTreat(item.id)}
                    className="shrink-0 rounded-full bg-coral px-3 py-2 text-[11px] font-semibold text-paper disabled:bg-ice disabled:text-muted">
                    🪙 {item.price}
                  </button>
                ) : owned ? (
                  <button
                    type="button"
                    onClick={() => (item.kind === 'accessory' ? toggleEquipped(item.id) : togglePlaced(item.id))}
                    aria-pressed={equipped}
                    className={`shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold ${
                      equipped ? 'bg-mint/30 text-ink' : 'border border-ice bg-cream text-muted'
                    }`}>
                    {equipped ? (
                      <span className="flex items-center gap-1">
                        <CheckIcon size={12} aria-hidden="true" /> Posé
                      </span>
                    ) : (
                      'Ranger'
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!affordable}
                    onClick={() => buy(item.id)}
                    className="shrink-0 rounded-full bg-coral px-3 py-2 text-[11px] font-semibold text-paper disabled:bg-ice disabled:text-muted">
                    {affordable ? (
                      `🪙 ${item.price}`
                    ) : (
                      <span className="flex items-center gap-1">
                        <LockIcon size={11} aria-hidden="true" /> {item.price}
                      </span>
                    )}
                  </button>
                )}
              </motion.li>
            );
          })}
        </ul>
      </SectionCard>

      <SectionCard title="Aperçu" subtitle={`${name} avec ce que vous lui avez offert`}>
        <div className="mx-auto h-40 w-40">
          <Companion species={species} mood="super" equipped={doc.equipped} name={name} className="h-full w-full" />
        </div>
      </SectionCard>
    </div>
  );
}

function gaugeLabel(key: string) {
  if (key === 'food') return 'faim';
  if (key === 'love') return 'affection';
  return 'énergie';
}
