/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#F4EFDE",
        "cream-soft": "#E9E1CD",
        tan: "#E3D8C0",
        "tan-2": "#D6C3A4",
        cinnamon: "#B2724D",
        sage: "#A5B9A3",
        "text-primary": "#2F2416",
        "text-secondary": "#65563F",
        "border-strong": "rgba(89, 66, 39, 0.18)",
        "border-stronger": "rgba(89, 66, 39, 0.32)",
      },
      borderRadius: {
        card: "18px",
      },
      boxShadow: {
        soft: "0 18px 34px rgba(15, 10, 5, 0.16)",
      },
    },
  },
  plugins: [],
};
