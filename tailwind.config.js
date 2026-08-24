/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // Catches ALL files under /src automatically
  ],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        primary: "#B487C9",
        text: "#2C3E50",
        item_background: "#FAFAFA",
      },
      // Fixed font sizes mapping to standard Tailwind class names
      fontSize: {
        xs: "8px",
        sm: "12px",
        base: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "68px",
      },
      textShadow: {
        sm: "0 1px 2px var(--tw-shadow-color)",
        DEFAULT: "0 2px 4px var(--tw-shadow-color)",
        lg: "0 4px 4px var(--tw-shadow-color)",
      },
    },
  },
  plugins: [
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          "custom-text-shadow": (value) => ({
            textShadow: value,
          }),
        },
        { values: theme("textShadow") },
      );
    }),
  ],
};
