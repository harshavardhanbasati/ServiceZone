/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        quantico: ['"Quantico"', 'sans-serif'],
        mono: ['"Quantico"', 'monospace'],
      },
      colors: {
        graphite: {
          950: '#0b0f14',
          900: '#111820',
          850: '#151e27',
          800: '#1a232e',
          700: '#2a3441',
          600: '#3a4655',
        },
        offwhite: {
          50: '#faf9f5',
          100: '#f1f0eb',
          200: '#e8e7e0',
          300: '#dedcd3',
        },
        electric: {
          DEFAULT: '#246BFD',
          hover: '#1b56d1',
          dim: '#133e96',
          glow: 'rgba(36, 107, 253, 0.15)',
        },
        techgrey: {
          100: '#f4f5f6',
          200: '#e4e7e9',
          300: '#d5d9dc',
          400: '#a3abb2',
          500: '#7c878e',
          600: '#535d64',
        },
        amber: {
          DEFAULT: '#E5A343',
          dim: '#855b1f',
        },
        green: {
          DEFAULT: '#27865B',
          dim: '#164d34',
        },
        crimson: {
          DEFAULT: '#D13B3B',
          dim: '#7c2020',
        }
      },
      borderRadius: {
        'none': '0px',
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
