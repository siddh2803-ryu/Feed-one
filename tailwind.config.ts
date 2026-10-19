import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: {
          DEFAULT: "var(--surface)",
          muted: "var(--surface-muted)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
        },
        foreground: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
        brand: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          on: "var(--on-primary)",
          subtle: "var(--primary-subtle)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          subtle: "var(--accent-subtle)",
          strong: "var(--accent-strong)",
        },
        success: {
          DEFAULT: "var(--success)",
          subtle: "var(--success-subtle)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          subtle: "var(--warning-subtle)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          subtle: "var(--danger-subtle)",
        },
        info: {
          DEFAULT: "var(--info)",
          subtle: "var(--info-subtle)",
        },
        neutral: {
          DEFAULT: "var(--neutral)",
          subtle: "var(--neutral-subtle)",
        },
        demo: {
          DEFAULT: "var(--demo)",
          subtle: "var(--demo-subtle)",
        },
        focus: "var(--focus)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
