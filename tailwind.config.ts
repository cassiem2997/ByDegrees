import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#171723",
        mist: "#f5f4ff",
        coral: "#ff7a6d",
        peach: "#ffb48a",
        sky: "#6ab8ff",
        mint: "#89d8b6",
        gold: "#ffd66b"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(37, 41, 89, 0.12)"
      },
      backgroundImage: {
        "temptracks-glow":
          "radial-gradient(circle at top left, rgba(255,122,109,0.20), transparent 35%), radial-gradient(circle at top right, rgba(106,184,255,0.22), transparent 38%), linear-gradient(180deg, #fff9f6 0%, #f8f8ff 52%, #f4fbff 100%)"
      }
    }
  },
  plugins: []
};

export default config;
