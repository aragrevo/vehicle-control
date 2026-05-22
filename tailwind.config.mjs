/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#10131a',
          dim: '#10131a',
          bright: '#363941',
          container: {
            lowest: '#0b0e15',
            low: '#191b23',
            DEFAULT: '#1d2027',
            high: '#272a31',
            highest: '#32353c',
          },
        },
        'on-surface': {
          DEFAULT: '#e1e2ec',
          variant: '#c2c6d6',
        },
        'inverse-surface': '#e1e2ec',
        'inverse-on-surface': '#2e3038',
        outline: {
          DEFAULT: '#8c909f',
          variant: '#424754',
        },
        'surface-tint': '#adc6ff',
        primary: {
          DEFAULT: '#adc6ff',
          container: '#4d8eff',
          fixed: {
            DEFAULT: '#d8e2ff',
            dim: '#adc6ff',
          },
        },
        'on-primary-fixed': {
          DEFAULT: '#001a42',
          variant: '#004395',
        },
        'on-primary': {
          DEFAULT: '#002e6a',
          container: '#00285d',
        },
        'inverse-primary': '#005ac2',
        secondary: {
          DEFAULT: '#b7c8e1',
          container: '#3a4a5f',
          fixed: {
            DEFAULT: '#d3e4fe',
            dim: '#b7c8e1',
          },
        },
        'on-secondary': {
          DEFAULT: '#213145',
          container: '#a9bad3',
          fixed: {
            DEFAULT: '#0b1c30',
            variant: '#38485d',
          },
        },
        tertiary: {
          DEFAULT: '#ffb786',
          container: '#df7412',
          fixed: {
            DEFAULT: '#ffdcc6',
            dim: '#ffb786',
          },
        },
        'on-tertiary': {
          DEFAULT: '#502400',
          container: '#461f00',
          fixed: {
            DEFAULT: '#311400',
            variant: '#723600',
          },
        },
        error: {
          DEFAULT: '#ffb4ab',
          container: '#93000a',
        },
        'on-error': {
          DEFAULT: '#690005',
          container: '#ffdad6',
        },
        success: {
          DEFAULT: '#4ade80',
          container: '#166534',
        },
        warning: {
          DEFAULT: '#fbbf24',
          container: '#92400e',
        },
        info: {
          DEFAULT: '#60a5fa',
          container: '#1e40af',
        },
        background: '#10131a',
        'on-background': '#e1e2ec',
        'surface-variant': '#32353c',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        'headline-lg': ['Inter'],
        'headline-md': ['Inter'],
        'headline-sm': ['Inter'],
        'body-md': ['Inter'],
        'body-lg': ['Inter'],
        'label-md': ['Inter'],
        'data-mono': ['JetBrains Mono'],
      },
      fontSize: {
        'headline-lg': ['32px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-sm': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-md': ['12px', { lineHeight: '1', fontWeight: '600', letterSpacing: '0.05em' }],
        'data-mono': ['14px', { lineHeight: '1', fontWeight: '500' }],
      },
      "borderRadius": {
                    "DEFAULT": "0.25rem",
                    "lg": "0.5rem",
                    "xl": "0.75rem",
                    "full": "9999px"
            },
            "spacing": {
                    "lg": "24px",
                    "margin-mobile": "16px",
                    "sm": "8px",
                    "xs": "4px",
                    "gutter": "16px",
                    "base": "4px",
                    "xl": "32px",
                    "md": "16px",
                    "margin-desktop": "48px"
            },
    },
  },
  plugins: [],
};
