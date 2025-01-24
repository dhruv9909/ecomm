/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      boxShadow : {
        'st' : '10px 10px 20px rgb(130, 130, 130)',
        'stw' : '4px 4px 8px rgba(0, 0, 1, 0.750)',
      },

    },
  },
  plugins: [],
}

