import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PlayIcon, SquareIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { melodies, type Melody } from '../../data/prompts';
import { shuffle } from '../../utils/text';
import type { GameProps } from './types';

const ROUND = 5;
const PASS = 3;

const semitones: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
};

/** « C4 » → 261.63 Hz (La4 = 440 Hz comme référence). */
function frequency(note: string) {
  const match = /^([A-G]#?)(\d)$/.exec(note);
  if (!match) return 440;
  const [, pitch, octave] = match;
  const midi = (Number(octave) + 1) * 12 + semitones[pitch];
  return 440 * 2 ** ((midi - 69) / 12);
}

/**
 * Blind test : les melodies sont synthetisees dans le navigateur (Web Audio),
 * ce qui evite tout fichier audio et fonctionne hors-ligne.
 */
export default function BlindTest({ meta, onFinish, earned }: GameProps) {
  const [seed, setSeed] = useState(() => Date.now());
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  const rounds = useMemo(() => shuffle(melodies, seed).slice(0, ROUND), [seed]);
  const melody = rounds[index];
  const choices = useMemo(() => shuffle(melody.choices, seed + index), [melody, seed, index]);

  useEffect(
    () => () => {
      stopRef.current?.();
      void audioRef.current?.close();
    },
    []
  );

  const stop = () => {
    stopRef.current?.();
    stopRef.current = null;
    setPlaying(false);
  };

  /** Joue l'extrait — 10 s maximum, comme au vrai blind test. */
  const play = (item: Melody) => {
    stop();
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const context = audioRef.current ?? new Ctor();
    audioRef.current = context;
    void context.resume();

    const master = context.createGain();
    master.gain.value = 0.18;
    master.connect(context.destination);

    const eighth = 0.19;
    let cursor = context.currentTime + 0.05;
    const nodes: OscillatorNode[] = [];

    item.notes.forEach(([note, beats]) => {
      const duration = beats * eighth;
      if (cursor - context.currentTime > 10) return;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = frequency(note);
      gain.gain.setValueAtTime(0.0001, cursor);
      gain.gain.exponentialRampToValueAtTime(1, cursor + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, cursor + duration * 0.95);
      oscillator.connect(gain).connect(master);
      oscillator.start(cursor);
      oscillator.stop(cursor + duration);
      nodes.push(oscillator);
      cursor += duration;
    });

    setPlaying(true);
    const endsIn = (cursor - context.currentTime) * 1000;
    const timer = window.setTimeout(() => setPlaying(false), endsIn);
    stopRef.current = () => {
      window.clearTimeout(timer);
      nodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          /* deja arrete */
        }
      });
      master.disconnect();
    };
  };

  const answer = (choice: string) => {
    if (picked) return;
    stop();
    setPicked(choice);
    const isRight = choice === melody.title;
    if (isRight) setCorrect((value) => value + 1);

    window.setTimeout(() => {
      if (index + 1 >= rounds.length) {
        const total = correct + (isRight ? 1 : 0);
        setDone(true);
        onFinish({ won: total >= PASS, score: total });
      } else {
        setIndex((value) => value + 1);
        setPicked(null);
      }
    }, 1000);
  };

  const restart = () => {
    stop();
    setSeed(Date.now());
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
  };

  if (done) {
    return (
      <GameShell meta={meta} rule="Reconnaître un air en dix secondes." onRestart={restart}>
        <GameResult
          won={correct >= PASS}
          title={`${correct}/${rounds.length} extraits reconnus`}
          detail={correct >= PASS ? 'Belle oreille !' : `Il en fallait ${PASS}. On remet une pièce ?`}
          coins={earned} />
      </GameShell>
    );
  }

  return (
    <GameShell
      meta={meta}
      rule="Écoutez l’extrait puis choisissez le bon titre. Les mélodies sont jouées par le téléphone : pas besoin de réseau."
      onRestart={restart}>
      <SectionCard title={`Extrait ${index + 1}/${rounds.length}`} subtitle={`${correct} trouvé(s)`}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={() => (playing ? stop() : play(melody))}
          className="flex w-full items-center justify-center gap-2 rounded-3xl bg-night py-6 text-sm font-semibold text-paper">
          {playing ? <SquareIcon size={20} aria-hidden="true" /> : <PlayIcon size={20} aria-hidden="true" />}
          {playing ? 'Stop' : 'Écouter l’extrait'}
        </motion.button>

        <div className="mt-3 grid gap-2">
          {choices.map((choice) => {
            const isAnswer = choice === melody.title;
            const isPicked = picked === choice;
            const reveal = picked !== null;
            return (
              <button
                key={choice}
                type="button"
                disabled={reveal}
                onClick={() => answer(choice)}
                className={`rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  reveal && isAnswer
                    ? 'border-mint bg-mint/25 text-ink'
                    : reveal && isPicked
                      ? 'border-coral bg-coral/15 text-ink'
                      : 'border-ice bg-frost text-ink'
                }`}>
                {choice}
              </button>
            );
          })}
        </div>
      </SectionCard>
    </GameShell>
  );
}
