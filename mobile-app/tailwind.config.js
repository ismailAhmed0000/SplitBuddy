/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Neutral ramp — warm-tinted, iOS-like.
        // 50 = card/panel, 100 = inactive chip, 200 = border/divider,
        // 500 = secondary text, 900 = primary text.
        gray: {
          50: '#F7F7F6',
          100: '#F2F2F1',
          200: '#ECECEC',
          300: '#DCDCDC',
          400: '#AEAEB2',
          500: '#8E8E93',
          600: '#6A6A6E',
          700: '#48484A',
          800: '#2C2C2E',
          900: '#1A1A1A',
        },
        // No brand accent any more — the primary action is a black pill.
        teal: {
          50: '#F2F2F1',
          100: '#ECECEC',
          200: '#DCDCDC',
          300: '#C7C7C7',
          400: '#3A3A3C',
          500: '#1A1A1A',
          600: '#1A1A1A',
          700: '#1A1A1A',
          800: '#1A1A1A',
          900: '#1A1A1A',
        },
        // Positive / up
        emerald: {
          50: '#E9F9EE',
          100: '#CFF3DA',
          500: '#34C759',
          600: '#2BB350',
          700: '#249A45',
        },
        green: {
          50: '#E9F9EE',
          500: '#34C759',
          600: '#2BB350',
        },
        // Negative / down
        red: {
          50: '#FFECEB',
          100: '#FFDAD7',
          200: '#FFC7C2',
          400: '#FF8078',
          500: '#FF3B30',
          600: '#E5352B',
          700: '#C22C24',
        },
      },
    },
  },
  plugins: [],
};
