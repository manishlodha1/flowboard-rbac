import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0c1222',
          900: '#141c2e',
          800: '#1e2a44',
          700: '#2a3a56',
          500: '#5b6b86',
          300: '#9aa8c0',
          100: '#e8eef7',
        },
        accent: {
          DEFAULT: '#0f7a6a',
          soft: '#d8f3ee',
          deep: '#0a5c50',
        },
        sand: {
          50: '#f7f5f1',
          100: '#efeae2',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(20, 28, 46, 0.08)',
      },
      backgroundImage: {
        mesh: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(15,122,106,0.18), transparent), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(30,42,68,0.12), transparent), linear-gradient(180deg, #f7f5f1 0%, #eef3f8 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
