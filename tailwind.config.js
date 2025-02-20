/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-brand)',
        role: {
          technical: 'var(--color-role-technical)',
          management: 'var(--color-role-management)',
          technicalmanagement: 'var(--color-role-technical-management)',
          design: 'var(--color-role-design)',
        },
        status: {
          looking: 'var(--color-status-looking)',
          full: 'var(--color-status-full)',
        },
        match: 'var(--color-match)',
        tag: {
          bg: 'var(--color-tag-bg)',
        },
      },
    },
  },
  plugins: [],
}