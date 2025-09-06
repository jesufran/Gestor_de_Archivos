/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./App.tsx",
    "./Header.tsx",
    "./components/**/*.{ts,tsx,js,jsx}",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary': {
          'light': 'hsl(243 89% 60%)', /* Indigo 600 */
          'dark': 'hsl(236 89% 77%)' /* Indigo 400 */
        },
        'secondary': {
          'light': '#f0f9ff',
          'dark': '#424242'
        },
        'background': {
          'light': '#f8fafc',
          'dark': '#383838'
        },
        'text': {
          'primary': {
            'light': '#1e293b',
            'dark': '#e4e4e7'
          },
          'secondary': {
            'light': '#64748b',
            'dark': '#a1a1aa'
          }
        },
        'border': {
          'light': '#e2e8f0',
          'dark': '#4d4d4d'
        },
        'hover': {
          'dark': '#5a5a5a'
        }
      }
    }
  },
  plugins: [],
}