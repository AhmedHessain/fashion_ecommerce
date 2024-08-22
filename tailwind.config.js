/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        transparent: "transparent",
        primary: "#B487C9",
        white: "#FFFFFF",
        text: "#2C3E50",
        item_background: "#FAFAFA",
      },
      fontSize: {
        sm: "8px",
        base: "16px",
        l: "24px",
        xl: "32px",
        xxl: "48px",
        xxxl: "68px",
      },
    },
  },
};
