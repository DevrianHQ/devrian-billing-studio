/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        devrian: {
          black: '#0E0E0E',
          grey: '#6B6B6B',
          lightgrey: '#9E9E9E',
          divider: '#E5E5E5',
          box: '#F0F0F0',
          darkbox: '#141414',
          subtle: '#222222',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

