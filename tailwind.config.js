/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        clinical: {
          blue: "#124BCE",
        },
      },
      boxShadow: {
        clinical: "0 16px 40px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};
