const defaultTheme = require('tailwindcss/defaultTheme');
const colors = require('tailwindcss/colors');

module.exports = {
  content: ['../src/**/*.html', '../src/**/*.js', '../src/**/*.tsx'],
  darkMode: 'class', // or 'media' or 'class'
  corePlugins: { preflight: false },
  important: true,
  theme: {
    extend: {
      colors: {
        'gray-850': '#18212F',
        blue: '#28c6e4',
        red: '#f92672',
        darkBlue: '#8be9fd',
        darkPink: '#ff79c6',
        darkBodyBackground: '#272b36',
        ...colors,
      },
    },
    fontFamily: {
      sans: ['Inter', ...defaultTheme.fontFamily.sans],
      serif: ['Inter', ...defaultTheme.fontFamily.serif],
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1400px',
    },
    container: {
      padding: '1rem',
    },
  },
  plugins: [],
};
