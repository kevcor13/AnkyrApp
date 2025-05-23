/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        "poppins-semibold": ["Poppins-SemiBold", "sans-serif"],
        "poppins-medium" : ["Poppins-Medium", "sans-serif"],
        quicksand: ["Quicksand", "sans-serif"],
        "quicksand-bold": ["Quicksand-Bold", "sans-serif"],
        raleway: ['Raleway-Regular', 'sans-serif'],
        sintony: ['Sintony', 'sans-serif'],
        "sintony-bold": ["Sintony-Bold", "sans-serif"],
      },
    },
  },
  plugins: [],
}