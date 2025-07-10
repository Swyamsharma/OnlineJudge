/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1E293B', // Slate 800
        'secondary': '#0F172A', // Slate 900
        'accent': {
          'DEFAULT': '#6366F1', // Indigo 500
          'hover': '#4F46E5', // Indigo 600
        },
        'text-primary': '#F8FAFC', // Slate 50
        'text-secondary': '#CBD5E1', // Slate 300
        'border-color': '#334155', // Slate 700
      },
      fontFamily: {
        // Add a modern sans-serif font
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // For styling markdown content
  ],
}