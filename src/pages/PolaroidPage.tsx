import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { TimerIcon } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { PhotoPicker } from '../components/PhotoPicker';
import { useCouple } from '../state/CoupleContext';
import { useNow } from '../hooks/useNow';
import { speciesOption } from '../data/companions';
import { hoursLeftFrom } from '../utils/time';
import type { Polaroid } from '../types';

export function PolaroidPage() {
  const { doc, me, them, mySlot, theirSlot, publishPolaroid } = useCouple();
  const now = useNow(30000);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const companionName = doc.companion?.name ?? speciesOption(doc.companion?.species).name;

  const alive = useMemo(
    () => doc.polaroids.filter((item) => !hoursLeftFrom(item.postedAt, 24, now.getTime()).expired),
    [doc.polaroids, now]
  );
  const mineToday = alive.find((item) => item.author === mySlot);
  const theirs = alive.find((item) => item.author === theirSlot);

  const publish = () => {
    if (!preview) return;
    publishPolaroid(preview, caption.trim() || 'Sans légende');
    setPreview(null);
    setCaption('');
  };

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <div className="rounded-4xl border border-ice bg-cream p-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Souvenirs éphémères</p>
        <h1 className="font-display text-xl font-semibold text-ink">Le Polaroid 24 h</h1>
        <p className="mt-1 text-xs leading-snug text-muted">
          Une photo par jour, visible seulement 24 heures. Après, elle disparaît — c’est ce qui la rend
          précieuse.
        </p>
      </div>

      <SectionCard
        title={theirs ? `Le Polaroid de ${them.name}` : `Rien encore de ${them.name}`}
        subtitle={
          theirs ? 'À voir avant qu’il ne s’efface' : `${companionName} te préviendra dès qu’il en dépose un`
        }>
        {theirs ? (
          <PolaroidCard photo={theirs} nowMs={now.getTime()} authorName={them.name} />
        ) : (
          <div className="flex h-40 items-center justify-center rounded-3xl border border-dashed border-ice bg-frost text-sm text-muted">
            En attente de sa photo du jour…
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Ta photo du jour"
        subtitle={
          mineToday ? 'Déjà publiée — encore visible pour lui/elle' : 'Filtre Polaroid appliqué automatiquement'
        }>
        {mineToday && !preview ? (
          <>
            <PolaroidCard photo={mineToday} nowMs={now.getTime()} authorName={me.name} />
            <div className="mt-3">
              <PhotoPicker onPick={setPreview} captureLabel="Reprendre" galleryLabel="Remplacer" compact />
            </div>
          </>
        ) : preview ? (
          <div>
            <div className="mx-auto w-56 rounded-sm bg-white p-3 pb-10 shadow-lift">
              <img src={preview} alt="Aperçu de ta photo" className="polaroid-filter h-48 w-full object-cover" />
            </div>
            <label htmlFor="caption" className="sr-only">
              Légende
            </label>
            <input
              id="caption"
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Une petite légende…"
              maxLength={60}
              className="mt-4 w-full rounded-full border border-ice bg-frost px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 rounded-full border border-ice bg-frost py-2.5 text-sm font-semibold text-ink">
                Annuler
              </button>
              <button
                type="button"
                onClick={publish}
                className="flex-1 rounded-full bg-coral py-2.5 text-sm font-semibold text-paper">
                Publier 24 h
              </button>
            </div>
          </div>
        ) : (
          <PhotoPicker onPick={setPreview} />
        )}
      </SectionCard>

      <SectionCard title="Encore visibles" subtitle="Tout s’efface au bout de 24 h">
        {alive.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ice bg-frost/60 px-3 py-6 text-center text-[11px] text-muted">
            Aucune photo en ligne pour le moment.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
            {alive.map((photo) => {
              const left = hoursLeftFrom(photo.postedAt, 24, now.getTime());
              return (
                <div key={photo.id} className="w-32 shrink-0 rounded-sm bg-white p-2 pb-6 shadow-soft">
                  <img src={photo.url} alt={photo.caption} className="polaroid-filter h-28 w-full object-cover" />
                  <p className="mt-1.5 truncate text-[10px] font-semibold text-[#3B2A32]">{photo.caption}</p>
                  <p className="text-[10px] text-[#967B85]">
                    {left.hours} h {left.minutes} min
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function PolaroidCard({
  photo,
  nowMs,
  authorName,
}: {
  photo: Polaroid;
  nowMs: number;
  authorName: string;
}) {
  const left = hoursLeftFrom(photo.postedAt, 24, nowMs);
  return (
    <motion.figure
      initial={{ opacity: 0, rotate: -3, y: 10 }}
      animate={{ opacity: 1, rotate: -1.5, y: 0 }}
      transition={{ type: 'spring', stiffness: 140, damping: 16 }}
      className="mx-auto w-60 rounded-sm bg-white p-3 pb-4 shadow-lift">
      <img src={photo.url} alt={photo.caption} className="polaroid-filter h-52 w-full object-cover" />
      <figcaption className="mt-3">
        <p className="font-display text-sm text-[#3B2A32]">{photo.caption}</p>
        <p className="mt-1 flex items-center gap-1 text-[11px] text-[#967B85]">
          <TimerIcon size={12} aria-hidden="true" />
          {authorName} · disparaît dans {left.hours} h {left.minutes} min
        </p>
      </figcaption>
    </motion.figure>
  );
}
