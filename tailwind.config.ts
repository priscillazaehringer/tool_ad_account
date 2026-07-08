import type { Config } from "tailwindcss";

// Design tokens for the Meta setup wizard.
// Warm, editorial, unfussy. No rounded corners on interactive elements.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm oyster / paper background
        paper: "#F5F1E8",
        // Deep ink text
        ink: "#1C1E1A",
        // Muted moss accent
        moss: "#4A5D3F",
        // Warm clay for errors
        clay: "#B85C3A",
      },
      fontFamily: {
        // Fraunces for display type, Inter for body copy.
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;
