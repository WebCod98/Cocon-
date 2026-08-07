import { motion } from 'framer-motion';

const S = '#6E8B9E';

/** Banquise du pingouin — iglou en verre, toboggan de glace, aurore boréale. */
export function IceField({ className = '' }: {className?: string;}) {
  return (
    <svg
      viewBox="0 0 360 260"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true">
      
      <rect width="360" height="260" fill="#DCEBF7" />

      {/* aurore boréale */}
      <motion.g
        animate={{ opacity: [0.45, 0.85, 0.45] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        
        <path d="M-10 66 Q 90 18 190 58 T 370 34 L370 66 Q 250 96 150 76 T -10 96 Z" fill="#AFE3D6" />
        <path d="M-10 92 Q 100 46 200 86 T 370 62 L370 88 Q 240 118 140 100 T -10 118 Z" fill="#CBBBE9" opacity="0.7" />
      </motion.g>

      {/* flocons */}
      {[
      { x: 60, delay: 0 },
      { x: 148, delay: 1.4 },
      { x: 246, delay: 0.7 },
      { x: 320, delay: 2.1 }].
      map((flake) =>
      <motion.text
        key={flake.x}
        x={flake.x}
        y="0"
        fontSize="14"
        fill="#FFFFFF"
        animate={{ y: [30, 150], opacity: [0, 1, 0] }}
        transition={{ duration: 7, repeat: Infinity, delay: flake.delay, ease: 'linear' }}>
        
          ❄
        </motion.text>
      )}

      {/* banquise */}
      <path
        d="M0 158 Q 96 144 180 154 T 360 148 L360 260 L0 260 Z"
        fill="#F7FBFF"
        stroke="#BBD8EA"
        strokeWidth="2" />
      
      <path d="M0 186 Q 120 176 240 188 T 360 182" stroke="#DCEBF7" strokeWidth="6" fill="none" />

      {/* lit polaire visible dans l'iglou */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <rect x="42" y="132" width="70" height="24" rx="10" fill="#EFA9A2" />
        <rect x="44" y="120" width="34" height="18" rx="8" fill="#F5E3CE" />
      </g>

      {/* iglou en verre */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <path d="M20 158 A 58 58 0 0 1 136 158 Z" fill="#E6F3FC" opacity="0.85" />
        <path d="M38 158 A 40 40 0 0 1 118 158" fill="none" stroke="#C3DEEF" />
        <path d="M56 158 A 22 22 0 0 1 100 158" fill="none" stroke="#C3DEEF" />
        <path d="M78 100 v58" stroke="#C3DEEF" />
        <path d="M62 130 h32" stroke="#C3DEEF" />
        <path d="M96 158 v-22 a 16 16 0 0 1 32 0 v22 z" fill="#D3E9F7" />
      </g>

      {/* toboggan de glace */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <path d="M232 158 v-34 a 14 14 0 0 1 28 0 v10 q34 12 46 24 z" fill="#CFE8F7" />
        <path d="M262 138 q28 10 38 20" fill="none" stroke="#FFFFFF" strokeWidth="4" />
        <path d="M240 128 v30" fill="none" stroke="#B7D8EC" />
      </g>

      {/* stalactites */}
      <g stroke={S} strokeWidth="2" fill="#EAF5FD">
        <path d="M176 108 l6 -22 l6 22 z" />
        <path d="M196 100 l5 -16 l5 16 z" />
      </g>

      {/* bassin de pêche */}
      <g stroke={S} strokeWidth="2">
        <ellipse cx="180" cy="230" rx="58" ry="19" fill="#BEDDF2" />
        <ellipse cx="180" cy="228" rx="46" ry="13" fill="#9FCCEA" />
        <g strokeWidth="1.5">
          <path d="M160 228 q10 -8 20 0 q-10 8 -20 0 z" fill="#EFA9A2" />
          <path d="M158 228 l-8 -5 v10 z" fill="#EFA9A2" />
          <path d="M192 232 q9 -7 18 0 q-9 7 -18 0 z" fill="#8FC1D9" />
          <path d="M190 232 l-7 -5 v10 z" fill="#8FC1D9" />
        </g>
        <path d="M214 200 l-18 24" strokeLinecap="round" />
      </g>
    </svg>);

}