/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: '#7552F6',
          purpleDark: '#5E38E8',
          purpleLight: '#8C6DF8',
          navy: '#20243A',
          navyLight: '#2C324E',
          bg: '#F2F4FB',
          card: '#FFFFFF',
          lavender: '#EEEAFE',
          lavenderDark: '#D4CCFB',
          mint: '#DFF5EC',
          mintDark: '#A3E5CB',
          blue: '#E5F0FF',
          blueDark: '#BAdafE',
          orange: '#FFF0D8',
          orangeDark: '#FED7AA',
        },
        primary: {
          50: '#F5F3FF',
          100: '#EEEAFE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#7552F6',
          600: '#5E38E8',
          700: '#4C28D4',
          800: '#3C1CB8',
          900: '#2A128B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(32, 36, 58, 0.06), 0 1px 4px -1px rgba(32, 36, 58, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(117, 82, 246, 0.12), 0 4px 12px -2px rgba(32, 36, 58, 0.06)',
      },
    },
  },
  plugins: [],
}
