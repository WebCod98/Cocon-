import { useEffect, useMemo, useRef, useState } from 'react';
import { SendIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { VoiceRecorder } from '../../components/VoiceRecorder';
import { useCouple } from '../../state/CoupleContext';
import { mimeEmojis, mimeSubjects } from '../../data/prompts';
import { shuffle } from '../../utils/text';
import type { GameProps } from './types';

interface MimePayload {
  subjectId: string;
  audio?: string;
  emojis?: string[];
  choices: string[];
  guess?: string;
  correct?: boolean;
}

/**
 * Mimes audio ou « GIF » : on fait deviner un sujet avec un court vocal ou une
 * suite de trois emojis. Le/la partenaire tranche parmi quatre propositions.
 */
export default function Mimes({ meta, onFinish, earned }: GameProps) {
  const { doc, them, mySlot, settings, createChallenge, updateChallenge, removeChallenge } = useCouple();

  const challenge = doc.challenges.find((item) => item.game === meta.id && item.status === 'open');
  const payload = challenge?.payload as unknown as MimePayload | undefined;
  const iMimed = challenge?.from === mySlot;
  const scored = useRef(false);

  const [subject] = useState(() => shuffle(mimeSubjects, Date.now())[0]);
  const [audio, setAudio] = useState<string | undefined>(undefined);
  const [emojis, setEmojis] = useState<string[]>([]);

  const choices = useMemo(() => {
    const decoys = shuffle(
      mimeSubjects.filter((item) => item.id !== subject.id),
      Date.now() + 7
    )
      .slice(0, 3)
      .map((item) => item.label);
    return shuffle([subject.label, ...decoys], Date.now() + 13);
  }, [subject]);

  useEffect(() => {
    if (!payload || payload.correct === undefined || scored.current) return;
    scored.current = true;
    onFinish({ won: payload.correct, score: payload.correct ? 1 : 0 });
  }, [payload, onFinish]);

  const send = () => {
    if (!audio && emojis.length === 0) return;
    const id = createChallenge(meta.id, {
      subjectId: subject.id,
      audio,
      emojis,
      choices,
    } as unknown as Record<string, unknown>);

    if (settings.demoPartner) {
      window.setTimeout(() => {
        const found = Math.random() < 0.6;
        const guess = found ? subject.label : choices.find((item) => item !== subject.label)!;
        updateChallenge(id, {
          payload: {
            subjectId: subject.id,
            audio,
            emojis,
            choices,
            guess,
            correct: found,
          } as unknown as Record<string, unknown>,
          turn: mySlot,
        });
      }, 2600);
    }
  };

  const answer = (choice: string) => {
    if (!challenge || !payload) return;
    const target = mimeSubjects.find((item) => item.id === payload.subjectId)?.label;
    updateChallenge(challenge.id, {
      payload: { ...payload, guess: choice, correct: choice === target } as unknown as Record<string, unknown>,
      turn: mySlot,
    });
  };

  const restart = () => {
    if (challenge) removeChallenge(challenge.id);
    setAudio(undefined);
    setEmojis([]);
    scored.current = false;
  };

  /* --- Verdict --- */
  if (payload?.correct !== undefined) {
    const target = mimeSubjects.find((item) => item.id === payload.subjectId)?.label;
    return (
      <GameShell meta={meta} rule="Le verdict est tombé." onRestart={restart}>
        <GameResult
          won={payload.correct}
          title={payload.correct ? 'Deviné !' : 'Pas cette fois'}
          detail={`C’était « ${target} » — réponse donnée : « ${payload.guess} »`}
          coins={earned} />
        {payload.emojis && payload.emojis.length > 0 && (
          <SectionCard title="L’indice">
            <p className="text-center text-4xl">{payload.emojis.join(' ')}</p>
          </SectionCard>
        )}
      </GameShell>
    );
  }

  /* --- À moi de deviner --- */
  if (challenge && payload && !iMimed) {
    return (
      <GameShell meta={meta} rule={`${them.name} a mimé quelque chose. Choisis la bonne proposition.`} onRestart={restart}>
        <SectionCard title="Son indice">
          {payload.audio && <audio controls src={payload.audio} className="w-full" />}
          {payload.emojis && payload.emojis.length > 0 && (
            <p className="py-4 text-center text-5xl">{payload.emojis.join(' ')}</p>
          )}
          <div className="mt-2 grid gap-2">
            {payload.choices.map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => answer(choice)}
                className="rounded-2xl border border-ice bg-frost px-3 py-3 text-left text-sm font-semibold text-ink">
                {choice}
              </button>
            ))}
          </div>
        </SectionCard>
      </GameShell>
    );
  }

  /* --- En attente --- */
  if (challenge && iMimed) {
    return (
      <GameShell meta={meta} rule="Ton indice est parti." onRestart={restart}>
        <SectionCard title="En attente" subtitle={`${them.name} doit deviner`}>
          <p className="rounded-2xl bg-frost px-3 py-6 text-center text-sm text-muted">
            Sujet mimé : <strong className="text-ink">{mimeSubjects.find((i) => i.id === payload?.subjectId)?.label}</strong>
          </p>
        </SectionCard>
      </GameShell>
    );
  }

  /* --- Phase de mime --- */
  return (
    <GameShell meta={meta} rule="Fais deviner le sujet avec un vocal très court, ou trois emojis. Sans le dire !" onRestart={restart}>
      <SectionCard title="À faire deviner" subtitle="Personne d’autre ne le voit">
        <p className="rounded-2xl bg-blush/50 px-3 py-3 text-center font-display text-lg font-semibold text-ink">
          {subject.label}
        </p>

        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">Version audio</p>
        <VoiceRecorder value={audio} onChange={setAudio} maxSeconds={15} label="Enregistrer un mime vocal" />

        <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Ou version « GIF » — 3 emojis max
        </p>
        <p className="mb-2 min-h-[44px] rounded-2xl border border-ice bg-frost py-2 text-center text-3xl">
          {emojis.length > 0 ? emojis.join(' ') : <span className="text-sm text-muted">Rien encore</span>}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {mimeEmojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Ajouter ${emoji}`}
              onClick={() =>
                setEmojis((current) => (current.length >= 3 ? [emoji] : [...current, emoji]))
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-ice bg-frost text-lg">
              {emoji}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={!audio && emojis.length === 0}
          onClick={send}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
          <SendIcon size={15} aria-hidden="true" />
          Envoyer à {them.name}
        </button>
      </SectionCard>
    </GameShell>
  );
}
