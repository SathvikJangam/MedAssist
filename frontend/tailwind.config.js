/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Enterprise MNC Healthcare Palette
        primary: {
          DEFAULT: '#0F62FE', // IBM Corporate Blue (Trust, Action)
          hover: '#0043CE',
          light: '#EDF5FF',   // Subtle blue for active backgrounds
        },
        success: {
          DEFAULT: '#24A148', // Crisp optimistic green
          light: '#DEFBE6',
        },
        surface: {
          DEFAULT: '#F4F7F9', // Very soft grey/blue app background
          card: '#FFFFFF',    // Pure white for data cards
        },
        text: {
          main: '#161616',    // Soft black for readable headings
          muted: '#525252',   // Grey for secondary text
        },
        border: '#E0E0E0'
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.03)', // Very soft, modern MNC shadow
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Standard professional font
      }
    },
  },
  plugins: [],
}