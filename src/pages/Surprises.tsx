import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HourglassIcon, LockIcon, MailOpenIcon, PlusIcon, ShuffleIcon, XIcon } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { Sheet } from '../components/Sheet';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { PhotoPicker } from '../components/PhotoPicker';
import { Confetti } from '../components/Confetti';
import { useCouple } from '../state/CoupleContext';
import { useNow } from '../hooks/useNow';
import { relativeFrom, shortDate } from '../utils/time';
import { vibrate } from '../lib/haptics';
import type { LetterCondition, LockedLetter } from '../types';

const conditions: { id: LetterCondition; label: string; emoji: string; question: string }[] = [
  {
    id: 'bad-day',
    label: 'Si tu as eu une mauvaise journée',
    emoji: '🌧️',
    question: 'Ta journée a vraiment été difficile ?',
  },
  { id: 'miss-you', label: 'Si je te manque trop', emoji: '💔', question: 'Je te manque, là, maintenant ?' },
  { id: 'cant-sleep', label: 'Si tu n’arrives pas à dormir', emoji: '🌙', question: 'Tu tournes en rond dans le lit ?' },
  { id: 'good-news', label: 'Si tu as une bonne nouvelle', emoji: '🎉', question: 'Une bonne nouvelle à fêter ?' },
  { id: 'need-courage', label: 'Si tu as besoin de courage', emoji: '🦁', question: 'Tu as besoin d’un coup de pouce ?' },
  { id: 'angry', label: 'Si on s’est disputés', emoji: '🫂', question: 'On vient de se disputer ?' },
];

const defaultWheel = ['Ton film', 'Mon film', 'Pizza 🍕', 'Sushis 🍣', 'On cuisine', 'Série + plaid'];

