import type { GameMeta } from '../../types';

export interface GameProps {
  meta: GameMeta;
  /** A appeler une fois la manche terminee : enregistre le score et verse les pieces. */
  onFinish: (result: { won: boolean; score?: number }) => void;
  /** Pieces gagnees depuis l'ouverture du jeu, pour l'affichage. */
  earned: number;
}
