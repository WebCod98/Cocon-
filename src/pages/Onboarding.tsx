import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  CheckIcon,
  CopyIcon,
  HeartHandshakeIcon,
  KeyRoundIcon,
  RefreshCwIcon,
  SmartphoneIcon,
} from 'lucide-react';
import { Confetti } from '../components/Confetti';
import { useSession } from '../state/CoupleContext';
import { cities, findCity } from '../data/cities';
import { askNotificationPermission } from '../lib/notifications';
import { supportsHaptics, vibrate } from '../lib/haptics';

const emojis = ['🌷', '🌊', '🌙', '☀️', '🍒', '🐝', '🌵', '🫐', '🔥', '🍀', '⭐', '🐚'];

type Step = 'welcome' | 'me' | 'partner' | 'story' | 'code' | 'permissions' | 'join';

const localTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris';
  } catch {
    return 'Europe/Paris';
  }
};

export function Onboarding() {
  const { doc, signup, enableSync, join, patchSettings, cloudConfigured } = useSession();
  // Inscription interrompue puis reprise : on repart a la derniere etape.
  const [step, setStep] = useState<Step>(() => (doc ? 'permissions' : 'welcome'));
  const [burst, setBurst] = useState(0);

  const [myName, setMyName] = useState('');
  const [myEmoji, setMyEmoji] = useState(emojis[0]);
  const [myCity, setMyCity] = useState('Paris');

  const [partnerName, setPartnerName] = useState('');
  const [partnerEmoji, setPartnerEmoji] = useState(emojis[1]);
  const [partnerCity, setPartnerCity] = useState('Montréal');

  const [since, setSince] = useState('');
  const [demoContent, setDemoContent] = useState(true);

  const [code, setCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);
  const [synced, setSynced] = useState(true);

  const myZone = useMemo(() => findCity(myCity)?.timeZone ?? localTimeZone(), [myCity]);
  const partnerZone = useMemo(() => findCity(partnerCity)?.timeZone ?? 'America/Toronto', [partnerCity]);

  const create = async () => {
    setCreating(true);
    const result = await signup({
      myName: myName.trim(),
      myEmoji,
      myCity,
      myTimeZone: myZone,
      partnerName: partnerName.trim(),
      partnerEmoji,
      partnerCity,
      partnerTimeZone: partnerZone,
      since,
      withDemoContent: demoContent,
    });
    setCreating(false);
    setCode(result.loveCode);
    setSynced(result.synced);
    setBurst((value) => value + 1);
    vibrate('success');
    setStep('code');
  };

  /** Nouvelle tentative d'enregistrement, depuis l'écran du code. */
  const retryPublish = async () => {
    setCreating(true);
    const result = await enableSync();
    setCreating(false);
    if (result.loveCode) setCode(result.loveCode);
    setSynced(result.synced);
  };

  const doJoin = async () => {
    setJoining(true);
    setJoinError(null);
    const result = await join({
      loveCode: joinCode.trim(),
      myName: myName.trim(),
      myEmoji,
      myCity,
      myTimeZone: myZone,
    });
    setJoining(false);

    if (result.ok) {
      setBurst((value) => value + 1);
      vibrate('success');
      setStep('permissions');
      return;
    }

    setJoinError(
      result.reason === 'full'
        ? 'Ce Cocon est déjà complet — deux personnes y sont déjà liées.'
        : result.reason === 'offline'
          ? 'Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.'
          : 'Aucun Cocon ne correspond à ce code. Vérifiez les 6 chiffres.'
    );
  };

  const finish = async (withNotifications: boolean) => {
    if (withNotifications) {
      const permission = await askNotificationPermission();
      patchSettings({ notifications: permission === 'granted', onboarded: true });
    } else {
      patchSettings({ notifications: false, onboarded: true });
    }
    // Le Gate bascule tout seul vers l'adoption du compagnon.
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-frost px-4 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      <Confetti trigger={burst} />

      <header className="text-center">
        <motion.p
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          className="text-4xl">
          💞
        </motion.p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-ink">Cocon</h1>
        <p className="text-xs text-muted">Votre nid à deux, malgré les kilomètres</p>
      </header>

      {step === 'welcome' && (
        <StepCard>
          <p className="text-sm leading-snug text-ink">
            Cocon se joue à deux : une seule mascotte, un seul calendrier, un seul compteur. L’un crée le
            Cocon et reçoit un <strong>Code d’Amour à 6 chiffres</strong>, l’autre le saisit pour vous lier.
          </p>
          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={() => setStep('me')}
              className="flex items-center gap-3 rounded-3xl bg-coral px-4 py-3.5 text-left text-paper transition-transform active:scale-[0.98]">
              <HeartHandshakeIcon size={19} aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">Créer notre Cocon</span>
                <span className="block text-[11px] text-paper/85">Je génère le code d’amour</span>
              </span>
              <ArrowRightIcon size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setStep('join')}
              className="flex items-center gap-3 rounded-3xl border border-ice bg-cream px-4 py-3.5 text-left text-ink transition-transform active:scale-[0.98]">
              <KeyRoundIcon size={19} aria-hidden="true" />
              <span className="flex-1">
                <span className="block text-sm font-semibold">J’ai déjà un code</span>
                <span className="block text-[11px] text-muted">Mon/ma partenaire l’a créé</span>
              </span>
              <ArrowRightIcon size={16} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-frost px-3 py-2 text-[11px] leading-snug text-muted">
            <SmartphoneIcon size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            Ajoutez Cocon à votre écran d’accueil : l’app s’ouvre alors en plein écran, sans passer par un
            store.
          </p>
        </StepCard>
      )}

      {step === 'me' && (
        <StepCard title="Qui es-tu ?" onBack={() => setStep('welcome')}>
          <Field label="Ton prénom">
            <input
              value={myName}
              onChange={(event) => setMyName(event.target.value)}
              maxLength={20}
              autoComplete="given-name"
              placeholder="Maguy"
              className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
          </Field>
          <Field label="Ton emoji">
            <EmojiRow value={myEmoji} onChange={setMyEmoji} />
          </Field>
          <Field label="Ta ville" hint="Elle donne ton fuseau horaire et ta météo">
            <CityPicker value={myCity} onChange={setMyCity} />
          </Field>
          <NextButton disabled={!myName.trim()} onClick={() => setStep('partner')} />
        </StepCard>
      )}

      {step === 'partner' && (
        <StepCard title="Et l’autre moitié ?" onBack={() => setStep('me')}>
          <Field label="Son prénom">
            <input
              value={partnerName}
              onChange={(event) => setPartnerName(event.target.value)}
              maxLength={20}
              placeholder="Ryan"
              className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
          </Field>
          <Field label="Son emoji">
            <EmojiRow value={partnerEmoji} onChange={setPartnerEmoji} />
          </Field>
          <Field label="Sa ville" hint="Le décalage horaire est calculé automatiquement">
            <CityPicker value={partnerCity} onChange={setPartnerCity} />
          </Field>
          <NextButton disabled={!partnerName.trim()} onClick={() => setStep('story')} />
        </StepCard>
      )}

      {step === 'story' && (
        <StepCard title="Depuis quand ?" onBack={() => setStep('partner')}>
          <Field label="Début de votre relation" hint="C’est ce qui alimente le Love Counter">
            <input
              type="date"
              value={since}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setSince(event.target.value)}
              className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink focus:border-coral focus:outline-none" />
          </Field>
          <label className="mt-2 flex items-start gap-3 rounded-2xl border border-ice bg-frost p-3">
            <input
              type="checkbox"
              checked={demoContent}
              onChange={(event) => setDemoContent(event.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#E8748F]" />
            <span className="text-[12px] leading-snug text-ink">
              <span className="font-semibold">Pré-remplir avec un exemple</span>
              <span className="block text-muted">
                Quelques mots doux, Polaroid et envies pour découvrir l’app tout de suite. Tout est
                supprimable ensuite.
              </span>
            </span>
          </label>
          <NextButton
            label={creating ? 'Création en cours…' : 'Créer notre Cocon'}
            disabled={creating || !since}
            onClick={() => void create()} />
        </StepCard>
      )}

      {step === 'code' && (
        <StepCard title="Votre Code d’Amour">
          {cloudConfigured && !synced && (
            <div role="alert" className="mb-3 rounded-3xl border border-coral/50 bg-coral/10 p-3">
              <p className="flex items-start gap-2 text-[12px] font-semibold leading-snug text-coral">
                <AlertTriangleIcon size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                Ce code ne fonctionnera pas encore
              </p>
              <p className="mt-1.5 text-[11px] leading-snug text-ink">
                Votre Cocon n’a pas pu être enregistré sur le serveur. Tant que ce n’est pas fait,
                {' '}{partnerName || 'votre partenaire'} verra « Aucun Cocon ne correspond à ce code ».
                Vérifiez que le script SQL a bien été exécuté dans Supabase, puis réessayez.
              </p>
              <button
                type="button"
                disabled={creating}
                onClick={() => void retryPublish()}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-2.5 text-sm font-semibold text-paper disabled:opacity-40">
                <RefreshCwIcon size={14} aria-hidden="true" />
                {creating ? 'Nouvelle tentative…' : 'Réessayer l’enregistrement'}
              </button>
            </div>
          )}
          {cloudConfigured && synced && (
            <p className="mb-3 rounded-2xl bg-mint/20 px-3 py-2 text-[11px] font-semibold text-ink">
              ✅ Votre Cocon est enregistré — le code est utilisable sur l’autre téléphone.
            </p>
          )}
          <p className="text-sm leading-snug text-muted">
            Transmets ces 6 chiffres à {partnerName || 'ton/ta partenaire'}. Sur son téléphone, il/elle
            ouvre Cocon et choisit « J’ai déjà un code ».
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {code.split('').map((digit, index) => (
              <motion.span
                key={`${digit}-${index}`}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.06 }}
                className="flex h-14 w-11 items-center justify-center rounded-2xl border border-ice bg-frost font-display text-2xl font-semibold tabular-nums text-ink">
                {digit}
              </motion.span>
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 2000);
              } catch {
                setCopied(false);
              }
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ice bg-frost py-2.5 text-sm font-semibold text-ink">
            {copied ? <CheckIcon size={15} aria-hidden="true" /> : <CopyIcon size={15} aria-hidden="true" />}
            {copied ? 'Code copié' : 'Copier le code'}
          </button>
          <p className="mt-3 rounded-2xl bg-frost px-3 py-2 text-[11px] leading-snug text-muted">
            La liaison se fait entre vos deux appareils. Tant que {partnerName || 'l’autre'} n’a pas saisi
            le code, tu peux déjà tout préparer : la mascotte, vos dates, vos lettres.
          </p>
          <NextButton label="Continuer" onClick={() => setStep('permissions')} />
        </StepCard>
      )}

      {step === 'join' && (
        <StepCard title="Rejoindre un Cocon" onBack={() => setStep('welcome')}>
          <Field label="Le code à 6 chiffres">
            <input
              value={joinCode}
              onChange={(event) => {
                setJoinCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                setJoinError(null);
              }}
              inputMode="numeric"
              placeholder="000000"
              className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-center font-display text-2xl tracking-[0.4em] text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
          </Field>
          <Field label="Ton prénom">
            <input
              value={myName}
              onChange={(event) => setMyName(event.target.value)}
              maxLength={20}
              placeholder="Ryan"
              className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />
          </Field>
          <Field label="Ton emoji">
            <EmojiRow value={myEmoji} onChange={setMyEmoji} />
          </Field>
          <Field label="Ta ville">
            <CityPicker value={myCity} onChange={setMyCity} />
          </Field>
          {joinError && (
            <p role="alert" className="rounded-2xl bg-coral/15 px-3 py-2 text-[12px] font-semibold text-coral">
              {joinError}
            </p>
          )}
          <NextButton
            label={joining ? 'Liaison en cours…' : 'Nous lier'}
            disabled={joining || joinCode.length !== 6 || !myName.trim()}
            onClick={() => void doJoin()} />
        </StepCard>
      )}

      {step === 'permissions' && (
        <StepCard title="Dernière étape">
          <p className="text-sm leading-snug text-muted">
            Cocon vous prévient quand un mot doux arrive, quand un Polaroid est publié et la veille de vos
            dates importantes.
          </p>
          <ul className="mt-3 space-y-2 text-[12px] text-ink">
            <li className="flex items-center gap-2 rounded-2xl border border-ice bg-frost px-3 py-2.5">
              <BellIcon size={15} className="text-coral" aria-hidden="true" />
              Notifications : messages, rappels et pings de présence
            </li>
            <li className="flex items-center gap-2 rounded-2xl border border-ice bg-frost px-3 py-2.5">
              <span aria-hidden="true">📳</span>
              Vibrations : le Bouton Pensée bat comme un cœur
              {!supportsHaptics() && <span className="text-muted"> (non gérées ici)</span>}
            </li>
          </ul>
          <NextButton label="Activer et entrer" onClick={() => void finish(true)} />
          <button
            type="button"
            onClick={() => void finish(false)}
            className="mt-2 w-full text-center text-[11px] font-semibold text-muted underline">
            Plus tard
          </button>
        </StepCard>
      )}
    </div>
  );
}

