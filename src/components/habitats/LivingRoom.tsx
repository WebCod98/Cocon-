
const S = '#8A6E77';

/** Salon cosy du chat — aplats vieux rose et beige, formes rondes. */
export function LivingRoom({ className = '' }: {className?: string;}) {
  return (
    <svg
      viewBox="0 0 360 260"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden="true">
      
      <rect width="360" height="260" fill="#FBE1E6" />
      <rect y="198" width="360" height="62" fill="#F4D8C4" />
      <path d="M0 198 H360" stroke={S} strokeWidth="2" />

      {/* tapis */}
      <ellipse cx="188" cy="228" rx="132" ry="24" fill="#F7C9D3" stroke={S} strokeWidth="2" />

      {/* étagère & souvenirs */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <rect x="112" y="60" width="126" height="8" rx="4" fill="#DCA97E" />
        <path d="M126 68 v8 M224 68 v8" />
        <path d="M132 40 h18 l-3 20 h-12 z" fill="#DE8E6B" />
        <path d="M141 40 c -12 -8 -18 -18 -6 -20 c 8 -1 8 10 6 20 z" fill="#7FBF8A" />
        <path d="M141 40 c 12 -8 20 -14 8 -18 c -8 -3 -10 8 -8 18 z" fill="#93CC9C" />
        <rect x="166" y="44" width="12" height="16" rx="3" fill="#8FC1D9" />
        <rect x="180" y="38" width="9" height="22" rx="3" fill="#E88C8C" />
        <rect x="191" y="42" width="9" height="18" rx="3" fill="#F0C36B" />
        <path d="M210 52 h12 l-2 8 h-8 z" fill="#F0C36B" />
        <path d="M212 52 c -6 -10 12 -10 8 0" fill="none" />
      </g>

      {/* mini-canapé moutarde */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <rect x="18" y="124" width="116" height="46" rx="20" fill="#EFC163" />
        <rect x="8" y="146" width="24" height="46" rx="12" fill="#E8B44B" />
        <rect x="120" y="146" width="24" height="46" rx="12" fill="#E8B44B" />
        <rect x="14" y="158" width="124" height="34" rx="16" fill="#F1C973" />
        <path d="M34 192 v8 M118 192 v8" strokeLinecap="round" />
        <g stroke="#C99A3C" strokeWidth="2">
          <path d="M52 140 l8 8 M60 140 l-8 8" />
          <path d="M92 140 l8 8 M100 140 l-8 8" />
        </g>
      </g>

      {/* panier tricoté */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <path d="M148 178 h96 l-8 34 h-80 z" fill="#D6E9F4" />
        <ellipse cx="196" cy="178" rx="48" ry="14" fill="#C3DCEC" />
        <g stroke="#A9CADF" strokeWidth="2">
          <path d="M164 188 v18 M180 190 v20 M196 190 v20 M212 190 v20 M228 188 v18" />
        </g>
      </g>

      {/* pelotes de laine */}
      <g stroke={S} strokeWidth="2">
        <circle cx="258" cy="204" r="13" fill="#F2A0B4" />
        <path d="M250 200 q8 6 16 2 M252 208 q6 -6 14 -4" fill="none" stroke="#DB7E95" />
        <circle cx="278" cy="212" r="10" fill="#F0C36B" />
        <path d="M272 209 q6 5 12 1" fill="none" stroke="#CFA246" />
      </g>

      {/* gamelle */}
      <g stroke={S} strokeWidth="2">
        <path d="M238 208 h44 l-6 14 h-32 z" fill="#8FC1D9" />
        <ellipse cx="260" cy="208" rx="22" ry="6" fill="#B4D9E8" />
      </g>

      {/* poteau à griffer */}
      <g stroke={S} strokeWidth="2" strokeLinejoin="round">
        <ellipse cx="316" cy="196" rx="32" ry="11" fill="#F3C0CB" />
        <rect x="304" y="122" width="24" height="74" fill="#E8C99B" />
        <g stroke="#C9A374" strokeWidth="1.5">
          <path d="M304 134 h24 M304 146 h24 M304 158 h24 M304 170 h24 M304 182 h24" />
        </g>
        <ellipse cx="316" cy="122" rx="28" ry="10" fill="#F3C0CB" />
        <path d="M330 128 q10 14 4 24" fill="none" />
        <circle cx="334" cy="158" r="8" fill="#F2A0B4" />
      </g>
    </svg>);

}