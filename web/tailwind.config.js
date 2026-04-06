/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'estonia-blue': '#0072CE',
        'estonia-black': '#000000',
        'estonia-white': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
