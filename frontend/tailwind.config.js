/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep navy SaaS background & surface hierarchy
        navy: {
          950: '#070c18', // Deepest background
          900: '#0a101d', // Canvas background
          850: '#0e1726', // Card / panel background
          800: '#141f36', // Hover / elevated surface
          700: '#1e293b', // Clean structural 1px borders
          600: '#334155', // Muted borders / dividers
        },
        // Slate mapping to deep navy for seamless component compatibility
        slate: {
          950: '#0a101d', // Canvas
          900: '#0e1726', // Cards & containers
          850: '#141f36', // Elevated panels
          800: '#1e293b', // Subtle borders
          750: '#273549',
          700: '#334155', // Dividers
          400: '#94a3b8', // Light gray secondary text
          300: '#cbd5e1', // Light gray body text
          200: '#e2e8f0', // Near white
          100: '#f1f5f9',
          50: '#f8fafc',  // Clean white
        },
        // Primary Blue accent for actions
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Primary action Blue
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Semantic status colors
        emerald: {
          400: '#34d399',
          500: '#10b981', // Positive savings Green
          600: '#059669',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b', // Warning Amber
          600: '#d97706',
        },
        rose: {
          400: '#f87171',
          500: '#ef4444', // Error / Violation Red
          600: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace']
      },
      borderRadius: {
        // Professional, modern SaaS radii (avoid excessively round corners)
        'none': '0',
        'sm': '0.25rem',  // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.375rem', // 6px
        'lg': '0.5rem',   // 8px
        'xl': '0.625rem', // 10px (Clean card corner)
        '2xl': '0.75rem', // 12px (Max card radius)
        '3xl': '0.875rem',
        'full': '9999px',
      },
      boxShadow: {
        // Flat, subtle enterprise shadows (no heavy blur)
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.35), 0 1px 2px -1px rgba(0, 0, 0, 0.25)',
        'elevated': '0 4px 12px -2px rgba(0, 0, 0, 0.45)',
        'dropdown': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}