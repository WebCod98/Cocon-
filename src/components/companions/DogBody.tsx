import { motion } from 'framer-motion';
import { Eyes } from './Eyes';
import type { PinguMood } from '../../types';

const FUR = '#E6B87F';
const FUR_DARK = '#D3A268';
const FUR_SHADE = '#DBAA70';
const MUZZLE = '#F0CE9E';
const NOSE = '#6B4A38';
const BROW = '#C08F55';
const MOUTH = '#C4586A';
const TONGUE = '#F0899C';
const COLLAR = '#C7554B';
const COLLAR_DEEP = '#A8443C';
const TAG = '#DBDEE3';
const EYE = '#3A2418';

interface BodyProps {
  mood: PinguMood;
  sleeping: boolean;
  duration: number;
}

/** Chiot labrador 3D beige, assis, collier rouge et médaille. */
export function DogBody({ mood, sleeping, duration }: BodyProps) {
  const openMouth = mood === 'happy' || mood === 'super' || mood === 'love';

  return (
    <g>
      {/* queue */}
      <motion.g
        style={{ transformOrigin: '146px 184px' }}
        animate={sleeping ? { rotate: [0, 2, 0] } : { rotate: [0, -20, 0] }}
        transition={{ duration: sleeping ? 4 : 0.6, repeat: Infinity, ease: 'easeInOut' }}>
        
        <path
          d="M144 186 C 172 186 186 168 182 148"
          stroke={FUR_DARK}
          strokeWidth="17"
          fill="none"
          strokeLinecap="round" />
        
      </motion.g>

      {/* corps assis */}
      <ellipse cx="100" cy="168" rx="48" ry="54" fill={FUR} />
      <ellipse cx="126" cy="176" rx="20" ry="40" fill={FUR_SHADE} opacity="0.7" />

      {/* pattes avant */}
      <rect x="74" y="158" width="20" height="52" rx="10" fill={FUR} />
      <rect x="106" y="158" width="20" height="52" rx="10" fill={FUR} />
      <ellipse cx="84" cy="208" rx="14" ry="8" fill={MUZZLE} />
      <ellipse cx="116" cy="208" rx="14" ry="8" fill={MUZZLE} />
      <g stroke={FUR_DARK} strokeWidth="2.4" strokeLinecap="round" opacity="0.7">
        <path d="M79 204 v6" />
        <path d="M89 204 v6" />
        <path d="M111 204 v6" />
        <path d="M121 204 v6" />
      </g>

      {/* collier + médaille */}
      <path d="M62 132 C 76 146 124 146 138 132 C 136 142 124 152 100 152 C 76 152 64 142 62 132 Z" fill={COLLAR} />
      <path d="M64 138 C 78 150 122 150 136 138" stroke={COLLAR_DEEP} strokeWidth="3" fill="none" opacity="0.6" />
      <circle cx="100" cy="158" r="10" fill={TAG} />
      <circle cx="100" cy="158" r="4.5" fill={COLLAR} />

      {/* tête */}
      <circle cx="100" cy="78" r="55" fill={FUR} />

      {/* oreilles tombantes */}
      <motion.g
        style={{ transformOrigin: '54px 52px' }}
        animate={sleeping ? {} : { rotate: [0, -5, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}>
        
        <path
          d="M56 44 C 32 54 24 96 34 124 C 42 146 66 142 66 120 C 66 96 62 62 56 44 Z"
          fill={FUR_DARK} />
        
      </motion.g>
      <motion.g
        style={{ transformOrigin: '146px 52px' }}
        animate={sleeping ? {} : { rotate: [0, 5, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}>
        
        <path
          d="M144 44 C 168 54 176 96 166 124 C 158 146 134 142 134 120 C 134 96 138 62 144 44 Z"
          fill={FUR_DARK} />
        
      </motion.g>

      {/* reflet + sourcils */}
      <ellipse cx="78" cy="46" rx="19" ry="11" fill="#FFFFFF" opacity="0.35" transform="rotate(-22 78 46)" />
      <path d="M70 58 q12 -6 22 -1" stroke={BROW} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M130 58 q-12 -6 -22 -1" stroke={BROW} strokeWidth="4.5" fill="none" strokeLinecap="round" />

      <Eyes mood={mood} color={EYE} highlight="#FFFFFF" radius={14} />

      {/* museau */}
      <ellipse cx="100" cy="106" rx="27" ry="19" fill={MUZZLE} />
      <path
        d="M100 88 C 111 88 118 94 116 101 C 114 107 107 111 100 111 C 93 111 86 107 84 101 C 82 94 89 88 100 88 Z"
        fill={NOSE} />
      

      {openMouth && !sleeping ?
      <g>
          <path d="M82 112 C 86 132 114 132 118 112 C 110 120 90 120 82 112 Z" fill={MOUTH} />
          <motion.ellipse
          cx="100"
          cy="124"
          rx="8"
          fill={TONGUE}
          // `ry` n'est pas un attribut SVG anime nativement par Framer Motion :
          // sans valeur initiale explicite, il ecrit « undefined » a la premiere image.
          initial={{ ry: 6 }}
          animate={{ ry: [6, 8, 6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }} />
        
        </g> :

      <g stroke={NOSE} strokeWidth="2.8" fill="none" strokeLinecap="round">
          <path d="M100 111 v5" />
          <path d="M100 116 q-9 8 -14 0" />
          <path d="M100 116 q9 8 14 0" />
        </g>
      }
    </g>);

}