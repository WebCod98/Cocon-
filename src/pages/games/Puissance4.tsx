import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { useCouple } from '../../state/CoupleContext';
import type { PartnerSlot } from '../../types';
import type { GameProps } from './types';

const COLS = 7;
const ROWS = 6;

type Cell = PartnerSlot | null;

interface BoardPayload {
  cells: Cell[];
  winner?: PartnerSlot | 'draw';
}

const index = (row: number, col: number) => row * COLS + col;

function winnerOf(cells: Cell[]): PartnerSlot | 'draw' | null {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const start = cells[index(row, col)];
      if (!start) continue;
      for (const [dRow, dCol] of directions) {
        const endRow = row + dRow * 3;
        const endCol = col + dCol * 3;
        if (endRow < 0 || endRow >= ROWS || endCol < 0 || endCol >= COLS) continue;
        let aligned = true;
        for (let step = 1; step < 4; step += 1) {
          if (cells[index(row + dRow * step, col + dCol * step)] !== start) {
            aligned = false;
            break;
          }
        }
        if (aligned) return start;
      }
    }
  }
  return cells.every(Boolean) ? 'draw' : null;
}

/** Trouve la ligne libre la plus basse d'une colonne. */
function drop(cells: Cell[], col: number) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (!cells[index(row, col)]) return row;
  }
  return -1;
}

/**
 * Puissance 4 en tour par tour asynchrone : chacun joue quand il veut, la
 * grille attend l'autre.
 */
export default function Puissance4({ meta, onFinish, earned }: GameProps) {
  const { doc, me, them, mySlot, theirSlot, settings, createChallenge, updateChallenge, removeChallenge } =
    useCouple();
  const scored = useRef(false);

  const challenge = doc.challenges.find((item) => item.game === meta.id && item.status === 'open');
  const payload = challenge?.payload as unknown as BoardPayload | undefined;
  const cells: Cell[] = payload?.cells ?? Array<Cell>(ROWS * COLS).fill(null);
  const winner = payload?.winner ?? null;
  const myTurn = !challenge || challenge.turn === mySlot;

  useEffect(() => {
    if (!winner || scored.current) return;
    scored.current = true;
    onFinish({ won: winner === mySlot, score: winner === mySlot ? 1 : 0 });
  }, [winner, mySlot, onFinish]);

  /** Coup simple de l'adversaire simulé : gagner, bloquer, sinon au centre. */
  const rivalMove = (current: Cell[]): number => {
    const playable = Array.from({ length: COLS }, (_, col) => col).filter((col) => drop(current, col) >= 0);
    for (const who of [theirSlot, mySlot] as PartnerSlot[]) {
      for (const col of playable) {
        const test = [...current];
        test[index(drop(current, col), col)] = who;
        if (winnerOf(test) === who) return col;
      }
    }
    return playable.sort((a, b) => Math.abs(3 - a) - Math.abs(3 - b))[0];
  };

  const play = (col: number) => {
    if (!myTurn || winner) return;
    const row = drop(cells, col);
    if (row < 0) return;

    const next = [...cells];
    next[index(row, col)] = mySlot;
    const outcome = winnerOf(next);

    if (!challenge) {
      const id = createChallenge(meta.id, { cells: next, winner: outcome ?? undefined } as unknown as Record<string, unknown>);
      if (!outcome && settings.demoPartner) simulate(id, next);
      return;
    }

    updateChallenge(challenge.id, {
      payload: { cells: next, winner: outcome ?? undefined } as unknown as Record<string, unknown>,
      turn: outcome ? mySlot : theirSlot,
    });
    if (!outcome && settings.demoPartner) simulate(challenge.id, next);
  };

  const simulate = (id: string, current: Cell[]) => {
    window.setTimeout(() => {
      const col = rivalMove(current);
      const row = drop(current, col);
      if (row < 0) return;
      const next = [...current];
      next[index(row, col)] = theirSlot;
      const outcome = winnerOf(next);
      updateChallenge(id, {
        payload: { cells: next, winner: outcome ?? undefined } as unknown as Record<string, unknown>,
        turn: mySlot,
      });
    }, 1200);
  };

  const restart = () => {
    if (challenge) removeChallenge(challenge.id);
    scored.current = false;
  };

  const colorFor = (cell: Cell) => {
    if (cell === mySlot) return 'bg-coral';
    if (cell === theirSlot) return 'bg-sun';
    return 'bg-cream';
  };

  return (
    <GameShell
      meta={meta}
      rule={`Alignez-en quatre. Chacun joue quand il peut — ${them.name} retrouvera la grille en ouvrant l’app.`}
      onRestart={challenge ? restart : undefined}>
      {winner && (
        <GameResult
          won={winner === mySlot}
          title={winner === 'draw' ? 'Grille pleine — match nul' : winner === mySlot ? 'Quatre alignés !' : `${them.name} l’emporte`}
          detail={winner === 'draw' ? 'Personne n’a réussi à aligner quatre jetons.' : undefined}
          coins={earned} />
      )}

      <SectionCard
        title="La grille"
        subtitle={winner ? 'Partie terminée' : myTurn ? 'À toi de jouer' : `Au tour de ${them.name}`}>
        <div className="rounded-3xl bg-night p-2">
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: COLS }, (_, col) => (
              <button
                key={`head-${col}`}
                type="button"
                disabled={!myTurn || Boolean(winner) || drop(cells, col) < 0}
                onClick={() => play(col)}
                aria-label={`Jouer colonne ${col + 1}`}
                className="mb-0.5 rounded-lg bg-paper/15 py-1 text-[10px] font-semibold text-paper disabled:opacity-30">
                ▼
              </button>
            ))}
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: COLS }, (_, col) => {
                const cell = cells[index(row, col)];
                return (
                  <motion.span
                    key={`${row}-${col}`}
                    initial={cell ? { scale: 0.4 } : false}
                    animate={{ scale: 1 }}
                    className={`aspect-square rounded-full ${colorFor(cell)}`}
                    aria-hidden="true" />
                );
              })
            )}
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-4 text-[11px] font-semibold text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-coral" aria-hidden="true" /> {me.name}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-sun" aria-hidden="true" /> {them.name}
          </span>
        </div>
      </SectionCard>
    </GameShell>
  );
}