export function Surprises() {
  const { doc, mySlot, theirSlot, them, addLetter, openLetter, addCapsule, openCapsule } = useCouple();
  const now = useNow(30000);

  const [letterOpen, setLetterOpen] = useState(false);
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [confirming, setConfirming] = useState<LockedLetter | null>(null);
  const [reading, setReading] = useState<LockedLetter | null>(null);
  const [burst, setBurst] = useState(0);

  const forMe = doc.letters.filter((letter) => letter.author === theirSlot);
  const fromMe = doc.letters.filter((letter) => letter.author === mySlot);

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <Confetti trigger={burst} />

      <div className="rounded-4xl border border-ice bg-cream p-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Surprises & secrets</p>
        <h1 className="font-display text-xl font-semibold text-ink">L’inattendu, préparé à l’avance</h1>
        <p className="mt-1 text-xs leading-snug text-muted">
          Des mots qu’on écrit aujourd’hui pour un jour qu’on ne connaît pas encore.
        </p>
      </div>

      {/* --- Lettres « À ouvrir quand… » --- */}
      <SectionCard
        title="À ouvrir quand…"
        subtitle={`${forMe.length} ${forMe.length > 1 ? 'lettres scellées' : 'lettre scellée'} de ${them.name}`}
        action={
          <button
            type="button"
            onClick={() => setLetterOpen(true)}
            aria-label="Écrire une lettre scellée"
            className="rounded-full bg-coral p-2 text-paper">
            <PlusIcon size={15} aria-hidden="true" />
          </button>
        }>
        {forMe.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ice bg-frost/60 px-3 py-6 text-center text-[11px] text-muted">
            Rien pour toi encore. Écris-en une pour {them.name} — elle l’attendra au bon moment.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2">
            {forMe.map((letter) => {
              const meta = conditions.find((item) => item.id === letter.condition);
              const opened = Boolean(letter.openedAt);
              return (
                <li key={letter.id}>
                  <button
                    type="button"
                    onClick={() => (opened ? setReading(letter) : setConfirming(letter))}
                    className={`flex h-full w-full flex-col items-center gap-1.5 rounded-3xl border p-3 text-center transition-transform active:scale-95 ${
                      opened ? 'border-ice bg-frost' : 'border-coral/40 bg-blush/40'
                    }`}>
                    <span className="text-2xl" aria-hidden="true">
                      {opened ? '💌' : meta?.emoji}
                    </span>
                    <span className="text-[11px] font-semibold leading-tight text-ink">{meta?.label}</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted">
                      {opened ? (
                        <>
                          <MailOpenIcon size={10} aria-hidden="true" /> Lue
                        </>
                      ) : (
                        <>
                          <LockIcon size={10} aria-hidden="true" /> Scellée
                        </>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {fromMe.length > 0 && (
          <>
            <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Celles que tu as écrites
            </p>
            <ul className="space-y-1.5">
              {fromMe.map((letter) => {
                const meta = conditions.find((item) => item.id === letter.condition);
                return (
                  <li
                    key={letter.id}
                    className="flex items-center gap-2 rounded-2xl border border-ice bg-frost px-3 py-2 text-[11px]">
                    <span aria-hidden="true">{meta?.emoji}</span>
                    <span className="flex-1 truncate text-ink">{meta?.label}</span>
                    <span className={letter.openedAt ? 'text-mint' : 'text-muted'}>
                      {letter.openedAt ? `ouverte ${relativeFrom(letter.openedAt, now.getTime())}` : 'en attente'}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </SectionCard>

      {/* --- Capsule temporelle --- */}
      <SectionCard
        title="Capsule temporelle"
        subtitle="Scellée à deux, ouvrable à une date choisie"
        action={
          <button
            type="button"
            onClick={() => setCapsuleOpen(true)}
            aria-label="Créer une capsule"
            className="rounded-full bg-coral p-2 text-paper">
            <PlusIcon size={15} aria-hidden="true" />
          </button>
        }>
        {doc.capsules.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ice bg-frost/60 px-3 py-6 text-center text-[11px] text-muted">
            Enfermez un souvenir, une promesse ou une photo — et ne la rouvrez que dans un an.
          </p>
        ) : (
          <ul className="space-y-2">
            {doc.capsules.map((capsule) => {
              const ready = now.getTime() >= capsule.openAt;
              const opened = Boolean(capsule.openedAt);
              return (
                <li key={capsule.id} className="rounded-3xl border border-ice bg-frost p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">
                      {opened ? '📖' : ready ? '✨' : '⏳'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{capsule.title}</p>
                      <p className="flex items-center gap-1 text-[11px] text-muted">
                        <HourglassIcon size={11} aria-hidden="true" />
                        {opened
                          ? `ouverte ${relativeFrom(capsule.openedAt!, now.getTime())}`
                          : ready
                            ? 'prête à être ouverte'
                            : `s’ouvre le ${shortDate(new Date(capsule.openAt))}`}
                      </p>
                    </div>
                    {!opened && (
                      <button
                        type="button"
                        disabled={!ready}
                        onClick={() => {
                          openCapsule(capsule.id);
                          setBurst((value) => value + 1);
                          vibrate('success');
                        }}
                        className="shrink-0 rounded-full bg-coral px-3 py-1.5 text-[11px] font-semibold text-paper disabled:bg-ice disabled:text-muted">
                        Ouvrir
                      </button>
                    )}
                  </div>
                  {opened && (
                    <div className="mt-2 rounded-2xl bg-cream p-3">
                      <p className="text-sm leading-snug text-ink">{capsule.text}</p>
                      {capsule.photo && (
                        <img src={capsule.photo} alt="" className="mt-2 h-40 w-full rounded-2xl object-cover" />
                      )}
                      <p className="mt-2 text-[10px] text-muted">
                        Scellée le {shortDate(new Date(capsule.createdAt))}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>

      {/* --- Roue des décisions --- */}
      <DecisionWheel />

      {/* --- Feuilles --- */}
      <NewLetterSheet open={letterOpen} onClose={() => setLetterOpen(false)} onSave={addLetter} />
      <NewCapsuleSheet open={capsuleOpen} onClose={() => setCapsuleOpen(false)} onSave={addCapsule} />

      <Sheet
        open={Boolean(confirming)}
        title="Un instant"
        subtitle="Cette lettre a une condition"
        onClose={() => setConfirming(null)}>
        <p className="text-sm leading-snug text-ink">
          {conditions.find((item) => item.id === confirming?.condition)?.question}
        </p>
        <p className="mt-2 text-[11px] leading-snug text-muted">
          {them.name} l’a écrite pour ce moment précis. Si ce n’est pas le cas, garde-la pour plus tard —
          elle ne s’ouvre qu’une fois.
        </p>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => {
              if (!confirming) return;
              openLetter(confirming.id);
              setReading({ ...confirming, openedAt: Date.now() });
              setConfirming(null);
              vibrate('success');
            }}
            className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper">
            Oui, je l’ouvre
          </button>
          <button
            type="button"
            onClick={() => setConfirming(null)}
            className="w-full rounded-full border border-ice bg-frost py-2.5 text-sm font-semibold text-ink">
            Pas maintenant
          </button>
        </div>
      </Sheet>

      <Sheet
        open={Boolean(reading)}
        title={conditions.find((item) => item.id === reading?.condition)?.label ?? 'Lettre'}
        subtitle={`De ${them.name}`}
        onClose={() => setReading(null)}>
        <p className="font-display text-[17px] leading-relaxed text-ink">« {reading?.text} »</p>
        {reading?.audio && <audio controls src={reading.audio} className="mt-3 w-full" />}
        <p className="mt-4 text-[11px] text-muted">
          Écrite {reading ? relativeFrom(reading.createdAt, now.getTime()) : ''}.
        </p>
      </Sheet>
    </div>
  );
}

/* --- Roue des décisions -------------------------------------------------- */

function DecisionWheel() {
  const [options, setOptions] = useState<string[]>(defaultWheel);
  const [draft, setDraft] = useState('');
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const slice = 360 / Math.max(1, options.length);

  const gradient = useMemo(() => {
    const palette = ['#E8748F', '#8FC9B4', '#F3C36B', '#F9D2DE', '#9B7EBD', '#7FB3D5'];
    const stops = options
      .map((_, index) => {
        const color = palette[index % palette.length];
        return `${color} ${index * slice}deg ${(index + 1) * slice}deg`;
      })
      .join(', ');
    return `conic-gradient(${stops})`;
  }, [options, slice]);

  const spin = () => {
    if (spinning || options.length < 2) return;
    setSpinning(true);
    setResult(null);
    const winner = Math.floor(Math.random() * options.length);
    // On vise le milieu de la part gagnante, plus 5 tours complets.
    const target = 360 * 5 + (360 - (winner * slice + slice / 2));
    setAngle((current) => current + target);
    window.setTimeout(() => {
      setResult(options[winner]);
      setSpinning(false);
      vibrate('success');
    }, 3200);
  };

  return (
    <SectionCard title="Roue des décisions" subtitle="Pour trancher sans se disputer">
      <div className="relative mx-auto h-52 w-52">
        <div
          className="absolute left-1/2 top-0 z-10 h-0 w-0 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-coral"
          aria-hidden="true" />
        <motion.div
          className="h-52 w-52 rounded-full border-4 border-cream shadow-lift"
          style={{ background: gradient }}
          animate={{ rotate: angle }}
          transition={{ duration: 3.2, ease: [0.16, 1, 0.3, 1] }}
          role="img"
          aria-label={`Roue de ${options.length} choix`} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-lg shadow-soft">
            🎡
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={spin}
        disabled={spinning || options.length < 2}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
        <ShuffleIcon size={15} aria-hidden="true" />
        {spinning ? 'La roue tourne…' : 'Lancer la roue'}
      </button>

      <AnimatePresence>
        {result && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className="mt-3 rounded-2xl bg-mint/25 px-3 py-2.5 text-center text-sm font-semibold text-ink">
            La roue a choisi : {result}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">Les choix</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <span
            key={option}
            className="flex items-center gap-1 rounded-full border border-ice bg-frost px-2.5 py-1 text-[11px] text-ink">
            {option}
            <button
              type="button"
              aria-label={`Retirer ${option}`}
              onClick={() => setOptions((current) => current.filter((item) => item !== option))}
              className="text-muted">
              <XIcon size={11} aria-hidden="true" />
            </button>
          </span>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const value = draft.trim();
          if (!value || options.includes(value) || options.length >= 8) return;
          setOptions((current) => [...current, value]);
          setDraft('');
        }}
        className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          maxLength={22}
          placeholder="Ajouter un choix…"
          aria-label="Ajouter un choix à la roue"
          className="flex-1 rounded-full border border-ice bg-frost px-4 py-2 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
        <button
          type="submit"
          disabled={!draft.trim() || options.length >= 8}
          aria-label="Ajouter"
          className="shrink-0 rounded-full bg-coral p-2 text-paper disabled:opacity-40">
          <PlusIcon size={15} aria-hidden="true" />
        </button>
      </form>
    </SectionCard>
  );
}

/* --- Feuilles de création ------------------------------------------------ */

function NewLetterSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (condition: LetterCondition, text: string, audio?: string) => void;
}) {
  const [condition, setCondition] = useState<LetterCondition>('bad-day');
  const [text, setText] = useState('');
  const [audio, setAudio] = useState<string | undefined>(undefined);

  return (
    <Sheet open={open} title="Écrire une lettre scellée" subtitle="Elle ne s’ouvrira qu’au bon moment" onClose={onClose}>
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
        La condition
      </span>
      <div className="mb-3 grid gap-1.5">
        {conditions.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={condition === item.id}
            onClick={() => setCondition(item.id)}
            className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-[12px] font-semibold transition-colors ${
              condition === item.id ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-frost text-muted'
            }`}>
            <span aria-hidden="true">{item.emoji}</span>
            {item.label}
          </button>
        ))}
      </div>

      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
          Ton message
        </span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          maxLength={500}
          placeholder="Ce que tu aurais voulu lui dire à ce moment-là…"
          className="w-full resize-none rounded-3xl border border-ice bg-frost p-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
      </label>

      <div className="mb-3">
        <VoiceRecorder value={audio} onChange={setAudio} label="Ou enregistrer un vocal" />
      </div>

      <button
        type="button"
        disabled={!text.trim() && !audio}
        onClick={() => {
          onSave(condition, text.trim() || '🎙️ Un message vocal', audio);
          setText('');
          setAudio(undefined);
          onClose();
        }}
        className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
        Sceller la lettre
      </button>
    </Sheet>
  );
}

function NewCapsuleSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (title: string, text: string, openAt: number, photo?: string) => void;
}) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

  return (
    <Sheet open={open} title="Sceller une capsule" subtitle="Impossible à rouvrir avant la date" onClose={onClose}>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">Titre</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={40}
          placeholder="Pour notre premier anniversaire"
          className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
      </label>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
          Ce que vous enfermez
        </span>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={5}
          maxLength={600}
          placeholder="Un souvenir, une promesse, une prédiction…"
          className="w-full resize-none rounded-3xl border border-ice bg-frost p-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
      </label>
      <label className="mb-3 block">
        <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
          Date d’ouverture
        </span>
        <input
          type="date"
          value={date}
          min={tomorrow}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink focus:border-coral focus:outline-none" />
      </label>

      {photo ? (
        <div className="mb-3">
          <img src={photo} alt="" className="h-36 w-full rounded-2xl object-cover" />
          <button
            type="button"
            onClick={() => setPhoto(undefined)}
            className="mt-2 w-full rounded-full border border-ice bg-frost py-2 text-[11px] font-semibold text-muted">
            Retirer la photo
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <PhotoPicker onPick={setPhoto} captureLabel="Photo" galleryLabel="Galerie" compact />
        </div>
      )}

      <button
        type="button"
        disabled={!title.trim() || !text.trim() || !date}
        onClick={() => {
          onSave(title.trim(), text.trim(), new Date(`${date}T00:00:00`).getTime(), photo);
          setTitle('');
          setText('');
          setDate('');
          setPhoto(undefined);
          onClose();
        }}
        className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
        Sceller la capsule
      </button>
    </Sheet>
  );
}
