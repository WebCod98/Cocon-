import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DeleteIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { codeColors } from '../../data/prompts';
import { vibrate } from '../../lib/haptics';
import type { GameProps } from './types';

const LENGTH = 4;
const MAX_TRIES = 10;

type Peg = (typeof codeColors)[number]['id'];

interface Attempt {
  guess: Peg[];
  exact: number;
  misplaced: number;
}

const secretCode = (): Peg[] =>
  Array.from({ length: LENGTH }, () => codeColors[Math.floor(Math.random() * codeColors.length)].id);

/** Compare une proposition au code : bien placés puis présents mais mal placés. */
function score(guess: Peg[], secret: Peg[]) {
  const remainingSecret: Peg[] = [];
  const remainingGuess: Peg[] = [];
  let exact = 0;

  guess.forEach((peg, position) => {
    if (peg === secret[position]) exact += 1;
    else {
      remainingSecret.push(secret[position]);
      remainingGuess.push(peg);
    }
  });

  let misplaced = 0;
  remainingGuess.forEach((peg) => {
    const found = remainingSecret.indexOf(peg);
    if (found >= 0) {
      misplaced += 1;
      remainingSecret.splice(found, 1);
    }
  });

  return { exact, misplaced };
}

/** Mastermind à 4 couleurs parmi 6, en 10 essais maximum. */
export default function CodeSecret({ meta, onFinish, earned }: GameProps) {
  const [secret, setSecret] = useState<Peg[]>(secretCode);
  const [draft, setDraft] = useState<Peg[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const solved = attempts.some((attempt) => attempt.exact === LENGTH);
  const over = solved || attempts.length >= MAX_TRIES;

  useEffect(() => {
    if (!over) return;
    onFinish({ won: solved, score: solved ? MAX_TRIES - attempts.length + 1 : 0 });
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = () => {
    if (draft.length !== LENGTH || over) return;
    const result = score(draft, secret);
    setAttempts((current) => [...current, { guess: draft, ...result }]);
    setDraft([]);
    vibrate(result.exact === LENGTH ? 'success' : 'tap');
  };

  const restart = () => {
    setSecret(secretCode());
    setDraft([]);
    setAttempts([]);
  };

  const hex = (peg: Peg) => codeColors.find((item) => item.id === peg)!.hex;
  const label = (peg: Peg) => codeColors.find((item) => item.id === peg)!.label;

  return (
    <GameShell
      meta={meta}
      rule={`Un code de ${LENGTH} couleurs, ${MAX_TRIES} essais. Après chaque tentative : ● bien placée, ○ présente mais mal placée.`}
      onRestart={restart}>
      {over && (
        <GameResult
          won={solved}
          title={solved ? `Code trouvé en ${attempts.length} essais` : 'Code non trouvé'}
          detail={solved ? undefined : `Le code était : ${secret.map(label).join(' · ')}`}
          coins={earned} />
      )}

      <SectionCard title="Ta proposition" subtitle={`Essai ${Math.min(attempts.length + 1, MAX_TRIES)}/${MAX_TRIES}`}>
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: LENGTH }, (_, position) => (
            <span
              key={position}
              className="h-12 w-12 rounded-full border-2 border-ice"
              style={{ backgroundColor: draft[position] ? hex(draft[position]) : 'transparent' }}
              aria-label={draft[position] ? label(draft[position]) : 'vide'} />
          ))}
          <button
            type="button"
            onClick={() => setDraft((current) => current.slice(0, -1))}
            disabled={draft.length === 0}
            aria-label="Effacer la dernière couleur"
            className="ml-1 rounded-full border border-ice bg-frost p-2 text-muted disabled:opacity-30">
            <DeleteIcon size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {codeColors.map((color) => (
            <motion.button
              key={color.id}
              type="button"
              whileTap={{ scale: 0.9 }}
              disabled={draft.length >= LENGTH || over}
              onClick={() => setDraft((current) => [...current, color.id])}
              aria-label={color.label}
              style={{ backgroundColor: color.hex }}
              className="h-11 w-11 rounded-full border-2 border-cream shadow-soft disabled:opacity-40" />
          ))}
        </div>

        <button
          type="button"
          disabled={draft.length !== LENGTH || over}
          onClick={submit}
          className="mt-4 w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
          Tenter ce code
        </button>
      </SectionCard>

      <SectionCard title="Tes essais" subtitle={`${MAX_TRIES - attempts.length} restants`}>
        {attempts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-ice bg-frost/60 px-3 py-6 text-center text-[11px] text-muted">
            Aucun essai encore. Lancez-vous : même une erreur donne de l’information.
          </p>
        ) : (
          <ul className="space-y-2">
            {attempts.map((attempt, position) => (
              <li
                key={position}
                className="flex items-center gap-3 rounded-2xl border border-ice bg-frost px-3 py-2">
                <span className="w-5 text-[11px] font-semibold text-muted">{position + 1}</span>
                <span className="flex gap-1.5">
                  {attempt.guess.map((peg, pegIndex) => (
                    <span
                      key={pegIndex}
                      className="h-6 w-6 rounded-full border border-cream"
                      style={{ backgroundColor: hex(peg) }}
                      aria-label={label(peg)} />
                  ))}
                </span>
                <span className="ml-auto text-[12px] font-semibold text-ink">
                  <span className="text-mint">{'●'.repeat(attempt.exact) || '—'}</span>{' '}
                  <span className="text-sun">{'○'.repeat(attempt.misplaced)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    </GameShell>
  );
}
