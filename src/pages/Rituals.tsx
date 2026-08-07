import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CameraIcon, FingerprintIcon, MoonStarIcon, SendIcon, SunriseIcon } from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { useCouple } from '../state/CoupleContext';
import { useNow } from '../hooks/useNow';
import { speciesOption } from '../data/companions';
import { dayLabelIn, hourIn, momentForHour, relativeFrom, timeIn } from '../utils/time';
import type { Moment, MoodKey } from '../types';

const moods: { id: MoodKey; label: string; emoji: string; reply: string }[] = [
  { id: 'happy', label: 'Heureux·se', emoji: '😄', reply: 'Il saute partout avec toi !' },
  { id: 'tired', label: 'Fatigué·e', emoji: '🥱', reply: 'Il baille et se blottit contre toi.' },
  { id: 'stressed', label: 'Stressé·e', emoji: '😖', reply: 'Il pose sa tête sur ton épaule.' },
  { id: 'cuddles', label: 'Besoin de câlins', emoji: '🤗', reply: 'Il ouvre grand les bras.' },
  { id: 'inlove', label: 'Amoureux·se', emoji: '🥰', reply: 'Il fait pleuvoir des petits cœurs.' },
  { id: 'down', label: 'Pas la forme', emoji: '🌧️', reply: 'Il reste assis tout près, sans rien dire.' },
];

