/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './App.{js,ts,tsx}', './src/components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary-bg)',
          hover: 'var(--color-primary-hover-bg)',
          border: 'var(--color-primary-hover-border)',
          dark: 'var(--color-primary-dark-hex)',
        },
        accent: {
          DEFAULT: 'var(--color-accent-bg)',
          hover: 'var(--color-accent-hover-bg)',
          border: 'var(--color-accent-border)',
          dark: 'var(--color-accent-dark-hex)',
        },
        background: 'var(--color-background)',
        panel: 'var(--color-bg-panel)',
      },
    },
  },
  plugins: [],
};
