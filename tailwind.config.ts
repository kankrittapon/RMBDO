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
        bg: {
          canvas: "#0B0D17",
          "surface-1": "#131627",
          "surface-2": "#1C2038",
          "surface-3": "#242A4A",
        },
        border: {
          subtle: "#1E2442",
          active: "#6366F1",
        },
        brand: {
          primary: "#8B5CF6",
          accent: "#3B82F6",
          gold: "#F59E0B",
          success: "#10B981",
          danger: "#EF4444",
          warning: "#F59E0B",
          cyan: "#06B6D4",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        }
      },
      fontFamily: {
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "monospace"],
        heading: ["var(--font-chakra)", "Chakra Petch", "sans-serif"],
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
