import { useEffect, useState } from 'react';
import { DownloadIcon, ShareIcon, XIcon } from 'lucide-react';
import { isIOS, isStandalone, type InstallPromptEvent } from '../lib/pwa';

const DISMISS_KEY = 'cocon.install.dismissed';

/**
 * Invite « Ajouter à l'écran d'accueil ».
 * Android/Chrome exposent `beforeinstallprompt` : un seul bouton suffit.
 * iOS ne l'expose pas : on affiche la marche a suivre via le menu Partager.
 */
export function InstallBanner() {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPrompt(event as InstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  if (dismissed || isStandalone()) return null;

  const ios = isIOS();
  if (!prompt && !ios) return null;

  const close = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* stockage indisponible : la banniere reviendra, tant pis */
    }
  };

  const install = async () => {
    if (!prompt) return;
    await prompt.prompt();
    await prompt.userChoice;
    setPrompt(null);
    close();
  };

  return (
    <div className="flex items-center gap-3 rounded-3xl border border-ice bg-cream p-3 shadow-soft">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-mint/25 text-mint">
        {ios ? <ShareIcon size={17} aria-hidden="true" /> : <DownloadIcon size={17} aria-hidden="true" />}
      </span>
      <div className="flex-1 text-[12px] leading-snug text-ink">
        <p className="font-semibold">Installe Cocon sur ton écran d’accueil</p>
        {ios ? (
          <p className="text-muted">
            Appuie sur <strong>Partager</strong> puis « Sur l’écran d’accueil ». L’app s’ouvre alors en
            plein écran, sans barre de navigateur.
          </p>
        ) : (
          <button
            type="button"
            onClick={install}
            className="mt-1.5 rounded-full bg-coral px-3 py-1.5 text-[11px] font-semibold text-paper">
            Installer maintenant
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={close}
        aria-label="Masquer la proposition d’installation"
        className="rounded-full p-1 text-muted hover:text-ink">
        <XIcon size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
