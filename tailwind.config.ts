import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f6f4ee",
          100: "#ebe4d5",
          200: "#dccca9",
          300: "#c9ab73",
          400: "#b48c49",
          500: "#946f31",
          600: "#7d5928",
          700: "#654521",
          800: "#563a1e",
          900: "#4a321c"
        },
        accent: "#0f766e",
        danger: "#dc2626"
      },
      fontFamily: {
        sans: ["var(--font-sans)"]
      },
      boxShadow: {
        soft: "0 20px 45px -25px rgba(32, 24, 16, 0.35)"
      },
      backgroundImage: {
        noise:
          "radial-gradient(circle at 1px 1px, rgba(80,60,40,0.12) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};

export default config;
