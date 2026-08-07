import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, LoaderIcon, RefreshCwIcon } from 'lucide-react';
import { Companion } from '../components/Companion';
import { Confetti } from '../components/Confetti';
import { useCouple } from '../state/CoupleContext';
import { speciesCatalog, speciesOption } from '../data/companions';
import type { Species } from '../types';
import { vibrate } from '../lib/haptics';

/**
 * Adoption de la mascotte : un seul animal pour deux, il faut donc que les
 * deux votes concordent avant de pouvoir lui donner un prenom.
 */
export function Adoption() {
  const { doc, me, them, mySlot, theirSlot, vote, adopt, restartVote } = useCouple();
  const [name, setName] = useState('');
  const [burst, setBurst] = useState(0);

  const myVote = doc.votes[mySlot];
  const theirVote = doc.votes[theirSlot];
  const agreed = myVote && theirVote && myVote === theirVote ? myVote : null;
  const conflict = Boolean(myVote && theirVote && myVote !== theirVote);
  const waiting = Boolean(myVote && !theirVote);
  const theirChoice = theirVote ? speciesOption(theirVote) : null;

  useEffect(() => {
    if (!agreed) return;
    setName((current) => current || speciesOption(agreed).name);
    setBurst((value) => value + 1);
    vibrate('success');
  }, [agreed]);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-md flex-col bg-frost px-4 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
      <Confetti trigger={burst} />

      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          {me.name} & {them.name}
        </p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          {agreed ? 'Comment l’appelez-vous ?' : 'Choisissez votre compagnon'}
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-xs leading-snug text-muted">
          {agreed
            ? 'Ce prénom sera le même sur vos deux téléphones. Vous pourrez changer de compagnon après un an.'
            : 'Un seul animal pour vous deux : il faut que vous fassiez le même choix. Une fois adopté, il reste avec vous.'}
        </p>
      </header>

      {agreed ? (
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-4xl border border-ice bg-cream p-4 shadow-soft">
          <div className="mx-auto h-40 w-40">
            <Companion species={agreed} mood="love" name={name} className="h-full w-full" />
          </div>
          <label htmlFor="companion-name" className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-muted">
            Son prénom
          </label>
          <input
            id="companion-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={16}
            className="mt-1.5 w-full rounded-2xl border border-ice bg-frost px-4 py-3 text-center font-display text-lg text-ink focus:border-coral focus:outline-none" />
          <p className="mt-2 text-center text-[11px] text-muted">
            {speciesOption(agreed).description}
          </p>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => adopt(name)}
            className="mt-4 w-full rounded-full bg-coral py-3 text-sm font-semibold text-paper disabled:opacity-40">
            Adopter {name.trim() || speciesOption(agreed).name}
          </button>
          <button
            type="button"
            onClick={restartVote}
            className="mt-2 w-full text-center text-[11px] font-semibold text-muted underline">
            Revenir au choix de l’animal
          </button>
        </motion.section>
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {speciesCatalog.map((option) => (
              <SpeciesCard
                key={option.id}
                id={option.id}
                name={option.name}
                label={option.label}
                description={option.description}
                mine={myVote === option.id}
                theirs={theirVote === option.id}
                theirName={them.name}
                onPick={() => vote(option.id)} />
            ))}
          </div>

          <div className="mt-5" aria-live="polite">
            {conflict && theirChoice && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-4xl border border-coral/40 bg-cream p-4 shadow-soft">
                <p className="font-display text-sm font-semibold text-ink">
                  Vous n’avez pas choisi le même compagnon
                </p>
                <p className="mt-1 text-xs leading-snug text-muted">
                  {them.name} a choisi {theirChoice.emoji} {theirChoice.name}. Mettez-vous d’accord pour
                  l’adopter ensemble.
                </p>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={() => vote(theirChoice.id)}
                    className="flex items-center justify-center gap-2 rounded-full bg-coral py-2.5 text-sm font-semibold text-paper">
                    <CheckIcon size={15} aria-hidden="true" />
                    Adopter {theirChoice.name} avec {them.name}
                  </button>
                  <button
                    type="button"
                    onClick={restartVote}
                    className="flex items-center justify-center gap-2 rounded-full border border-ice bg-frost py-2.5 text-sm font-semibold text-ink">
                    <RefreshCwIcon size={15} aria-hidden="true" />
                    Relancer le choix à deux
                  </button>
                </div>
              </motion.div>
            )}

            {waiting && (
              <div className="flex items-center justify-center gap-2 rounded-full bg-cream py-3 text-sm font-semibold text-muted shadow-soft">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                  className="flex">
                  <LoaderIcon size={15} aria-hidden="true" />
                </motion.span>
                En attente du choix de {them.name}…
              </div>
            )}

            {!conflict && !waiting && !myVote && (
              <p className="text-center text-[11px] text-muted">
                {theirChoice
                  ? `${them.name} a déjà voté ${theirChoice.emoji} — à toi de jouer.`
                  : `${them.name} vote de son côté en même temps.`}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function SpeciesCard({
  id,
  name,
  label,
  description,
  mine,
  theirs,
  theirName,
  onPick,
}: {
  id: Species;
  name: string;
  label: string;
  description: string;
  mine: boolean;
  theirs: boolean;
  theirName: string;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-pressed={mine}
      className={`flex w-full items-center gap-3 rounded-4xl border p-3 text-left shadow-soft transition-colors ${
        mine ? 'border-coral bg-blush/50' : 'border-ice bg-cream'
      }`}>
      <span className="h-20 w-20 shrink-0 rounded-3xl bg-frost p-1">
        <Companion species={id} mood="happy" name={name} className="h-full w-full" />
      </span>
      <span className="flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display text-base font-semibold text-ink">{name}</span>
          <span className="text-[11px] text-muted">{label}</span>
        </span>
        <span className="mt-0.5 block text-[11px] leading-snug text-muted">{description}</span>
        <span className="mt-1.5 flex flex-wrap gap-1.5">
          {mine && (
            <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-semibold text-paper">
              Ton choix
            </span>
          )}
          {theirs && (
            <span className="rounded-full bg-mint/25 px-2 py-0.5 text-[10px] font-semibold text-ink">
              {theirName} a choisi
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
