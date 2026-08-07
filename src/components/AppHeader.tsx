import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MoonStarIcon, SettingsIcon, SunIcon } from 'lucide-react';
import { useCouple } from '../state/CoupleContext';
import { speciesOption } from '../data/companions';
import { timeIn } from '../utils/time';

interface AppHeaderProps {
  now: Date;
}

export function AppHeader({ now }: AppHeaderProps) {
  const { doc, me, them, isNight, settings, setTheme } = useCouple();
  const option = speciesOption(doc.companion?.species);
  const unseenThoughts = doc.thoughts.filter((item) => item.from !== settings.slot && !item.seen).length;

  const cycleTheme = () => {
    // auto → nuit → jour → auto : on garde le mode automatique accessible.
    if (settings.theme === 'auto') setTheme(isNight ? 'day' : 'night');
    else if (settings.theme === 'night') setTheme('day');
    else setTheme('auto');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ice bg-cream/95 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-night text-base"
            aria-hidden="true">
            {option.emoji}
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold leading-tight text-ink">
              {me.name} <span className="text-coral">&</span> {them.name}
            </p>
            <p className="truncate text-[11px] leading-tight text-muted">
              {timeIn(me.timeZone, now)} chez toi · {timeIn(them.timeZone, now)} chez {them.name}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            to="/boutique"
            className="flex items-center gap-1 rounded-full border border-ice bg-frost px-2.5 py-1.5 text-[11px] font-semibold text-ink"
            aria-label={`Boutique — ${doc.coins} pièces`}>
            <span aria-hidden="true">🪙</span>
            <span className="tabular-nums">{doc.coins}</span>
          </Link>

          <button
            type="button"
            onClick={cycleTheme}
            aria-label={
              settings.theme === 'auto'
                ? 'Thème automatique — appuyer pour forcer'
                : settings.theme === 'night'
                  ? 'Mode nuit actif'
                  : 'Mode jour actif'
            }
            className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-ice bg-frost text-ink">
            <motion.span key={String(isNight)} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              {isNight ? <MoonStarIcon size={16} aria-hidden="true" /> : <SunIcon size={16} aria-hidden="true" />}
            </motion.span>
            {settings.theme === 'auto' && (
              <span className="absolute bottom-1 text-[7px] font-bold uppercase text-muted">auto</span>
            )}
          </button>

          <Link
            to="/reglages"
            className="relative flex h-9 w-9 items-center justify-center rounded-2xl border border-ice bg-frost text-ink"
            aria-label="Réglages">
            <SettingsIcon size={16} aria-hidden="true" />
            {unseenThoughts > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-coral" aria-hidden="true" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
