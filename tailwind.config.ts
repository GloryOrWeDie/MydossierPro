import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm & Trustworthy Palette
        coral: {
          50: '#FFF5F5',
          100: '#FFE5E5',
          200: '#FFC9C9',
          300: '#FFA8A8',
          400: '#FF8787',
          500: '#FF6B6B',  // Primary
          600: '#FA5252',
          700: '#F03E3E',
          800: '#E03131',
          900: '#C92A2A',
        },
        teal: {
          50: '#E6FCFF',
          100: '#C3F7FF',
          200: '#9AEFFF',
          300: '#6FE7FF',
          400: '#4BDAFF',
          500: '#4ECDC4',  // Secondary
          600: '#3DB5AC',
          700: '#2D9B92',
          800: '#1F8078',
          900: '#13615A',
        },
        dark: {
          DEFAULT: '#2D3436',
          light: '#636E72',
          lighter: '#B2BEC3',
        },
        light: {
          DEFAULT: '#F7F9FC',
          darker: '#E8EDF2',
        },
        // Keep primary for backward compatibility
        primary: {
          DEFAULT: "#FF6B6B",
          50: "#FFF5F5",
          100: "#FFE5E5",
          200: "#FFC9C9",
          300: "#FFA8A8",
          400: "#FF8787",
          500: "#FF6B6B",
          600: "#FA5252",
          700: "#F03E3E",
          800: "#E03131",
          900: "#C92A2A",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      boxShadow: {
        'coral': '0 10px 40px -10px rgba(255, 107, 107, 0.3)',
        'teal': '0 10px 40px -10px rgba(78, 205, 196, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
