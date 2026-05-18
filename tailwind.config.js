const { nextui } = require("@nextui-org/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        微信绿: '#07c160',
        小红书红: '#ff2442',
        微博橙: '#ff8200',
      }
    },
  },
  darkMode: "class",
  plugins: [nextui()],
};
