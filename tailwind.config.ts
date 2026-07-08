import type { Config } from "tailwindcss";

// Whitney Bateson brand tokens.
// Warm, editorial, unfussy. No rounded corners on interactive elements.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand palette
        cream: "#efeae3", // warm cream — backgrounds
        pink: "#ffcdcd", // soft pink
        coral: "#ff7f50", // coral — accent / CTAs
        lime: "#e3f696", // pale lime
        sky: "#aed3dd", // light blue — hero / info
        teal: "#02525d", // deep teal — dark anchor / text

        // Functional (not a brand colour): errors & warnings.
        alert: "#b23a1f",

        // Semantic aliases used throughout the UI.
        paper: "#efeae3", // page background  (= cream)
        ink: "#02525d", // primary text     (= deep teal)
      },
      fontFamily: {
        // Boston Angel (display) and Proxima Nova (body) are licensed fonts;
        // Milkshake Script is used for handwritten accents. See globals.css and
        // README for how to activate them. Web-safe/Google fallbacks are wired
        // in so the layout looks right before the licensed fonts load.
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      letterSpacing: {
        label: "0.18em",
      },
    },
  },
  plugins: [],
};

export default config;
