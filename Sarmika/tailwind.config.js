/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#AA0022"
      },
      fontFamily: {
        lthin: ["Outfit-Thin", "sans-serif"],
        lextralight: ["Outfit-ExtraLight", "sans-serif"],
        llight: ["Outfit-Light", "sans-serif"],
        lregular: ["Outfit-Regular", "sans-serif"],
        lmedium: ["Outfit-Medium", "sans-serif"],
        lsemibold: ["Outfit-SemiBold", "sans-serif"],
        lbold: ["Outfit-Bold", "sans-serif"],
        lextrabold: ["Outfit-ExtraBold", "sans-serif"],
        lblack: ["Outfit-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
}