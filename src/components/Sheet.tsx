import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface SheetProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}

/** Feuille qui remonte du bas — la fenetre modale des telephones. */
export function Sheet({ open, title, subtitle, onClose, children }: SheetProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="absolute inset-0 bg-night/50 backdrop-blur-[2px]" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-4xl border border-ice bg-cream pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lift">

            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-ice bg-cream/95 px-4 py-3 backdrop-blur">
              <div>
                <h2 className="font-display text-base font-semibold text-ink">{title}</h2>
                {subtitle && <p className="text-[11px] text-muted">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="rounded-full border border-ice bg-frost p-1.5 text-muted transition-colors hover:text-ink">
                <XIcon size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="px-4 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
