import { motion } from 'framer-motion';
import { Eyes } from './Eyes';
import type { PinguMood } from '../../types';

const DARK = '#2E2E2E';
const DARK_SOFT = '#3B3B3B';
const WHITE = '#FDFDFD';
const SHADE = '#E4E7EA';
const ORANGE = '#F5A623';
const ORANGE_DEEP = '#E08C10';

interface BodyProps {
  mood: PinguMood;
  sleeping: boolean;
  duration: number;
}

export function PenguinBody({ mood, sleeping, duration }: BodyProps) {
  const swing = mood === 'super' ? 26 : 7;

  return (
    <g>
      {/* pattes */}
      <Foot x={74} flip />
      <Foot x={126} />

      {/* corps + tête */}
      <ellipse cx="100" cy="150" rx="64" ry="70" fill={DARK} />
      <circle cx="100" cy="74" r="52" fill={DARK} />
      <ellipse cx="78" cy="50" rx="22" ry="15" fill="#6A6A6A" opacity="0.35" transform="rotate(-24 78 50)" />

      {/* ailes */}
      <motion.g
        style={{ transformOrigin: '44px 112px' }}
        animate={sleeping ? {} : { rotate: [0, -swing, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}>
        
        <path d="M50 112 C 30 128 26 168 38 190 C 46 202 58 196 58 182 C 58 160 58 130 50 112 Z" fill={DARK_SOFT} />
      </motion.g>
      <motion.g
        style={{ transformOrigin: '156px 112px' }}
        animate={sleeping ? {} : { rotate: [0, swing, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}>
        
        <path
          d="M150 112 C 170 128 174 168 162 190 C 154 202 142 196 142 182 C 142 160 142 130 150 112 Z"
          fill={DARK_SOFT} />
        
      </motion.g>

      {/* ventre + visage */}
      <ellipse cx="100" cy="156" rx="51" ry="62" fill={WHITE} />
      <ellipse cx="100" cy="86" rx="34" ry="35" fill={WHITE} />
      <ellipse cx="126" cy="164" rx="24" ry="50" fill={SHADE} opacity="0.55" />
      <ellipse cx="96" cy="150" rx="46" ry="58" fill={WHITE} />

      <ellipse cx="70" cy="98" rx="9" ry="5.5" fill="#F9D2DE" opacity="0.9" />
      <ellipse cx="130" cy="98" rx="9" ry="5.5" fill="#F9D2DE" opacity="0.9" />

      <Eyes mood={mood} color={DARK} highlight={WHITE} />

      {/* bec */}
      <path d="M85 99 C 89 93 111 93 115 99 C 117 108 109 117 100 117 C 91 117 83 108 85 99 Z" fill={ORANGE} />
      <path
        d="M100 117 C 94 116 89 111 87 106 C 95 110 105 110 113 106 C 111 111 106 116 100 117 Z"
        fill={ORANGE_DEEP}
        opacity="0.6" />
      
    </g>);

}

function Foot({ x, flip = false }: {x: number;flip?: boolean;}) {
  return (
    <g transform={`translate(${x} 206) rotate(${flip ? -12 : 12})`}>
      <path
        d="M-19 6 C -19 -4 -10 -8 0 -8 C 10 -8 19 -4 19 6 C 19 10 12 12 0 12 C -12 12 -19 10 -19 6 Z"
        fill={ORANGE} />
      
      <path d="M-7 2 v9" stroke={ORANGE_DEEP} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M7 2 v9" stroke={ORANGE_DEEP} strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
    </g>);

}