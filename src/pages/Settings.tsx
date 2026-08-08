import { useState, type ReactNode } from 'react';
import {
  BellIcon,
  CheckIcon,
  CloudIcon,
  CloudOffIcon,
  CopyIcon,
  LogOutIcon,
  RefreshCwIcon,
  TrashIcon,
  UsersIcon,
} from 'lucide-react';
import { SectionCard } from '../components/SectionCard';
import { Sheet } from '../components/Sheet';
import { useCouple } from '../state/CoupleContext';
import { askNotificationPermission, notificationPermission, notify } from '../lib/notifications';
import { supportsHaptics, vibrate } from '../lib/haptics';
import { isStandalone } from '../lib/pwa';
import type { ThemeMode } from '../types';

const themes: { id: ThemeMode; label: string; hint: string }[] = [
  { id: 'auto', label: 'Automatique', hint: 'Nuit de 21 h à 6 h, heure locale' },
  { id: 'day', label: 'Jour', hint: 'Toujours clair' },
  { id: 'night', label: 'Nuit', hint: 'Mode Sommeil Étoilé permanent' },
];

export function Settings() {
  const { doc, me, them, settings, cloud, cloudSetup, enableSync, patchSettings, setTheme, leave, hardReset } =
    useCouple();
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  /** Publie un Cocon créé avant que la synchronisation ne soit configurée. */
  const repairSync = async () => {
    setSyncing(true);
    setSyncError(null);
    const result = await enableSync();
    setSyncing(false);
    if (!result.synced) {
      setSyncError(
        'Le serveur n’a pas répondu. Vérifiez que le script SQL a bien été exécuté dans Supabase, et que le projet n’est pas en pause.'
      );
    }
  };
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const permission = notificationPermission();

  const toggleNotifications = async () => {
    if (settings.notifications) {
      patchSettings({ notifications: false });
      return;
    }
    const result = await askNotificationPermission();
    patchSettings({ notifications: result === 'granted' });
    if (result === 'granted') {
      void notify('Cocon', 'Les notifications sont activées 💞', 'welcome');
    }
  };

  return (
    <div className="space-y-4 px-4 pb-6 pt-4">
      <div className="rounded-4xl border border-ice bg-cream p-4 shadow-soft">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Réglages</p>
        <h1 className="font-display text-xl font-semibold text-ink">
          {me.emoji} {me.name} & {them.emoji} {them.name}
        </h1>
        <p className="mt-1 text-xs text-muted">
          {doc.paired ? 'Vos deux appareils sont liés.' : 'En attente de la liaison du second appareil.'}
        </p>
      </div>

      <SectionCard title="Code d’Amour" subtitle="À donner à votre partenaire pour vous lier">
        <div className="flex items-center gap-2">
          <p className="flex-1 rounded-2xl bg-frost px-4 py-3 text-center font-display text-2xl tracking-[0.3em] tabular-nums text-ink">
            {doc.loveCode}
          </p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(doc.loveCode);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              } catch {
                setCopied(false);
              }
            }}
            aria-label="Copier le code"
            className="shrink-0 rounded-2xl border border-ice bg-frost p-3 text-muted">
            {copied ? <CheckIcon size={16} aria-hidden="true" /> : <CopyIcon size={16} aria-hidden="true" />}
          </button>
        </div>
        <p className="mt-2 flex items-start gap-2 rounded-2xl bg-frost px-3 py-2 text-[11px] leading-snug text-muted">
          <UsersIcon size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          {cloud
            ? 'Sur son téléphone, votre partenaire ouvre Cocon, choisit « J’ai déjà un code » et saisit ces 6 chiffres. Le code ne fonctionne qu’une seule fois : une fois la liaison faite, il devient inutile.'
            : 'La liaison passe par le stockage du navigateur : ouvrez Cocon dans un second onglet, choisissez « J’ai déjà un code » et saisissez ces 6 chiffres.'}
        </p>
      </SectionCard>

      <SectionCard title="Synchronisation" subtitle="Ce que vos deux appareils partagent">
        <div
          className={`flex items-start gap-3 rounded-3xl border px-3 py-3 ${
            cloud ? 'border-mint/50 bg-mint/15' : 'border-ice bg-frost'
          }`}>
          <span className={cloud ? 'text-mint' : 'text-muted'} aria-hidden="true">
            {cloud ? <CloudIcon size={18} /> : <CloudOffIcon size={18} />}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-ink">
              {cloud ? 'Synchronisation activée' : 'Mode local'}
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">
              {cloud
                ? `Vos mots, photos et parties voyagent entre vos deux téléphones en temps réel. ${
                    doc.paired ? 'Les deux appareils sont reliés.' : 'En attente du second appareil.'
                  }`
                : cloudSetup.state === 'ready'
                  ? 'Le serveur est configuré, mais ce Cocon n’y est pas encore enregistré — il a été créé avant. Votre partenaire ne peut donc pas vous rejoindre avec le code.'
                  : cloudSetup.state === 'off'
                    ? 'Tout reste sur cet appareil. La synchronisation ne fonctionne qu’entre les onglets de ce navigateur — votre partenaire aurait son propre Cocon.'
                    : 'La synchronisation est mal configurée : voir le détail ci-dessous.'}
            </p>
          </div>
        </div>

        {(cloudSetup.state === 'incomplete' || cloudSetup.state === 'malformed') && (
          <div role="alert" className="mt-3 rounded-3xl border border-coral/50 bg-coral/10 p-3">
            <p className="text-[12px] font-semibold text-coral">⚠️ Configuration incomplète</p>
            <p className="mt-1 text-[11px] leading-snug text-ink">
              {cloudSetup.state === 'incomplete' ? (
                <>
                  Il manque la variable <strong>{cloudSetup.missing}</strong> côté hébergeur. Les deux
                  vont par paire : une adresse sans clé — ou une clé sans adresse — ne permet rien.
                </>
              ) : (
                cloudSetup.problem
              )}
            </p>
            <p className="mt-1.5 text-[11px] leading-snug text-muted">
              Ajoutez-la dans Netlify (<em>Site configuration → Environment variables</em>), puis
              relancez un déploiement avec <em>Clear cache and deploy site</em>.
            </p>
          </div>
        )}

        {cloudSetup.state === 'ready' && !cloud && (
          <>
            <button
              type="button"
              disabled={syncing}
              onClick={() => void repairSync()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
              <RefreshCwIcon size={15} aria-hidden="true" />
              {syncing ? 'Enregistrement…' : 'Activer la synchronisation'}
            </button>
            <p className="mt-2 text-[11px] leading-snug text-muted">
              Rien n’est perdu : vos mots, vos photos et votre mascotte restent en place. Un nouveau
              Code d’Amour peut être attribué — pensez à le redonner à votre partenaire.
            </p>
            {syncError && (
              <p role="alert" className="mt-2 rounded-2xl bg-coral/15 px-3 py-2 text-[11px] font-semibold text-coral">
                {syncError}
              </p>
            )}
          </>
        )}
      </SectionCard>

      <SectionCard title="Apparence" subtitle="Le Mode Sommeil Étoilé bascule toute l’interface">
        <div className="grid gap-2">
          {themes.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={settings.theme === item.id}
              onClick={() => setTheme(item.id)}
              className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors ${
                settings.theme === item.id ? 'border-coral bg-blush/60' : 'border-ice bg-frost'
              }`}>
              <span>
                <span className="block text-sm font-semibold text-ink">{item.label}</span>
                <span className="block text-[11px] text-muted">{item.hint}</span>
              </span>
              {settings.theme === item.id && <CheckIcon size={16} className="text-coral" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Notifications & vibrations">
        <Toggle
          label="Notifications"
          hint={
            permission === 'denied'
              ? 'Bloquées par le navigateur — réautorisez-les dans ses réglages.'
              : 'Messages, Polaroid et rappels de vos dates'
          }
          icon={<BellIcon size={16} aria-hidden="true" />}
          checked={settings.notifications}
          disabled={permission === 'denied' || permission === 'unsupported'}
          onChange={() => void toggleNotifications()} />

        <Toggle
          label="Vibrations"
          hint={
            supportsHaptics()
              ? 'Le Bouton Pensée bat comme un cœur'
              : 'Non gérées par cet appareil'
          }
          icon={<span aria-hidden="true">📳</span>}
          checked={settings.haptics}
          disabled={!supportsHaptics()}
          onChange={() => {
            patchSettings({ haptics: !settings.haptics });
            if (!settings.haptics) vibrate('heartbeat');
          }} />

        <Toggle
          label="Partenaire de démonstration"
          hint={
            cloud && doc.paired
              ? 'Inactif : votre vrai partenaire est connecté'
              : 'Fait réagir votre partenaire pour explorer l’app en solo'
          }
          icon={<UsersIcon size={16} aria-hidden="true" />}
          checked={settings.demoPartner && !(cloud && doc.paired)}
          disabled={cloud && doc.paired}
          onChange={() => patchSettings({ demoPartner: !settings.demoPartner })} />
      </SectionCard>

      <SectionCard title="Installation" subtitle="Cocon est une PWA — pas de store">
        <p className="rounded-2xl bg-frost px-3 py-2.5 text-[11px] leading-snug text-muted">
          {isStandalone()
            ? '✅ Cocon est installée : vous êtes en plein écran, comme une application native.'
            : 'Depuis le navigateur, utilisez « Ajouter à l’écran d’accueil » (menu Partager sur iOS, menu ⋮ sur Android). L’app s’ouvre ensuite sans barre de navigateur et fonctionne hors-ligne.'}
        </p>
      </SectionCard>

      <SectionCard title="Ce compte">
        <div className="grid gap-2">
          <button
            type="button"
            onClick={leave}
            className="flex items-center gap-2 rounded-2xl border border-ice bg-frost px-3 py-3 text-sm font-semibold text-ink">
            <LogOutIcon size={16} aria-hidden="true" />
            Se déconnecter de cet appareil
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 rounded-2xl border border-coral/40 bg-coral/10 px-3 py-3 text-sm font-semibold text-coral">
            <TrashIcon size={16} aria-hidden="true" />
            Effacer toutes les données
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted">
          Se déconnecter garde le Cocon intact sur cet appareil : le code d’amour permet d’y revenir. Tout
          effacer supprime définitivement les mots, les photos et les souvenirs stockés ici.
        </p>
      </SectionCard>

      <Sheet
        open={confirmReset}
        title="Tout effacer ?"
        subtitle="Cette action est définitive"
        onClose={() => setConfirmReset(false)}>
        <p className="text-sm leading-snug text-ink">
          Vos mots doux, Polaroid, lettres scellées et capsules seront supprimés de cet appareil, sans
          possibilité de les récupérer.
        </p>
        <div className="mt-4 grid gap-2">
          <button
            type="button"
            onClick={() => {
              setConfirmReset(false);
              hardReset();
            }}
            className="w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper">
            Oui, tout effacer
          </button>
          <button
            type="button"
            onClick={() => setConfirmReset(false)}
            className="w-full rounded-full border border-ice bg-frost py-2.5 text-sm font-semibold text-ink">
            Annuler
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function Toggle({
  label,
  hint,
  icon,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  icon: ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className="mb-2 flex w-full items-center gap-3 rounded-2xl border border-ice bg-frost px-3 py-2.5 text-left disabled:opacity-50">
      <span className="text-coral" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        <span className="block text-[11px] leading-snug text-muted">{hint}</span>
      </span>
      <span
        className={`flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
          checked ? 'bg-coral' : 'bg-ice'
        }`}
        aria-hidden="true">
        <span
          className={`h-5 w-5 rounded-full bg-cream shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`} />
      </span>
    </button>
  );
}
