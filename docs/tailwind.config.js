module.exports = {
  purge: ['./src/**/*.html', './src/**/*.js', './src/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  corePlugins: { preflight: false },
  important: '#tailwind',
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
