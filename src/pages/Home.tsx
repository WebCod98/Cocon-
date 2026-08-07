import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CameraIcon,
  FingerprintIcon,
  FishIcon,
  GamepadIcon,
  GiftIcon,
  HeartIcon,
  LockIcon,
  MailIcon,
  MoonIcon,
  RefreshCwIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from 'lucide-react';
import { Companion } from '../components/Companion';
import { HabitatStage } from '../components/habitats/HabitatStage';
import { Gauge } from '../components/Gauge';
import { SectionCard } from '../components/SectionCard';
import { InstallBanner } from '../components/InstallBanner';
import { Sheet } from '../components/Sheet';
import { useCouple } from '../state/CoupleContext';
import { habitats, speciesOption } from '../data/companions';
import { shopItem, shopItems } from '../data/shop';
import { relativeFrom } from '../utils/time';

export function Home() {
  const {
    doc,
    them,
    superHappy,
    care,
    feedTreat,
    toggleEquipped,
    togglePlaced,
    sendThought,
    restartVote,
  } = useCouple();
  const [changeOpen, setChangeOpen] = useState(false);

  const species = doc.companion?.species ?? 'penguin';
  const name = doc.companion?.name ?? speciesOption(species).name;
  const option = speciesOption(species);

  const adoptedAt = doc.companion ? new Date(doc.companion.adoptedAt) : new Date();
  const daysWith = Math.floor((Date.now() - adoptedAt.getTime()) / 86400000);
  const daysBeforeChange = Math.max(0, 365 - daysWith);
  const canChange = daysBeforeChange === 0;

  const ownedAccessories = doc.owned
    .map((id) => shopItem(id))
    .filter((item): item is NonNullable<typeof item> => item?.kind === 'accessory');
  const ownedFurniture = doc.owned
    .map((id) => shopItem(id))
    .filter((item): item is NonNullable<typeof item> => item?.kind === 'furniture')
    .filter((item) => !item.species || item.species === species);
  const treats = shopItems.filter((item) => item.kind === 'treat');

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <InstallBanner />

      <HabitatStage />

      <SectionCard
        title="Ses besoins"
        subtitle={
          superHappy
            ? 'Vous vous en êtes occupés tous les deux aujourd’hui 💛'
            : 'Une attention de chacun aujourd’hui débloque « Super Heureux »'
        }>
        <div className="flex gap-3">
          <Gauge label="Nourriture" emoji="🐟" value={doc.gauges.food} color="#F3C36B" />
          <Gauge label="Affection" emoji="💗" value={doc.gauges.love} color="#EF8A72" />
          <Gauge label="Énergie" emoji="⚡" value={doc.gauges.energy} color="#8FC9B4" />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <CareButton icon={<FishIcon size={16} />} label="Nourrir" onClick={() => care('food')} />
          <CareButton icon={<HeartIcon size={16} />} label="Câliner" onClick={() => care('love')} />
          <CareButton icon={<MoonIcon size={16} />} label="Reposer" onClick={() => care('energy')} />
        </div>
        <p className="mt-3 text-[11px] leading-snug text-muted">
          {name} ne meurt jamais. S’il est négligé, il s’endort simplement en attendant votre retour — et
          chaque geste de l’un remonte la jauge sur l’écran de l’autre.
        </p>
      </SectionCard>

      <SectionCard title="Messager d’affection" subtitle={`${name} fait le trajet jusqu’à ${them.name}`}>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={sendThought}
            className="flex items-center gap-3 rounded-3xl bg-coral px-4 py-3 text-left text-paper transition-transform active:scale-[0.98]">
            <FingerprintIcon size={19} aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-sm font-semibold">Bouton Pensée</span>
              <span className="block text-[11px] text-paper/85">
                Son téléphone vibre au rythme d’un battement de cœur
              </span>
            </span>
          </button>
          <QuickLink to="/rituels" icon={<MailIcon size={18} />} title={`Confier une lettre à ${name}`} hint="Livrée à son matin ou à son soir" />
          <QuickLink to="/polaroid" icon={<CameraIcon size={18} />} title="Publier un Polaroid 24 h" hint="Il s’efface tout seul demain" />
          <QuickLink to="/surprises" icon={<GiftIcon size={18} />} title="Préparer une surprise" hint="Lettre scellée, capsule ou roue des décisions" />
          <QuickLink to="/arcade" icon={<GamepadIcon size={18} />} title="Lancer un défi à l’Arcade" hint="15 mini-jeux, des pièces à gagner" />
        </div>
      </SectionCard>

      <SectionCard
        title="Friandises"
        subtitle={`${doc.coins} pièces disponibles`}
        action={
          <Link to="/boutique" className="rounded-full bg-frost p-2 text-coral" aria-label="Ouvrir la boutique">
            <ShoppingBagIcon size={15} aria-hidden="true" />
          </Link>
        }>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {treats.map((treat) => (
            <button
              key={treat.id}
              type="button"
              disabled={doc.coins < treat.price}
              onClick={() => feedTreat(treat.id)}
              className="flex w-24 shrink-0 flex-col items-center gap-1 rounded-2xl border border-ice bg-frost px-2 py-3 text-center transition-transform active:scale-95 disabled:opacity-40">
              <span className="text-xl" aria-hidden="true">
                {treat.emoji}
              </span>
              <span className="text-[11px] font-semibold leading-tight text-ink">{treat.label}</span>
              <span className="text-[10px] text-muted">🪙 {treat.price}</span>
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title={`Garde-robe & ${option.homeLabel}`}
        subtitle="Achetés en boutique avec vos pièces"
        action={<SparklesIcon size={16} className="text-sun" aria-hidden="true" />}>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">Accessoires</p>
        {ownedAccessories.length === 0 ? (
          <EmptyHint>Rien encore — la boutique en propose six.</EmptyHint>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ownedAccessories.map((item) => {
              const active = doc.equipped.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleEquipped(item.id)}
                  className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    active ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-frost text-muted'
                  }`}>
                  <span aria-hidden="true">{item.emoji}</span> {item.label}
                </button>
              );
            })}
          </div>
        )}

        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Meubles & décorations
        </p>
        {ownedFurniture.length === 0 ? (
          <EmptyHint>Son habitat est encore tout nu.</EmptyHint>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ownedFurniture.map((item) => {
              const active = doc.placed.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => togglePlaced(item.id)}
                  className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors ${
                    active ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-frost text-muted'
                  }`}>
                  <span aria-hidden="true">{item.emoji}</span> {item.label}
                </button>
              );
            })}
          </div>
        )}

        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Objets de son habitat
        </p>
        <ul className="space-y-2">
          {habitats[species].spots.map((spot) => (
            <li key={spot.id} className="flex items-center gap-3 rounded-2xl border border-ice bg-frost px-3 py-2">
              <span className="text-base" aria-hidden="true">
                {spot.emoji}
              </span>
              <span>
                <span className="block text-xs font-semibold leading-tight text-ink">{spot.label}</span>
                <span className="block text-[11px] text-muted">{spot.hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </SectionCard>

      {doc.feed.length > 0 && (
        <SectionCard title="Journal du cocon" subtitle="Ce que vous avez fait tous les deux">
          <ul className="space-y-2">
            {doc.feed.slice(0, 8).map((event) => (
              <li key={event.id} className="flex items-center gap-3 rounded-2xl border border-ice bg-frost px-3 py-2">
                <span className="text-base" aria-hidden="true">
                  {event.icon}
                </span>
                <span className="flex-1 text-xs leading-tight text-ink">{event.text}</span>
                <span className="shrink-0 text-[10px] text-muted">{relativeFrom(event.createdAt)}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard title="Votre compagnon" subtitle="Choisi à deux, au tout début de votre histoire">
        <div className="flex items-center gap-3">
          <span className="h-16 w-16 shrink-0 rounded-2xl bg-frost p-1">
            <Companion species={species} mood="happy" name={name} className="h-full w-full" />
          </span>
          <div className="flex-1">
            <p className="font-display text-sm font-semibold text-ink">
              {option.emoji} {name}
            </p>
            <p className="text-[11px] leading-snug text-muted">
              {canChange
                ? 'Un an ensemble : vous pouvez adopter un autre compagnon, si vous êtes d’accord tous les deux.'
                : `Ensemble depuis ${daysWith} ${daysWith > 1 ? 'jours' : 'jour'}. Changement possible dans ${daysBeforeChange} jours.`}
            </p>
          </div>
        </div>
        {canChange ? (
          <button
            type="button"
            onClick={() => setChangeOpen(true)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-2.5 text-sm font-semibold text-paper">
            <RefreshCwIcon size={15} aria-hidden="true" />
            Changer de compagnon à deux
          </button>
        ) : (
          <div className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ice bg-frost py-2.5 text-sm font-semibold text-muted">
            <LockIcon size={15} aria-hidden="true" />
            Changement verrouillé
          </div>
        )}
      </SectionCard>

      <Sheet
        open={changeOpen}
        title="Changer de compagnon"
        subtitle="Il faudra revoter tous les deux"
        onClose={() => setChangeOpen(false)}>
        <p className="text-sm leading-snug text-muted">
          {name} laissera sa place. Vos accessoires et vos meubles restent dans votre inventaire, et le
          nouveau compagnon emménage dans son propre habitat.
        </p>
        <button
          type="button"
          onClick={() => {
            setChangeOpen(false);
            restartVote();
          }}
          className="mt-4 w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper">
          Relancer le choix à deux
        </button>
      </Sheet>
    </div>
  );
}

function CareButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="flex flex-col items-center gap-1 rounded-2xl border border-ice bg-frost py-3 text-xs font-semibold text-ink">
      <span className="text-coral" aria-hidden="true">
        {icon}
      </span>
      {label}
    </motion.button>
  );
}

function QuickLink({
  to,
  icon,
  title,
  hint,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-3xl border border-ice bg-frost px-4 py-3 text-ink transition-transform active:scale-[0.98]">
      <span className="text-coral" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-[11px] text-muted">{hint}</span>
      </span>
    </Link>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-ice bg-frost/60 px-3 py-3 text-center text-[11px] text-muted">
      {children}
    </p>
  );
}
