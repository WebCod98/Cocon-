import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BriefcaseIcon,
  CheckIcon,
  CoffeeIcon,
  GiftIcon,
  MoonIcon,
  PlusIcon,
  TicketIcon,
  Trash2Icon,
} from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { Sheet } from '../components/Sheet';
import { PhotoPicker } from '../components/PhotoPicker';
import { useCouple } from '../state/CoupleContext';
import { useNow } from '../hooks/useNow';
import { dayLabelIn, offsetBetween, timeIn } from '../utils/time';
import type { Availability, PartnerProfile, TripDoc } from '../types';

const statusMeta: Record<Availability, { label: string; emoji: string }> = {
  free: { label: 'Disponible', emoji: '🟢' },
  busy: { label: 'Occupé·e', emoji: '🟠' },
  sleeping: { label: 'Je dors', emoji: '🌙' },
};

const docTypes: { id: TripDoc['type']; label: string; emoji: string }[] = [
  { id: 'flight', label: 'Vol', emoji: '✈️' },
  { id: 'train', label: 'Train', emoji: '🚆' },
  { id: 'stay', label: 'Logement', emoji: '🏠' },
  { id: 'ticket', label: 'Billet', emoji: '🎟️' },
];

export function Together() {
  const {
    doc,
    me,
    them,
    mySlot,
    theirSlot,
    setAvailability,
    addBucket,
    toggleBucket,
    removeBucket,
    addTripDoc,
    removeTripDoc,
  } = useCouple();
  const now = useNow(1000);
  const [bucketDraft, setBucketDraft] = useState('');
  const [photoFor, setPhotoFor] = useState<string | null>(null);
  const [docOpen, setDocOpen] = useState(false);

  const shift = offsetBetween(me.timeZone, them.timeZone, now);
  const done = doc.bucket.filter((item) => item.done).length;

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <div className="grid grid-cols-2 gap-3">
        <ClockCard partner={me} now={now} status={doc.availability[mySlot]} isYou />
        <ClockCard partner={them} now={now} status={doc.availability[theirSlot]} />
      </div>

      <p className="rounded-2xl border border-ice bg-cream px-3 py-2 text-center text-[11px] text-muted shadow-soft">
        {shift === 0
          ? 'Vous êtes dans le même fuseau horaire — aucun décalage.'
          : shift > 0
            ? `${them.city} a ${shift} h d’avance sur ${me.city}.`
            : `${them.city} a ${Math.abs(shift)} h de retard sur ${me.city}.`}
      </p>

      <SectionCard title="Ton statut" subtitle="Pour qu’il/elle sache si tu peux répondre maintenant">
        <div className="grid grid-cols-3 gap-2">
          {(['free', 'busy', 'sleeping'] as Availability[]).map((value) => {
            const active = doc.availability[mySlot] === value;
            const Icon = value === 'free' ? CoffeeIcon : value === 'busy' ? BriefcaseIcon : MoonIcon;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setAvailability(value)}
                className={`flex flex-col items-center gap-1 rounded-2xl border py-3 text-[11px] font-semibold transition-colors ${
                  active ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-frost text-muted'
                }`}>
                <Icon size={17} aria-hidden="true" />
                {statusMeta[value].label}
              </button>
            );
          })}
        </div>
      </SectionCard>

      <Link
        to="/surprises"
        className="flex items-center gap-3 rounded-4xl border border-ice bg-cream px-4 py-3.5 shadow-soft transition-transform active:scale-[0.98]">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blush/60 text-coral">
          <GiftIcon size={19} aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-semibold text-ink">Surprises & secrets</span>
          <span className="block text-[11px] text-muted">
            Lettres « à ouvrir quand… », capsule temporelle, roue des décisions
          </span>
        </span>
      </Link>

      <SectionCard
        title="Bucket list des retrouvailles"
        subtitle={`${done}/${doc.bucket.length} validées — une photo suffit`}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!bucketDraft.trim()) return;
            addBucket(bucketDraft.trim());
            setBucketDraft('');
          }}
          className="mb-3 flex gap-2">
          <input
            value={bucketDraft}
            onChange={(event) => setBucketDraft(event.target.value)}
            maxLength={60}
            placeholder="Une activité à faire ensemble…"
            aria-label="Nouvelle activité"
            className="flex-1 rounded-full border border-ice bg-frost px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
          <button
            type="submit"
            disabled={!bucketDraft.trim()}
            aria-label="Ajouter"
            className="shrink-0 rounded-full bg-coral p-2.5 text-paper disabled:opacity-40">
            <PlusIcon size={16} aria-hidden="true" />
          </button>
        </form>

        {doc.bucket.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ice bg-frost/60 px-3 py-6 text-center text-[11px] text-muted">
            Rien encore. Notez ce que vous ferez dès que vous serez au même endroit.
          </p>
        ) : (
          <ul className="space-y-2">
            {doc.bucket.map((item) => (
              <li key={item.id} className="rounded-3xl border border-ice bg-frost p-2.5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-pressed={item.done}
                    aria-label={`Marquer « ${item.label} » comme ${item.done ? 'à faire' : 'faite'}`}
                    onClick={() => toggleBucket(item.id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      item.done ? 'border-mint bg-mint text-paper' : 'border-ice bg-cream text-transparent'
                    }`}>
                    <CheckIcon size={13} aria-hidden="true" />
                  </button>
                  <span className={`flex-1 text-sm ${item.done ? 'text-muted line-through' : 'text-ink'}`}>
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPhotoFor(item.id)}
                    className="shrink-0 rounded-full border border-ice bg-cream px-2.5 py-1 text-[10px] font-semibold text-muted">
                    {item.photo ? 'Changer' : '📸 Valider'}
                  </button>
                  <button
                    type="button"
                    aria-label={`Supprimer ${item.label}`}
                    onClick={() => removeBucket(item.id)}
                    className="shrink-0 rounded-full p-1.5 text-muted">
                    <Trash2Icon size={14} aria-hidden="true" />
                  </button>
                </div>
                {item.photo && (
                  <img
                    src={item.photo}
                    alt={`Souvenir : ${item.label}`}
                    className="mt-2 h-32 w-full rounded-2xl object-cover" />
                )}
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard
        title="Mode Retrouvailles"
        subtitle="Vos billets et réservations au même endroit"
        action={
          <button
            type="button"
            onClick={() => setDocOpen(true)}
            aria-label="Ajouter un document"
            className="rounded-full bg-coral p-2 text-paper">
            <PlusIcon size={15} aria-hidden="true" />
          </button>
        }>
        {doc.tripDocs.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ice bg-frost/60 px-3 py-6 text-center text-[11px] text-muted">
            Ajoutez votre vol, votre logement ou vos billets : ils seront visibles par vous deux.
          </p>
        ) : (
          <ul className="space-y-2">
            {doc.tripDocs.map((item) => (
              <li key={item.id} className="flex items-center gap-3 rounded-3xl border border-ice bg-frost px-3 py-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cream text-coral">
                  <TicketIcon size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight text-ink">{item.title}</p>
                  <p className="truncate text-[11px] text-muted">{item.detail}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Supprimer ${item.title}`}
                  onClick={() => removeTripDoc(item.id)}
                  className="shrink-0 rounded-full p-1.5 text-muted">
                  <Trash2Icon size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <Sheet
        open={Boolean(photoFor)}
        title="Photo souvenir"
        subtitle="Elle valide l’activité pour vous deux"
        onClose={() => setPhotoFor(null)}>
        <PhotoPicker
          onPick={(dataURL) => {
            if (photoFor) toggleBucket(photoFor, dataURL);
            setPhotoFor(null);
          }} />
      </Sheet>

      <AddDocSheet open={docOpen} onClose={() => setDocOpen(false)} onAdd={addTripDoc} />
    </div>
  );
}

function ClockCard({
  partner,
  now,
  status,
  isYou = false,
}: {
  partner: PartnerProfile;
  now: Date;
  status: Availability;
  isYou?: boolean;
}) {
  return (
    <article
      className={`rounded-4xl border p-4 shadow-soft ${
        isYou ? 'border-ice bg-cream' : 'border-night/20 bg-night text-paper'
      }`}>
      <p className={`truncate text-[11px] font-semibold ${isYou ? 'text-muted' : 'text-paper/70'}`}>
        {partner.emoji} {isYou ? 'Toi' : partner.name} · {partner.city}
      </p>
      <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{timeIn(partner.timeZone, now)}</p>
      <p className={`text-[11px] capitalize ${isYou ? 'text-muted' : 'text-paper/70'}`}>
        {dayLabelIn(partner.timeZone, now)}
      </p>
      <p className="mt-3 text-sm">
        <span aria-hidden="true">{partner.weather.icon}</span> {partner.weather.label} ·{' '}
        {partner.weather.temp}°
      </p>
      <p className={`mt-2 text-[11px] font-semibold ${isYou ? 'text-ink' : 'text-paper'}`}>
        {statusMeta[status].emoji} {statusMeta[status].label}
      </p>
    </article>
  );
}

function AddDocSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<TripDoc, 'id'>) => void;
}) {
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [type, setType] = useState<TripDoc['type']>('flight');

  return (
    <Sheet open={open} title="Ajouter un document" subtitle="Visible par vous deux" onClose={onClose}>
      <div className="mb-3 flex flex-wrap gap-2">
        {docTypes.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={type === item.id}
            onClick={() => setType(item.id)}
            className={`rounded-2xl border px-3 py-2 text-[11px] font-semibold transition-colors ${
              type === item.id ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-frost text-muted'
            }`}>
            <span aria-hidden="true">{item.emoji}</span> {item.label}
          </button>
        ))}
      </div>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">Intitulé</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={50}
          placeholder="Vol AF 346 — CDG → YUL"
          className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
      </label>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">Détail</span>
        <input
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          maxLength={60}
          placeholder="12 sept. · 10h30 · Siège 22A"
          className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
      </label>
      <button
        type="button"
        disabled={!title.trim()}
        onClick={() => {
          onAdd({ title: title.trim(), detail: detail.trim(), type });
          setTitle('');
          setDetail('');
          onClose();
        }}
        className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
        Ajouter
      </button>
    </Sheet>
  );
}