export function Rituals() {
  const { doc, me, them, mySlot, theirSlot, sendNote, markNotesRead, setMood, sendThought, flashMood } =
    useCouple();
  const now = useNow(30000);

  const companionName = doc.companion?.name ?? speciesOption(doc.companion?.species).name;
  const myMoment = momentForHour(hourIn(me.timeZone, now));
  const theirMoment = momentForHour(hourIn(them.timeZone, now));
  const [view, setView] = useState<Moment>(myMoment);
  const [draft, setDraft] = useState('');
  const [audio, setAudio] = useState<string | undefined>(undefined);
  const [sent, setSent] = useState(false);

  const fromPartner = useMemo(
    () => doc.notes.find((note) => note.author === theirSlot && note.moment === view),
    [doc.notes, theirSlot, view]
  );
  const mine = useMemo(() => doc.notes.filter((note) => note.author === mySlot), [doc.notes, mySlot]);

  const myMood = doc.moods.find((entry) => entry.author === mySlot);
  const theirMood = doc.moods.find((entry) => entry.author === theirSlot);
  const theirMoodMeta = moods.find((item) => item.id === theirMood?.mood);
  const myMoodMeta = moods.find((item) => item.id === myMood?.mood);

  /* Lire le mot du partenaire le marque comme lu de son côté. */
  useEffect(() => {
    if (fromPartner && !fromPartner.readAt) markNotesRead(view);
  }, [fromPartner, markNotesRead, view]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft.trim() && !audio) return;
    sendNote(draft.trim() || '🎙️ Un message vocal', view, audio);
    setDraft('');
    setAudio(undefined);
    setSent(true);
    window.setTimeout(() => setSent(false), 2600);
  };

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <div className="rounded-4xl border border-ice bg-cream p-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Ton espace solo</p>
        <h1 className="font-display text-xl font-semibold text-ink">
          {myMoment === 'morning' ? 'Bon matin, ' : 'Bonne soirée, '}
          {me.name}
        </h1>
        <p className="mt-1 text-xs capitalize text-muted">{dayLabelIn(me.timeZone, now)}</p>
        <p className="mt-3 rounded-2xl bg-frost px-3 py-2 text-[11px] leading-snug text-muted">
          Chacun son fuseau : il est {timeIn(me.timeZone, now)} chez toi et {timeIn(them.timeZone, now)} chez{' '}
          {them.name}. Tu lis {myMoment === 'morning' ? 'ton mot du matin' : 'ta déclaration du soir'} pendant
          qu’il/elle découvre {theirMoment === 'morning' ? 'son mot du matin' : 'sa déclaration du soir'}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Rituel affiché">
        <RitualTab
          active={view === 'morning'}
          onClick={() => setView('morning')}
          icon={<SunriseIcon size={16} aria-hidden="true" />}
          label="Mot du matin" />
        <RitualTab
          active={view === 'evening'}
          onClick={() => setView('evening')}
          icon={<MoonStarIcon size={16} aria-hidden="true" />}
          label="Déclaration du soir" />
      </div>

      <motion.article
        key={view}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className={`rounded-4xl border p-5 shadow-soft ${
          view === 'morning' ? 'border-sun/40 bg-sun/15' : 'border-night/25 bg-night text-paper'
        }`}>
        <p
          className={`text-[11px] font-semibold uppercase tracking-wide ${
            view === 'morning' ? 'text-ink/60' : 'text-paper/60'
          }`}>
          {view === 'morning' ? 'Pour bien démarrer' : 'Pour t’apaiser avant de dormir'}
        </p>
        {fromPartner ? (
          <>
            <p className={`mt-3 font-display text-[17px] leading-relaxed ${view === 'morning' ? 'text-ink' : ''}`}>
              « {fromPartner.text} »
            </p>
            {fromPartner.audio && <audio controls src={fromPartner.audio} className="mt-3 w-full" />}
            <p className={`mt-4 text-xs ${view === 'morning' ? 'text-ink/60' : 'text-paper/70'}`}>
              — {them.name} · {relativeFrom(fromPartner.createdAt, now.getTime())}
            </p>
          </>
        ) : (
          <p className={`mt-3 text-sm leading-relaxed ${view === 'morning' ? 'text-ink' : ''}`}>
            {them.name} n’a pas encore déposé son message. {companionName} monte la garde et te préviendra
            dès qu’il arrive {speciesOption(doc.companion?.species).emoji}
          </p>
        )}
      </motion.article>

      <SectionCard
        title={`Écrire à ${them.name}`}
        subtitle={`Livré à son ${view === 'morning' ? 'réveil' : 'coucher'}, heure de ${them.city}`}>
        <form onSubmit={submit}>
          <label htmlFor="note" className="sr-only">
            Ton message
          </label>
          <textarea
            id="note"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={4}
            maxLength={320}
            placeholder={
              view === 'morning'
                ? 'Une pensée douce pour bien démarrer sa journée…'
                : 'Un mot calme pour l’accompagner jusqu’au sommeil…'
            }
            className="w-full resize-none rounded-3xl border border-ice bg-frost p-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />

          <div className="mt-2">
            <VoiceRecorder value={audio} onChange={setAudio} label="Ajouter une note vocale apaisante" />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-muted">{draft.length}/320</span>
            <button
              type="submit"
              disabled={!draft.trim() && !audio}
              className="flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40">
              <SendIcon size={15} aria-hidden="true" />
              Confier à {companionName}
            </button>
          </div>
          <p aria-live="polite" className="mt-2 text-[12px] font-semibold text-mint">
            {sent ? `Message déposé — ${companionName} est en route ✉️` : ''}
          </p>
        </form>
      </SectionCard>

      <SectionCard
        title="Météo émotionnelle"
        subtitle={`${companionName} adapte sa posture à votre humeur`}>
        <div className="grid grid-cols-3 gap-2">
          {moods.map((item) => {
            const active = myMood?.mood === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setMood(item.id);
                  flashMood(item.id === 'inlove' ? 'love' : item.id === 'tired' ? 'sleepy' : 'happy', item.reply);
                }}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-[11px] font-semibold transition-colors ${
                  active ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-frost text-muted'
                }`}>
                <span className="text-xl" aria-hidden="true">
                  {item.emoji}
                </span>
                <span className="text-center leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid gap-2">
          <p className="rounded-2xl bg-frost px-3 py-2 text-[11px] leading-snug text-muted">
            {myMoodMeta
              ? `Toi : ${myMoodMeta.emoji} ${myMoodMeta.label} — ${myMoodMeta.reply}`
              : 'Tu n’as pas encore dit comment tu vas aujourd’hui.'}
          </p>
          <p className="rounded-2xl bg-frost px-3 py-2 text-[11px] leading-snug text-muted">
            {theirMoodMeta
              ? `${them.name} : ${theirMoodMeta.emoji} ${theirMoodMeta.label} · ${relativeFrom(theirMood!.createdAt, now.getTime())}`
              : `${them.name} n’a pas encore partagé son humeur.`}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Présence" subtitle="Deux gestes pour dire « je suis là »">
        <div className="grid gap-2">
          <button
            type="button"
            onClick={sendThought}
            className="flex items-center gap-3 rounded-3xl bg-coral px-4 py-3 text-left text-paper transition-transform active:scale-[0.98]">
            <FingerprintIcon size={19} aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-sm font-semibold">Bouton Pensée</span>
              <span className="block text-[11px] text-paper/85">Une vibration en battement de cœur</span>
            </span>
          </button>
          <Link
            to="/polaroid"
            className="flex items-center gap-3 rounded-3xl border border-ice bg-frost px-4 py-3 text-ink transition-transform active:scale-[0.98]">
            <CameraIcon size={18} className="text-coral" aria-hidden="true" />
            <span className="flex-1">
              <span className="block text-sm font-semibold">Polaroid 24 h</span>
              <span className="block text-[11px] text-muted">Une photo qui s’efface demain</span>
            </span>
          </Link>
        </div>
      </SectionCard>

      {mine.length > 0 && (
        <SectionCard title="Ce que tu as déjà envoyé" subtitle="Tes derniers mots">
          <ul className="space-y-2">
            {mine.slice(0, 6).map((note) => (
              <li key={note.id} className="rounded-3xl border border-ice bg-frost p-3">
                <p className="text-[11px] font-semibold text-muted">
                  {note.moment === 'morning' ? '☀️ Matin' : '🌙 Soir'} ·{' '}
                  {relativeFrom(note.createdAt, now.getTime())}
                  {note.readAt && <span className="ml-1 text-mint">· lu</span>}
                </p>
                <p className="mt-1 text-sm leading-snug text-ink">{note.text}</p>
                {note.audio && <audio controls src={note.audio} className="mt-2 w-full" />}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}

function RitualTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-semibold transition-colors ${
        active ? 'border-coral bg-blush/60 text-ink' : 'border-ice bg-cream text-muted'
      }`}>
      {icon}
      {label}
    </button>
  );
}
