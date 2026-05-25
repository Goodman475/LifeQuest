import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Light mode palette
        light: {
          background: '#FFFFFF',
          surface: '#F5F5F5',
          primary: '#6366F1',
          secondary: '#8B5CF6',
          accent: '#EC4899',
          text: '#1F2937',
          'text-secondary': '#6B7280',
          border: '#E5E7EB',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
        },
        // Dark mode palette
        dark: {
          background: '#0F172A',
          surface: '#1E293B',
          primary: '#818CF8',
          secondary: '#A78BFA',
          accent: '#F472B6',
          text: '#F1F5F9',
          'text-secondary': '#CBD5E1',
          border: '#334155',
          success: '#34D399',
          warning: '#FBBF24',
          error: '#F87171',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
