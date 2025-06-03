module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './node_modules/@heyform-inc/form-renderer/src/**/*.tsx'],
  theme: {
    extend: {}
  },
  variants: {
    extend: {}
  },
  plugins: [require('@tailwindcss/forms')]
}
