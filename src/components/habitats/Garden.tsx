import { motion } from 'framer-motion';

const S = '#5F7A63';

/** Jardin d'aventures du chien — vert menthe, ciel bleu, niche pastel. */
export function Garden({ className = '' }: {className?: string;}) {
  return (
    <svg
      viewBox="0 0 360 260"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true">
      
      <rect width="360" height="260" fill="#DAEEF8" />
      <circle cx="46" cy="44" r="20" fill="#FBE3A0" stroke="#E4C574" strokeWidth="2" />
      <g fill="#FFFFFF" opacity="0.85">
        <ellipse cx="120" cy="40" rx="26" ry="12" />
        <ellipse cx="140" cy="34" rx="18" ry="11" />
      </g>

      {/* pelouse */}
      <path
        d="M0 146 Q 90 134 180 144 T 360 140 L360 260 L0 260 Z"
        fill="#C8E7C1"
        stroke={S}
        strokeWidth="2" />
      

      {/* clôture basse */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        {[0, 1, 2, 3, 4, 5].map((index) =>
        <rect
          key={index}
          x={10 + index * 28}
          y={112}
          width="13"
          height="28"
          rx="6"
          fill="#FDFDFD" />

        )}
        <rect x="8" y="118" width="172" height="5" rx="2" fill="#FDFDFD" />
        <rect x="8" y="130" width="172" height="5" rx="2" fill="#FDFDFD" />
      </g>

      {/* pommier */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <path d="M312 168 v-44" stroke="#B98457" strokeWidth="14" strokeLinecap="round" />
        <circle cx="316" cy="96" r="34" fill="#8FC98C" />
        <circle cx="290" cy="112" r="21" fill="#9ED09A" />
        <circle cx="338" cy="116" r="18" fill="#9ED09A" />
        <g fill="#E4666E" stroke="#C24F58">
          <circle cx="304" cy="92" r="6" />
          <circle cx="328" cy="104" r="6" />
          <circle cx="312" cy="118" r="6" />
        </g>
      </g>

      {/* niche */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <path d="M214 152 L262 106 L310 152 Z" fill="#A9C9E9" />
        <rect x="220" y="150" width="86" height="56" rx="8" fill="#BDD8F0" />
        <path d="M236 206 v-40 q26 -14 54 0 v40" fill="#9BBFE2" />
        <rect x="240" y="176" width="46" height="30" rx="8" fill="#F2AFBB" />
        <rect x="238" y="164" width="22" height="18" rx="6" fill="#F5D89B" />
        <rect x="264" y="164" width="22" height="18" rx="6" fill="#CDE3F6" />
      </g>

      {/* piscine à balles */}
      <g stroke={S} strokeWidth="2">
        <ellipse cx="88" cy="222" rx="52" ry="19" fill="#A9C9E9" />
        <ellipse cx="88" cy="217" rx="42" ry="13" fill="#CDE3F6" />
        <g strokeWidth="1.5">
          <circle cx="70" cy="214" r="7" fill="#F2A0B4" />
          <circle cx="86" cy="218" r="7" fill="#F5D89B" />
          <circle cx="102" cy="213" r="7" fill="#8FC98C" />
          <circle cx="94" cy="222" r="6" fill="#E4666E" />
          <circle cx="76" cy="222" r="6" fill="#9BBFE2" />
        </g>
      </g>

      {/* cache-croquettes */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <rect x="12" y="176" width="52" height="30" rx="10" fill="#F5D89B" />
        <g fill="#D8B673">
          <circle cx="26" cy="191" r="5" />
          <circle cx="38" cy="191" r="5" />
          <circle cx="50" cy="191" r="5" />
        </g>
      </g>

      {/* dalles */}
      <g stroke={S} strokeWidth="2" fill="#E8EBE1">
        <ellipse cx="160" cy="238" rx="22" ry="8" />
        <ellipse cx="204" cy="250" rx="22" ry="8" />
      </g>

      {/* touffes d'herbe */}
      <motion.g
        stroke={S}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        animate={{ rotate: [0, 2.5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '180px 220px' }}>
        
        <path d="M148 176 q-4 -10 2 -14 M154 176 q2 -12 8 -14" />
        <path d="M330 200 q-4 -10 2 -14 M336 200 q2 -12 8 -14" />
        <path d="M188 214 q-4 -10 2 -14 M194 214 q2 -12 8 -14" />
      </motion.g>
    </svg>);

}