import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BellIcon, BellOffIcon, PlaneIcon, PlusIcon, Trash2Icon, VideoIcon } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { Sheet } from '../components/Sheet';
import { useCouple } from '../state/CoupleContext';
import { useNow } from '../hooks/useNow';
import { milestones } from '../data/seed';
import { speciesOption } from '../data/companions';
import { scheduleLocal } from '../lib/notifications';
import {
  countdownTo,
  dayNumberDate,
  daysUntil,
  loveDuration,
  longDate,
  nextOccurrence,
  shortDate,
} from '../utils/time';
import type { KeyDateKind } from '../types';

const kinds: { id: KeyDateKind; label: string; emoji: string }[] = [
  { id: 'birthday', label: 'Anniversaire', emoji: '🎂' },
  { id: 'couple', label: 'Notre couple', emoji: '💞' },
  { id: 'holiday', label: 'Fête', emoji: '🎉' },
  { id: 'video', label: 'Visio', emoji: '📹' },
  { id: 'reunion', label: 'Retrouvailles', emoji: '✈️' },
];

export function Agenda() {
  const {
    doc,
    them,
    settings,
    addKeyDate,
    removeKeyDate,
    toggleReminder,
    setReunion,
  } = useCouple();
  const now = useNow(1000);
  const [addOpen, setAddOpen] = useState(false);
  const [reunionOpen, setReunionOpen] = useState(false);

  const companionName = doc.companion?.name ?? speciesOption(doc.companion?.species).name;
  const love = loveDuration(doc.since, now);
  const reunion = doc.reunionAt ? new Date(doc.reunionAt) : null;
  const countdown = reunion ? countdownTo(reunion, now) : null;

  const sorted = useMemo(
    () =>
      doc.keyDates
        .map((item) => {
          const date = item.year
            ? new Date(item.year, item.month - 1, item.day)
            : nextOccurrence(item.month, item.day, now);
          return { ...item, date, days: daysUntil(date, now) };
        })
        .filter((item) => item.days >= 0)
        .sort((a, b) => a.days - b.days),
    // Recalcule une fois par minute suffit : `now` change chaque seconde.
    [doc.keyDates, Math.floor(now.getTime() / 60000)] // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* Rappels locaux : la veille à 20 h, tant que l'app reste ouverte. */
  useEffect(() => {
    if (!settings.notifications) return undefined;
    const cancels = sorted
      .filter((item) => item.reminder && item.days === 1)
      .map((item) => {
        const at = new Date(item.date);
        at.setDate(at.getDate() - 1);
        at.setHours(20, 0, 0, 0);
        return scheduleLocal(at.getTime(), `${item.emoji} Demain : ${item.title}`, 'Rappel Cocon', item.id);
      });
    return () => cancels.forEach((cancel) => cancel());
  }, [sorted, settings.notifications]);

  const unlocked = milestones.filter((item) => love.totalDays >= item.days);
  const nextMilestone = milestones.find((item) => love.totalDays < item.days);

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      {/* --- Love Counter --- */}
      <section className="rounded-4xl border border-ice bg-cream p-5 shadow-lift">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Love Counter</p>
        <h1 className="mt-1 font-display text-xl font-semibold text-ink">Ensemble depuis…</h1>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <CounterCell value={love.years} label="ans" />
          <CounterCell value={love.months} label="mois" />
          <CounterCell value={love.days} label="jours" />
          <CounterCell value={love.hours} label="heures" />
          <CounterCell value={love.minutes} label="min" />
          <CounterCell value={love.seconds} label="sec" pulse />
        </div>
        <p className="mt-3 text-center text-[11px] text-muted">
          Soit <strong className="text-ink tabular-nums">{love.totalDays.toLocaleString('fr-FR')}</strong>{' '}
          jours, depuis le {longDate(new Date(`${doc.since}T00:00:00`))}.
        </p>
      </section>

      {/* --- Retrouvailles --- */}
      <section className="rounded-4xl border border-ice bg-night p-5 text-paper shadow-lift">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-paper/70">
          <PlaneIcon size={14} aria-hidden="true" />
          Retrouvailles à {them.city}
        </p>
        {countdown ? (
          <>
            <h2 className="mt-1 font-display text-xl font-semibold">Plus que…</h2>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { value: countdown.days, label: 'jours' },
                { value: countdown.hours, label: 'heures' },
                { value: countdown.minutes, label: 'min' },
                { value: countdown.seconds, label: 'sec' },
              ].map((unit) => (
                <div key={unit.label} className="rounded-2xl bg-paper/12 py-3 text-center">
                  <p className="font-display text-2xl font-semibold tabular-nums">
                    {String(unit.value).padStart(2, '0')}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-paper/70">{unit.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-paper/70">
              {shortDate(reunion!)} — {companionName} compte avec vous et prépare sa valise 🧳
            </p>
            <button
              type="button"
              onClick={() => setReunionOpen(true)}
              className="mt-3 w-full rounded-full bg-paper/15 py-2 text-[12px] font-semibold text-paper">
              Modifier la date
            </button>
          </>
        ) : (
          <>
            <h2 className="mt-1 font-display text-xl font-semibold">Aucune date fixée</h2>
            <p className="mt-1 text-[11px] leading-snug text-paper/70">
              Dès que vous savez quand vous vous revoyez, le compte à rebours démarre sur vos deux
              téléphones.
            </p>
            <button
              type="button"
              onClick={() => setReunionOpen(true)}
              className="mt-4 w-full rounded-full bg-coral py-2.5 text-sm font-semibold text-paper">
              Fixer la date des retrouvailles
            </button>
          </>
        )}
      </section>

      {/* --- Jalons --- */}
      <SectionCard
        title="Vos jalons"
        subtitle={
          nextMilestone
            ? `Prochain : ${nextMilestone.label} le ${shortDate(dayNumberDate(doc.since, nextMilestone.days))}`
            : 'Vous les avez tous décrochés 🏆'
        }>
        <div className="flex flex-wrap gap-2">
          {milestones.map((item) => {
            const done = unlocked.includes(item);
            return (
              <span
                key={item.id}
                className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-[11px] font-semibold ${
                  done ? 'border-sun/50 bg-sun/20 text-ink' : 'border-dashed border-ice bg-frost/60 text-muted'
                }`}
                title={
                  done
                    ? `Atteint le ${shortDate(dayNumberDate(doc.since, item.days))}`
                    : `Dans ${item.days - love.totalDays} jours`
                }>
                <span aria-hidden="true">{item.emoji}</span>
                {item.label}
                {!done && <span aria-hidden="true">🔒</span>}
              </span>
            );
          })}
        </div>
      </SectionCard>

      {/* --- Calendrier --- */}
      <SectionCard
        title="Vos dates clés"
        subtitle="Anniversaires, visios, fêtes — synchronisées à deux"
        action={
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            aria-label="Ajouter une date"
            className="rounded-full bg-coral p-2 text-paper">
            <PlusIcon size={15} aria-hidden="true" />
          </button>
        }>
        {sorted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ice bg-frost/60 px-3 py-6 text-center text-[11px] text-muted">
            Aucune date pour l’instant. Ajoutez vos anniversaires et vos rendez-vous visio.
          </p>
        ) : (
          <ul className="space-y-2">
            {sorted.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-3xl border border-ice bg-frost px-3 py-2.5">
                <span className="text-xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold leading-tight text-ink">{item.title}</p>
                  <p className="text-[11px] text-muted">
                    {item.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                    {item.time && ` · ${item.time}`} ·{' '}
                    {item.days === 0 ? "c'est aujourd'hui !" : `dans ${item.days} j`}
                  </p>
                </div>
                <button
                  type="button"
                  aria-pressed={item.reminder}
                  aria-label={`Rappel pour ${item.title}`}
                  onClick={() => toggleReminder(item.id)}
                  className={`shrink-0 rounded-full p-2 transition-colors ${
                    item.reminder ? 'bg-coral text-paper' : 'bg-ice text-muted'
                  }`}>
                  {item.reminder ? (
                    <BellIcon size={15} aria-hidden="true" />
                  ) : (
                    <BellOffIcon size={15} aria-hidden="true" />
                  )}
                </button>
                <button
                  type="button"
                  aria-label={`Supprimer ${item.title}`}
                  onClick={() => removeKeyDate(item.id)}
                  className="shrink-0 rounded-full p-2 text-muted">
                  <Trash2Icon size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[11px] leading-snug text-muted">
          Les rappels s’affichent en notification la veille à 20 h, heure locale, sur l’appareil où l’app est
          ouverte.
        </p>
      </SectionCard>

      <AddDateSheet open={addOpen} onClose={() => setAddOpen(false)} onAdd={addKeyDate} />
      <ReunionSheet
        open={reunionOpen}
        current={doc.reunionAt}
        onClose={() => setReunionOpen(false)}
        onSave={setReunion} />
    </div>
  );
}

function CounterCell({ value, label, pulse }: { value: number; label: string; pulse?: boolean }) {
  return (
    <div className="rounded-2xl bg-frost py-3 text-center">
      <motion.p
        key={pulse ? value : undefined}
        initial={pulse ? { scale: 1.14 } : false}
        animate={{ scale: 1 }}
        className="font-display text-2xl font-semibold tabular-nums text-ink">
        {String(value).padStart(2, '0')}
      </motion.p>
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

function AddDateSheet({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (entry: {
    title: string;
    month: number;
    day: number;
    year?: number;
    kind: KeyDateKind;
    emoji: string;
    reminder: boolean;
    time?: string;
  }) => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [kind, setKind] = useState<KeyDateKind>('birthday');
  const [time, setTime] = useState('');

  const recurring = kind === 'birthday' || kind === 'couple' || kind === 'holiday';

  const submit = () => {
    if (!title.trim() || !date) return;
    const parsed = new Date(`${date}T00:00:00`);
    onAdd({
      title: title.trim(),
      month: parsed.getMonth() + 1,
      day: parsed.getDate(),
      year: recurring ? undefined : parsed.getFullYear(),
      kind,
      emoji: kinds.find((item) => item.id === kind)?.emoji ?? '📅',
      reminder: true,
      time: kind === 'video' && time ? time : undefined,
    });
    setTitle('');
    setDate('');
    setTime('');
    onClose();
  };

  return (
    <Sheet open={open} title="Ajouter une date" subtitle="Elle apparaît chez vous deux" onClose={onClose}>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">Titre</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={40}
          placeholder="Anniversaire de Maguy"
          className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
      </label>

      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">Type</span>
      <div className="mb-3 flex flex-wrap gap-2">
        {kinds.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={kind === item.id}
            onClick={() => setKind(item.id)}
            className={`rounded-2xl border px-3 py-2 text-[11px] font-semibold transition-colors ${
              kind === item.id ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-frost text-muted'
            }`}>
            <span aria-hidden="true">{item.emoji}</span> {item.label}
          </button>
        ))}
      </div>

      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
          Date {recurring && '(elle revient chaque année)'}
        </span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink focus:border-coral focus:outline-none" />
      </label>

      {kind === 'video' && (
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Heure de l’appel
          </span>
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink focus:border-coral focus:outline-none" />
        </label>
      )}

      <button
        type="button"
        disabled={!title.trim() || !date}
        onClick={submit}
        className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
        Ajouter au calendrier
      </button>
    </Sheet>
  );
}

function ReunionSheet({
  open,
  current,
  onClose,
  onSave,
}: {
  open: boolean;
  current: string | null;
  onClose: () => void;
  onSave: (iso: string | null) => void;
}) {
  const [value, setValue] = useState(current ? current.slice(0, 16) : '');

  return (
    <Sheet open={open} title="Prochaines retrouvailles" subtitle="Le compte à rebours partagé" onClose={onClose}>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
          Date et heure d’arrivée
        </span>
        <input
          type="datetime-local"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink focus:border-coral focus:outline-none" />
      </label>
      <div className="grid gap-2">
        <button
          type="button"
          disabled={!value}
          onClick={() => {
            onSave(value);
            onClose();
          }}
          className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
          <span className="flex items-center justify-center gap-2">
            <VideoIcon size={15} aria-hidden="true" />
            Lancer le compte à rebours
          </span>
        </button>
        {current && (
          <button
            type="button"
            onClick={() => {
              onSave(null);
              setValue('');
              onClose();
            }}
            className="w-full rounded-full border border-ice bg-frost py-2.5 text-sm font-semibold text-muted">
            Retirer la date
          </button>
        )}
      </div>
    </Sheet>
  );
}
