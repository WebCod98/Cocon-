import { useMemo, useRef, useState } from 'react';
import { EyeIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { crosswordClues, crosswordGrid } from '../../data/prompts';
import type { GameProps } from './types';

interface CellInfo {
  row: number;
  col: number;
  letter: string;
  number?: number;
}

const key = (row: number, col: number) => `${row}-${col}`;

/** Analyse la grille : cases noires, numerotation, mots horizontaux et verticaux. */
function buildGrid() {
  const rows = crosswordGrid.map((line) => line.split(''));
  const height = rows.length;
  const width = rows[0].length;
  const cells = new Map<string, CellInfo>();
  let counter = 0;

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const letter = rows[row][col];
      if (letter === '.') continue;

      const startsAcross =
        (col === 0 || rows[row][col - 1] === '.') && col + 1 < width && rows[row][col + 1] !== '.';
      const startsDown =
        (row === 0 || rows[row - 1][col] === '.') && row + 1 < height && rows[row + 1][col] !== '.';

      const info: CellInfo = { row, col, letter };
      if (startsAcross || startsDown) {
        counter += 1;
        info.number = counter;
      }
      cells.set(key(row, col), info);
    }
  }

  return { rows, height, width, cells };
}

export default function MotsCroises({ meta, onFinish, earned }: GameProps) {
  const { rows, height, width, cells } = useMemo(buildGrid, []);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const filled = Object.values(entries).filter(Boolean).length;
  const total = cells.size;

  const wrong = Array.from(cells.values()).filter(
    (cell) => (entries[key(cell.row, cell.col)] ?? '') !== cell.letter
  );
  const solved = wrong.length === 0;

  const focusNext = (row: number, col: number) => {
    for (let next = col + 1; next < width; next += 1) {
      if (rows[row][next] !== '.') {
        inputs.current[key(row, next)]?.focus();
        return;
      }
    }
    for (let nextRow = row + 1; nextRow < height; nextRow += 1) {
      for (let nextCol = 0; nextCol < width; nextCol += 1) {
        if (rows[nextRow][nextCol] !== '.') {
          inputs.current[key(nextRow, nextCol)]?.focus();
          return;
        }
      }
    }
  };

  const check = () => {
    setChecked(true);
    if (solved) onFinish({ won: true, score: total });
  };

  const restart = () => {
    setEntries({});
    setChecked(false);
    setRevealed(false);
  };

  return (
    <GameShell
      meta={meta}
      rule="Une grille sur-mesure : chaque définition parle de vous. Remplissez-la à deux."
      onRestart={restart}>
      {checked && (
        <GameResult
          won={solved}
          title={solved ? 'Grille complète !' : `${total - wrong.length}/${total} cases justes`}
          detail={solved ? 'Rien à ajouter, vous vous connaissez par cœur.' : 'Les cases fausses sont surlignées.'}
          coins={earned} />
      )}

      <SectionCard title="La grille" subtitle={`${filled}/${total} cases remplies`}>
        <div className="overflow-x-auto">
          <div
            className="mx-auto grid gap-[3px]"
            style={{ gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`, maxWidth: `${width * 44}px` }}>
            {rows.map((line, row) =>
              line.map((letter, col) => {
                if (letter === '.') {
                  return <span key={key(row, col)} className="aspect-square rounded-[4px] bg-ink/15" />;
                }
                const cell = cells.get(key(row, col))!;
                const value = revealed ? cell.letter : (entries[key(row, col)] ?? '');
                const isWrong = checked && value !== cell.letter;
                return (
                  <label key={key(row, col)} className="relative aspect-square">
                    {cell.number && (
                      <span className="pointer-events-none absolute left-0.5 top-0 z-10 text-[8px] font-bold text-muted">
                        {cell.number}
                      </span>
                    )}
                    <span className="sr-only">
                      Ligne {row + 1}, colonne {col + 1}
                    </span>
                    <input
                      ref={(element) => {
                        inputs.current[key(row, col)] = element;
                      }}
                      value={value}
                      readOnly={revealed}
                      onChange={(event) => {
                        const next = event.target.value.slice(-1).toUpperCase();
                        setEntries((current) => ({ ...current, [key(row, col)]: next }));
                        setChecked(false);
                        if (next) focusNext(row, col);
                      }}
                      inputMode="text"
                      maxLength={1}
                      className={`h-full w-full rounded-[4px] border text-center font-display text-base font-semibold uppercase focus:outline-none ${
                        isWrong
                          ? 'border-coral bg-coral/20 text-ink'
                          : checked || revealed
                            ? 'border-mint/60 bg-mint/20 text-ink'
                            : 'border-ice bg-frost text-ink focus:border-coral'
                      }`} />
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={check}
            className="flex-1 rounded-full bg-coral py-2.5 text-sm font-semibold text-paper">
            Vérifier
          </button>
          <button
            type="button"
            onClick={() => setRevealed((value) => !value)}
            className="flex items-center gap-1.5 rounded-full border border-ice bg-frost px-4 py-2.5 text-sm font-semibold text-muted">
            <EyeIcon size={15} aria-hidden="true" />
            {revealed ? 'Cacher' : 'Solution'}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Définitions">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Horizontalement</p>
        <ul className="mb-3 space-y-1.5">
          {Object.entries(crosswordClues.across).map(([number, clue]) => (
            <li key={number} className="flex gap-2 text-[12px] leading-snug text-ink">
              <span className="font-display font-semibold text-coral">{number}.</span>
              <span>{clue}</span>
            </li>
          ))}
        </ul>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">Verticalement</p>
        <ul className="space-y-1.5">
          {Object.entries(crosswordClues.down).map(([number, clue]) => (
            <li key={number} className="flex gap-2 text-[12px] leading-snug text-ink">
              <span className="font-display font-semibold text-coral">{number}.</span>
              <span>{clue}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </GameShell>
  );
}
