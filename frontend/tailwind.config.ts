import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        light: {
          background: '#F0FDF8',
          surface: '#FFFFFF',
          primary: '#00C97A',
          secondary: '#00B36B',
          accent: '#00E5A0',
          text: '#0A1A12',
          'text-secondary': '#4B7A62',
          border: '#C6EDD8',
          success: '#00C97A',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        dark: {
          background: '#0A0F0D',
          surface: '#111A14',
          primary: '#00E5A0',
          secondary: '#00C97A',
          accent: '#00FF99',
          text: '#F0FDF8',
          'text-secondary': '#7ABFA0',
          border: '#1E3328',
          success: '#00E5A0',
          warning: '#FBBF24',
          error: '#F87171',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;