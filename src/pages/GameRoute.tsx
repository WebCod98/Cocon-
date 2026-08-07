import { Suspense, lazy, useCallback, useState, type ComponentType, type LazyExoticComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useCouple } from '../state/CoupleContext';
import { gameMeta } from '../data/games';
import { vibrate } from '../lib/haptics';
import type { GameProps } from './games/types';

const lazyGame = (loader: () => Promise<{ default: ComponentType<GameProps> }>) => lazy(loader);

/** Chaque jeu est charge a la demande : l'app reste legere au demarrage. */
const registry: Record<string, LazyExoticComponent<ComponentType<GameProps>>> = {
  'qui-de-nous-deux': lazyGame(() => import('./games/QuiDeNousDeux')),
  'master-quiz': lazyGame(() => import('./games/MasterQuiz')),
  'tu-preferes': lazyGame(() => import('./games/TuPreferes')),
  'mots-croises': lazyGame(() => import('./games/MotsCroises')),
  'dessinez-devinez': lazyGame(() => import('./games/DessinezDevinez')),
  'cadavre-exquis': lazyGame(() => import('./games/CadavreExquis')),
  'blind-test': lazyGame(() => import('./games/BlindTest')),
  mimes: lazyGame(() => import('./games/Mimes')),
  'tap-tap': lazyGame(() => import('./games/TapTap')),
  morpion: lazyGame(() => import('./games/Morpion')),
  'puissance-4': lazyGame(() => import('./games/Puissance4')),
  memory: lazyGame(() => import('./games/Memory')),
  'action-ou-verite': lazyGame(() => import('./games/ActionOuVerite')),
  'code-secret': lazyGame(() => import('./games/CodeSecret')),
  'petit-bac': lazyGame(() => import('./games/PetitBac')),
};

export function GameRoute() {
  const { gameId } = useParams<{ gameId: string }>();
  const { recordGame, addCoins } = useCouple();
  const [earned, setEarned] = useState(0);

  const meta = gameId ? gameMeta(gameId) : undefined;
  const Game = gameId ? registry[gameId] : undefined;

  const onFinish = useCallback(
    (result: { won: boolean; score?: number }) => {
      if (!meta) return;
      recordGame(meta.id, result);
      if (result.won) {
        addCoins(meta.reward, `${meta.title} remporté`);
        setEarned((value) => value + meta.reward);
        vibrate('success');
      }
    },
    [meta, recordGame, addCoins]
  );

  if (!meta || !Game) return <Navigate to="/arcade" replace />;

  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-sm text-muted" role="status">
          Chargement du jeu…
        </div>
      }>
      <Game meta={meta} onFinish={onFinish} earned={earned} />
    </Suspense>
  );
}
