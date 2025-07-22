import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class', // Active le dark mode via la classe 'dark'
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette inspirée de macOS/iOS (modifiable)
        background: {
          DEFAULT: '#F9F9F9', // Light background
          dark: '#1C1C1E',   // Dark background
        },
        foreground: {
          DEFAULT: '#111113', // Texte principal light
          dark: '#F2F2F7',   // Texte principal dark
        },
        accent: {
          DEFAULT: '#007AFF', // Bleu Apple
          dark: '#0A84FF',   // Bleu accent dark
        },
        border: {
          DEFAULT: '#D1D1D6', // Gris clair
          dark: '#3A3A3C',   // Gris foncé
        },
        // Couleurs système supplémentaires
        success: '#30D158',
        warning: '#FFD60A',
        error: '#FF453A',
      },
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Display',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};

export default config; 