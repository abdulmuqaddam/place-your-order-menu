import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#E4A11B",
        "gold-light": "#f5c842",
        "dark-bg": "#121212",
        "card-bg": "#1e1e1e",
      },
    },
  },
  plugins: [],
};
export default config;
