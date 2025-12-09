/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': '#1e40af',
        'brand-indigo': '#4f46e5',
      },
    },
  },
  plugins: [],
  safelist: [
    'animate-spin',
    'bg-indigo-600',
    'hover:bg-indigo-700',
  ],
}
