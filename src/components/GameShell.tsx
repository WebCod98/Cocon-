import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, RotateCcwIcon } from 'lucide-react';
import type { GameMeta } from '../types';

interface GameShellProps {
  meta: GameMeta;
  /** Consigne affichee sous le titre. */
  rule: string;
  onRestart?: () => void;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Cadre commun a tous les mini-jeux : retour, regle, bouton rejouer. */
export function GameShell({ meta, rule, onRestart, footer, children }: GameShellProps) {
  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <div className="rounded-4xl border border-ice bg-cream p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <Link
            to="/arcade"
            className="flex items-center gap-1 rounded-full border border-ice bg-frost px-2.5 py-1.5 text-[11px] font-semibold text-muted">
            <ArrowLeftIcon size={13} aria-hidden="true" />
            Arcade
          </Link>
          <span className="rounded-full bg-sun/25 px-2.5 py-1 text-[11px] font-semibold text-ink">
            🪙 {meta.reward} pièces
          </span>
        </div>
        <h1 className="mt-3 font-display text-xl font-semibold text-ink">
          <span aria-hidden="true">{meta.emoji}</span> {meta.title}
        </h1>
        <p className="mt-1 text-xs leading-snug text-muted">{rule}</p>
        {onRestart && (
          <button
            type="button"
            onClick={onRestart}
            className="mt-3 flex items-center gap-1.5 rounded-full border border-ice bg-frost px-3 py-1.5 text-[11px] font-semibold text-ink">
            <RotateCcwIcon size={13} aria-hidden="true" />
            Recommencer
          </button>
        )}
      </div>

      {children}

      {footer}
    </div>
  );
}

interface GameResultProps {
  won: boolean;
  title: string;
  detail?: string;
  coins?: number;
}

/** Bandeau de fin de partie, identique dans les 15 jeux. */
export function GameResult({ won, title, detail, coins }: GameResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-4xl border p-4 text-center shadow-soft ${
        won ? 'border-mint/50 bg-mint/20' : 'border-ice bg-cream'
      }`}
      role="status">
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {detail && <p className="mt-1 text-xs leading-snug text-muted">{detail}</p>}
      {typeof coins === 'number' && coins > 0 && (
        <p className="mt-2 inline-block rounded-full bg-sun/30 px-3 py-1 text-xs font-semibold text-ink">
          + {coins} pièces 🪙
        </p>
      )}
    </motion.div>
  );
}
