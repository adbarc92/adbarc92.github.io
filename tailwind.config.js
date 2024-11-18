/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '50%': { transform: 'translate(20px, -20px) rotate(10deg)' },
        },
      },
    },
  },
  plugins: [],
};
