import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: 'rgb(var(--ink-900) / <alpha-value>)',
          600: 'rgb(var(--ink-600) / <alpha-value>)',
          300: 'rgb(var(--ink-300) / <alpha-value>)',
        },
        surface: {
          0: 'rgb(var(--surface-0) / <alpha-value>)',
          50: 'rgb(var(--surface-50) / <alpha-value>)',
          100: 'rgb(var(--surface-100) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        white: 'rgb(var(--ink-900) / <alpha-value>)',
        black: 'rgb(var(--surface-0) / <alpha-value>)',
        brand: {
          DEFAULT: 'rgb(var(--brand) / <alpha-value>)',
          hover: 'rgb(var(--brand-hover) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
          hover: 'rgb(var(--accent-hover) / <alpha-value>)',
        },
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        pass: {
          DEFAULT: 'rgb(var(--pass) / <alpha-value>)',
          bg: 'rgb(var(--pass-bg) / <alpha-value>)',
        },
        fail: {
          DEFAULT: 'rgb(var(--fail) / <alpha-value>)',
          bg: 'rgb(var(--fail-bg) / <alpha-value>)',
        },
        pending: {
          DEFAULT: 'rgb(var(--pending) / <alpha-value>)',
          bg: 'rgb(var(--pending-bg) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Flexo Soft Medium"', 'system-ui', 'sans-serif'],
        display: ['var(--font-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['"Flexo Soft Medium"', 'system-ui', 'sans-serif'],
        code: ['var(--font-jetbrains)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        meta: ['0.8125rem', { lineHeight: '1.25rem' }],
        'body-sm': ['0.9375rem', { lineHeight: '1.5rem' }],
        body: ['1.0625rem', { lineHeight: '1.625rem' }],
        subheading: ['1.25rem', { lineHeight: '1.75rem' }],
        section: ['1.75rem', { lineHeight: '2.25rem' }],
        hero: ['2.5rem', { lineHeight: '2.75rem' }],
      },
      borderRadius: {
        card: '8px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.5)',
      },
      maxWidth: {
        content: '1120px',
      },
    },
  },
  plugins: [],
}

export default config