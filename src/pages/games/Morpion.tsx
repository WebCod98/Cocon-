import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SendIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { useCouple } from '../../state/CoupleContext';
import { gages } from '../../data/prompts';
import { shuffle } from '../../utils/text';
import type { GameProps } from './types';

type Mark = '💗' | '⭐' | null;

const lines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function winnerOf(board: Mark[]) {
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

/** Coup de l'adversaire : gagner si possible, sinon bloquer, sinon au hasard. */
function bestMove(board: Mark[], mark: Mark, rival: Mark) {
  const empty = board.map((cell, index) => (cell ? -1 : index)).filter((index) => index >= 0);

  for (const index of empty) {
    const test = [...board];
    test[index] = mark;
    if (winnerOf(test) === mark) return index;
  }
  for (const index of empty) {
    const test = [...board];
    test[index] = rival;
    if (winnerOf(test) === rival) return index;
  }
  if (empty.includes(4)) return 4;
  const corners = [0, 2, 6, 8].filter((index) => empty.includes(index));
  if (corners.length > 0) return corners[Math.floor(Math.random() * corners.length)];
  return empty[Math.floor(Math.random() * empty.length)];
}

/** Morpion 2.0 : le perdant tire un gage tout mignon. */
export default function Morpion({ meta, onFinish, earned }: GameProps) {
  const { me, them, sendNote } = useCouple();
  const [board, setBoard] = useState<Mark[]>(Array(9).fill(null));
  const [myTurn, setMyTurn] = useState(true);
  const [gage] = useState(() => shuffle(gages, Date.now())[0]);
  const [sent, setSent] = useState(false);

  const winner = winnerOf(board);
  const full = board.every(Boolean);
  const over = Boolean(winner) || full;
  const iWon = winner === '💗';

  /* Le tour de l'adversaire, avec un petit temps de réflexion. */
  useEffect(() => {
    if (myTurn || over) return undefined;
    const id = window.setTimeout(() => {
      setBoard((current) => {
        if (winnerOf(current) || current.every(Boolean)) return current;
        const next = [...current];
        next[bestMove(current, '⭐', '💗')] = '⭐';
        return next;
      });
      setMyTurn(true);
    }, 700);
    return () => window.clearTimeout(id);
  }, [myTurn, over]);

  useEffect(() => {
    if (!over) return;
    onFinish({ won: iWon, score: iWon ? 1 : 0 });
  }, [over]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = (index: number) => {
    if (!myTurn || board[index] || over) return;
    setBoard((current) => {
      const next = [...current];
      next[index] = '💗';
      return next;
    });
    setMyTurn(false);
  };

  const restart = () => {
    setBoard(Array(9).fill(null));
    setMyTurn(true);
    setSent(false);
  };

  return (
    <GameShell
      meta={meta}
      rule={`Toi les cœurs, ${them.name} les étoiles. Le perdant accomplit le gage.`}
      onRestart={restart}>
      {over && (
        <GameResult
          won={iWon}
          title={iWon ? 'Tu gagnes !' : winner ? `${them.name} l’emporte` : 'Match nul'}
          detail={
            winner
              ? `${iWon ? them.name : 'Toi'} : c’est le gage.`
              : 'Personne ne gagne — personne ne fait de gage.'
          }
          coins={earned} />
      )}

      <SectionCard title="La grille" subtitle={over ? 'Partie terminée' : myTurn ? 'À toi de jouer' : `${them.name} réfléchit…`}>
        <div className="mx-auto grid max-w-[280px] grid-cols-3 gap-2">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              type="button"
              whileTap={{ scale: 0.94 }}
              disabled={Boolean(cell) || over || !myTurn}
              onClick={() => play(index)}
              aria-label={`Case ${index + 1}${cell ? `, occupée par ${cell}` : ', libre'}`}
              className="flex aspect-square items-center justify-center rounded-2xl border border-ice bg-frost text-3xl disabled:opacity-100">
              {cell}
            </motion.button>
          ))}
        </div>
        <div className="mt-3 flex justify-center gap-4 text-[11px] font-semibold text-muted">
          <span>💗 {me.name}</span>
          <span>⭐ {them.name}</span>
        </div>
      </SectionCard>

      {over && winner && (
        <SectionCard title="Le gage" subtitle={iWon ? `Pour ${them.name}` : 'Pour toi'}>
          <p className="rounded-3xl border border-sun/40 bg-sun/15 p-4 text-center text-sm leading-snug text-ink">
            {gage}
          </p>
          {iWon && (
            <button
              type="button"
              disabled={sent}
              onClick={() => {
                sendNote(`🎯 Gage du Morpion : ${gage}`, 'evening');
                setSent(true);
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-2.5 text-sm font-semibold text-paper disabled:opacity-40">
              <SendIcon size={15} aria-hidden="true" />
              {sent ? 'Gage envoyé' : `Envoyer le gage à ${them.name}`}
            </button>
          )}
        </SectionCard>
      )}
    </GameShell>
  );
}
