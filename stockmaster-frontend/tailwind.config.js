/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#2563eb', // blue-600
                    hover: '#1d4ed8', // blue-700
                    foreground: '#ffffff',
                },
                secondary: {
                    DEFAULT: '#64748b', // slate-500
                    hover: '#475569', // slate-600
                    foreground: '#ffffff',
                },
                destructive: {
                    DEFAULT: '#ef4444', // red-500
                    hover: '#dc2626', // red-600
                    foreground: '#ffffff',
                },
                background: { DEFAULT: '#f8fafc' }, // slate-50
                surface: { DEFAULT: '#ffffff' },
                border: { DEFAULT: '#e2e8f0' }, // slate-200
            },
        },
    },
    plugins: [],
}
