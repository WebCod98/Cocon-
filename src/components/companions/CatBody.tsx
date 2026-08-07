import { motion } from 'framer-motion';
import { Eyes } from './Eyes';
import type { PinguMood } from '../../types';

const WHITE = '#FDFBF7';
const SHADE = '#EFE6DC';
const STRIPE = '#F6C595';
const STRIPE_DEEP = '#EFB27A';
const EAR_IN = '#F2BB9C';
const NOSE = '#F19BA8';
const MOUTH = '#E4788B';
const TONGUE = '#F5A0AE';
const EYE = '#4A2C1B';
const INK = '#3B2A32';

interface BodyProps {
  mood: PinguMood;
  sleeping: boolean;
  duration: number;
}

/** Chaton 3D crème à rayures pêche, assis, façon peluche kawaii. */
export function CatBody({ mood, sleeping, duration }: BodyProps) {
  const openMouth = mood === 'happy' || mood === 'super' || mood === 'love';

  return (
    <g>
      {/* queue rayée qui remonte */}
      <motion.g
        style={{ transformOrigin: '150px 182px' }}
        animate={sleeping ? { rotate: [0, 2, 0] } : { rotate: [0, -9, 0] }}
        transition={{ duration: sleeping ? duration : 1.7, repeat: Infinity, ease: 'easeInOut' }}>
        
        <path
          d="M146 184 C 176 182 190 156 180 132 C 176 122 168 116 162 120"
          stroke={WHITE}
          strokeWidth="19"
          fill="none"
          strokeLinecap="round" />
        
        <path
          d="M146 184 C 176 182 190 156 180 132 C 176 122 168 116 162 120"
          stroke={STRIPE}
          strokeWidth="19"
          fill="none"
          strokeLinecap="butt"
          strokeDasharray="9 15" />
        
      </motion.g>

      {/* corps assis */}
      <ellipse cx="100" cy="168" rx="49" ry="54" fill={WHITE} />
      <ellipse cx="126" cy="176" rx="20" ry="40" fill={SHADE} opacity="0.5" />
      {/* rayures sur la hanche */}
      <path d="M62 150 q10 8 4 20" stroke={STRIPE} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M58 176 q11 6 6 18" stroke={STRIPE} strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* pattes avant */}
      <rect x="74" y="158" width="19" height="52" rx="9.5" fill={WHITE} />
      <rect x="107" y="158" width="19" height="52" rx="9.5" fill={WHITE} />
      <ellipse cx="83.5" cy="208" rx="13" ry="8" fill={WHITE} />
      <ellipse cx="116.5" cy="208" rx="13" ry="8" fill={WHITE} />
      <g stroke={SHADE} strokeWidth="2.4" strokeLinecap="round">
        <path d="M79 204 v6" />
        <path d="M88 204 v6" />
        <path d="M112 204 v6" />
        <path d="M121 204 v6" />
      </g>

      {/* oreilles */}
      <path d="M58 46 C 50 20 52 8 62 10 C 74 13 88 22 96 32 Z" fill={WHITE} />
      <path d="M62 42 C 57 24 58 17 65 19 C 73 22 82 28 87 34 Z" fill={EAR_IN} />
      <path d="M142 46 C 150 20 148 8 138 10 C 126 13 112 22 104 32 Z" fill={STRIPE} />
      <path d="M138 42 C 143 24 142 17 135 19 C 127 22 118 28 113 34 Z" fill={EAR_IN} />

      {/* tête */}
      <circle cx="100" cy="80" r="56" fill={WHITE} />
      {/* rayures du front */}
      <path d="M92 34 q8 9 6 19" stroke={STRIPE} strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M108 34 q-8 9 -6 19" stroke={STRIPE} strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* rayures des joues */}
      <path d="M52 66 q14 4 20 12" stroke={STRIPE} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M48 86 q14 0 20 6" stroke={STRIPE_DEEP} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M148 66 q-14 4 -20 12" stroke={STRIPE} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M152 86 q-14 0 -20 6" stroke={STRIPE_DEEP} strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* reflet doux */}
      <ellipse cx="76" cy="48" rx="20" ry="12" fill="#FFFFFF" opacity="0.7" transform="rotate(-22 76 48)" />

      <Eyes mood={mood} color={EYE} highlight="#FFFFFF" radius={15} lashes />

      {/* museau */}
      <ellipse cx="100" cy="104" rx="24" ry="16" fill={WHITE} />
      <path d="M100 100 C 105 100 108 103 106 106 C 104 109 96 109 94 106 C 92 103 95 100 100 100 Z" fill={NOSE} />

      {openMouth && !sleeping ?
      <g>
          <path d="M84 110 C 88 126 112 126 116 110 C 108 116 92 116 84 110 Z" fill={MOUTH} />
          <ellipse cx="100" cy="118" rx="7" ry="5" fill={TONGUE} />
        </g> :

      <g stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round">
          <path d="M100 108 q-8 8 -13 1" />
          <path d="M100 108 q8 8 13 1" />
        </g>
      }

      {/* moustaches */}
      <g stroke={SHADE} strokeWidth="2.2" strokeLinecap="round">
        <path d="M74 104 l-22 -4" />
        <path d="M75 112 l-21 6" />
        <path d="M126 104 l22 -4" />
        <path d="M125 112 l21 6" />
      </g>
    </g>);

}