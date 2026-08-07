import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { EraserIcon, SendIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { useCouple } from '../../state/CoupleContext';
import { drawWords } from '../../data/prompts';
import { normalizeAnswer, shuffle } from '../../utils/text';
import type { GameProps } from './types';

interface DrawPayload {
  word: string;
  image: string;
  guess?: string;
  correct?: boolean;
}

const palette = ['#3B2A32', '#E8748F', '#8FC9B4', '#F3C36B', '#7FB3D5'];

/** Pictionary asynchrone : l'un dessine, l'autre devine en ouvrant l'app. */
export default function DessinezDevinez({ meta, onFinish, earned }: GameProps) {
  const { doc, them, mySlot, settings, createChallenge, updateChallenge, removeChallenge } = useCouple();

  const challenge = doc.challenges.find((item) => item.game === meta.id && item.status === 'open');
  const payload = challenge?.payload as unknown as DrawPayload | undefined;
  const iDrew = challenge?.from === mySlot;

  const [word] = useState(() => shuffle(drawWords, Date.now())[0]);
  const [guess, setGuess] = useState('');
  const [color, setColor] = useState(palette[0]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const scored = useRef(false);

  /* Prépare le canvas une fois monté (fond crème, trait rond). */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || (challenge && !iDrew)) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.scale(ratio, ratio);
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, rect.width, rect.height);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.lineWidth = 4;
  }, [challenge, iDrew]);

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    const { x, y } = point(event);
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(x, y);
  };

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;
    const { x, y } = point(event);
    context.lineTo(x, y);
    context.stroke();
  };

  const stop = () => {
    drawing.current = false;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const rect = canvas.getBoundingClientRect();
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, rect.width, rect.height);
  };

  const send = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = canvas.toDataURL('image/jpeg', 0.6);
    const id = createChallenge(meta.id, { word, image } as unknown as Record<string, unknown>);
    if (settings.demoPartner) {
      window.setTimeout(() => {
        const found = Math.random() < 0.6;
        updateChallenge(id, {
          payload: {
            word,
            image,
            guess: found ? word : shuffle(drawWords, Date.now())[1],
            correct: found,
          } as unknown as Record<string, unknown>,
          turn: mySlot,
        });
      }, 2600);
    }
  };

  const submitGuess = () => {
    if (!challenge || !payload) return;
    const correct = normalizeAnswer(guess) === normalizeAnswer(payload.word);
    updateChallenge(challenge.id, {
      payload: { ...payload, guess: guess.trim(), correct } as unknown as Record<string, unknown>,
      turn: mySlot,
    });
  };

  /* Le résultat tombe : on marque la partie une seule fois. */
  useEffect(() => {
    if (!payload || payload.correct === undefined || scored.current) return;
    scored.current = true;
    onFinish({ won: payload.correct, score: payload.correct ? 1 : 0 });
  }, [payload, onFinish]);

  const restart = () => {
    if (challenge) removeChallenge(challenge.id);
    setGuess('');
    scored.current = false;
    clear();
  };

  /* --- Résultat --- */
  if (payload?.correct !== undefined) {
    return (
      <GameShell meta={meta} rule="Le verdict est tombé." onRestart={restart}>
        <GameResult
          won={payload.correct}
          title={payload.correct ? 'Trouvé !' : 'Raté'}
          detail={`Le mot était « ${payload.word} » — réponse donnée : « ${payload.guess} »`}
          coins={earned} />
        <SectionCard title="Le chef-d’œuvre">
          <img src={payload.image} alt={`Dessin représentant ${payload.word}`} className="w-full rounded-3xl border border-ice" />
        </SectionCard>
      </GameShell>
    );
  }

  /* --- À moi de deviner --- */
  if (challenge && payload && !iDrew) {
    return (
      <GameShell meta={meta} rule={`${them.name} a dessiné quelque chose. À toi de trouver quoi.`} onRestart={restart}>
        <SectionCard title="Son dessin" subtitle="Un seul essai">
          <img src={payload.image} alt="Dessin à deviner" className="w-full rounded-3xl border border-ice" />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (guess.trim()) submitGuess();
            }}
            className="mt-3 flex gap-2">
            <input
              value={guess}
              onChange={(event) => setGuess(event.target.value)}
              placeholder="C’est un/une…"
              aria-label="Ta proposition"
              className="flex-1 rounded-full border border-ice bg-frost px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
            <button
              type="submit"
              disabled={!guess.trim()}
              className="shrink-0 rounded-full bg-coral px-4 py-2.5 text-sm font-semibold text-paper disabled:opacity-40">
              Valider
            </button>
          </form>
        </SectionCard>
      </GameShell>
    );
  }

  /* --- En attente de sa réponse --- */
  if (challenge && iDrew) {
    return (
      <GameShell meta={meta} rule="Ton dessin est parti." onRestart={restart}>
        <SectionCard title="En route" subtitle={`${them.name} doit encore deviner`}>
          <img src={payload?.image} alt="Ton dessin" className="w-full rounded-3xl border border-ice" />
          <p className="mt-3 rounded-2xl bg-frost px-3 py-3 text-center text-[12px] text-muted">
            Mot à faire deviner : <strong className="text-ink">{payload?.word}</strong>
          </p>
        </SectionCard>
      </GameShell>
    );
  }

  /* --- Phase de dessin --- */
  return (
    <GameShell meta={meta} rule="Dessine le mot ci-dessous. Interdiction d’écrire !" onRestart={clear}>
      <SectionCard title="À dessiner" subtitle="Personne d’autre ne le voit">
        <p className="rounded-2xl bg-blush/50 px-3 py-3 text-center font-display text-xl font-semibold text-ink">
          {word}
        </p>

        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex gap-1.5">
            {palette.map((item) => (
              <button
                key={item}
                type="button"
                aria-label={`Couleur ${item}`}
                aria-pressed={color === item}
                onClick={() => setColor(item)}
                style={{ backgroundColor: item }}
                className={`h-7 w-7 rounded-full border-2 ${color === item ? 'border-ink' : 'border-cream'}`} />
            ))}
          </div>
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 rounded-full border border-ice bg-frost px-3 py-1.5 text-[11px] font-semibold text-muted">
            <EraserIcon size={13} aria-hidden="true" />
            Effacer
          </button>
        </div>

        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerLeave={stop}
          className="mt-3 h-64 w-full touch-none rounded-3xl border border-ice bg-white"
          aria-label="Zone de dessin" />

        <button
          type="button"
          onClick={send}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-paper">
          <SendIcon size={15} aria-hidden="true" />
          Envoyer à {them.name}
        </button>
      </SectionCard>
    </GameShell>
  );
}
