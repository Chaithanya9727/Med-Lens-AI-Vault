/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#07090F',
          raised: '#0D1117',
          overlay: '#161B22',
          subtle: '#1C2128',
        },
        brand: {
          DEFAULT: '#58A6FF',
          light: '#79C0FF',
          dark: '#388BFD',
          muted: '#1F3D5C',
        },
        accent: {
          teal: '#3DDBD9',
          indigo: '#8B8FFF',
          emerald: '#3FB950',
          amber: '#D29922',
          rose: '#F47067',
        },
        tx: {
          primary: '#E6EDF3',
          secondary: '#8B949E',
          muted: '#484F58',
          inverse: '#07090F',
        },
        edge: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          hover: 'rgba(255,255,255,0.16)',
          active: 'rgba(88,166,255,0.4)',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      animation: {
        'spin-slow': 'spin 4s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 8s ease infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideUp: {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        glow: {
          from: { boxShadow: '0 0 20px rgba(88,166,255,0.15)' },
          to: { boxShadow: '0 0 40px rgba(88,166,255,0.25)' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 15px rgba(88,166,255,0.15)',
        'glow-md': '0 0 30px rgba(88,166,255,0.2)',
        'glow-lg': '0 0 60px rgba(88,166,255,0.25)',
      },
    },
  },
  plugins: [],
}
