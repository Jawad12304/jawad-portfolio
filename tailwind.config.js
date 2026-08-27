/** Tailwind config — used by the local build only. See package.json scripts. */
module.exports = {
  content: ['./index.html', './assets/js/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
      },
      colors: {
        brand: { light: '#6ee7ff', DEFAULT: '#06b6d4', dark: '#0f766e' },
        accent: '#f59e0b',
      },
    },
  },
  corePlugins: { preflight: true },
  plugins: [],
}