/* --- Briques du formulaire ------------------------------------------------ */

function StepCard({
  title,
  onBack,
  children,
}: {
  title?: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 rounded-4xl border border-ice bg-cream p-4 shadow-soft">
      {(title || onBack) && (
        <div className="mb-3 flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Étape précédente"
              className="rounded-full border border-ice bg-frost p-1.5 text-muted">
              <ArrowLeftIcon size={15} aria-hidden="true" />
            </button>
          )}
          {title && <h2 className="font-display text-base font-semibold text-ink">{title}</h2>}
        </div>
      )}
      {children}
    </motion.section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

function EmojiRow({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-pressed={value === emoji}
          aria-label={`Emoji ${emoji}`}
          onClick={() => onChange(emoji)}
          className={`flex h-10 w-10 items-center justify-center rounded-2xl border text-lg transition-colors ${
            value === emoji ? 'border-coral bg-blush/60' : 'border-ice bg-frost'
          }`}>
          {emoji}
        </button>
      ))}
    </div>
  );
}

function CityPicker({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-sm text-ink focus:border-coral focus:outline-none">
      {cities.map((city) => (
        <option key={city.id} value={city.city}>
          {city.city} — {city.country}
        </option>
      ))}
    </select>
  );
}

function NextButton({
  label = 'Continuer',
  disabled,
  onClick,
}: {
  label?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-coral py-3 text-sm font-semibold text-paper transition-opacity disabled:opacity-40">
      {label}
      <ArrowRightIcon size={16} aria-hidden="true" />
    </button>
  );
}
