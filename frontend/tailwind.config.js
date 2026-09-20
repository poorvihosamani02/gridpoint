/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bright Royal Blue primary accent (Tailwind blue-600 standard)
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Royal Blue primary action
          700: '#1d4ed8', // Hover state
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Clean neutral slate for light mode
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9', // Very light gray for backgrounds & dividers
          200: '#e2e8f0', // Structural 1px borders
          300: '#cbd5e1',
          400: '#94a3b8', // Muted text
          500: '#64748b', // Secondary text
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a', // Main text: Dark Slate / Navy
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      borderRadius: {
        // Restrained, professional SaaS card corners (avoid overly rounded/pill shapes)
        'none': '0',
        'sm': '0.25rem',  // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.375rem', // 6px
        'lg': '0.5rem',   // 8px (Standard card)
        'xl': '0.625rem', // 10px
        '2xl': '0.75rem', // 12px
        'full': '9999px',
      },
      boxShadow: {
        // Subtle, clean light shadows
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}