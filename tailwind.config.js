/**
 * Palette issue de la maquette. Chaque teinte passe par une variable CSS
 * (definie dans index.css) pour que le « Mode Sommeil Etoile » puisse
 * basculer toute l'interface en sombre sans toucher une seule classe.
 */
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: token('--c-cream'),
        frost: token('--c-frost'),
        ice: token('--c-ice'),
        ink: token('--c-ink'),
        muted: token('--c-muted'),
        coral: token('--c-coral'),
        blush: token('--c-blush'),
        mint: token('--c-mint'),
        sun: token('--c-sun'),
        night: token('--c-night'),
        /** Toujours clair : texte et details poses sur une surface sombre. */
        paper: '#FFF6F8',
      },
      fontFamily: {
        display: ['Fredoka', 'ui-rounded', 'system-ui', 'sans-serif'],
        body: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        soft: '0 10px 30px -18px rgba(74, 47, 60, 0.4)',
        lift: '0 18px 40px -24px rgba(74, 47, 60, 0.5)',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.25' },
          '50%': { opacity: '1' },
        },
        'fall-down': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        'fall-down': 'fall-down 2.6s linear forwards',
      },
    },
  },
};
