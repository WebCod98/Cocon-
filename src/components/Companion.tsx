import { motion } from 'framer-motion';
import { PenguinBody } from './companions/PenguinBody';
import { CatBody } from './companions/CatBody';
import { DogBody } from './companions/DogBody';
import type { PinguMood, Species } from '../types';

interface CompanionProps {
  species: Species;
  mood: PinguMood;
  equipped?: string[];
  className?: string;
  name?: string;
}

export function Companion({
  species,
  mood,
  equipped = [],
  className = '',
  name = 'Votre compagnon'
}: CompanionProps) {
  const sleeping = mood === 'sleepy';
  const amplitude = mood === 'super' ? -18 : mood === 'love' ? -11 : sleeping ? 0 : -5;
  const duration = mood === 'super' ? 0.7 : mood === 'love' ? 0.95 : sleeping ? 3.6 : 2.4;

  const wearing = (id: string) => equipped.includes(id);
  const hasHeadphones = mood === 'listening';
  const hasBeanie = wearing('beanie') && !hasHeadphones;

  const Body = species === 'cat' ? CatBody : species === 'dog' ? DogBody : PenguinBody;

  return (
    <div className={`relative ${className}`} role="img" aria-label={`${name}, humeur : ${moodLabel(mood)}`}>
      {mood === 'love' && <Hearts />}
      {sleeping && <SleepZzz />}
      <motion.div
        animate={sleeping ? { scale: [1, 1.035, 1] } : { y: [0, amplitude, 0] }}
        transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}>
        
        <svg viewBox="0 0 200 230" className="h-full w-full">
          <ellipse cx="100" cy="216" rx="52" ry="9" fill="#000000" opacity="0.12" />

          <Body mood={mood} sleeping={sleeping} duration={duration} />

          {/* écharpe */}
          {wearing('scarf') &&
          <g>
              <rect x="58" y="126" width="84" height="19" rx="9.5" fill="#8FC9B4" />
              <rect x="118" y="136" width="19" height="44" rx="9.5" fill="#8FC9B4" />
              <rect x="118" y="154" width="19" height="6" fill="#7BB8A3" />
            </g>
          }

          {/* lunettes */}
          {wearing('glasses') &&
          <g stroke="#1F1F1F" strokeWidth="3.5" fill="none">
              <circle cx="82" cy="80" r="15" />
              <circle cx="118" cy="80" r="15" />
              <path d="M97 80 h6" />
            </g>
          }

          {/* bonnet de nuit */}
          {hasBeanie &&
          <g>
              <path d="M56 58 Q100 6 144 58 Z" fill="#E8748F" />
              <rect x="52" y="50" width="96" height="16" rx="8" fill="#FFF6F8" />
              <circle cx="100" cy="14" r="9" fill="#FFF6F8" />
            </g>
          }

          {/* casque audio */}
          {hasHeadphones &&
          <g>
              <path d="M46 74 Q100 6 154 74" stroke="#4A2F3C" strokeWidth="11" fill="none" strokeLinecap="round" />
              <rect x="32" y="62" width="24" height="36" rx="12" fill="#E8748F" />
              <rect x="144" y="62" width="24" height="36" rx="12" fill="#E8748F" />
            </g>
          }

          {/* couronne */}
          {wearing('crown') &&
          <path d="M64 48 l10 -32 14 21 12 -29 12 29 14 -21 10 32 z" fill="#F3C36B" />
          }

          {/* noeud papillon */}
          {wearing('bowtie') &&
          <g>
              <path d="M100 132 l-22 -13 v26 z" fill="#E8748F" />
              <path d="M100 132 l22 -13 v26 z" fill="#E8748F" />
              <circle cx="100" cy="132" r="6" fill="#C85C76" />
            </g>
          }

          {/* fleur sur l'oreille */}
          {wearing('flower') &&
          <g>
              {[0, 1, 2, 3, 4].map((petal) =>
            <ellipse
              key={petal}
              cx={144 + 9 * Math.cos((petal * 2 * Math.PI) / 5)}
              cy={62 + 9 * Math.sin((petal * 2 * Math.PI) / 5)}
              rx="6.5"
              ry="6.5"
              fill="#F9D2DE" />

            )}
              <circle cx="144" cy="62" r="5" fill="#F3C36B" />
            </g>
          }
        </svg>
      </motion.div>
    </div>);

}

function Hearts() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {[0, 1, 2].map((index) =>
      <motion.span
        key={index}
        className="absolute text-2xl"
        style={{ left: `${22 + index * 26}%`, bottom: '38%' }}
        initial={{ opacity: 0, y: 0, scale: 0.6 }}
        animate={{ opacity: [0, 1, 0], y: -90, scale: [0.6, 1, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.4, ease: 'easeOut' }}>
        
          💗
        </motion.span>
      )}
    </div>);

}

function SleepZzz() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {[0, 1].map((index) =>
      <motion.span
        key={index}
        className="absolute font-display text-xl text-paper/70"
        style={{ right: `${16 - index * 6}%`, top: `${14 + index * 4}%` }}
        animate={{ opacity: [0, 1, 0], y: -26 }}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.9 }}>
        
          z
        </motion.span>
      )}
    </div>);

}

function moodLabel(mood: PinguMood) {
  switch (mood) {
    case 'super':
      return 'super heureux';
    case 'love':
      return 'tout amoureux';
    case 'sleepy':
      return 'endormi';
    case 'listening':
      return 'à l’écoute avec son casque';
    default:
      return 'content';
  }
}