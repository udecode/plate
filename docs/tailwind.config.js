module.exports = {
  purge: ['./src/**/*.html', './src/**/*.js', './src/**/*.tsx'],
  darkMode: 'class', // or 'media' or 'class'
  corePlugins: { preflight: false },
  important: '#tailwind',
  theme: {
    extend: {
      colors: {
        'gray-850': '#18212F',
        blue: '#28c6e4',
        red: '#f92672',
        darkBlue: '#8be9fd',
        darkPink: '#ff79c6',
        darkBodyBackground: '#272b36',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
