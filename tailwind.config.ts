import type { Config } from "tailwindcss";

// Whitney Bateson brand tokens — matched to the live Done-For-You Funnel intake.
// Lora (display) + DM Sans (body), warm cream + deep teal + coral, soft rounded
// corners.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#efeae3", // page background
        white: "#ffffff",
        teal: "#02525d", // primary teal
        tealdark: "#013840", // dark surfaces (landing bg, headers) + body text
        tealmid: "#3a6068", // secondary text / hover
        coral: "#ff7f50", // accent / primary CTAs
        coraldark: "#e86e3f", // coral hover
        lime: "#e3f696",
        sky: "#aed3dd",
        skylight: "#c8e6ee", // info callout fill
        line: "#d4e4e7", // borders
        textmid: "#3a6068",
        textlight: "#7a9499",
        alert: "#b23a1f", // form errors

        // Semantic aliases kept so existing utility classes keep working.
        paper: "#efeae3", // = cream
        ink: "#013840", // = tealdark (body text)
      },
      fontFamily: {
        display: ["Lora", "Georgia", "serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.15em",
      },
    },
  },
  plugins: [],
};

export default config;
