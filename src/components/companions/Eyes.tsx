import type { PinguMood } from '../../types';

interface EyesProps {
  mood: PinguMood;
  color?: string;
  highlight?: string;
  /** rayon de l'œil ouvert */
  radius?: number;
  /** cils façon peluche 3D */
  lashes?: boolean;
}

/** Yeux partagés par tous les compagnons — mêmes positions, même langage d'expression. */
export function Eyes({
  mood,
  color = '#1F1F1F',
  highlight = '#FDFDFD',
  radius = 10.5,
  lashes = false
}: EyesProps) {
  if (mood === 'sleepy') {
    return (
      <g stroke={color} strokeWidth="5" fill="none" strokeLinecap="round">
        <path d="M70 80 q12 11 24 0" />
        <path d="M106 80 q12 11 24 0" />
      </g>);

  }

  if (mood === 'super' || mood === 'love') {
    return (
      <g stroke={color} strokeWidth="5.5" fill="none" strokeLinecap="round">
        <path d="M69 85 q13 -16 26 0" />
        <path d="M105 85 q13 -16 26 0" />
      </g>);

  }

  return (
    <g>
      <circle cx="82" cy="80" r={radius} fill={color} />
      <circle cx="118" cy="80" r={radius} fill={color} />
      <circle cx={82 - radius * 0.3} cy={80 - radius * 0.34} r={radius * 0.38} fill={highlight} />
      <circle cx={118 - radius * 0.3} cy={80 - radius * 0.34} r={radius * 0.38} fill={highlight} />
      <circle cx={82 + radius * 0.34} cy={80 + radius * 0.36} r={radius * 0.18} fill={highlight} opacity="0.8" />
      <circle
        cx={118 + radius * 0.34}
        cy={80 + radius * 0.36}
        r={radius * 0.18}
        fill={highlight}
        opacity="0.8" />
      
      {lashes &&
      <g stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M70 66 l-5 -5" />
          <path d="M78 62 l-2 -6" />
          <path d="M130 66 l5 -5" />
          <path d="M122 62 l2 -6" />
        </g>
      }
    </g>);

}