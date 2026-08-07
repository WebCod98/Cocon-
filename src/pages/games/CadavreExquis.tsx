import { useEffect, useRef, useState } from 'react';
import { SendIcon } from 'lucide-react';
import { GameResult, GameShell } from '../../components/GameShell';
import { SectionCard } from '../../components/SectionCard';
import { useCouple } from '../../state/CoupleContext';
import { cadavrePrompts } from '../../data/prompts';
import { fillNames } from '../../utils/text';
import type { PartnerSlot } from '../../types';
import type { GameProps } from './types';

interface Line {
  slot: PartnerSlot;
  text: string;
}

interface StoryPayload {
  lines: Line[];
}

const TARGET = 6;

const partnerLines = [
  'Et là, la voisine est sortie en peignoir avec une poêle à la main.',
  'Le train est parti sans nous, mais on s’en fichait complètement.',
  'C’est à ce moment précis que le chat a renversé le café sur le contrat.',
  'On a couru sous la pluie en riant comme des idiots.',
  'Personne n’a jamais su comment le pingouin était arrivé là.',
  'Alors je t’ai regardé·e et j’ai su que c’était pour longtemps.',
];

/**
 * Cadavre exquis : chacun ajoute une phrase en ne voyant que la precedente.
 * L'histoire complete n'apparait qu'a la fin.
 */
export default function CadavreExquis({ meta, onFinish, earned }: GameProps) {
  const { doc, me, them, mySlot, theirSlot, settings, createChallenge, updateChallenge, removeChallenge } =
    useCouple();
  const [draft, setDraft] = useState('');
  const scored = useRef(false);

  const challenge = doc.challenges.find((item) => item.game === meta.id && item.status === 'open');
  const payload = challenge?.payload as unknown as StoryPayload | undefined;
  const lines = payload?.lines ?? [];
  const finished = lines.length >= TARGET;
  const myTurn = !challenge || challenge.turn === mySlot;
  const lastLine = lines[lines.length - 1];
  const prompt = fillNames(cadavrePrompts[Math.min(lines.length, cadavrePrompts.length - 1)], me.name, them.name);

  useEffect(() => {
    if (!finished || scored.current) return;
    scored.current = true;
    onFinish({ won: true, score: lines.length });
  }, [finished, lines.length, onFinish]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const nextLines = [...lines, { slot: mySlot, text }];
    setDraft('');

    if (!challenge) {
      const id = createChallenge(meta.id, { lines: nextLines } as unknown as Record<string, unknown>);
      if (settings.demoPartner) simulate(id, nextLines);
      return;
    }

    const done = nextLines.length >= TARGET;
    updateChallenge(challenge.id, {
      payload: { lines: nextLines } as unknown as Record<string, unknown>,
      turn: done ? mySlot : theirSlot,
    });
    if (!done && settings.demoPartner) simulate(challenge.id, nextLines);
  };

  /** Le partenaire de demonstration ajoute sa phrase quelques secondes plus tard. */
  const simulate = (id: string, current: Line[]) => {
    window.setTimeout(() => {
      const text = partnerLines[current.length % partnerLines.length];
      const nextLines = [...current, { slot: theirSlot, text }];
      updateChallenge(id, {
        payload: { lines: nextLines } as unknown as Record<string, unknown>,
        turn: mySlot,
      });
    }, 2400);
  };

  const restart = () => {
    if (challenge) removeChallenge(challenge.id);
    setDraft('');
    scored.current = false;
  };

  if (finished) {
    return (
      <GameShell meta={meta} rule="Voilà ce que ça donne, mis bout à bout." onRestart={restart}>
        <GameResult won title="Votre histoire est complète" detail={`${lines.length} phrases à quatre mains.`} coins={earned} />
        <SectionCard title="L’histoire" subtitle="Écrite à l’aveugle">
          <div className="rounded-3xl border border-ice bg-frost p-4">
            <p className="font-display text-[15px] leading-relaxed text-ink">
              {lines.map((line, index) => (
                <span key={index} className={line.slot === mySlot ? 'text-ink' : 'text-coral'}>
                  {line.text}{' '}
                </span>
              ))}
            </p>
          </div>
          <p className="mt-2 text-[11px] text-muted">
            <span className="text-ink">En sombre</span> tes phrases · <span className="text-coral">en corail</span>{' '}
            celles de {them.name}.
          </p>
        </SectionCard>
      </GameShell>
    );
  }

  if (!myTurn) {
    return (
      <GameShell meta={meta} rule="Chacun son tour, sans voir le reste." onRestart={restart}>
        <SectionCard title={`Au tour de ${them.name}`} subtitle={`${lines.length}/${TARGET} phrases`}>
          <p className="rounded-2xl bg-frost px-3 py-6 text-center text-sm text-muted">
            Ta phrase est partie. {them.name} ne voit qu’elle, rien d’autre — c’est tout l’intérêt.
          </p>
        </SectionCard>
      </GameShell>
    );
  }

  return (
    <GameShell
      meta={meta}
      rule="Tu ne vois que la dernière phrase écrite. Ajoute la tienne et passe la main."
      onRestart={challenge ? restart : undefined}>
      <SectionCard title={`Phrase ${lines.length + 1}/${TARGET}`} subtitle={prompt}>
        {lastLine ? (
          <blockquote className="rounded-3xl border border-ice bg-frost p-3 font-display text-[15px] leading-relaxed text-ink">
            « …{lastLine.text} »
            <span className="mt-1 block text-[11px] font-body text-muted">
              écrit par {lastLine.slot === mySlot ? 'toi' : them.name}
            </span>
          </blockquote>
        ) : (
          <p className="rounded-3xl border border-dashed border-ice bg-frost/60 p-3 text-center text-[12px] text-muted">
            L’histoire est encore vierge. À toi de l’ouvrir.
          </p>
        )}

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          maxLength={180}
          placeholder="Une seule phrase, la plus improbable possible…"
          aria-label="Ta phrase"
          className="mt-3 w-full resize-none rounded-3xl border border-ice bg-frost p-3 text-sm text-ink placeholder:text-muted focus:border-coral focus:outline-none" />

        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] text-muted">{draft.length}/180</span>
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={send}
            className="flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-paper disabled:opacity-40">
            <SendIcon size={15} aria-hidden="true" />
            Passer la main
          </button>
        </div>
      </SectionCard>
    </GameShell>
  );
}
