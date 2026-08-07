import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { useCouple } from '../../state/CoupleContext';
import { masterQuiz } from '../../data/prompts';
import { fillNames, shuffle } from '../../utils/text';
import type { GameProps } from './types';

const ROUND = 6;
const PASS = 4;

/** Questionnaire a choix multiples sur votre histoire. */
export default function MasterQuiz({ meta, onFinish, earned }: GameProps) {
  const { me, them } = useCouple();
  const [seed, setSeed] = useState(() => Date.now());
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const questions = useMemo(() => shuffle(masterQuiz, seed).slice(0, ROUND), [seed]);
  const question = questions[index];

  const answer = (choice: number) => {
    if (picked !== null) return;
    setPicked(choice);
    const isRight = choice === question.answer;
    if (isRight) setCorrect((value) => value + 1);

    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        const total = correct + (isRight ? 1 : 0);
        setDone(true);
        onFinish({ won: total >= PASS, score: total });
      } else {
        setIndex((value) => value + 1);
        setPicked(null);
      }
    }, 900);
  };

  const restart = () => {
    setSeed(Date.now());
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setDone(false);
  };

  if (done) {
    return (
      <GameShell meta={meta} rule="Vos dates et vos détails, à choix multiples." onRestart={restart}>
        <GameResult
          won={correct >= PASS}
          title={`${correct}/${questions.length} bonnes réponses`}
          detail={
            correct >= PASS
              ? 'Vous vous souvenez de tout — ou presque.'
              : `Il en fallait ${PASS}. Rejouez : les questions changent d’ordre.`
          }
          coins={earned} />
        <SectionCard title="Les réponses" subtitle="La version officielle du couple">
          <ul className="space-y-2">
            {questions.map((item) => (
              <li key={item.id} className="rounded-3xl border border-ice bg-frost p-3">
                <p className="text-[12px] font-semibold leading-snug text-ink">
                  {fillNames(item.question, me.name, them.name)}
                </p>
                <p className="mt-1 text-[11px] text-mint">
                  ✓ {fillNames(item.choices[item.answer], me.name, them.name)}
                </p>
              </li>
            ))}
          </ul>
        </SectionCard>
      </GameShell>
    );
  }

  return (
    <GameShell
      meta={meta}
      rule={`${ROUND} questions sur votre histoire. Il en faut ${PASS} bonnes pour empocher les pièces.`}>
      <SectionCard title={`Question ${index + 1}/${questions.length}`} subtitle={`${correct} bonne(s) jusqu’ici`}>
        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-ice">
          <motion.div
            className="h-full rounded-full bg-coral"
            animate={{ width: `${((index + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }} />
        </div>

        <p className="font-display text-base leading-snug text-ink">
          {fillNames(question.question, me.name, them.name)}
        </p>
        {question.hint && <p className="mt-1 text-[11px] text-muted">{question.hint}</p>}

        <div className="mt-3 grid gap-2">
          {question.choices.map((choice, choiceIndex) => {
            const isAnswer = choiceIndex === question.answer;
            const isPicked = picked === choiceIndex;
            const reveal = picked !== null;
            return (
              <motion.button
                key={choice}
                type="button"
                whileTap={{ scale: 0.98 }}
                disabled={reveal}
                onClick={() => answer(choiceIndex)}
                className={`flex items-center gap-2 rounded-2xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  reveal && isAnswer
                    ? 'border-mint bg-mint/25 text-ink'
                    : reveal && isPicked
                      ? 'border-coral bg-coral/15 text-ink'
                      : 'border-ice bg-frost text-ink'
                }`}>
                <span className="flex-1">{fillNames(choice, me.name, them.name)}</span>
                {reveal && isAnswer && <CheckIcon size={15} className="text-mint" aria-hidden="true" />}
                {reveal && isPicked && !isAnswer && <XIcon size={15} className="text-coral" aria-hidden="true" />}
              </motion.button>
            );
          })}
        </div>
      </SectionCard>
    </GameShell>
  );
}
