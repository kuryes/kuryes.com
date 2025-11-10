/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./**/*.html",
    "./js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF3131',
        accent: '#24A8AB',
        support: {
          yellow: '#FFD60A',
          orange: '#FF7A00'
        },
        bg: '#F8FBFD',
        text: '#1C1C1C',
        muted: '#6F6F6F'
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'inter': ['Inter', 'sans-serif']
      }
    }
  },
  plugins: []
}



